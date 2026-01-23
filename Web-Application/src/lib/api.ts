import { supabase } from './supabase'
import { 
  Institute, 
  Course, 
  Lecture, 
  LectureContent,
  LectureProcessing,
  Slide
} from '../types'

// Institute API
export async function getInstitutes(): Promise<Institute[]> {
  const { data, error } = await supabase
    .from('institutes')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Course API
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('code')

  if (error) throw error
  return data || []
}

export async function createCourse(course: { id: string; code: string; name: string; professor: string }): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      id: course.id,
      code: course.code,
      name: course.name,
      professor: course.professor
    })
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    professor: data.professor
  }
}

// Lecture API
export async function getLectures(courseId: string): Promise<Lecture[]> {
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('course_id', courseId)
    .order('number')

  if (error) throw error
  return data?.map(lecture => ({
    id: lecture.id,
    number: lecture.number,
    date: lecture.date,
    topic: lecture.topic,
    courseId: lecture.course_id
  })) || []
}

export async function createLecture(lecture: {
  topic: string
  date: string
  number: number
  courseId: string
}): Promise<Lecture> {
  const lectureId = `${lecture.courseId}-l${lecture.number}`
  const { data, error } = await supabase
    .from('lectures')
    .insert({
      id: lectureId,
      topic: lecture.topic,
      date: lecture.date,
      number: lecture.number,
      course_id: lecture.courseId
    })
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    number: data.number,
    date: data.date,
    topic: data.topic,
    courseId: data.course_id
  }
}

// Lecture Content API
export async function getLectureContent(lectureId: string): Promise<LectureContent | null> {
  const { data, error } = await supabase
    .from('lecture_content')
    .select('*')
    .eq('lecture_id', lectureId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return {
    lectureId: data.lecture_id,
    topic: data.topic,
    definition: data.definition || '',
    recordingUrl: data.recording_url || '',
    bookReference: data.book_reference || '',
    content: data.content_data.content || [],
    doubts: data.content_data.doubts || [],
    examples: data.content_data.examples || [],
    animations: data.content_data.animations || []
  }
}

export async function saveLectureContent(content: LectureContent): Promise<void> {
  const { error } = await supabase
    .from('lecture_content')
    .upsert({
      lecture_id: content.lectureId,
      topic: content.topic,
      definition: content.definition,
      recording_url: content.recordingUrl,
      book_reference: content.bookReference,
      content_data: {
        content: content.content,
        doubts: content.doubts,
        examples: content.examples,
        animations: content.animations
      },
      updated_at: new Date().toISOString()
    })

  if (error) throw error
}

// Professor API
export interface ProfessorDoubt {
  id: string
  courseId: string
  studentName: string
  question: string
  date: string
  reply?: string | null
}

export interface StudentDoubt {
  id: string
  courseId: string
  studentName: string
  question: string
  date: string
  reply?: string | null
}

export async function getStudentDoubts(): Promise<StudentDoubt[]> {
  const { data, error } = await supabase
    .from('doubts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data?.map(d => ({
    id: d.id,
    courseId: d.course_id,
    studentName: d.student_name,
    question: d.question,
    date: d.date,
    reply: d.reply
  })) || []
}

export async function getProfessorDoubts() {
  const { data, error } = await supabase
    .from('doubts')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

// Lecture Processing API
export async function getLectureProcessing(lectureId: string): Promise<LectureProcessing | null> {
  const { data, error } = await supabase
    .from('lectures_processing')
    .select('*')
    .eq('lecture_id', lectureId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  
  return data ? {
    id: data.id,
    lectureId: data.lecture_id,
    status: data.status,
    audioFile: data.audio_file,
    videoFile: data.video_file,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } : null
}

export async function createLectureProcessing(processing: {
  lectureId: string,
  audioFile?: string,
  videoFile?: string
}): Promise<LectureProcessing> {
  const id = `proc_${Date.now()}`
  const { data, error } = await supabase
    .from('lectures_processing')
    .insert({
      id,
      lecture_id: processing.lectureId,
      status: 'uploading',
      audio_file: processing.audioFile,
      video_file: processing.videoFile
    })
    .select()
    .single()

  if (error) throw error
  
  return {
    id: data.id,
    lectureId: data.lecture_id,
    status: data.status,
    audioFile: data.audio_file,
    videoFile: data.video_file,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function updateLectureProcessingStatus(id: string, status: 'uploading' | 'processing' | 'generating' | 'completed'): Promise<void> {
  const { error } = await supabase
    .from('lectures_processing')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

// Slides API
export async function getSlides(lectureId: string): Promise<Slide[]> {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('lecture_id', lectureId)
    .order('upload_date', { ascending: false })

  if (error) throw error
  
  return data?.map(slide => ({
    id: slide.id,
    lectureId: slide.lecture_id,
    fileName: slide.file_name,
    filePath: slide.file_path,
    uploadDate: slide.upload_date
  })) || []
}

export async function uploadSlide(slide: {
  lectureId: string,
  fileName: string,
  filePath: string
}): Promise<Slide> {
  const id = `slide_${Date.now()}`
  const { data, error } = await supabase
    .from('slides')
    .insert({
      id,
      lecture_id: slide.lectureId,
      file_name: slide.fileName,
      file_path: slide.filePath
    })
    .select()
    .single()

  if (error) throw error
  
  return {
    id: data.id,
    lectureId: data.lecture_id,
    fileName: data.file_name,
    filePath: data.file_path,
    uploadDate: data.upload_date
  }
}


export async function replyToDoubt(doubtId: string, reply: string): Promise<void> {
  const { error } = await supabase
    .from('doubts')
    .update({ 
      reply,
      updated_at: new Date().toISOString()
    })
    .eq('id', doubtId)

  if (error) throw error
}

export async function createDoubt(doubt: {
  courseId: string
  studentName: string
  question: string
  date: string
}): Promise<ProfessorDoubt> {
  const doubtId = `doubt-${Date.now()}`
  const { data, error } = await supabase
    .from('doubts')
    .insert({
      id: doubtId,
      course_id: doubt.courseId,
      student_name: doubt.studentName,
      question: doubt.question,
      date: doubt.date
    })
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    courseId: data.course_id,
    studentName: data.student_name,
    question: data.question,
    date: data.date,
    reply: data.reply
  }
}
