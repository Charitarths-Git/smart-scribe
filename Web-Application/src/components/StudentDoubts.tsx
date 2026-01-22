import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { MessageSquare, PlusCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStudentDoubts, getCourses, createDoubt } from '../lib/api';

interface Doubt {
  id: string;
  courseId: string;
  studentName: string;
  question: string;
  date: string;
  reply?: string | null;
}

interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
}

interface StudentDoubtsProps {
  onClose: () => void;
}

export function StudentDoubts({ onClose }: StudentDoubtsProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newDoubt, setNewDoubt] = useState({
    courseId: '',
    studentName: '',
    question: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [doubtsData, coursesData] = await Promise.all([
          getStudentDoubts(),
          getCourses()
        ]);
        setDoubts(doubtsData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDoubt.courseId || !newDoubt.studentName || !newDoubt.question) {
      alert('Please fill all fields');
      return;
    }

    try {
      await createDoubt({
        courseId: newDoubt.courseId,
        studentName: newDoubt.studentName,
        question: newDoubt.question,
        date: newDoubt.date
      });

      // Refresh doubts
      const updatedDoubts = await getStudentDoubts();
      setDoubts(updatedDoubts);

      // Reset form
      setNewDoubt({
        courseId: '',
        studentName: '',
        question: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating doubt:', error);
      alert('Failed to submit doubt');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doubts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">My Doubts</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ask Doubt
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Doubt Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ask a New Doubt</h2>
            <form onSubmit={handleSubmitDoubt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <select
                  value={newDoubt.courseId}
                  onChange={(e) => setNewDoubt({ ...newDoubt, courseId: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  type="text"
                  value={newDoubt.studentName}
                  onChange={(e) => setNewDoubt({ ...newDoubt, studentName: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <textarea
                  value={newDoubt.question}
                  onChange={(e) => setNewDoubt({ ...newDoubt, question: e.target.value })}
                  placeholder="Enter your question..."
                  className="w-full border rounded-md px-3 py-2 min-h-[120px]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Doubt
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewDoubt({
                      courseId: '',
                      studentName: '',
                      question: '',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Doubts List */}
      <div className="max-w-5xl mx-auto">
        <Card className="p-6 md:p-8">
          {doubts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg mb-2">No doubts yet</p>
              <p className="text-gray-500">Ask your first doubt to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {doubts.map((doubt) => {
                const course = courses.find((c) => c.id === doubt.courseId);
                return (
                  <div
                    key={doubt.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-all bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <p className="font-semibold text-blue-700">
                        {doubt.studentName}
                      </p>
                      <p className="text-sm text-gray-500">{doubt.date}</p>
                    </div>
                    <p className="text-gray-800 mb-2">{doubt.question}</p>
                    <p className="text-sm text-gray-600 italic">
                      Course: {course ? `${course.code} - ${course.name}` : 'Unknown'}
                    </p>

                    {doubt.reply && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm font-semibold text-green-700 mb-1">
                          Professor's Reply:
                        </p>
                        <p className="text-green-700">{doubt.reply}</p>
                      </div>
                    )}
                    {!doubt.reply && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 italic">
                          Waiting for professor's reply...
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
