import { useState, useEffect } from 'react';
import { FileQuestion, X, MessageCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { LectureNav } from './LectureNav';
import { LectureContent } from './LectureContent';
import { ChatPanel } from './ChatPanel';
import { PlanningMode } from './PlanningMode';
import { ProjectSection } from './ProjectSection';
import { QnAGenerator } from './QnAGenerator';
import { Button } from './ui/button';
import { courses, lectures, lectureContents } from '../data/mockData';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface StudentDashboardProps {
  onLogout: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(courses[0].id);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'lectures' | 'planning' | 'projects'>('lectures');
  const [qnaDialogOpen, setQnaDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (selectedCourse && currentMode === 'lectures') {
      const courseLectures = lectures[selectedCourse];
      if (courseLectures && courseLectures.length > 0) {
        setSelectedLecture(courseLectures[0].id);
      }
    }
  }, [selectedCourse, currentMode]);

  const getCurrentLectures = () => {
    if (!selectedCourse) return [];
    return lectures[selectedCourse] || [];
  };

  const getCurrentContent = () => {
    if (!selectedLecture) return null;
    return lectureContents[selectedLecture] || null;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0`}
      >
        {/* Close button (mobile only) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 md:hidden">
          <h2 className="font-semibold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Sidebar
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseSelect={setSelectedCourse}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m0 6H4" />
              </svg>
            </Button>
            <h1 className="font-semibold text-lg">Student Dashboard</h1>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setQnaDialogOpen(true)}
                  variant="outline"
                  className="gap-2 text-sm"
                >
                  <FileQuestion className="w-4 h-4" />
                  QnA Generator
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate custom quizzes from course concepts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* LectureNav (always visible) */}
        {currentMode === 'lectures' && (
          <div className="bg-gray-50 border-b border-gray-200 overflow-x-auto">
            <LectureNav
              lectures={getCurrentLectures()}
              selectedLecture={selectedLecture}
              onLectureSelect={setSelectedLecture}
            />
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {currentMode === 'lectures' && getCurrentContent() && (
              <LectureContent content={getCurrentContent()!} />
            )}
            {currentMode === 'lectures' && !getCurrentContent() && (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <p className="text-xl mb-2">No lecture content available</p>
                  <p className="text-sm">Select a different lecture or course</p>
                </div>
              </div>
            )}
            {currentMode === 'planning' && <PlanningMode />}
            {currentMode === 'projects' && <ProjectSection />}
          </div>

          {/* Chat panel (only on desktop) */}
          <div className="hidden lg:block w-[350px] border-l border-gray-200">
            <ChatPanel />
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Button for iPad/Mobile */}
      <Button
        className="fixed bottom-5 right-5 rounded-full shadow-lg p-3 md:flex lg:hidden bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Slide-in ChatPanel (for iPad and mobile) */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${chatOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:hidden`}
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <ChatPanel />
      </div>

      {/* QnA Dialog */}
      <QnAGenerator open={qnaDialogOpen} onClose={() => setQnaDialogOpen(false)} />
    </div>
  );
}
