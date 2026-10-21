---
name: project_aws_staging_decommissioned
description: AWS staging torn down (staging is Netcup-only); shared OIDC role + ECR repos moved to terraform/shared and must survive until prod leaves AWS
metadata: 
  node_type: memory
  type: project
  originSessionId: fdd79ea2-84c5-4da8-848f-593d050c337b
---

The AWS staging Terraform stack (`terraform/staging/`) was decommissioned on
2026-06-01 once staging moved fully to Netcup. `terraform destroy` removed 27
staging-only AWS resources (EC2 spot instance, EIP 13.200.117.142, the 30GB EBS
data volume, launch template, SG, staging EC2 IAM role/profile/policy, the
staging KMS key + alias, 13 `/mypickuae/staging/*` SSM params, and the
`mypickuae-config` bootstrap bucket). `terraform/staging/` is deleted from the repo.

**Critical: three resources were NOT destroyed — they're account-global and prod
(still on AWS, same account 100137600454) depends on them.** They were moved via
`terraform state mv` into a new **`terraform/shared/`** config (not recreated):
- `aws_iam_openid_connect_provider.github` — one OIDC provider per URL per account
- `aws_iam_role.github_actions` (+ base policy, now ECR-auth/push only) — `terraform/production/cicd.tf` looks it up via `data "aws_iam_role"` and attaches a prod-scoped policy
- 9 `aws_ecr_repository.services` + lifecycle — `build-service.yml` pushes BOTH staging and prod images to the same `mypickuae-<service>` repos

Do NOT destroy `terraform/shared` until prod also leaves AWS. The CI `terraform`
IAM user lacks `ecr:UntagResource` (ECR repos use `lifecycle { ignore_changes = [tags] }`)
and `iam:ListInstanceProfilesForRole` (had to delete the leftover EC2 role by hand).

Loose ends (left intentionally, out of "terraform-only" scope): the legacy
`deploy-staging.yml` (AWS, manual-only) now points at destroyed infra — dead, can
be removed. S3 media (`mypickuae-media-dev`) is untouched — provisioned outside TF,
Netcup box uses static keys in `.env`. See [[project_netcup_staging_live]],
[[project_prod_infra_and_listing_diag]], [[project_infra_migration_target]].
