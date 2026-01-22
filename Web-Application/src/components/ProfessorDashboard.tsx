import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import {
  getCourses,
  getProfessorDoubts,
  replyToDoubt,
  createCourse,
} from "../lib/api";
import { Course, ProfessorDoubt } from "../types/index";
import { Sidebar } from "./professor/Sidebar";
import { CourseUpload } from "./professor/CourseUpload";
import { SlidesUpload } from "./professor/SlidesUpload";
import { DoubtsSection } from "./professor/DoubtsSection";
import { LectureProcessing } from "./professor/LectureProcessing";
import { SlidesManagement } from "./professor/SlidesManagement";
import { Card } from "./ui/card";

interface ProfessorDashboardProps {
  onLogout: () => void;
}

export function ProfessorDashboard({ onLogout }: ProfessorDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [doubts, setDoubts] = useState<ProfessorDoubt[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [view, setView] = useState<"courses" | "doubts">("courses");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [lectureNumber, setLectureNumber] = useState("");
  const [lectureDate, setLectureDate] = useState("");
  const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);

  // Slides upload state
  const [selectedSlideFile, setSelectedSlideFile] = useState<File | null>(null);
  const [slideLectureNumber, setSlideLectureNumber] = useState("");
  const [slideDate, setSlideDate] = useState("");
  const [isSlideUploading, setIsSlideUploading] = useState(false);

  const [newCourse, setNewCourse] = useState({
    courseName: "",
    courseCode: "",
    semester: "",
    academicYear: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const coursesData = await getCourses();
        const mappedCourses: Course[] = coursesData.map((c) => ({
          id: c.id,
          courseName: c.name,
          courseCode: c.code,
          name: c.name,
          code: c.code,
          professor: c.professor,
          semester: "odd",
          academicYear: "2025-26",
          materials: { slides: [], audio: null, video: null, generatedContent: [] },
        }));
        setCourses(mappedCourses);

        const doubtsData = await getProfessorDoubts();
        setDoubts(doubtsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCourseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleAddCourse = async (e: React.FormEvent) => {
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

    try {
      const courseId = `c${Date.now()}`;
      await createCourse({
        id: courseId,
        code: newCourse.courseCode,
        name: newCourse.courseName,
        professor: "Dr. Professor",
      });

      const newCourseObj: Course = {
        id: courseId,
        courseName: newCourse.courseName,
        courseCode: newCourse.courseCode,
        name: newCourse.courseName,
        code: newCourse.courseCode,
        professor: "Dr. Professor",
        semester: newCourse.semester,
        academicYear: newCourse.academicYear,
        materials: { slides: [], audio: null, video: null, generatedContent: [] },
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
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course");
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "slides" | "audio" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourseId) return;

    if (type === "slides") {
      setSelectedSlideFile(file);
      e.target.value = "";
      return;
    }

    // For audio and video, replace the current file
    const updatedCourses = courses.map((c) => {
      if (c.id !== selectedCourseId) return c;
      const newMaterials = { ...c.materials! };

      if (type === "audio") {
        newMaterials.audio = file.name;
        setPendingAudioFile(file);
      } else if (type === "video") {
        newMaterials.video = file.name;
        setPendingVideoFile(file);
      }

      return { ...c, materials: newMaterials };
    });

    setCourses(updatedCourses);
    e.target.value = "";
  };

  const handleSlideUpload = async () => {
    if (!selectedSlideFile || !selectedCourseId || !slideLectureNumber || !slideDate) {
      alert("Please fill all fields before uploading.");
      return;
    }
    try {
      setIsSlideUploading(true);
      const form = new FormData();
      form.append("file", selectedSlideFile);
      form.append("courseId", selectedCourseId);
      form.append("lectureNumber", slideLectureNumber);
      form.append("date", slideDate);
      const res = await fetch("/api/upload/slides", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error || "Slide upload failed");
      const data = await res.json();
      const slideUrl = data.url;
      const updatedCourses = courses.map((c) => {
        if (c.id !== selectedCourseId) return c;
        const newMaterials = { ...c.materials! };
        newMaterials.slides.push({
          name: selectedSlideFile.name,
          lectureNumber: slideLectureNumber,
          date: slideDate,
          url: slideUrl,
        });
        return { ...c, materials: newMaterials };
      });
      setCourses(updatedCourses);
      setSelectedSlideFile(null);
      setSlideLectureNumber("");
      setSlideDate("");
      alert("✅ Slide uploaded to cloud!");
    } catch (error: any) {
      alert(error?.message || "Slide upload failed");
    } finally {
      setIsSlideUploading(false);
    }
  };

  const handleReply = async (id: string) => {
    const replyText = prompt("Enter your reply:");
    if (!replyText) return;
    try {
      await replyToDoubt(id, replyText);
      const updatedDoubts = doubts.map((d) =>
        d.id === id ? { ...d, reply: replyText } : d
      );
      setDoubts(updatedDoubts);
    } catch (error) {
      console.error("Error replying to doubt:", error);
      alert("Failed to reply to doubt");
    }
  };

  const handleGenerateContent = () => {
    if (!lectureNumber || !lectureDate) {
      alert("Please enter lecture number and date before generating content.");
      return;
    }

    if (!selectedCourse?.materials?.audio || !selectedCourse?.materials?.video) {
      alert("Please upload both audio and video files first.");
      return;
    }

    const updatedCourses = courses.map((c) => {
      if (c.id !== selectedCourseId) return c;
      const newMaterials = { ...c.materials! };

      newMaterials.generatedContent.push({
        lectureNumber,
        date: lectureDate,
        audioFile: newMaterials.audio!,
        videoFile: newMaterials.video!,
      });

      // Clear current audio and video
      newMaterials.audio = null;
      newMaterials.video = null;

      return { ...c, materials: newMaterials };
    });

    setCourses(updatedCourses);
    setLectureNumber("");
    setLectureDate("");
    alert(`✅ Content generated for Lecture ${lectureNumber} on ${lectureDate}`);
  };

  // Capture upload completion from child and persist URLs on the course
  React.useEffect(() => {
    function onUploaded(e: any) {
      const { audioUrl, videoUrl } = e.detail || {};
      if (!audioUrl || !videoUrl || !selectedCourseId) return;
      const updated = courses.map((c) => {
        if (c.id !== selectedCourseId) return c;
        const newMaterials = { ...c.materials! };
        newMaterials.audio = audioUrl;
        newMaterials.video = videoUrl;
        return { ...c, materials: newMaterials };
      });
      setCourses(updated);
    }
    window.addEventListener("gcs-upload-completed", onUploaded as any);
    return () => window.removeEventListener("gcs-upload-completed", onUploaded as any);
  }, [courses, selectedCourseId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Component */}
      <Sidebar
        view={view}
        setView={setView}
        courses={courses}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        setIsAddingCourse={setIsAddingCourse}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {/* Empty State - No Course Selected */}
        {view === "courses" && !selectedCourse && !isAddingCourse && (
          <div className="flex items-center justify-center h-full">
            <Card className="p-12 shadow-md border border-gray-200 bg-white rounded-2xl text-center max-w-md">
              <div className="mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  No Course Selected
                </h2>
                <p className="text-gray-600 mb-6">
                  Please select a course from the sidebar or add a new course to get started.
                </p>
              </div>
            
            </Card>
          </div>
        )}

        {/* Course Management Section */}
        {view === "courses" && selectedCourse && !isAddingCourse && (
          <div className="space-y-6">
            {/* Course Upload Component */}
            <CourseUpload
              selectedCourse={selectedCourse}
              lectureNumber={lectureNumber}
              setLectureNumber={setLectureNumber}
              lectureDate={lectureDate}
              setLectureDate={setLectureDate}
              handleFileUpload={handleFileUpload}
              handleGenerateContent={handleGenerateContent}
        pendingAudioFile={pendingAudioFile}
        pendingVideoFile={pendingVideoFile}
            />

            {/* Lecture Processing Status */}
            {selectedCourseId && (
              <LectureProcessing courseId={selectedCourseId} />
            )}
            
            {/* Previous Lectures */}
            {selectedCourse.materials?.generatedContent && 
             selectedCourse.materials.generatedContent.length > 0 && (
              <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700">
                  Previous Lectures
                </h2>
                <div className="space-y-4">
                  {selectedCourse.materials.generatedContent.map((content, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 bg-gray-50 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-purple-700">
                          Lecture {content.lectureNumber}
                        </h3>
                        <p className="text-sm text-gray-500">{content.date}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-700">🎵 Audio: {content.audioFile}</p>
                        <p className="text-gray-700">🎬 Video: {content.videoFile}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Slides Upload Component */}
            <SlidesUpload
              selectedSlideFile={selectedSlideFile}
              slideLectureNumber={slideLectureNumber}
              setSlideLectureNumber={setSlideLectureNumber}
              slideDate={slideDate}
              setSlideDate={setSlideDate}
              handleFileUpload={handleFileUpload}
              handleSlideUpload={handleSlideUpload}
              isUploading={isSlideUploading}
            />

            {/* Slides Management Component */}
            {selectedCourseId && (
              <SlidesManagement courseId={selectedCourseId} />
            )}
          </div>
        )}

        {/* Add Course Form */}
        {view === "courses" && isAddingCourse && (
          <Card className="p-8 shadow-md border border-gray-200 bg-white rounded-2xl max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700">
              Add New Course
            </h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={newCourse.courseName}
                  onChange={handleCourseChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Data Structures"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  name="courseCode"
                  value={newCourse.courseCode}
                  onChange={handleCourseChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. CS101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  value={newCourse.semester}
                  onChange={handleCourseChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="odd">Odd Semester</option>
                  <option value="even">Even Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={newCourse.academicYear}
                  onChange={handleCourseChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. 2023-24"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddingCourse(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add Course
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Doubts Section Component */}
        {view === "doubts" && (
          <DoubtsSection
            doubts={doubts}
            courses={courses}
            handleReply={handleReply}
          />
        )}
      </div>
    </div>
  );
}