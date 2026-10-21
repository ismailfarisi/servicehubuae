#!/usr/bin/env bun
/**
 * SQL-backed audit. Same output as audit.mjs — same audit.json, same shape,
 * same gap logic — but sourced from one read-only query instead of one HTTP
 * request per product.
 *
 * Use this when the batch is a whole brand or bigger. The API audit needs a
 * paginated scan plus a detail fetch per product (finding one small brand in a
 * 223-product catalogue cost 223 requests); this is a single query that filters
 * on brand server-side and reports the true total, not just what it scanned.
 *
 *   bun scripts/audit-sql.mjs --env staging --brand "Beauty of Joseon" --out audit.json
 *   bun scripts/audit-sql.mjs --env prod --brand teatro --status published --out audit.json
 *   bun scripts/audit-sql.mjs --env prod --print-sql        # show the SQL, run nothing
 *
 * Transports, because the two environments are not reachable the same way:
 *   staging → SSH to the Netcup box (Postgres runs on-box in compose)
 *   prod    → AWS SSM send-command to the EC2 host (Postgres is RDS)
 *
 * Both run the identical on-box recipe: read DB credentials out of a running
 * service container's env, then run the query in a throwaway postgres:16-alpine
 * container. Neither the service images nor the hosts have psql installed, and
 * prod has no SSH at all.
 *
 * The query is SELECT-only. This script never writes to the database — writes
 * still go through apply.mjs and the admin API, so the Typesense reindex and
 * the audit-log row keep happening.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeProduct, parseArgs, printAuditTable, writeJson } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = String(args.out ?? "audit.json");

const ENVS = {
  staging: {
    via: "ssh",
    sshHost: "deploy@89.58.29.111",
    sshKey: "~/.ssh/netcup_deploy_ci",
    container: "mypickuae-product-service-1",
    base: "https://api.stage.mypickuae.com",
  },
  prod: {
    via: "ssm",
    instance: "i-0f982d225cd7f140a",
    region: "ap-south-1",
    container: "mypickuae-product-service-1",
    base: "https://api.mypickuae.com",
  },
};

const envName = String(args.env ?? "staging");
const env = ENVS[envName];
if (!env) {
  console.error(`Unknown --env "${envName}". Known: ${Object.keys(ENVS).join(", ")}`);
  process.exit(1);
}
const via = String(args.via ?? env.via);
const container = String(args.container ?? env.container);

/** psql's :'var' expands to a quoted literal, so the only escaping needed is
 *  doubling single quotes. Building the prelude here rather than passing -v on
 *  a command line means operator input never crosses a shell boundary. */
const setVar = (name, value) => `\\set ${name} '${String(value ?? "").replace(/'/g, "''")}'`;

/** --summary runs the counts-only sizing query instead of the full extract.
 *  On a large catalogue that distinction matters: audit.sql hauls back every
 *  product record, which is impractical over SSM past a few hundred rows,
 *  while summary.sql returns a few KB no matter how big the catalogue is. */
const summaryMode = Boolean(args.summary);

function buildSql() {
  const file = summaryMode ? "summary.sql" : "audit.sql";
  const body = fs.readFileSync(path.join(here, "..", "sql", file), "utf8");
  const prelude = summaryMode
    ? [
        setVar("brand", args.brand ?? ""),
        setVar("status", args.status ?? ""),
        setVar("lim", args.limit ?? "40"),
      ]
    : [
        setVar("brand", args.brand ?? ""),
        setVar("status", args.status ?? ""),
        setVar("vendor", args.vendor ?? ""),
        setVar("category", args.category ?? ""),
        setVar("ids", args.ids ?? ""),
        setVar("lim", args.limit ?? "200"),
      ];
  return `${prelude.join("\n")}\n${body}`;
}

const sql = buildSql();
if (args["print-sql"]) {
  console.log(sql);
  process.exit(0);
}

/**
 * On-box script. Identical for both environments.
 *
 * Credentials come from the service container's env because there is no
 * DATABASE_URL in these deployments — only discrete DB_* vars — and they are
 * handed to psql through an --env-file so a password containing shell
 * metacharacters can't be mangled on the way in.
 *
 * The psql container joins the service container's docker network so that a
 * compose-internal hostname (staging: "postgres") resolves, while a public RDS
 * endpoint (prod) still works via that network's egress.
 */
function onBoxScript(sqlB64, { chunked }) {
  return `
# pipefail matters: without it a psql failure is masked by the base64 at the
# end of the pipe exiting 0, and the run looks like it produced empty output.
set -euo pipefail
ENVDUMP=$(docker exec ${container} env)
get() { echo "$ENVDUMP" | grep -E "^$1=" | head -1 | cut -d= -f2- ; }
H=$(get DB_HOST); P=$(get DB_PORT); N=$(get DB_NAME)
U=$(get DB_USERNAME); [ -n "$U" ] || U=$(get DB_USER); PW=$(get DB_PASSWORD)
if [ -z "$H" ] || [ -z "$U" ]; then echo "NL_ERROR: could not read DB_* from ${container}" >&2; exit 1; fi
NET=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' ${container} | awk '{print $1}')
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
printf '%s' '${sqlB64}' | base64 -d > "$WORK/audit.sql"
printf 'PGHOST=%s\\nPGPORT=%s\\nPGDATABASE=%s\\nPGUSER=%s\\nPGPASSWORD=%s\\n' "$H" "\${P:-5432}" "$N" "$U" "$PW" > "$WORK/pg.env"
chmod 600 "$WORK/pg.env"
# NO -i on docker run, and stdin closed explicitly. This whole script arrives on
# bash's stdin (ssh 'bash -s' / piped base64), so an interactive docker would
# swallow the remaining lines of the script and the run would end right here,
# silently, with no output and no error.
docker run --rm --network "$NET" --env-file "$WORK/pg.env" \
  -v "$WORK/audit.sql:/audit.sql:ro" postgres:16-alpine \
  psql -tAqX -f /audit.sql < /dev/null | gzip -c | base64 -w 76 > "$WORK/out.b64"
${
  chunked
    ? // SSM truncates inline output at ~24KB, so leave the payload on the box
      // and report only its size; the caller pulls it back in slices.
      `cp "$WORK/out.b64" /tmp/nl-audit.b64\necho "NL_LINES=$(wc -l < "$WORK/out.b64")"`
    : // SSH has no such limit — stream the whole thing back in one go, with
      // markers so a warning printed by ssh or docker can't corrupt the payload.
      `echo "NL_BEGIN"\ncat "$WORK/out.b64"\necho "NL_END"`
}
`.trim();
}

if (args["print-script"]) {
  console.log(onBoxScript(Buffer.from(sql).toString("base64"), { chunked: via === "ssm" }));
  process.exit(0);
}

/** Blocking sleep with no subprocess. Shelling out to `timeout /t` on Windows
 *  fails outright when stdin is redirected, which it is here. */
const sleepSync = (ms) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

function sh(file, argv, input) {
  return execFileSync(file, argv, {
    input,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
}

// ── SSH transport (staging) ────────────────────────────────────────────────
function runSsh(script) {
  const key = String(args["ssh-key"] ?? env.sshKey).replace(/^~/, process.env.HOME ?? "");
  const host = String(args["ssh-host"] ?? env.sshHost);
  return sh(
    "ssh",
    ["-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "-i", key, host, "bash -s"],
    script,
  );
}

// ── SSM transport (prod) ───────────────────────────────────────────────────
/** SSM truncates inline command output at ~24KB, which a real audit blows past
 *  immediately. So the query result is gzipped and base64'd on the box, and
 *  pulled back in chunks small enough to survive that ceiling. */
function ssmRun(command) {
  const region = String(args.region ?? env.region);
  const instance = String(args.instance ?? env.instance);
  const paramFile = path.join(
    process.env.TEMP ?? "/tmp",
    `nl-ssm-${Math.abs(command.length * 2654435761) % 1e9}.json`,
  );
  fs.writeFileSync(
    paramFile,
    JSON.stringify({ commands: [`echo ${Buffer.from(command).toString("base64")} | base64 -d | bash`] }),
  );
  try {
    const sent = JSON.parse(
      sh("aws", [
        "ssm", "send-command",
        "--region", region,
        "--instance-ids", instance,
        "--document-name", "AWS-RunShellScript",
        "--parameters", `file://${paramFile}`,
        "--output", "json",
      ]),
    );
    const commandId = sent.Command.CommandId;
    for (let attempt = 0; attempt < 60; attempt++) {
      sleepSync(2000);
      let inv;
      try {
        inv = JSON.parse(
          sh("aws", [
            "ssm", "get-command-invocation",
            "--region", region,
            "--command-id", commandId,
            "--instance-id", instance,
            "--output", "json",
          ]),
        );
      } catch {
        continue; // invocation not registered yet
      }
      if (inv.Status === "InProgress" || inv.Status === "Pending") continue;
      if (inv.Status !== "Success") {
        throw new Error(`SSM command ${inv.Status}: ${inv.StandardErrorContent?.slice(0, 500)}`);
      }
      return inv.StandardOutputContent ?? "";
    }
    throw new Error("SSM command timed out after ~2 minutes");
  } finally {
    fs.rmSync(paramFile, { force: true });
  }
}

function runSsm(script) {
  const first = ssmRun(script);
  const lines = Number(/NL_LINES=(\d+)/.exec(first)?.[1]);
  if (!Number.isFinite(lines) || lines < 1) {
    throw new Error(`Query produced no output. Host said:\n${first.slice(0, 800)}`);
  }
  // 76-char base64 lines → 250 lines ≈ 19KB, comfortably under SSM's ceiling.
  const CHUNK = 250;
  const parts = [];
  for (let start = 1; start <= lines; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, lines);
    process.stderr.write(`  fetching lines ${start}-${end} of ${lines}\r`);
    parts.push(ssmRun(`sed -n '${start},${end}p' /tmp/nl-audit.b64`).replace(/\s+/g, ""));
  }
  ssmRun("rm -f /tmp/nl-audit.b64");
  process.stderr.write("\n");
  return parts.join("");
}

// ── Run ────────────────────────────────────────────────────────────────────
const sqlB64 = Buffer.from(sql).toString("base64");
console.log(`Running SQL audit against ${envName} via ${via}…`);

function decodeText(b64) {
  // gunzipSync hands back a Uint8Array, NOT a Buffer — and
  // Uint8Array.toString("utf8") silently ignores the encoding and returns
  // comma-joined byte values ("123,34,112,…"). Decode explicitly.
  return new TextDecoder().decode(Bun.gunzipSync(Buffer.from(b64, "base64")));
}

function decode(b64, context) {
  try {
    return JSON.parse(decodeText(b64));
  } catch (error) {
    throw new Error(
      `Could not decode the query result (${error.message}). ${context}\n` +
        `Got ${b64.length} base64 chars starting: ${b64.slice(0, 80)}`,
    );
  }
}

let resultB64;
let transport;
if (via === "ssh") {
  const stdout = runSsh(onBoxScript(sqlB64, { chunked: false }));
  // Slice between the markers so anything the transport prints around the
  // payload (motd, docker progress, ssh warnings) can't corrupt it.
  const match = /NL_BEGIN\s*([\s\S]*?)\s*NL_END/.exec(stdout);
  if (!match) {
    throw new Error(`Query produced no output. Host said:\n${stdout.slice(0, 800)}`);
  }
  resultB64 = match[1].replace(/\s+/g, "");
  transport = "SSH transport.";
} else if (via === "ssm") {
  resultB64 = runSsm(onBoxScript(sqlB64, { chunked: true }));
  transport = "SSM chunked transport.";
} else {
  console.error(`Unknown --via "${via}". Use ssh or ssm.`);
  process.exit(1);
}

// ── Summary mode: counts only, printed as a table ──────────────────────────
if (summaryMode) {
  const rows = decodeText(resultB64)
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("|"));
  const HEAD = ["BRAND", "PRODUCTS", "NO ARABIC", "NO ATTRS", "MISSING REQ", "NO SEO", "NO TAGS", "NO DESC"];
  const widths = HEAD.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length)),
  );
  const fmt = (cells) =>
    cells.map((c, i) => (i === 0 ? String(c).padEnd(widths[i]) : String(c).padStart(widths[i]))).join("  ");
  console.log(`\nEnrichment backlog on ${envName}${args.brand ? ` (brand ~ "${args.brand}")` : ""}\n`);
  console.log(fmt(HEAD));
  console.log("-".repeat(widths.reduce((a, b) => a + b + 2, 0)));
  for (const row of rows) {
    // ROLLUP emits an empty brand for the grand total.
    console.log(fmt([row[0] === "" ? "ALL BRANDS" : row[0], ...row.slice(1)]));
  }
  console.log("\nScope a batch with:  --brand \"<name>\"   then drop --summary to extract it.");
  process.exit(0);
}

const payload = decode(resultB64, transport);

const products = payload.products ?? [];
if (!products.length) {
  console.error(
    args.brand
      ? `No products matched brand "${args.brand}". The match is on brand id, slug, or a substring of the name.`
      : "No products matched the filters.",
  );
  process.exit(1);
}

const categoryAttributes = payload.category_attributes ?? {};
const audited = products.map((product) =>
  analyzeProduct(product, categoryAttributes[String(product.category_id)] ?? []),
);
const needsWork = audited.filter(
  (row) =>
    row.gaps.missing_attributes.length ||
    row.gaps.missing_ar_fields.length ||
    row.gaps.missing_en_fields.length,
);

const total = payload.total_matching ?? audited.length;
const truncated = total > audited.length;

writeJson(outPath, {
  base: env.base,
  source: `sql:${envName}`,
  generated_at: new Date().toISOString(),
  filters: {
    status: args.status ?? null,
    brand: args.brand ?? null,
    vendor: args.vendor ?? null,
    category: args.category ?? null,
    ids: args.ids ?? null,
    limit: Number(args.limit ?? 200),
  },
  brand_names_matched: payload.brand_names_matched ?? [],
  total_matching: total,
  truncated,
  audited_count: audited.length,
  needs_work_count: needsWork.length,
  products: audited,
});

console.log(
  `\nAudited ${audited.length} of ${total} matching product(s) on ${envName} — ${needsWork.length} need work\n`,
);
if (args.brand) {
  const names = payload.brand_names_matched ?? [];
  console.log(`Brand "${args.brand}" matched: ${names.join(", ") || "(none)"}`);
  if (names.length > 1) {
    console.log(
      "  NOTE: matched more than one brand — narrow it with the exact slug or uuid if that wasn't intended.",
    );
  }
}
if (truncated) {
  console.log(
    `  NOTE: --limit ${args.limit ?? 200} of ${total} matching; raise --limit to cover the rest.`,
  );
}
if (args.brand || truncated) console.log("");
printAuditTable(needsWork);
console.log(`\nWrote ${outPath}`);
console.log(`\nWrites still go through the API: bun scripts/apply.mjs plan.json --base ${env.base}`);
