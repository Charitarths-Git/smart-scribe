import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { FileAudio, FileVideo, Hash, Calendar } from "lucide-react";
import { Course } from "../../types/index";
import { getLectures, createLecture, createLectureProcessing, updateLectureProcessingStatus } from "../../lib/api";

interface CourseUploadProps {
  selectedCourse: Course;
  lectureNumber: string;
  setLectureNumber: (value: string) => void;
  lectureDate: string;
  setLectureDate: (value: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "slides" | "audio" | "video") => void;
  handleGenerateContent: () => void;
  pendingAudioFile: File | null;
  pendingVideoFile: File | null;
}

export function CourseUpload({
  selectedCourse,
  lectureNumber,
  setLectureNumber,
  lectureDate,
  setLectureDate,
  handleFileUpload,
  handleGenerateContent,
  pendingAudioFile,
  pendingVideoFile,
}: CourseUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);

  const canUploadBoth = Boolean(
    selectedCourse.materials?.audio &&
    selectedCourse.materials?.video &&
    lectureNumber &&
    lectureDate
  );

  const handleUploadBoth = async () => {
    if (!canUploadBoth) return;
    try {
      setIsUploading(true);
      const audioFile = pendingAudioFile;
      const videoFile = pendingVideoFile;
      if (!audioFile || !videoFile) {
        alert("Please choose both audio and video files.");
        return;
      }

      // Direct-to-GCS resumable uploads for audio and video
      async function initResumable(kind: 'audio' | 'video', file: File) {
        const initRes = await fetch('/api/upload/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: selectedCourse.id,
            lectureNumber,
            lectureDate,
            kind,
            filename: file.name,
            type: file.type,
          }),
        });
        if (!initRes.ok) {
          const e = await initRes.json().catch(() => ({} as any));
          throw new Error((e as any).error || 'Failed to initialize upload');
        }
        return initRes.json() as Promise<{ uploadUrl: string; destinationPath: string; pathPrefix: string }>
      }

      async function putFile(uploadUrl: string, file: File) {
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!putRes.ok) throw new Error('Upload to GCS failed');
      }

      const [audioInit, videoInit] = await Promise.all([
        initResumable('audio', audioFile),
        initResumable('video', videoFile),
      ]);

      await Promise.all([
        putFile(audioInit.uploadUrl, audioFile),
        putFile(videoInit.uploadUrl, videoFile),
      ]);

      const data = {
        audioUrl: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || ''}/${encodeURI(audioInit.destinationPath)}`,
        videoUrl: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || ''}/${encodeURI(videoInit.destinationPath)}`,
      } as const;

      const evt = new CustomEvent("gcs-upload-completed", {
        detail: {
          audioUrl: data.audioUrl as string,
          videoUrl: data.videoUrl as string,
        },
      });
      window.dispatchEvent(evt);
      alert("✅ Files uploaded to cloud successfully.");

      // Ensure lecture exists, then create processing record
      const courseId = selectedCourse.id;
      const lectureNum = Number(lectureNumber);
      // Try to find an existing lecture for this course and number
      let lectureId: string | null = null;
      try {
        const lectures = await getLectures(courseId);
        const existing = lectures.find(l => l.number === lectureNum);
        if (existing) {
          lectureId = existing.id;
        } else {
          const created = await createLecture({
            topic: `Lecture ${lectureNum}`,
            date: lectureDate,
            number: lectureNum,
            courseId,
          });
          lectureId = created.id;
        }
      } catch (err) {
        console.error("Failed ensuring lecture exists:", err);
      }

      if (lectureId) {
        try {
          const proc = await createLectureProcessing({
            lectureId,
            audioFile: data.audioUrl as string,
            videoFile: data.videoUrl as string,
          });
          // Move to processing state right away per requirement
          await updateLectureProcessingStatus(proc.id, 'processing');
        } catch (err) {
          console.error("Failed creating or updating lecture processing row:", err);
        }
      }
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700">
        Generate Lecture Content
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Audio Upload */}
        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-all">
          <FileAudio className="w-8 h-8 mb-3 text-blue-600" />
          <h3 className="font-medium mb-2">Upload Audio</h3>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            id="upload-audio"
            onChange={(e) => handleFileUpload(e, "audio")}
          />
          <Button
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100"
            onClick={() =>
              document.getElementById("upload-audio")?.click()
            }
          >
            Choose File
          </Button>
          {selectedCourse.materials?.audio && (
            <div className="mt-4 w-full">
              <p className="text-xs font-semibold text-gray-600 mb-1">Current:</p>
              <p className="text-xs text-gray-700 truncate">
                🎵 {selectedCourse.materials.audio}
              </p>
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-all">
          <FileVideo className="w-8 h-8 mb-3 text-green-600" />
          <h3 className="font-medium mb-2">Upload Video</h3>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="upload-video"
            onChange={(e) => handleFileUpload(e, "video")}
          />
          <Button
            variant="outline"
            className="bg-green-50 hover:bg-green-100"
            onClick={() =>
              document.getElementById("upload-video")?.click()
            }
          >
            Choose File
          </Button>
          {selectedCourse.materials?.video && (
            <div className="mt-4 w-full">
              <p className="text-xs font-semibold text-gray-600 mb-1">Current:</p>
              <p className="text-xs text-gray-700 truncate">
                🎬 {selectedCourse.materials.video}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Both to Cloud */}
      {selectedCourse.materials?.audio && selectedCourse.materials?.video && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Upload to Cloud</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Hash className="text-purple-600" />
              <Input
                type="number"
                placeholder="Lecture Number"
                value={lectureNumber}
                onChange={(e) => setLectureNumber(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar className="text-purple-600" />
              <Input
                type="date"
                value={lectureDate}
                onChange={(e) => setLectureDate(e.target.value)}
              />
            </div>
            <Button onClick={handleUploadBoth} disabled={!canUploadBoth || isUploading} className="bg-purple-600 hover:bg-purple-700 text-white px-6">
              {isUploading ? "Processing..." : "Process Lecture Content"}
            </Button>
          </div>
        </div>
      )}

      
    </Card>
  );
}