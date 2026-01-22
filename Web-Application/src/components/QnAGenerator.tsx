import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, CheckCircle, Eye, Plus, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

interface QnAGeneratorProps {
  open: boolean;
  onClose: () => void;
  lectureContent?: unknown;
}

export function QnAGenerator({ open, onClose, lectureContent }: QnAGeneratorProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [questionFormat, setQuestionFormat] = useState<string>('mcq');
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic('');
      setError(null);
    } else if (topics.includes(currentTopic.trim())) {
      setError('This topic has already been added');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleGenerateQuiz = async () => {
    if (topics.length === 0) {
      setError('Please add at least one topic');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate questions for all topics
      const allQuestions = [];
      
      for (const topic of topics) {
        const response = await fetch('/api/qna/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            questionFormat,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate questions for topic: ${topic}`);
        }
        
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          allQuestions.push(...data.questions);
        }
      }
      
      if (allQuestions.length === 0) {
        throw new Error('No questions were generated');
      }
      
      setQuestions(allQuestions);
      setQuizGenerated(true);
      setShowSolutions(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setQuizGenerated(false);
    setShowSolutions(false);
    setTopics([]);
    setCurrentTopic('');
    setQuestions([]);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileQuestion className="w-6 h-6 text-purple-600" />
            QnA Generator
          </DialogTitle>
          <DialogDescription>
            Add topics and select question format to generate a personalized quiz
          </DialogDescription>
        </DialogHeader>

        {!quizGenerated ? (
          <div className="space-y-6 py-4">
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Topic Input */}
            <div>
              <Label className="text-base mb-3 block">Add Topics</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a topic (e.g., Quantum Mechanics, Data Structures)"
                  value={currentTopic}
                  onChange={(e) => setCurrentTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTopic}
                  disabled={!currentTopic.trim()}
                  size="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Press Enter or click Add to add the topic to your list
              </p>
            </div>

            {/* Topics List */}
            {topics.length > 0 && (
              <div>
                <Label className="text-base mb-3 block">
                  Selected Topics ({topics.length})
                </Label>
                <div className="space-y-2">
                  <AnimatePresence>
                    {topics.map((topic, index) => (
                      <motion.div
                        key={topic}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <span className="text-sm font-medium">{topic}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTopic(topic)}
                          >
                            <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Question Format */}
            <div>
              <Label className="text-base mb-3 block">Question Format</Label>
              <Select value={questionFormat} onValueChange={setQuestionFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice Questions (MCQ)</SelectItem>
                  <SelectItem value="subjective">Subjective Questions</SelectItem>
                  <SelectItem value="mathematical">Mathematical Problems</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || topics.length === 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Generated Quiz</h3>
                <p className="text-sm text-gray-600">
                  {questions.length} questions •{' '}
                  {questionFormat === 'mcq'
                    ? 'Multiple Choice'
                    : questionFormat === 'subjective'
                    ? 'Subjective'
                    : 'Mathematical Problems'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSolutions(!showSolutions)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showSolutions ? 'Hide' : 'Show'} Solutions
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  New Quiz
                </Button>
              </div>
            </div>

            <Separator />

            {/* Questions */}
            <div className="space-y-6">
              <AnimatePresence>
                {questions.length > 0 ? (
                  questions.map((q: any, idx: number) => (
                    <motion.div
                      key={q.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <Badge variant="secondary">Q{idx + 1}</Badge>
                          <p className="flex-1 text-gray-800">{q.question}</p>
                        </div>

                        {/* MCQ Options */}
                        {questionFormat === 'mcq' && q.options && (
                          <div className="space-y-2 mb-4">
                            {q.options.map((option: string, i: number) => (
                              <div
                                key={i}
                                className={`p-3 rounded-lg border ${
                                  showSolutions && i === q.correct
                                    ? 'bg-green-50 border-green-500'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sm">
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span>{option}</span>
                                  {showSolutions && i === q.correct && (
                                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Solution */}
                        {showSolutions && (q.explanation || q.solution) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                          >
                            <h4 className="mb-2 flex items-center gap-2 font-semibold">
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                              Solution
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {q.explanation || q.solution}
                            </p>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No questions generated. Please try again with a different topic.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}