import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Upload, Hash, Calendar } from "lucide-react";

interface SlidesUploadProps {
  selectedSlideFile: File | null;
  slideLectureNumber: string;
  setSlideLectureNumber: (value: string) => void;
  slideDate: string;
  setSlideDate: (value: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "slides" | "audio" | "video") => void;
  handleSlideUpload: () => void;
  isUploading?: boolean;
}

export function SlidesUpload({
  selectedSlideFile,
  slideLectureNumber,
  setSlideLectureNumber,
  slideDate,
  setSlideDate,
  handleFileUpload,
  handleSlideUpload,
  isUploading = false,
}: SlidesUploadProps) {
  return (
    <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700">
        Upload Slides and Books
      </h2>

      <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-all max-w-md mx-auto">
        <Upload className="w-8 h-8 mb-3 text-purple-600" />
        <h3 className="font-medium mb-2">Upload Slides and Books</h3>
        <input
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="hidden"
          id="upload-slides"
          onChange={(e) => handleFileUpload(e, "slides")}
        />
        <Button
          variant="outline"
          className="bg-purple-50 hover:bg-purple-100"
          onClick={() =>
            document.getElementById("upload-slides")?.click()
          }
        >
          Choose File
        </Button>

        {selectedSlideFile && (
          <div className="mt-4 w-full space-y-3">
            <p className="text-sm text-gray-700 font-medium">
              Selected: {selectedSlideFile.name}
            </p>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Lecture Number
              </label>
              <div className="flex items-center gap-2">
                <Hash className="text-purple-600 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="Enter lecture number"
                  value={slideLectureNumber}
                  onChange={(e) => setSlideLectureNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Date
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="text-purple-600 w-4 h-4" />
                <Input
                  type="date"
                  value={slideDate}
                  onChange={(e) => setSlideDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSlideUpload}
              disabled={isUploading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Uploading...
                </span>
              ) : (
                "Upload Slide and Books"
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}