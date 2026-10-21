---
name: project_auth_twilio_boot_crashloop
description: Placeholder/invalid Twilio env crash-looped the whole auth-service at boot; fixed by validating config and degrading to disabled (PR
metadata: 
  node_type: memory
  type: project
  originSessionId: c993472e-c0ff-41b3-9413-01f6feb132f5
---

auth-service builds `createPhoneVerificationProvider()` at **container import time** (`container.ts:20`), so ANY throw there takes down the entire service at boot — not just phone OTP (login/refresh/2FA all go offline).

Staging outage (2026-07-05): `.env` had `SMS_OTP_PROVIDER=twilio` with **placeholder** creds (`TWILIO_ACCOUNT_SID=PLACEHOLDER…`). The Twilio SDK constructor rejects any account SID not starting with `AC` → threw `accountSid must start with AC` → crash-loop (18 restarts). The old code's presence-only check (`if (!SID||!TOKEN||!SERVICE_SID) throw`) was equally fatal for an *incomplete* config.

**Immediate fix (live box):** copied the real Twilio creds from prod's auth-service (valid `AC…`/`VA…`) into staging `/opt/mypickuae/.env` and `docker compose -f docker-compose.netcup.yml up -d --force-recreate auth-service`. Prod (AWS, i-0f982d225cd7f140a) creds pulled via SSM; staging is Netcup (see [[project_netcup_staging_live]]), reached by SSH `deploy@89.58.29.111 -i ~/.ssh/netcup_deploy_ci`.

**Code hardening (PR #306, merged 8141e562):** `createPhoneVerificationProvider` now validates presence + `AC`/`VA` SID prefixes and **degrades gracefully** — logs an error and returns the disabled provider (phone-OTP → clean 503) instead of throwing. A misconfigured Twilio env no longer takes down auth.

Gotcha to reuse: any service that constructs a 3rd-party SDK client at module/container import time turns a bad env value into a boot crash-loop. Validate + fall back, don't throw at import. See also [[reference_prod_rds_ssm_debug]] for the SSM base64 trick used to read/copy prod env.
