import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Brain, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { getInstitutes } from '../lib/api';
import { Institute } from '../types';

interface LandingPageProps {
  onLogin: (role: 'student' | 'professor', institute: string) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor' | null>(null);
  const [selectedInstitute, setSelectedInstitute] = useState<string>('');
  const [studentGmail, setStudentGmail] = useState<string>('');
  const [studentCourse, setStudentCourse] = useState<string>('');
  const [studentYear, setStudentYear] = useState<string>('');
  const [profGmail, setProfGmail] = useState<string>(''); 
  const [showAllInstitutes, setShowAllInstitutes] = useState<boolean>(false);

  useEffect(() => {
    async function loadInstitutes() {
      try {
        const institutesData = await getInstitutes();
        setInstitutes(institutesData);
      } catch (error) {
        console.error('Error loading institutes:', error);
      }
    }
    loadInstitutes();
  }, []);

  const initialInstitutesToShow = 6;
  const visibleInstitutes = showAllInstitutes ? institutes : institutes.slice(0, initialInstitutesToShow);

  const handleContinue = () => {
    if (selectedRole && selectedInstitute) {
      if (selectedRole === 'student') {
        if (!studentGmail || !studentCourse || !studentYear) {
          alert('Please fill in all student details.');
          return;
        }
        if (studentGmail !== 'demo@gmail.com') {
          alert('Please enter a valid Gmail or use demo Gmail');
          return;
        }
      }
      if (selectedRole === 'professor') {
        if (!profGmail) {
          alert('Please enter your email.');
          return;
        }
        if (profGmail !== 'demo@gmail.com') {
          alert('Please enter a valid Gmail or use demo Gmail');
          return;
        }
      }
      onLogin(selectedRole, selectedInstitute);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl">Smart Scribes</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-Powered Classroom Assistant - Transforming Live Lectures into Rich Multimedia Notes
          </p>
        </motion.div>

        {/* Features Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Sparkles, text: 'Multimodal AI Processing', color: 'text-purple-600' },
            { icon: BookOpen, text: 'Auto-Generated Notes', color: 'text-blue-600' },
            { icon: Brain, text: 'Smart Summaries', color: 'text-green-600' },
            { icon: GraduationCap, text: 'Interactive Learning', color: 'text-orange-600' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <feature.icon className={`w-6 h-6 ${feature.color} mb-2`} />
              <p className="text-sm text-gray-700">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Role Selection */}
        {!selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl text-center mb-6">Select Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="p-8 cursor-pointer border-2 hover:border-blue-500 hover:shadow-lg transition-all"
                  onClick={() => setSelectedRole('student')}
                >
                  <GraduationCap className="w-16 h-16 text-blue-600 mb-4 mx-auto" />
                  <h3 className="text-2xl text-center mb-2">Student</h3>
                  <p className="text-center text-gray-600">
                    Access lecture notes, AI chat, and personalized learning tools
                  </p>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="p-8 cursor-pointer border-2 hover:border-purple-500 hover:shadow-lg transition-all"
                  onClick={() => setSelectedRole('professor')}
                >
                  <BookOpen className="w-16 h-16 text-purple-600 mb-4 mx-auto" />
                  <h3 className="text-2xl text-center mb-2">Professor</h3>
                  <p className="text-center text-gray-600">
                    Monitor student engagement and enhance teaching materials
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Institute Selection */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Select Your Institute</h2>
              <Button variant="ghost" onClick={() => setSelectedRole(null)}>
                Change Role
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {visibleInstitutes.map((institute) => (
                <motion.div key={institute.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Card
                    className={`p-6 cursor-pointer border-2 transition-all ${
                      selectedInstitute === institute.id
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow'
                    }`}
                    onClick={() => setSelectedInstitute(institute.id)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={institute.logo}
                        alt={institute.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <h3 className="text-lg">{institute.name}</h3>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {institutes.length > initialInstitutesToShow && (
              <div className="text-center mb-8">
                <Button variant="ghost" onClick={() => setShowAllInstitutes(!showAllInstitutes)}>
                  {showAllInstitutes ? 'View Less' : 'View More'}
                </Button>
              </div>
            )}

            {/* Student Details */}
            {selectedRole === 'student' && selectedInstitute && (
              <motion.div className="space-y-4 mb-8">
                <h3 className="text-xl text-center">Student Details</h3>
                <div>
                  <Label htmlFor="studentGmail">Gmail</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="studentGmail"
                      type="email"
                      placeholder="Enter your Gmail"
                      value={studentGmail}
                      onChange={(e) => setStudentGmail(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setStudentGmail('demo@gmail.com')}
                    >
                      Use Demo Gmail
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="studentCourse">Course</Label>
                  <Select onValueChange={setStudentCourse} value={studentCourse}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B.Tech">B.Tech</SelectItem>
                      <SelectItem value="M.Tech">M.Tech</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="studentYear">Year</Label>
                  <Select onValueChange={setStudentYear} value={studentYear}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Professor Details */}
            {selectedRole === 'professor' && selectedInstitute && (
              <motion.div className="space-y-4 mb-8">
                <h3 className="text-xl text-center">Professor Details</h3>
                <div>
                  <Label htmlFor="profGmail">Gmail</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="profGmail"
                      type="email"
                      placeholder="Enter your Gmail"
                      value={profGmail}
                      onChange={(e) => setProfGmail(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setProfGmail('demo@gmail.com')}
                    >
                      Use Demo Gmail
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: selectedInstitute ? 1 : 0.5 }}>
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedInstitute}
                className="px-12"
              >
                Continue as {selectedRole === 'student' ? 'Student' : 'Professor'}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-gray-500"
        >
          <p>iHub Hackathon 2025 • Smart Scribes Team</p>
        </motion.div>
      </div>
    </div>
  );
}
