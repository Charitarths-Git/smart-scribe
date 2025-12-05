import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface QnAGeneratorProps {
  open: boolean;
  onClose: () => void;
}

export function QnAGenerator({ open, onClose }: QnAGeneratorProps) {
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [questionFormat, setQuestionFormat] = useState<string>('mcq');
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  const concepts = [
    { id: 'ztransform', name: 'Z-Transform Properties' },
    { id: 'roc', name: 'Region of Convergence' },
    { id: 'filters', name: 'Digital Filter Design' },
    { id: 'bst', name: 'Binary Search Trees' },
    { id: 'graphs', name: 'Graph Algorithms' },
    { id: 'nn', name: 'Neural Networks Basics' },
  ];

  const mockQuiz = {
    mcq: [
      {
        id: '1',
        question: 'What is the Region of Convergence (ROC) for the Z-transform of a causal signal x[n] = aⁿu[n]?',
        options: ['|z| < |a|', '|z| > |a|', '|z| = |a|', 'All values of z'],
        correct: 1,
        explanation: 'For a causal exponential sequence, the ROC is the region outside the circle with radius |a|. This ensures the infinite sum converges.',
      },
      {
        id: '2',
        question: 'In a Binary Search Tree, what is the time complexity of searching for an element in a balanced tree with n nodes?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
        explanation: 'In a balanced BST, the height is log₂(n), and search follows one path from root to leaf, giving O(log n) complexity.',
      },
      {
        id: '3',
        question: 'Which activation function is most commonly used in hidden layers of modern neural networks?',
        options: ['Sigmoid', 'ReLU', 'Tanh', 'Softmax'],
        correct: 1,
        explanation: 'ReLU (Rectified Linear Unit) is preferred because it solves the vanishing gradient problem and is computationally efficient.',
      },
    ],
    subjective: [
      {
        id: '1',
        question: 'Explain the relationship between the Z-transform and the Discrete-Time Fourier Transform (DTFT). Under what condition does the Z-transform reduce to the DTFT?',
        solution: 'The DTFT is a special case of the Z-transform evaluated on the unit circle in the z-plane. When z = e^(jω), where ω is the angular frequency, the Z-transform reduces to the DTFT. This relationship allows us to analyze the frequency response of discrete-time systems by evaluating the Z-transform on the unit circle.',
      },
      {
        id: '2',
        question: 'Describe the three cases that must be handled when deleting a node from a Binary Search Tree. Provide the algorithmic approach for each case.',
        solution: 'Case 1 - Leaf node (0 children): Simply remove the node.\nCase 2 - Node with 1 child: Replace the node with its child.\nCase 3 - Node with 2 children: Find the inorder successor (smallest node in right subtree) or inorder predecessor (largest in left subtree), replace the node\'s value with it, then delete the successor/predecessor (which will be Case 1 or 2).',
      },
    ],
    mathematical: [
      {
        id: '1',
        question: 'Find the Z-transform of the sequence x[n] = (1/2)ⁿu[n] - (1/3)ⁿu[n] and determine its ROC.',
        solution: 'Using linearity property:\nX(z) = Z{(1/2)ⁿu[n]} - Z{(1/3)ⁿu[n]}\n     = z/(z-1/2) - z/(z-1/3)\n     = z[(z-1/3) - (z-1/2)] / [(z-1/2)(z-1/3)]\n     = z(1/2 - 1/3) / [(z-1/2)(z-1/3)]\n     = z/6 / [(z-1/2)(z-1/3)]\n\nROC: |z| > 1/2 (intersection of ROCs for both terms)',
      },
      {
        id: '2',
        question: 'Calculate the output of a single perceptron with weights w = [0.5, -0.3, 0.8], bias b = 0.2, and sigmoid activation for input x = [1, 2, 1].',
        solution: 'Step 1: Calculate weighted sum\nz = w·x + b\n  = (0.5×1) + (-0.3×2) + (0.8×1) + 0.2\n  = 0.5 - 0.6 + 0.8 + 0.2\n  = 0.9\n\nStep 2: Apply sigmoid activation\nσ(z) = 1/(1+e⁻ᶻ)\n     = 1/(1+e⁻⁰·⁹)\n     = 1/(1+0.4066)\n     ≈ 0.711\n\nOutput: 0.711',
      },
    ],
  };

  const handleGenerateQuiz = () => {
    setQuizGenerated(true);
    setShowSolutions(false);
  };

  const handleReset = () => {
    setQuizGenerated(false);
    setShowSolutions(false);
    setSelectedConcepts([]);
  };

  const toggleConcept = (conceptId: string) => {
    setSelectedConcepts((prev) =>
      prev.includes(conceptId)
        ? prev.filter((id) => id !== conceptId)
        : [...prev, conceptId]
    );
  };

  const getCurrentQuestions = () => {
    return mockQuiz[questionFormat as keyof typeof mockQuiz] || mockQuiz.mcq;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileQuestion className="w-6 h-6 text-purple-600" />
            QnA Generator
          </DialogTitle>
          <DialogDescription>
            Select concepts and question format to generate a personalized quiz
          </DialogDescription>
        </DialogHeader>

        {!quizGenerated ? (
          <div className="space-y-6 py-4">
            {/* Concept Selection */}
            <div>
              <Label className="text-base mb-3 block">Select Concepts</Label>
              <div className="grid grid-cols-2 gap-3">
                {concepts.map((concept) => (
                  <motion.div
                    key={concept.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        selectedConcepts.includes(concept.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleConcept(concept.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedConcepts.includes(concept.id)} />
                        <span>{concept.name}</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

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
              disabled={selectedConcepts.length === 0}
              className="w-full"
              size="lg"
            >
              Generate Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl">Generated Quiz</h3>
                <p className="text-sm text-gray-600">
                  {getCurrentQuestions().length} questions •{' '}
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
                {getCurrentQuestions().map((q: any, idx: number) => (
                  <motion.div
                    key={q.id}
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
                      {showSolutions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                        >
                          <h4 className="mb-2 flex items-center gap-2">
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
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
