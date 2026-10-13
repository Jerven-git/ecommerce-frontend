# Website Editor Release Runbook

This runbook releases the Store Admin Website Editor introduced in Phases 1–5. It does not authorize a deployment by itself. Run every command against the actual target environment and compose file, and record the result separately from code validation.

## Release boundary

- The editor is available only to authenticated Store Admin users and resolves `user.store_id` through the existing admin tenant middleware.
- Drafts, published versions, audit records, and health-monitor output are tenant-scoped.
- The public storefront reads only published `SiteConfig` data.
- The editor does not own private media uploads yet. Existing Site Settings and product media workflows remain authoritative.
- Do not roll back the additive editor migrations merely to roll back application code. Dropping them deletes private drafts and version history.

## Required pre-release evidence

From `ssu-backend`:

```bash
php artisan test tests/Feature/SiteConfigDraftApiTest.php \
  tests/Feature/WebsiteEditorHardeningTest.php \
  tests/Feature/SuperAdmin/ActivityLogTest.php
vendor/bin/pint --dirty --test
```

From `ssu-frontend`:

```bash
npm ci
npm run build
npm run audit:runtime
npm run test:e2e:list
npm audit --omit=dev
```

The release image is multi-stage: Nuxt and its build/dev tooling are installed only in the build stage, while the runtime stage receives `.output` only. `npm run audit:runtime` resolves and audits the exact package versions declared by the generated `.output/server/package.json`; this is the production runtime release gate.

Keep the workspace audit as a separate build-tooling report. As of 13 October 2026, `npm audit --omit=dev` reports 14 advisories (7 high and 7 critical) through Nuxt build/dev dependencies. The affected `simple-git`, argv parser, glob, and local-listener packages are absent from the generated runtime manifest, and the generated runtime audit reports 0 vulnerabilities. Several upstream paths have no stable patched release; npm's proposed automatic remediation downgrades Nuxt to the end-of-life 3.x line. Do not run `npm audit fix --force`, suppress the findings, or treat the workspace report as proof that the final runtime image contains those packages.

Re-run both audits for every release. Stop the release if `audit:runtime` reports a vulnerability, if one of the currently build-only packages becomes part of `.output`, or if an advisory is reachable from untrusted build inputs. Continue tracking the workspace advisories and upgrade the stable Nuxt dependency chain when compatible fixes are published.

Run the browser suite against a disposable staging store. The storage-state file contains an authenticated session and must remain inside the ignored `tests/e2e/.auth` directory.

```bash
npx playwright codegen --save-storage=tests/e2e/.auth/store-admin.json https://STAGING_HOST/admin/website-editor

SSU_E2E_BASE_URL=https://STAGING_HOST \
SSU_E2E_STORAGE_STATE=tests/e2e/.auth/store-admin.json \
npm run test:e2e
```

The default suite exercises loading, page switching, unsaved-state preservation, undo, responsive controls, navigation protection, failure recovery, saving, and discarding. Publishing is intentionally disabled by default. Enable it only for a disposable tenant:

```bash
SSU_E2E_BASE_URL=https://STAGING_HOST \
SSU_E2E_STORAGE_STATE=tests/e2e/.auth/store-admin.json \
SSU_E2E_ALLOW_PUBLISH=true \
npm run test:e2e
```

## Deployment sequence

1. Confirm the target branch, compose file, database, and mounted frontend artifact path.
2. Back up the production database and record the restore command before changing services.
3. Deploy the backend code first.
4. Run the additive migrations inside the production backend container:

   ```bash
   docker compose -f docker-compose-prod.yml exec backend php artisan migrate --force
   docker compose -f docker-compose-prod.yml exec backend php artisan migrate:status
   docker compose -f docker-compose-prod.yml exec backend php artisan optimize:clear
   docker compose -f docker-compose-prod.yml exec backend php artisan queue:restart
   ```

5. Verify the `site_config_drafts` and `site_config_versions` migrations are marked as run.
6. Build and deploy the frontend through the existing production artifact process. Verify that nginx is serving the newly generated `.output/public`, not a stale mounted directory.
7. Confirm the scheduler is running so `website-editor:monitor` executes every fifteen minutes.
8. Run the staging browser suite and the production smoke checks below before widening access.

## Production smoke checks

Use two test stores to prove tenant isolation:

1. Open Store A's Website Editor and confirm the published preview matches Store A.
2. Change copy, save a draft, and verify Store A's public storefront is unchanged.
3. Open Store B and confirm Store A's draft and versions are absent.
4. Publish Store A's draft and verify its subdomain and verified custom domain.
5. Confirm Store B remains unchanged.
6. Restore Store A's previous version and verify the public storefront.
7. Check the activity log for `draft_saved`, `website_published`, and `version_restored` events with the correct store and administrator.
8. Run `php artisan website-editor:monitor` and confirm zero unexpected stale drafts or stalled media items.
9. Exercise desktop, tablet, mobile, keyboard-only, reduced-motion, and module-disabled page states.

## Monitoring and alerts

The scheduled `website-editor:monitor` command logs:

- private drafts unchanged for more than 24 hours;
- media left in `pending` or `processing` for more than 30 minutes.

Publish and restore conflicts emit structured warning logs. Unexpected publish or restore exceptions emit structured error logs containing operation, tenant, user, and exception context without recording draft content.

Route these log messages through the production log collector:

- `Website editor operation rejected`
- `Website editor operation failed`
- `Website editor stale drafts detected`
- `Website editor stalled media processing detected`

## Rollback

1. Stop new editor use or remove its Store Admin navigation entry through the release rollback artifact.
2. Restore the previous frontend artifact and backend application revision.
3. Run `php artisan optimize:clear` and restart queue workers.
4. Keep the additive draft/version tables in place unless the database backup has been verified and deleting private drafts/history is explicitly approved.
5. Verify the public storefront and checkout using existing published `SiteConfig` values.
6. If a publish changed public content incorrectly, use version restore before rolling application code back.

Published storefront data remains in `site_config`; application rollback must not replace it with a draft or delete it.
