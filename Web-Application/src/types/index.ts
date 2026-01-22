export interface Institute {
  id: string;
  name: string;
  logo: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  courseName?: string;
  courseCode?: string;
  semester?: string;
  academicYear?: string;
  materials?: MaterialSet;
}

export interface GeneratedContent {
  lectureNumber: string;
  date: string;
  audioFile: string;
  videoFile: string;
}

export interface MaterialSet {
  slides: Array<{ name: string; lectureNumber: string; date: string; url?: string }>;
  audio: string | null;
  video: string | null;
  generatedContent: GeneratedContent[];
}

export interface ProfessorDoubt {
  id: string;
  courseId: string;
  studentName: string;
  question: string;
  date: string;
  reply?: string | null;
}

export interface Lecture {
  id: string;
  number: number;
  date: string;
  topic: string;
  courseId: string;
}

export interface LectureContent {
  lectureId: string;
  topic: string;
  definition: string;
  recordingUrl: string;
  bookReference: string;
  content: ContentSection[];
  doubts: Doubt[];
  examples: Example[];
  animations: Animation[];
}

export interface ContentSection {
  id: string;
  type: 'explanation' | 'proof' | 'concept' | 'example' | 'algorithm';
  title: string;
  content: string;
  timestamp?: string;
  image?: string;
  imageCaption?: string;
  animation?: Animation;
  professorNote?: string;
  bookReference?: string;
}

export interface Doubt {
  id: string;
  student: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface Example {
  id: string;
  title: string;
  problem: string;
  solution: string;
  image?: string;
}

export interface Animation {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'video' | 'interactive';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LectureProcessing {
  id: string
  lectureId: string
  status: 'uploading' | 'processing' | 'generating' | 'completed'
  audioFile?: string
  videoFile?: string
  createdAt: string
  updatedAt: string
}

export interface Slide {
  id: string
  lectureId: string
  fileName: string
  filePath: string
  uploadDate: string
}
