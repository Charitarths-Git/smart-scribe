import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { Storage } from "@google-cloud/storage";
import fs from "fs";

function getStorage() {
  const projectId = process.env.GCP_PROJECT_ID;
  const jsonEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const jsonPathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const clientEmailEnv = process.env.GCP_CLIENT_EMAIL;
  const privateKeyEnv = process.env.GCP_PRIVATE_KEY;

  if (!projectId) {
    throw new Error("Missing GCP_PROJECT_ID env var");
  }

  let parsed: any | null = null;
  let lastError: unknown = null;

  if (jsonEnv) {
    try {
      const maybeDecoded = jsonEnv.trim().startsWith("{")
        ? jsonEnv
        : Buffer.from(jsonEnv, "base64").toString("utf8");
      parsed = JSON.parse(maybeDecoded);
    } catch (e) {
      lastError = e;
    }
  }
  if (!parsed && jsonPathEnv) {
    try {
      const file = fs.readFileSync(jsonPathEnv, "utf8");
      parsed = JSON.parse(file);
    } catch (e) {
      lastError = e;
    }
  }
  if (!parsed) {
    if (clientEmailEnv && privateKeyEnv) {
      parsed = {
        client_email: clientEmailEnv,
        private_key: privateKeyEnv,
      };
    } else {
      const hint = jsonEnv
        ? "GOOGLE_APPLICATION_CREDENTIALS_JSON looks invalid (ensure valid JSON, or provide base64 of the JSON)."
        : jsonPathEnv
          ? "GOOGLE_APPLICATION_CREDENTIALS path could not be read or parsed."
          : "Provide GOOGLE_APPLICATION_CREDENTIALS_JSON, GOOGLE_APPLICATIONS_CREDENTIALS, or GCP_CLIENT_EMAIL and GCP_PRIVATE_KEY.";
      throw new Error(`Failed to load GCP credentials: ${hint}`);
    }
  }
  if (parsed.private_key && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return new Storage({ projectId, credentials: parsed });
}

async function uploadBufferToGCS(params: {
  bucketName: string;
  destinationPath: string;
  buffer: Buffer;
  contentType?: string | null;
}) {
  const { bucketName, destinationPath, buffer, contentType } = params;
  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destinationPath);
  await file.save(buffer, {
    resumable: false,
    contentType: contentType ?? undefined,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });
  return `https://storage.googleapis.com/${bucketName}/${encodeURI(destinationPath)}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const slidesFile = formData.get("file");
    const courseId = (formData.get("courseId") as string) || "unknown-course";
    const slideLectureNumber = (formData.get("lectureNumber") as string) || "";
    const slideDate = (formData.get("date") as string) || "";

    if (!(slidesFile instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "Missing GCS_BUCKET_NAME env var" },
        { status: 500 }
      );
    }

    let safeBaseName = slidesFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    let slideMetaPrefix = slideLectureNumber ? `lecture${slideLectureNumber}` : '';
    slideMetaPrefix += slideDate ? `_${slideDate}` : '';
    if (slideMetaPrefix) slideMetaPrefix += '_';
    const dest = `courses/${courseId}/slides/${slideMetaPrefix}_${safeBaseName}`;
    const arrayBuffer = await slidesFile.arrayBuffer();
    const url = await uploadBufferToGCS({
      bucketName,
      destinationPath: dest,
      buffer: Buffer.from(arrayBuffer),
      contentType: slidesFile.type,
    });
    return NextResponse.json({ url, path: dest });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Slides upload failed" },
      { status: 500 }
    );
  }
}


