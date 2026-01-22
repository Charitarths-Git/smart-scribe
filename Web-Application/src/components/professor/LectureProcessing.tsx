import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { getLectures, getLectureProcessing, createLectureProcessing, updateLectureProcessingStatus } from "../../lib/api";
import { Lecture, LectureProcessing as LectureProcessingType } from "../../types";

interface LectureProcessingProps {
  courseId: string;
}

export function LectureProcessing({ courseId }: LectureProcessingProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [processingItems, setProcessingItems] = useState<LectureProcessingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const lecturesData = await getLectures(courseId);
        setLectures(lecturesData);
        
        // Fetch processing status for each lecture
        const processingData = await Promise.all(
          lecturesData.map(async (lecture) => {
            const processing = await getLectureProcessing(lecture.id);
            return processing;
          })
        );
        
        setProcessingItems(processingData.filter(Boolean) as LectureProcessingType[]);
      } catch (error) {
        console.error("Error fetching lecture processing data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'uploading':
        return "bg-blue-100 text-blue-800";
      case 'processing':
        return "bg-yellow-100 text-yellow-800";
      case 'generating':
        return "bg-purple-100 text-purple-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return "send to server processing will start soon";
      case 'processing':
        return "Processing in Pipeline";
      case 'generating':
        return "Generating Content";
      case 'completed':
        return "Pushed on Website";
      default:
        return status;
    }
  };

  // Simulate status update (in a real app, this would be triggered by backend events)
  const simulateNextStatus = async (item: LectureProcessingType) => {
    const statusOrder = ['uploading', 'processing', 'generating', 'completed'];
    const currentIndex = statusOrder.indexOf(item.status);
    
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1] as 'uploading' | 'processing' | 'generating' | 'completed';
      
      try {
        await updateLectureProcessingStatus(item.id, nextStatus);
        
        // Update local state
        setProcessingItems(prev => 
          prev.map(p => 
            p.id === item.id ? { ...p, status: nextStatus } : p
          )
        );
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const startNewProcessing = async (lectureId: string) => {
    try {
      const newProcessing = await createLectureProcessing({
        lectureId,
        audioFile: "sample_audio.mp3",
        videoFile: "sample_video.mp4"
      });
      
      setProcessingItems(prev => [...prev, newProcessing]);
    } catch (error) {
      console.error("Error creating new processing:", error);
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
      <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700">
        Lecture Processing Status
      </h2>
      
      {processingItems.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">No lectures are currently being processed.</p>
          {lectures.length > 0 && (
            <div className="space-y-4">
              <p className="font-medium">Start processing for a lecture:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {lectures.map(lecture => (
                  <Button 
                    key={lecture.id}
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100"
                    onClick={() => startNewProcessing(lecture.id)}
                  >
                    Lecture {lecture.number}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {processingItems.map(item => {
            const lecture = lectures.find(l => l.id === item.lectureId);
            return (
              <div 
                key={item.id}
                className="border rounded-lg p-4 bg-gray-50 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-purple-700">
                    {lecture ? `Lecture ${lecture.number}` : 'Unknown Lecture'}
                  </h3>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                  {item.audioFile && <p className="text-gray-700">🎵 Audio: {item.audioFile}</p>}
                  {item.videoFile && <p className="text-gray-700">🎬 Video: {item.videoFile}</p>}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(item.updatedAt).toLocaleString()}
                  </p>
                  
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}