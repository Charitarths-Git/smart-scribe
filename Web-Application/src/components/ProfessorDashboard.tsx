import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  Upload,
  LogOut,
  BookOpen,
  PlusCircle,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import professorData from "../data/prof.json";

interface MaterialSet {
  slides: string[];
  recordings: string[];
  notes: string[];
}

interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  semester: string;
  academicYear: string;
  materials: MaterialSet;
}

interface Doubt {
  id: string;
  courseId: string;
  studentName: string;
  question: string;
  date: string;
  reply?: string;
}

interface ProfessorData {
  professorId: string;
  name: string;
  courses: Course[];
  doubts: Doubt[];
}

interface ProfessorDashboardProps {
  onLogout: () => void;
}

export function ProfessorDashboard({ onLogout }: ProfessorDashboardProps) {
  const [courses, setCourses] = useState<Course[]>(professorData.courses);
  const [doubts, setDoubts] = useState<Doubt[]>(professorData.doubts);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [view, setView] = useState<"courses" | "doubts">("courses");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newCourse, setNewCourse] = useState({
    courseName: "",
    courseCode: "",
    semester: "",
    academicYear: "",
  });

  const handleCourseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newCourse.courseName ||
      !newCourse.courseCode ||
      !newCourse.semester ||
      !newCourse.academicYear
    ) {
      alert("Please fill all fields.");
      return;
    }

    const newCourseObj: Course = {
      id: `c${Date.now()}`,
      ...newCourse,
      materials: { slides: [], recordings: [], notes: [] },
    };

    setCourses([...courses, newCourseObj]);
    setIsAddingCourse(false);
    setSelectedCourseId(newCourseObj.id);
    setNewCourse({
      courseName: "",
      courseCode: "",
      semester: "",
      academicYear: "",
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleUpload = (type: "slides" | "recordings" | "notes") => {
    const fileName = prompt(`Enter ${type} file name (dummy simulation):`);
    if (!fileName) return;
    const updatedCourses = courses.map((c) =>
      c.id === selectedCourseId
        ? {
            ...c,
            materials: { ...c.materials, [type]: [...c.materials[type], fileName] },
          }
        : c
    );
    setCourses(updatedCourses);
  };

  const handleReply = (id: string) => {
    const replyText = prompt("Enter your reply:");
    if (!replyText) return;
    const updatedDoubts = doubts.map((d) =>
      d.id === id ? { ...d, reply: replyText } : d
    );
    setDoubts(updatedDoubts);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-20 shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Dashboard
        </h2>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-purple-600" />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.div
            key="sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:static top-0 left-0 w-72 bg-white shadow-lg border-r p-6 flex flex-col justify-between h-screen z-30"
          >
            {/* Close Button for Mobile */}
            <div className="lg:hidden flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                Dashboard
              </h2>

              {/* Sidebar Navigation */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setView("courses");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-md ${
                    view === "courses"
                      ? "bg-purple-100 border border-purple-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  📘 Courses
                </button>

                <button
                  onClick={() => {
                    setView("doubts");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-md ${
                    view === "doubts"
                      ? "bg-purple-100 border border-purple-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  💬 Doubts
                </button>
              </div>

              {/* Courses List */}
              {view === "courses" && (
                <div>
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
                        className={`cursor-pointer p-3 rounded-md ${
                          selectedCourseId === course.id
                            ? "bg-purple-100 border border-purple-400"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-gray-600">
                          {course.courseCode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Bottom Buttons */}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 p-10 mt-14 lg:mt-0 overflow-y-auto">
        {/* Add Course Form */}
        {isAddingCourse && view === "courses" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-medium mb-6 text-center">
              Add New Course
            </h2>
            <form onSubmit={handleAddCourse} className="space-y-5">
              <Input
                type="text"
                name="courseName"
                value={newCourse.courseName}
                onChange={handleCourseChange}
                placeholder="Course Name"
                required
              />
              <Input
                type="text"
                name="courseCode"
                value={newCourse.courseCode}
                onChange={handleCourseChange}
                placeholder="Course Code"
                required
              />
              <select
                name="semester"
                value={newCourse.semester}
                onChange={handleCourseChange}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Select Semester</option>
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
              <Input
                type="text"
                name="academicYear"
                value={newCourse.academicYear}
                onChange={handleCourseChange}
                placeholder="Academic Year (e.g. 2025-26)"
                required
              />
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Course
              </Button>
            </form>
          </motion.div>
        )}

        {/* Course Content Section */}
        {view === "courses" && selectedCourse && !isAddingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-center text-purple-700">
                {selectedCourse.courseName} ({selectedCourse.courseCode})
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Semester:{" "}
                <span className="font-medium">
                  {selectedCourse.semester.toUpperCase()}
                </span>{" "}
                • Academic Year:{" "}
                <span className="font-medium">
                  {selectedCourse.academicYear}
                </span>
              </p>

              {/* Uploaded Material */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Uploaded Material
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["slides", "recordings", "notes"].map((type) => (
                    <div key={type} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 capitalize">{type}</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {selectedCourse.materials[
                          type as keyof typeof selectedCourse.materials
                        ].length > 0 ? (
                          selectedCourse.materials[
                            type as keyof typeof selectedCourse.materials
                          ].map((file, idx) => <li key={idx}>{file}</li>)
                        ) : (
                          <p className="text-gray-400">No files uploaded</p>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-all">
                  <Upload className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-medium mb-2">Upload Slides</h3>
                  <Button
                    onClick={() => handleUpload("slides")}
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100"
                  >
                    Choose File
                  </Button>
                </div>
                <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-all">
                  <Upload className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-medium mb-2">Upload Recordings</h3>
                  <Button
                    onClick={() => handleUpload("recordings")}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    Choose File
                  </Button>
                </div>
                <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-all">
                  <Upload className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-medium mb-2">Upload Notes</h3>
                  <Button
                    onClick={() => handleUpload("notes")}
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100"
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Doubts Section */}
        {view === "doubts" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700 flex items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                Student Doubts
              </h2>

              {doubts.length === 0 ? (
                <p className="text-center text-gray-500">
                  No doubts asked yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {doubts.map((doubt) => {
                    const course = courses.find(
                      (c) => c.id === doubt.courseId
                    );
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
          </motion.div>
        )}

        {!selectedCourse && view === "courses" && !isAddingCourse && (
          <p className="text-center text-gray-600 mt-40 text-lg">
            Select a course from the sidebar or add a new one.
          </p>
        )}
      </div>
    </div>
  );
}
