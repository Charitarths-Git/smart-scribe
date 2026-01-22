## Environment variables example

Copy the relevant options below into `.env.local` in the project root and fill in values.

Required:
```bash
GCP_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=your-gcs-bucket-name
```

Pick ONE of the following credential methods:

Option A — base64 JSON (recommended):
```bash
# Paste base64 of your service-account JSON (no quotes)
GOOGLE_APPLICATION_CREDENTIALS_JSON=<BASE64_OF_JSON>
```

Option B — raw JSON one-line (escape private_key newlines as \n):
```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"service-account@your-gcp-project-id.iam.gserviceaccount.com","client_id":"...","token_uri":"https://oauth2.googleapis.com/token"}
```

Option C — file path to JSON key:
```bash
GOOGLE_APPLICATION_CREDENTIALS=C:\\absolute\\path\\to\\service-account.json
```

Option D — minimal vars:
```bash
GCP_CLIENT_EMAIL=service-account@your-gcp-project-id.iam.gserviceaccount.com
GCP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nLINE1\nLINE2\n-----END PRIVATE KEY-----\n
```


