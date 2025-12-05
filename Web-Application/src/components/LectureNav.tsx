import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Lecture } from '../types';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface LectureNavProps {
  lectures: Lecture[];
  selectedLecture: string | null;
  onLectureSelect: (lectureId: string) => void;
}

export function LectureNav({ lectures, selectedLecture, onLectureSelect }: LectureNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLecture && scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(
        `[data-lecture-id="${selectedLecture}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedLecture]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scroll('left')}
          className="shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-2 pb-2">
            {lectures.map((lecture) => (
              <TooltipProvider key={lecture.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      data-lecture-id={lecture.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onLectureSelect(lecture.id)}
                      className={`shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedLecture === lecture.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow'
                      }`}
                    >
                      <div className="text-sm whitespace-nowrap">
                        Lecture {lecture.number}
                      </div>
                      <div
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          selectedLecture === lecture.id
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {new Date(lecture.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{lecture.topic}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => scroll('right')}
          className="shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
