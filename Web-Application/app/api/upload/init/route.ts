import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (jsonEnv) {
    try {
      const maybeDecoded = jsonEnv.trim().startsWith("{")
        ? jsonEnv
        : Buffer.from(jsonEnv, "base64").toString("utf8");
      parsed = JSON.parse(maybeDecoded);
    } catch {}
  }
  if (!parsed && jsonPathEnv) {
    try {
      const file = fs.readFileSync(jsonPathEnv, "utf8");
      parsed = JSON.parse(file);
    } catch {}
  }
  if (!parsed) {
    if (clientEmailEnv && privateKeyEnv) {
      parsed = {
        client_email: clientEmailEnv,
        private_key: privateKeyEnv.replace(/\\n/g, "\n"),
      };
    } else {
      throw new Error(
        "Missing credentials. Provide GOOGLE_APPLICATION_CREDENTIALS_JSON, GOOGLE_APPLICATION_CREDENTIALS, or both GCP_CLIENT_EMAIL and GCP_PRIVATE_KEY."
      );
    }
  }
  if (parsed.private_key && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return new Storage({ projectId, credentials: parsed });
}

export async function POST(request: NextRequest) {
  try {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "Missing GCS_BUCKET_NAME env var" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Expected application/json body" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const courseId: string = body.courseId || "unknown-course";
    const lectureNumber: string = body.lectureNumber || "";
    const lectureDate: string = body.lectureDate || "";
    const kind: "audio" | "video" | undefined = body.kind;
    const filename: string = body.filename || "file.bin";
    const type: string | undefined = body.type;

    if (!kind || (kind !== "audio" && kind !== "video")) {
      return NextResponse.json(
        { error: "Provide kind as 'audio' or 'video'" },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const bucket = storage.bucket(bucketName);

    
    const ext = (filename.split(".").pop() || "bin").toLowerCase();
    const basePath = `courses/${courseId}/lectures/${
      lectureNumber || "unlabeled"
    }`;
    const destinationPath = `${basePath}/${kind}.${ext}`;

    const file = bucket.file(destinationPath);
    const [uploadUrl] = await file.createResumableUpload({
      origin: request.headers.get("origin") || undefined,
      metadata: {
        contentType: type || undefined,
        cacheControl: "public, max-age=31536000",
      },
    });

    return NextResponse.json({
      uploadUrl,
      destinationPath,
      pathPrefix: basePath,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to init resumable upload" },
      { status: 500 }
    );
  }
}


