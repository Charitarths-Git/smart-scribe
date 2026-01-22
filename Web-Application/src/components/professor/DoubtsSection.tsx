import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { MessageSquare } from "lucide-react";
import { Course, ProfessorDoubt } from "../../types/index";

interface DoubtsSectionProps {
  doubts: ProfessorDoubt[];
  courses: Course[];
  handleReply: (id: string) => void;
}

export function DoubtsSection({ doubts, courses, handleReply }: DoubtsSectionProps) {
  return (
    <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700 flex items-center justify-center gap-2">
        <MessageSquare className="w-6 h-6 text-purple-600" /> Student
        Doubts
      </h2>
      {doubts.length === 0 ? (
        <p className="text-center text-gray-500">No doubts asked yet.</p>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => {
            const course = courses.find((c) => c.id === doubt.courseId);
            return (
              <div
                key={doubt.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-all bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-purple-700">
                    Anonymous Student
                  </p>
                  <p className="text-sm text-gray-500">{doubt.date}</p>
                </div>
                <p className="text-gray-800 mb-1">{doubt.question}</p>
                <p className="text-sm text-gray-600 italic">
                  Course: {course ? course.courseName : "Unknown"}
                </p>
                <div className="mt-3">
                  {doubt.reply ? (
                    <p className="text-green-700 bg-green-50 p-2 rounded-md">
                      <strong>Reply:</strong> {doubt.reply}
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleReply(doubt.id)}
                      className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}