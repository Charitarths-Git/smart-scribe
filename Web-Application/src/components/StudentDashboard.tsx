import { useState, useEffect } from 'react';
import { FileQuestion, X, MessageCircle, HelpCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { LectureNav } from './LectureNav';
import { LectureContent } from './LectureContent';
import { ChatPanel } from './ChatPanel';
import { PlanningMode } from './PlanningMode';
import { ProjectSection } from './ProjectSection';
import { QnAGenerator } from './QnAGenerator';
import { StudentDoubts } from './StudentDoubts';
import { Button } from './ui/button';
import { Course, Lecture, LectureContent as LectureContentType } from '../types';
import { getCourses, getLectures, getLectureContent } from '../lib/api';
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Record<string, Lecture[]>>({});
  const [lectureContents, setLectureContents] = useState<Record<string, LectureContentType>>({});
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'lectures' | 'planning' | 'projects'>('lectures');
  const [qnaDialogOpen, setQnaDialogOpen] = useState(false);
  const [doubtsDialogOpen, setDoubtsDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load courses on mount
  useEffect(() => {
    async function loadData() {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load lectures when course changes
  useEffect(() => {
    async function loadLectures() {
      if (!selectedCourse) return;
      
      try {
        const lecturesData = await getLectures(selectedCourse);
        setLectures(prev => ({ ...prev, [selectedCourse]: lecturesData }));
        
        // Auto-select first lecture
        if (lecturesData.length > 0 && currentMode === 'lectures') {
          setSelectedLecture(lecturesData[0].id);
        }
      } catch (error) {
        console.error('Error loading lectures:', error);
      }
    }
    
    loadLectures();
  }, [selectedCourse, currentMode]);

  // Load lecture content when lecture changes
  useEffect(() => {
    async function loadLectureContent() {
      if (!selectedLecture) return;
      
      // Check if already loaded
      if (lectureContents[selectedLecture]) return;
      
      try {
        const content = await getLectureContent(selectedLecture);
        if (content) {
          // Debug: print links and content to console
          console.log('[LectureContent] Loaded for lecture:', selectedLecture);
          console.log('[LectureContent] Recording URL:', content.recordingUrl);
          console.log('[LectureContent] Book Reference:', content.bookReference);
          console.log('[LectureContent] Content sections:', content.content);
          console.log('[LectureContent] Animations:', content.animations);
          setLectureContents(prev => ({ ...prev, [selectedLecture]: content }));
        }
      } catch (error) {
        console.error('Error loading lecture content:', error);
      }
    }
    
    loadLectureContent();
  }, [selectedLecture]);

  const getCurrentLectures = () => {
    if (!selectedCourse) return [];
    return lectures[selectedCourse] || [];
  };

  const getCurrentContent = () => {
    if (!selectedLecture) return null;
    return lectureContents[selectedLecture] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setDoubtsDialogOpen(true)}
                    variant="outline"
                    className="gap-2 text-sm hidden md:flex"
                  >
                    <HelpCircle className="w-4 h-4" />
                    My Doubts
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View and ask your doubts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setQnaDialogOpen(true)}
                    variant="outline"
                    className="gap-2 text-sm"
                  >
                    <FileQuestion className="w-4 h-4" />
                    <span className="hidden md:inline">QnA Generator</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate custom quizzes from course concepts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
            <ChatPanel lectureContent={getCurrentContent()?.content as unknown} />
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Button for iPad/Mobile */}
      <Button
        className="fixed bottom-11 right-5 rounded-full shadow-lg p-3 md:flex lg:hidden bg-blue-600 text-white hover:bg-blue-700"
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
      <QnAGenerator 
        open={qnaDialogOpen} 
        onClose={() => setQnaDialogOpen(false)} 
        lectureContent={getCurrentContent()?.content as unknown} 
      />

      {/* Student Doubts Dialog/Page */}
      {doubtsDialogOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold">Doubts</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDoubtsDialogOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <StudentDoubts onClose={() => setDoubtsDialogOpen(false)} />
        </div>
      )}

      {/* Mobile Floating Doubt Button */}
      <Button
        className="fixed bottom-1 right-5 rounded-full shadow-lg p-3 md:hidden bg-green-600 text-white hover:bg-green-700 z-40"
        onClick={() => setDoubtsDialogOpen(true)}
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}