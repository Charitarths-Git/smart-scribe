import { createClient } from '@supabase/supabase-js'

// You'll need to add these to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database type definitions
export interface Database {
  public: {
    Tables: {
      institutes: {
        Row: {
          id: string
          name: string
          logo: string
          created_at: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          name: string
          professor: string
          created_at: string
        }
      }
      lectures: {
        Row: {
          id: string
          number: number
          date: string
          topic: string
          course_id: string
          created_at: string
        }
      }
      lecture_content: {
        Row: {
          id: string
          lecture_id: string
          topic: string
          definition: string | null
          recording_url: string | null
          book_reference: string | null
          content_data: any // JSONB field
          created_at: string
          updated_at: string
        }
      }
      professors: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          email: string
          course_id: string | null
          year: string | null
          created_at: string
        }
      }
      doubts: {
        Row: {
          id: string
          course_id: string
          student_name: string
          question: string
          date: string
          reply: string | null
          created_at: string
        }
      }
    }
  }
}
