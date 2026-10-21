---
name: reference_prod_rds_ssm_debug
description: How to query prod RDS and call internal service endpoints on the AWS prod box via SSM
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8193b0c7-558d-47a8-8132-f21903bb7eac
---

Prod is AWS EC2 (`i-0f982d225cd7f140a`, ap-south-1), services in docker compose, DB on RDS — operate via `aws ssm send-command` (set `MSYS_NO_PATHCONV=1` on Windows). Containers: `mypickuae-<svc>-1`.

**Read service logs:** `docker logs mypickuae-<svc>-1 --since 15m 2>&1 | grep ...`.

**Query prod RDS** (no psql on the box; pull creds from a service container's env and run a throwaway psql container):
```
ENV=$(docker exec mypickuae-product-service-1 sh -c env)
H=$(echo "$ENV"|grep -E '^DB_HOST='|cut -d= -f2); N=$(echo "$ENV"|grep -E '^DB_NAME='|cut -d= -f2)
U=$(echo "$ENV"|grep -E '^DB_USER(NAME)?='|head -1|cut -d= -f2); PW=$(echo "$ENV"|grep -E '^DB_PASSWORD='|cut -d= -f2)
echo <BASE64_SQL> | base64 -d | docker run --rm -i -e PGPASSWORD="$PW" postgres:16-alpine psql -h "$H" -U "$U" -d "$N" -tA
```

**Call an internal (service-to-service) endpoint** — exec into a container that has the internal secret + network reach, run bun:
```
docker exec mypickuae-reels-service-1 sh -c 'echo <BASE64_TS> | base64 -d > /tmp/v.ts && bun /tmp/v.ts'
# v.ts: fetch("http://product-service:3002/internal/...", { headers: { "x-internal-secret": process.env.INTERNAL_SERVICE_SECRET } })
```

**Gotcha:** nested quoting through SSM JSON → bash → psql/SQL is a trap (single quotes in SQL literals break the outer-quoted `commands=[...]`). Base64-encode the SQL/script and decode on the box — avoids all quote escaping. Prod RDS host: `mypickuae-production.cxes8q6wcoux.ap-south-1.rds.amazonaws.com` / db `mypickuae_production`. See [[project_prod_infra_and_listing_diag]].
