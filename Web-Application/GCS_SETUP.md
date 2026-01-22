## Google Cloud Storage setup and environment variables

This app uploads audio and video files to Google Cloud Storage (GCS) via the Next.js API route at `app/api/upload/route.ts`.

### 1) Install dependencies

```bash
npm i @google-cloud/storage
```

### 2) Required environment variables (.env.local)

Create or update a `.env.local` in the project root with the following keys. Do NOT commit your secrets.

```bash
# Google Cloud project where your bucket and service account live
GCP_PROJECT_ID=your-gcp-project-id

# Target bucket to store uploads (must exist)
GCS_BUCKET_NAME=your-gcs-bucket-name

# Full JSON of a service account key with Storage permissions (as a single line)
# Make sure to replace real values and keep the private_key newlines escaped as \n
GOOGLE_APPLICATION_CREDENTIALS_JSON={
  "type": "service_account",
  "project_id": "your-gcp-project-id",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nLINE1\nLINE2\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account-name@your-gcp-project-id.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account-name%40your-gcp-project-id.iam.gserviceaccount.com"
}
```

Notes:
- The `private_key` field must include literal `\n` sequences for newlines if kept on one line in `.env.local`.
- Alternatively, you can minify the JSON into a single line. Ensure it remains valid JSON.
- These variables are read server-side only by the upload API.

### 3) Create and configure a GCS bucket

1. Open Google Cloud Console → Storage → Buckets.
2. Create bucket:
   - Name: use the value you set in `GCS_BUCKET_NAME`.
   - Location/Region: choose near your users.
   - Default storage class: Standard (or per your cost profile).
   - Keep “Uniform access” enabled.
3. Make objects publicly readable (two options):
   - EITHER set bucket-level public access:
     - Permissions → Grant access: `allUsers` → Role: `Storage Object Viewer`.
     - Or enable “Public access” guided policy in the UI.
   - OR keep it private and serve via signed URLs. This repo’s API currently calls `file.makePublic()`; if you prefer private objects, remove that call and serve via signed URLs.

### 4) Create a service account and key

1. IAM & Admin → Service Accounts → Create Service Account.
2. Grant roles:
   - `Storage Object Admin` (upload, update, and set ACLs)
   - Alternatively: `Storage Object Creator` + `Storage Object Viewer` if you handle ACLs elsewhere.
3. Create a JSON key and download it.
4. Copy its full JSON into `GOOGLE_APPLICATION_CREDENTIALS_JSON` in `.env.local` (escape newlines in `private_key` as `\n`).

### 5) Verify local upload

Run the dev server and test uploading both audio and video in the professor dashboard.

Expected behavior:
- Both files must be chosen; the UI uploads them together to `/api/upload`.
- Files are saved under `courses/{courseId}/lectures/{lectureNumber}-{timestamp}/audio.*` and `video.*`.
- API returns public URLs like `https://storage.googleapis.com/<bucket>/<path>`.

### 6) Production deployment

- Ensure the same env vars are configured in your hosting platform.
- If your host supports mounting secrets, store `GOOGLE_APPLICATION_CREDENTIALS_JSON` as a secret.
- Consider using VPC-SC or restricted service account scopes in production.

### Troubleshooting

- Missing env var: API will respond with a 500 and a helpful error message.
- `private_key` invalid: ensure `\n` are literal in `.env.local` and not real newlines.
- Access denied (403): verify bucket name, service account roles, and that the project ID matches the bucket’s project.
- Public access blocked: remove org/bucket policies that block public access, or switch to signed URLs and remove `makePublic()` from the API code.


