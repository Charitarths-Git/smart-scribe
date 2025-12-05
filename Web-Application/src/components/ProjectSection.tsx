import { motion } from 'framer-motion';
import { FolderKanban, Sparkles, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function ProjectSection() {
  const projects = [
    {
      id: '1',
      title: 'Real-time Speech Recognition System',
      courses: ['IC-252', 'IC-256'],
      description: 'Build a speech recognition system using signal processing and neural networks',
      difficulty: 'Advanced',
      progress: 35,
      concepts: ['Fourier Transform', 'Neural Networks', 'Audio Processing'],
      aiSuggestions: [
        'Start with preprocessing audio using Z-transform filters',
        'Extract MFCC features for speech characterization',
        'Use RNN/LSTM for sequence modeling',
      ],
    },
    {
      id: '2',
      title: 'Network Traffic Analyzer',
      courses: ['DC-256', 'IC-112'],
      description: 'Analyze and visualize network traffic patterns using graph algorithms',
      difficulty: 'Intermediate',
      progress: 60,
      concepts: ['Graph Algorithms', 'Network Protocols', 'Data Structures'],
      aiSuggestions: [
        'Use graph traversal for packet routing analysis',
        'Implement priority queues for traffic management',
        'Visualize network topology with force-directed layouts',
      ],
    },
    {
      id: '3',
      title: 'AI-Powered Study Planner',
      courses: ['IC-256', 'DC-202'],
      description: 'Create an intelligent study planner that adapts to learning patterns',
      difficulty: 'Beginner',
      progress: 20,
      concepts: ['Machine Learning', 'Recommendation Systems', 'Database Design'],
      aiSuggestions: [
        'Use collaborative filtering for personalized recommendations',
        'Implement spaced repetition algorithm',
        'Design normalized database schema for user progress',
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl mb-2 flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-blue-600" />
            Project Ideas & Planning
          </h1>
          <p className="text-gray-600">
            AI-generated project ideas that combine concepts from multiple courses
          </p>
        </motion.div>

        {/* Project Cards */}
        <div className="space-y-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl">{project.title}</h2>
                      <Badge
                        variant={
                          project.difficulty === 'Beginner'
                            ? 'secondary'
                            : project.difficulty === 'Intermediate'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {project.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.courses.map((course) => (
                        <Badge key={course} variant="outline">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Project Progress</span>
                    <span className="text-sm">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Concepts */}
                <div className="mb-4">
                  <h3 className="text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    Key Concepts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.concepts.map((concept) => (
                      <Badge key={concept} className="bg-purple-100 text-purple-700 border-purple-300">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="mb-4">
                  <h3 className="text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Implementation Roadmap
                  </h3>
                  <div className="space-y-2">
                    {project.aiSuggestions.map((suggestion, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Assistance
                  </Button>
                  <Button variant="outline">View Resources</Button>
                  <Button variant="outline">Find Team</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Generate New Project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-300">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl mb-2">Need a Custom Project Idea?</h3>
            <p className="text-gray-600 mb-4">
              Let AI generate a personalized project based on your interests and course progress
            </p>
            <Button size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Project with AI
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
