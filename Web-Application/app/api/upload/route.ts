import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import Busboy from "busboy";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
        private_key: privateKeyEnv.replace(/\\n/g, "\n"),
      };
    } else {
      const hint = jsonEnv
        ? "Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON."
        : jsonPathEnv
        ? "Invalid GOOGLE_APPLICATION_CREDENTIALS path."
        : "Missing credentials. Provide one of GOOGLE_APPLICATION_CREDENTIALS_JSON, GOOGLE_APPLICATION_CREDENTIALS, or both GCP_CLIENT_EMAIL and GCP_PRIVATE_KEY.";
      throw new Error(`Failed to load GCP credentials: ${hint}`);
    }
  }

  if (parsed.private_key && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  return new Storage({ projectId, credentials: parsed });
}

async function uploadStreamToGCS(params: {
  bucketName: string;
  destinationPath: string;
  stream: NodeJS.ReadableStream;
  contentType?: string | null;
}) {
  const { bucketName, destinationPath, stream, contentType } = params;
  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destinationPath);

  const writeStream = file.createWriteStream({
    resumable: true,
    contentType: contentType ?? undefined,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  await new Promise<void>((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
    stream.on("error", reject);
  });

  return `https://storage.googleapis.com/${bucketName}/${encodeURI(destinationPath)}`;
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
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    let courseId = "unknown-course";
    let lectureNumber = "";
    let lectureDate = "";

    let audioUrl: string | undefined;
    let videoUrl: string | undefined;
    const promises: Promise<void>[] = [];

    const bb = Busboy({ headers: { "content-type": contentType } });

    bb.on("field", (name, val) => {
      if (name === "courseId") courseId = val || "unknown-course";
      if (name === "lectureNumber") lectureNumber = val || "";
      if (name === "lectureDate") lectureDate = val || "";
    });

    bb.on("file", (name, file, info) => {
      const { filename, mimeType } = info;
      const ext = (filename?.split(".").pop() || "bin").toLowerCase();
      const basePath = `courses/${courseId}/lectures/${
        lectureNumber || "unlabeled"
      }`;
      const isAudio = name === "audio";
      const destinationPath = `${basePath}/${isAudio ? "audio" : "video"}.${ext}`;

      const p = uploadStreamToGCS({
        bucketName,
        destinationPath,
        stream: file,
        contentType: mimeType,
      }).then((url) => {
        if (isAudio) audioUrl = url; else videoUrl = url;
      });
      promises.push(p);
    });

    const nodeReadable = Readable.fromWeb(request.body as any);
    await new Promise<void>((resolve, reject) => {
      nodeReadable.pipe(bb);
      bb.on("close", resolve);
      bb.on("error", reject);
      nodeReadable.on("error", reject);
    });

    await Promise.all(promises);

    if (!audioUrl || !videoUrl) {
      return NextResponse.json(
        { error: "Both audio and video files are required" },
        { status: 400 }
      );
    }

    const pathPrefix = `courses/${courseId}/lectures/${
      lectureNumber || "unlabeled"
    }`;

    return NextResponse.json({
      success: true,
      audioUrl,
      videoUrl,
      courseId,
      lectureNumber,
      lectureDate,
      pathPrefix,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}


