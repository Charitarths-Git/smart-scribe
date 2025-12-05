import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Search, BookOpen, User, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function PlanningMode() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const concepts = [
    {
      id: '1',
      name: 'Fourier Transform Applications',
      courses: ['IC-252', 'IC-256'],
      description: 'Understanding how Fourier transforms are used in signal processing and feature extraction in machine learning',
      professors: ['Dr. Rajesh Kumar', 'Dr. Amit Patel'],
    },
    {
      id: '2',
      name: 'Tree-based Algorithms in ML',
      courses: ['IC-112', 'IC-256'],
      description: 'How tree data structures form the foundation of decision trees and random forests in machine learning',
      professors: ['Dr. Priya Sharma', 'Dr. Amit Patel'],
    },
    {
      id: '3',
      name: 'Graph Algorithms in Networks',
      courses: ['IC-112', 'DC-256'],
      description: 'Application of graph traversal and shortest path algorithms in routing protocols',
      professors: ['Dr. Priya Sharma', 'Dr. Sanjay Verma'],
    },
  ];

  const recommendations = [
    {
      concept: 'Digital Filtering',
      professor: 'Dr. Rajesh Kumar',
      course: 'IC-252',
      reason: 'Expert in practical applications of Z-transform',
      rating: 4.8,
    },
    {
      concept: 'Neural Network Optimization',
      professor: 'Dr. Amit Patel',
      course: 'IC-256',
      reason: 'Research focus on gradient descent and backpropagation',
      rating: 4.9,
    },
    {
      concept: 'Advanced Data Structures',
      professor: 'Dr. Priya Sharma',
      course: 'IC-112',
      reason: 'Industry experience with scalable systems',
      rating: 4.7,
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
            <Lightbulb className="w-8 h-8 text-yellow-600" />
            Planning Mode
          </h1>
          <p className="text-gray-600">
            Explore concepts across multiple courses and get AI-powered recommendations
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for concepts, topics, or connections..."
              className="pl-10 py-6"
            />
          </div>
        </motion.div>

        {/* Cross-Course Concepts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl mb-4">Cross-Course Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map((concept, idx) => (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card
                  className={`p-5 cursor-pointer transition-all ${
                    selectedConcept === concept.id
                      ? 'border-2 border-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedConcept(concept.id)}
                >
                  <h3 className="mb-2 flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-1" />
                    {concept.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{concept.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {concept.courses.map((course) => (
                      <Badge key={course} variant="secondary">
                        {course}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Professors: {concept.professors.join(', ')}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Explanation */}
        {selectedConcept && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <h2 className="text-2xl mb-4">AI-Powered Explanation</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  The connection between these courses reveals a fundamental principle in computer science:
                  mathematical transformations and data structures often have deep applications across
                  different domains.
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h3 className="text-lg mb-2">Key Insights:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        Fourier transforms break signals into frequency components, similar to how decision
                        trees break data into hierarchical decisions
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        Both techniques involve decomposition - signals into frequencies, data into
                        partitions
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        Understanding tree traversal algorithms helps visualize how neural networks
                        propagate information through layers
                      </span>
                    </li>
                  </ul>
                </div>
                <Button>Explore Further with AI</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Professor Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600" />
            Recommended Professors for Deep Dives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="mb-1">{rec.professor}</h3>
                      <Badge variant="outline" className="text-xs">
                        {rec.course}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{rec.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{rec.concept}</p>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Office Hours
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
