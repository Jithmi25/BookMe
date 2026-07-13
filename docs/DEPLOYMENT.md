# Deployment Guide (Manual + Optional GitHub Actions)

## Manual Deployment Flow (recommended to start)

### Web App (Vercel)

1. Import repository in Vercel.
2. Set Root Directory to `web`.
3. Add environment variables from `web/.env.example`.
4. Deploy preview from pull requests.
5. Promote to production from `main`.

### Firebase (Functions/Rules/Storage)

Run from repository root:

```bash
firebase use dev
firebase deploy --only functions,firestore:rules,storage

firebase use prod
firebase deploy --only functions,firestore:rules,storage
```

## Optional GitHub Actions Flow

A sample workflow is provided in `.github/workflows/web-deploy.yml`.

What to configure in GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Optional Firebase deployment secrets:

- `FIREBASE_SERVICE_ACCOUNT`

## Suggested release policy

- `pull_request` to `main`: run lint/test/build checks.
- push to `main`: deploy to Vercel production.
- `workflow_dispatch`: manual deployment trigger.
