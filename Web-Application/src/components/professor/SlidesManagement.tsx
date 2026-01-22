import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getLectures, getSlides, uploadSlide } from "../../lib/api";
import { Lecture, Slide } from "../../types";

interface SlidesManagementProps {
  courseId: string;
}

export function SlidesManagement({ courseId }: SlidesManagementProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [slides, setSlides] = useState<Record<string, Slide[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState({
    lectureId: "",
    fileName: "",
    filePath: ""
  });
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const lecturesData = await getLectures(courseId);
        setLectures(lecturesData);
        
        // Fetch slides for each lecture
        const slidesData: Record<string, Slide[]> = {};
        await Promise.all(
          lecturesData.map(async (lecture) => {
            const lectureSlides = await getSlides(lecture.id);
            slidesData[lecture.id] = lectureSlides;
          })
        );
        
        setSlides(slidesData);
        
        // Set first lecture as selected if available
        if (lecturesData.length > 0 && !selectedLecture) {
          setSelectedLecture(lecturesData[0].id);
          setUploadData(prev => ({ ...prev, lectureId: lecturesData[0].id }));
        }
      } catch (error) {
        console.error("Error fetching slides data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (courseId) {
      fetchData();
    }
  }, [courseId, selectedLecture]);

  const handleLectureSelect = (lectureId: string) => {
    setSelectedLecture(lectureId);
    setUploadData(prev => ({ ...prev, lectureId }));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, this would handle file upload to storage
      // For now, we'll just simulate adding a slide to the database
      const newSlide = await uploadSlide({
        lectureId: uploadData.lectureId,
        fileName: uploadData.fileName || `slide_${Date.now()}.pdf`,
        filePath: uploadData.filePath || `/uploads/slides/${Date.now()}.pdf`
      });
      
      // Update local state
      setSlides(prev => ({
        ...prev,
        [uploadData.lectureId]: [...(prev[uploadData.lectureId] || []), newSlide]
      }));
      
      // Reset form
      setUploadData({
        lectureId: selectedLecture || "",
        fileName: "",
        filePath: ""
      });
      setShowUploadForm(false);
    } catch (error) {
      console.error("Error uploading slide:", error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-md">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        Slides Management
      </h2>
      
      {lectures.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No lectures available for this course.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <Label htmlFor="lecture-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Lecture
            </Label>
            <div className="flex flex-wrap gap-2">
              {lectures.map(lecture => (
                <Button
                  key={lecture.id}
                  type="button"
                  variant={selectedLecture === lecture.id ? "default" : "outline"}
                  className={selectedLecture === lecture.id ? "bg-blue-600" : "bg-blue-50 hover:bg-blue-100"}
                  onClick={() => handleLectureSelect(lecture.id)}
                >
                  Lecture {lecture.number}
                </Button>
              ))}
            </div>
          </div>
          
          {selectedLecture && (
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-blue-700">
                    {lectures.find(l => l.id === selectedLecture)?.topic || 'Lecture Slides'}
                  </h3>
                  <Button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {showUploadForm ? "Cancel" : "Add More Slides"}
                  </Button>
                </div>
                
                {showUploadForm && (
                  <form onSubmit={handleUploadSubmit} className="mb-6 p-4 border rounded-lg bg-white">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Slide (PDF)
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".pdf"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadData(prev => ({
                                ...prev,
                                fileName: file.name,
                                filePath: `/uploads/slides/${file.name}`
                              }));
                            }
                          }}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Upload Slide
                      </Button>
                    </div>
                  </form>
                )}
                
                <div className="space-y-2">
                  {slides[selectedLecture]?.length > 0 ? (
                    slides[selectedLecture].map((slide, index) => (
                      <div 
                        key={slide.id}
                        className="flex justify-between items-center p-3 bg-white rounded border hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-600 font-medium">#{index + 1}</span>
                          <span className="text-gray-700">{slide.fileName}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => {
                              // In a real app, this would open the slide
                              alert(`Viewing slide: ${slide.fileName}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      No slides uploaded for this lecture yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}