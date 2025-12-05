import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, FolderKanban, LogOut } from 'lucide-react';
import { Course } from '../types';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface SidebarProps {
  courses: Course[];
  selectedCourse: string | null;
  onCourseSelect: (courseId: string) => void;
  currentMode: 'lectures' | 'planning' | 'projects';
  onModeChange: (mode: 'lectures' | 'planning' | 'projects') => void;
  onLogout: () => void;
}

export function Sidebar({
  courses,
  selectedCourse,
  onCourseSelect,
  currentMode,
  onModeChange,
  onLogout,
}: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          My Courses
        </h2>
      </div>

      {/* Mode Selector */}
      <div className="p-4 space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === 'lectures' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onModeChange('lectures')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Lectures
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>View course lectures and notes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === 'planning' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onModeChange('planning')}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Planning Mode
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>AI-powered concept explanation across courses</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === 'projects' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onModeChange('projects')}
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Projects
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Project ideas and planning assistance</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator />

      {/* Course List */}
      {currentMode === 'lectures' && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onCourseSelect(course.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                          selectedCourse === course.id
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="text-sm mb-1">{course.code}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {course.name}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div>
                        <p className="mb-1">{course.name}</p>
                        <p className="text-xs text-gray-400">{course.professor}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
