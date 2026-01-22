import React from "react";
import { Button } from "../ui/button";
import { BookOpen, PlusCircle, LogOut, MessageSquare } from "lucide-react";
import { Course } from "../../types/index";

interface SidebarProps {
  view: "courses" | "doubts";
  setView: (view: "courses" | "doubts") => void;
  courses: Course[];
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string) => void;
  setIsAddingCourse: (isAdding: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export function Sidebar({
  view,
  setView,
  courses,
  selectedCourseId,
  setSelectedCourseId,
  setIsAddingCourse,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}: SidebarProps) {
  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 w-72 bg-white shadow-lg border-r p-6 flex flex-col justify-between z-40 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}
    >
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          Dashboard
        </h2>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setView("courses")}
            className={`w-full text-left p-3 rounded-md ${
              view === "courses"
                ? "bg-purple-100 border border-purple-400"
                : "hover:bg-gray-100"
            }`}
          >
            📘 Courses
          </button>
          <button
            onClick={() => setView("doubts")}
            className={`w-full text-left p-3 rounded-md ${
              view === "doubts"
                ? "bg-purple-100 border border-purple-400"
                : "hover:bg-gray-100"
            }`}
          >
            💬 Doubts
          </button>
        </div>

        {view === "courses" && (
          <div className="overflow-y-auto max-h-[60vh]">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Your Courses
            </h3>
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setIsAddingCourse(false);
                    setSidebarOpen(false);
                  }}
                  className={`cursor-pointer p-3 rounded-md break-words ${
                    selectedCourseId === course.id
                      ? "bg-purple-100 border border-purple-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium">{course.courseName}</p>
                  <p className="text-sm text-gray-600">{course.courseCode}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {view === "courses" && (
          <Button
            onClick={() => setIsAddingCourse(true)}
            className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <PlusCircle className="w-4 h-4" /> Add Course
          </Button>
        )}
        <Button
          onClick={onLogout}
          variant="outline"
          className="mt-4 w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </div>
  );
}