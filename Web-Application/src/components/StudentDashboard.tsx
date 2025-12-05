import { useState, useEffect } from 'react';
import { FileQuestion } from 'lucide-react';
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

  // Auto-select first lecture when course changes
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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar
        courses={courses}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        {currentMode === 'lectures' && (
          <div className="bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <LectureNav
                lectures={getCurrentLectures()}
                selectedLecture={selectedLecture}
                onLectureSelect={setSelectedLecture}
              />
            </div>
            <div className="px-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setQnaDialogOpen(true)}
                      variant="outline"
                      className="gap-2"
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
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
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

          {/* Right Chat Panel */}
          <ChatPanel />
        </div>
      </div>

      {/* QnA Generator Dialog */}
      <QnAGenerator open={qnaDialogOpen} onClose={() => setQnaDialogOpen(false)} />
    </div>
  );
}
