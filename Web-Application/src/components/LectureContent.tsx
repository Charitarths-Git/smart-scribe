import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  BookOpen, 
  Clock, 
  User, 
  MessageCircle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  PlayCircle
} from 'lucide-react';
import { LectureContent as LectureContentType } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

interface LectureContentProps {
  content: LectureContentType;
}

export function LectureContent({ content }: LectureContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['definition', 'content'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl mb-2">{content.topic}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              Auto-generated notes
            </Badge>
          </div>
        </motion.div>

        {/* Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Definition
            </h2>
            <p className="text-gray-700 leading-relaxed">{content.definition}</p>
          </Card>
        </motion.div>

        {/* Recording & Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-600" />
              Lecture Recording
            </h3>
            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <PlayCircle className="w-12 h-12" />
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              Book Reference
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg">
              {content.bookReference}
            </p>
          </Card>
        </motion.div>

        {/* Main Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection('content')}
            >
              <h2 className="text-2xl">Lecture Content</h2>
              <Button variant="ghost" size="sm">
                {expandedSections.has('content') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>
            </div>

            <AnimatePresence>
              {expandedSections.has('content') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {content.content.map((section, idx) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-5 rounded-lg border-l-4 ${
                        section.type === 'concept'
                          ? 'bg-purple-50 border-purple-500'
                          : section.type === 'proof'
                          ? 'bg-orange-50 border-orange-500'
                          : section.type === 'algorithm'
                          ? 'bg-green-50 border-green-500'
                          : section.type === 'example'
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg">{section.title}</h3>
                        {section.timestamp && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {section.timestamp}
                          </Badge>
                        )}
                      </div>
                      
                      {section.professorNote && (
                        <div className="mb-3 p-3 bg-white/60 rounded-lg border border-indigo-200">
                          <p className="text-sm text-indigo-700">
                            <User className="w-4 h-4 inline mr-2" />
                            <span className="italic">Professor said: "{section.professorNote}"</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </div>
                      
                      {section.image && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-4"
                        >
                          <img
                            src={section.image}
                            alt={section.imageCaption || section.title}
                            className="w-full rounded-lg shadow-md border-2 border-white"
                          />
                          {section.imageCaption && (
                            <p className="text-sm text-gray-600 mt-2 text-center italic">
                              {section.imageCaption}
                            </p>
                          )}
                        </motion.div>
                      )}
                      
                      {section.animation && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4"
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="relative">
                              <img
                                src={section.animation.thumbnail}
                                alt={section.animation.title}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <PlayCircle className="w-16 h-16 text-white" />
                              </div>
                              <Badge className="absolute top-2 right-2">
                                {section.animation.type}
                              </Badge>
                            </div>
                            <div className="p-4 bg-white">
                              <h4 className="text-sm font-semibold mb-1">{section.animation.title}</h4>
                              <p className="text-sm text-gray-600">{section.animation.description}</p>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                      
                      {section.bookReference && (
                        <div className="mt-3 p-3 bg-white/60 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700">
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            <span className="font-medium">Book Reference:</span> {section.bookReference}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Student Doubts Section */}
        {content.doubts && content.doubts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Student Questions & Doubts
              </h2>
              <div className="space-y-4">
                {content.doubts.map((doubt, idx) => (
                  <motion.div
                    key={doubt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <User className="w-5 h-5 text-yellow-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-900">{doubt.student}</span>
                          <Badge variant="outline" className="text-xs">
                            {doubt.timestamp}
                          </Badge>
                        </div>
                        <p className="text-gray-800 italic">"{doubt.question}"</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="pl-8">
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <p className="text-sm mb-1 text-blue-600">Professor's Answer:</p>
                        <p className="text-gray-700">{doubt.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Examples Section */}
        {content.examples && content.examples.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-orange-600" />
                Solved Examples
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {content.examples.map((example, idx) => (
                  <AccordionItem
                    key={example.id}
                    value={example.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                      <span className="text-left">{example.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-gray-900">Problem:</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                            {example.problem}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-gray-900">Solution:</h4>
                          <p className="text-gray-700 bg-green-50 p-4 rounded-lg whitespace-pre-line border-l-4 border-green-500">
                            {example.solution}
                          </p>
                        </div>
                        {example.image && (
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            src={example.image}
                            alt={example.title}
                            className="w-full rounded-lg shadow-md"
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </motion.div>
        )}

        {/* Animations Section */}
        {content.animations && content.animations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-purple-600" />
                Animated Explanations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {content.animations.map((animation, idx) => (
                  <motion.div
                    key={animation.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="cursor-pointer"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={animation.thumbnail}
                          alt={animation.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-white" />
                        </div>
                        <Badge className="absolute top-2 right-2">
                          {animation.type}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2">{animation.title}</h3>
                        <p className="text-sm text-gray-600">{animation.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
