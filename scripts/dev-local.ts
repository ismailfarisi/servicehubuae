#!/usr/bin/env bun
/**
 * One-command local launcher.
 *
 *   bun scripts/dev-local.ts            # infra + migrations + seed + search + all services + 3 web apps
 *   bun scripts/dev-local.ts --prod     # same, but production builds of the web apps (`bun run prod:local`)
 *   bun scripts/dev-local.ts --no-web   # backend only
 *   bun scripts/dev-local.ts --reindex  # force a full Typesense service_offerings reindex first
 *   bun scripts/dev-local.ts --stop     # stop the docker infra containers
 *
 * Steps:
 *  1. Load backend/.env. The services don't read it themselves, because Bun
 *     only loads .env from each app's own cwd.
 *  2. docker compose up: postgres, redis, typesense, local-s3 (+ bucket init),
 *     and local-stream. Then wait until each one is healthy.
 *  3. Run TypeORM migrations and the idempotent seed.
 *  4. Create and fill the Typesense `service_offerings` collection if it's
 *     missing (backend/scripts/reindex-services.ts). catalog-service only
 *     creates it empty at boot.
 *  5. Start every backend service and the web, vendor and admin apps through
 *     turbo with `--env-mode=loose`. Turbo 2's strict mode would drop
 *     undeclared vars such as DB_PORT.
 *     With --prod: `next build` the three apps through turbo (cached, so an
 *     unchanged app is not rebuilt), then run each backend service from source
 *     without file watching and each app with `next start`. Faster pages and
 *     far less memory than dev, but no hot reload.
 * Ctrl+C stops the services. The docker infra keeps running (use --stop).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { connect } from "node:net";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const BACKEND = join(ROOT, "backend");
const BUN = process.execPath;
const args = new Set(process.argv.slice(2));
const PROD = args.has("--prod");
const WEB_APPS = [
	{ name: "web", pkg: "@mypickuae/web", port: 4000 },
	{ name: "vendor-dashboard", pkg: "@mypickuae/vendor-dashboard", port: 4001 },
	{ name: "admin-panel", pkg: "@mypickuae/admin-panel", port: 4002 },
];
const INFRA = [
	"postgres",
	"redis",
	"typesense",
	"local-s3",
	"local-s3-init",
	"local-stream",
];

const c = {
	dim: "\x1b[2m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	bold: "\x1b[1m",
	off: "\x1b[0m",
};
const step = (msg: string) => console.log(`\n${c.bold}▶ ${msg}${c.off}`);
const ok = (msg: string) => console.log(`  ${c.green}✓${c.off} ${msg}`);
const warn = (msg: string) => console.log(`  ${c.yellow}!${c.off} ${msg}`);
function fail(msg: string, hint?: string): never {
	console.error(`\n  ${c.red}✗ ${msg}${c.off}`);
	if (hint) console.error(`    ${hint}`);
	process.exit(1);
}

function parseEnv(file: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq < 1) continue;
		let value = line.slice(eq + 1).trim();
		if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
		out[line.slice(0, eq).trim()] = value;
	}
	return out;
}

async function run(
	cmd: string[],
	opts: { cwd?: string; quiet?: boolean } = {},
) {
	const proc = Bun.spawn(cmd, {
		cwd: opts.cwd ?? ROOT,
		env,
		stdout: opts.quiet ? "pipe" : "inherit",
		stderr: opts.quiet ? "pipe" : "inherit",
	});
	const [out, err, code] = await Promise.all([
		opts.quiet ? new Response(proc.stdout).text() : "",
		opts.quiet ? new Response(proc.stderr).text() : "",
		proc.exited,
	]);
	return { code, out, err };
}

async function waitFor(
	label: string,
	check: () => Promise<boolean>,
	timeoutMs = 90_000,
) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (await check().catch(() => false)) return ok(label);
		await Bun.sleep(1000);
	}
	fail(`${label} did not become ready within ${timeoutMs / 1000}s`);
}

const httpOk = (url: string, init?: RequestInit) => async () => {
	const res = await fetch(url, { ...init, signal: AbortSignal.timeout(3000) });
	return res.status < 500;
};

const portInUse = (port: number) =>
	new Promise<boolean>((resolve) => {
		const sock = connect({ port, host: "127.0.0.1" });
		sock.once("connect", () => {
			sock.destroy();
			resolve(true);
		});
		sock.once("error", () => resolve(false));
	});

// ── 1. Environment ────────────────────────────────────────────────────────
const envFile = join(BACKEND, ".env");
if (!existsSync(envFile)) {
	fail(
		"backend/.env not found",
		"Copy backend/.env.example to backend/.env and fill it in.",
	);
}
const dotenv = parseEnv(envFile);
const env: Record<string, string | undefined> = { ...dotenv, ...process.env };
const compose = ["docker", "compose"];

if (args.has("--stop")) {
	step("Stopping docker infra");
	await run([...compose, "stop", ...INFRA], { cwd: BACKEND });
	process.exit(0);
}

step("Checking prerequisites");
if ((await run(["docker", "info"], { quiet: true })).code !== 0) {
	fail("Docker is not running", "Start Docker Desktop and try again.");
}
ok("docker is running");
ok(`bun ${Bun.version}`);

const servicePorts = [3000, 3001, 3002, 3004, 3005, 3006, 3007, 3008, 3009];
const webPorts = args.has("--no-web") ? [] : [4000, 4001, 4002];
const busy: number[] = [];
for (const p of [...servicePorts, ...webPorts])
	if (await portInUse(p)) busy.push(p);
if (busy.length) {
	fail(
		`ports already in use: ${busy.join(", ")}`,
		"Another copy of the app is probably running. Stop it first (Ctrl+C in its terminal).",
	);
}
ok("service ports are free");

// ── 2. Docker infra ───────────────────────────────────────────────────────
step("Starting docker infra");
const up = await run([...compose, "up", "-d", "--build", ...INFRA], {
	cwd: BACKEND,
	quiet: true,
});
if (up.code !== 0)
	fail(
		"docker compose up failed",
		up.err.trim().split("\n").slice(-5).join("\n    "),
	);

const dbPort = Number(env.DB_PORT ?? 5432);
const tsPort = Number(env.TYPESENSE_PORT ?? 8108);
await waitFor(
	`postgres (port ${dbPort})`,
	async () =>
		(
			await run(
				[
					...compose,
					"exec",
					"-T",
					"postgres",
					"pg_isready",
					"-U",
					env.DB_USERNAME ?? "mypickuae",
				],
				{ cwd: BACKEND, quiet: true },
			)
		).code === 0,
);
await waitFor("redis (port 6379)", async () =>
	(
		await run([...compose, "exec", "-T", "redis", "redis-cli", "ping"], {
			cwd: BACKEND,
			quiet: true,
		})
	).out.includes("PONG"),
);
await waitFor(`typesense (port ${tsPort})`, async () => {
	const ps = await run(
		[
			...compose,
			"ps",
			"-a",
			"--format",
			"{{.Service}} {{.State}} {{.ExitCode}}",
		],
		{ cwd: BACKEND, quiet: true },
	);
	const line = ps.out.split("\n").find((l) => l.startsWith("typesense "));
	if (line?.includes("exited")) {
		fail(
			`typesense container exited (${line})`,
			"Exit 139 on WSL usually means the WSL kernel lacks /proc/self/io (CONFIG_TASKSTATS). Check `wsl --version`.",
		);
	}
	return httpOk(`http://localhost:${tsPort}/health`)();
});
await waitFor("local-s3 (port 7070)", httpOk("http://localhost:7070/"));
await waitFor("local-stream (port 7071)", httpOk("http://localhost:7071/"));

// ── 3. Database ───────────────────────────────────────────────────────────
step("Database");
const migrate = await run([BUN, "run", "src/run-migrations.ts"], {
	cwd: join(BACKEND, "libs/database"),
	quiet: true,
});
if (migrate.code !== 0)
	fail(
		"migrations failed",
		(migrate.err || migrate.out).trim().split("\n").slice(-8).join("\n    "),
	);
const executed = migrate.out.match(/(\d+) migration\(s\) executed/);
ok(executed ? `${executed[1]} migration(s) applied` : "migrations up to date");

const seed = await run([BUN, "run", "src/seeds/index.ts"], {
	cwd: join(BACKEND, "libs/database"),
	quiet: true,
});
if (seed.code !== 0)
	fail(
		"seed failed",
		(seed.err || seed.out).trim().split("\n").slice(-8).join("\n    "),
	);
ok("seed checked (admin@mypickuae.com / customer@mypickuae.com)");

// ── 4. Search index ───────────────────────────────────────────────────────
step("Search index");
const tsKey = env.TYPESENSE_API_KEY ?? "dev-typesense-key";
const collections = (await (
	await fetch(`http://localhost:${tsPort}/collections`, {
		headers: { "X-TYPESENSE-API-KEY": tsKey },
	})
).json()) as Array<{ name: string; num_documents: number }>;
const servicesCollection = collections.find(
	(col) =>
		col.name === (env.TYPESENSE_SERVICES_COLLECTION ?? "service_offerings"),
);
// catalog-service creates the collection empty at boot, so an empty one is
// treated like a missing one (the seed's demo services should be searchable).
if (
	!servicesCollection ||
	servicesCollection.num_documents === 0 ||
	args.has("--reindex")
) {
	const reindex = await run([BUN, "scripts/reindex-services.ts"], {
		cwd: BACKEND,
		quiet: true,
	});
	if (reindex.code !== 0)
		fail(
			"reindex failed",
			(reindex.err || reindex.out).trim().split("\n").slice(-8).join("\n    "),
		);
	ok(reindex.out.match(/Reindexed .*/)?.[0] ?? "service_offerings reindexed");
} else {
	ok(
		`service_offerings collection has ${servicesCollection.num_documents} document(s) (use --reindex to rebuild)`,
	);
}

// ── 5. Services ───────────────────────────────────────────────────────────
const withWeb = !args.has("--no-web");

// Announce once the gateway (and web apps) answer; logs keep streaming.
async function announce() {
	const targets: [string, string][] = [
		["API gateway", "http://localhost:3000/health"],
	];
	if (withWeb) {
		targets.push(
			["Storefront", "http://localhost:4000/en"],
			["Vendor dashboard", "http://localhost:4001/"],
			["Admin panel", "http://localhost:4002/"],
		);
	}
	for (const [, url] of targets) {
		const start = Date.now();
		while (Date.now() - start < 300_000) {
			if (await httpOk(url)().catch(() => false)) break;
			await Bun.sleep(2000);
		}
	}
	const mode = PROD ? " (production build)" : "";
	console.log(`\n${c.green}${c.bold}✓ MyPickUAE is running${mode}${c.off}`);
	for (const [name, url] of targets)
		console.log(`  ${name.padEnd(17)} ${url.replace(/\/health$/, "")}`);
	console.log(
		`  ${"Local S3".padEnd(17)} http://localhost:7070   ${c.dim}(files in backend/.local-s3)${c.off}`,
	);
	console.log(
		`  ${"Local Stream".padEnd(17)} http://localhost:7071   ${c.dim}(videos in backend/.local-stream)${c.off}`,
	);
	if (existsSync(join(ROOT, "local-credentials.md"))) {
		console.log(`  ${c.dim}Logins: see local-credentials.md${c.off}`);
	}
}

if (!PROD) {
	step("Starting services (Ctrl+C to stop)");
	const filters = ["--filter=./backend/apps/*"];
	if (withWeb) filters.push(...WEB_APPS.map((a) => `--filter=${a.pkg}`));
	const services = Bun.spawn(
		[
			BUN,
			"x",
			"turbo",
			"run",
			"dev",
			...filters,
			"--concurrency",
			"20",
			"--env-mode=loose",
		],
		{ cwd: ROOT, env, stdout: "inherit", stderr: "inherit", stdin: "inherit" },
	);
	const stop = () => services.kill();
	process.on("SIGINT", stop);
	process.on("SIGTERM", stop);
	announce();
	process.exit(await services.exited);
}

// --prod: Next must see NODE_ENV=production (backend/.env says development),
// and LOCAL_MEDIA lets the build accept the local S3 / Stream image hosts.
const nextEnv: Record<string, string | undefined> = {
	...env,
	NODE_ENV: undefined,
	LOCAL_MEDIA: "1",
};

if (withWeb) {
	step("Building web apps (production)");
	const build = Bun.spawn(
		[
			BUN,
			"x",
			"turbo",
			"run",
			"build",
			...WEB_APPS.map((a) => `--filter=${a.pkg}`),
			"--env-mode=loose",
		],
		{ cwd: ROOT, env: nextEnv, stdout: "inherit", stderr: "inherit" },
	);
	if ((await build.exited) !== 0)
		fail("web app build failed (see output above)");
	ok("web apps built");
}

step("Starting services (Ctrl+C to stop)");
const procs: { name: string; proc: ReturnType<typeof Bun.spawn> }[] = [];

async function pipeLines(stream: ReadableStream<Uint8Array>, prefix: string) {
	const decoder = new TextDecoder();
	let buf = "";
	for await (const chunk of stream) {
		buf += decoder.decode(chunk, { stream: true });
		let nl = buf.indexOf("\n");
		while (nl >= 0) {
			process.stdout.write(`${prefix}${buf.slice(0, nl)}\n`);
			buf = buf.slice(nl + 1);
			nl = buf.indexOf("\n");
		}
	}
	if (buf) process.stdout.write(`${prefix}${buf}\n`);
}

function start(
	name: string,
	cmd: string[],
	cwd: string,
	procEnv: Record<string, string | undefined>,
) {
	const proc = Bun.spawn(cmd, {
		cwd,
		env: procEnv,
		stdout: "pipe",
		stderr: "pipe",
	});
	const prefix = `${c.dim}${name.padEnd(20)}│${c.off} `;
	pipeLines(proc.stdout, prefix);
	pipeLines(proc.stderr, prefix);
	procs.push({ name, proc });
}

// Each service runs from source without --watch (Bun executes TypeScript
// directly; the bundled `start` scripts are not used locally).
const backendApps = readdirSync(join(BACKEND, "apps"), { withFileTypes: true })
	.filter(
		(d) =>
			d.isDirectory() &&
			existsSync(join(BACKEND, "apps", d.name, "src/index.ts")),
	)
	.map((d) => d.name);
for (const app of backendApps) {
	start(app, [BUN, "run", "src/index.ts"], join(BACKEND, "apps", app), env);
}
if (withWeb) {
	for (const app of WEB_APPS) {
		start(
			app.name,
			[BUN, "x", "next", "start", "--port", String(app.port)],
			join(ROOT, "apps", app.name),
			nextEnv,
		);
	}
}

// On Windows a plain kill leaves `next start`'s node child running, so stop
// whole process trees.
function stopAll() {
	for (const { proc } of procs) {
		if (proc.exitCode !== null) continue;
		if (process.platform === "win32") {
			Bun.spawnSync(["taskkill", "/PID", String(proc.pid), "/T", "/F"], {
				stdout: "ignore",
				stderr: "ignore",
			});
		} else {
			proc.kill();
		}
	}
}
process.on("SIGINT", () => {
	stopAll();
	process.exit(0);
});
process.on("SIGTERM", () => {
	stopAll();
	process.exit(0);
});

announce();
// Like turbo: if any process dies, stop the rest so nothing is left half-up.
const first = await Promise.race(
	procs.map(({ name, proc }) => proc.exited.then((code) => ({ name, code }))),
);
console.error(
	`\n  ${c.red}✗ ${first.name} exited (${first.code}); stopping everything${c.off}`,
);
stopAll();
process.exit(first.code || 1);
