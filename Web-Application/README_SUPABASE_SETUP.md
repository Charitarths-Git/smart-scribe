# Supabase Setup Guide

This application now uses Supabase as its backend database. Follow these steps to set up and connect your application to Supabase.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in your project details:
   - Project name: `Smart Scribes`
   - Database password: Choose a strong password (save it securely)
   - Region: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Run the SQL Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the `supabase_schema.sql` file from this project
4. Copy all the SQL content
5. Paste it into the SQL Editor in Supabase
6. Click "Run" to execute the SQL

This will create all the necessary tables:
- `institutes` - Educational institutions
- `courses` - Course information
- `lectures` - Lecture details
- `lecture_content` - Detailed lecture content
- `professors` - Professor information
- `students` - Student information
- `doubts` - Student doubts and professor replies

## Step 3: Get Your API Credentials

1. In your Supabase project, go to "Settings" (gear icon in the left sidebar)
2. Click on "API" under Project Settings
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

1. In the root of your project, create a file named `.env.local`
2. Copy the template from `.env.example`
3. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with your actual Supabase credentials.

## Step 5: Test the Connection

1. Run the development server:
```bash
npm run dev
```

2. The application should now connect to Supabase instead of using static data
3. You can verify the connection by checking the browser console for any errors

## Database Schema Overview

### Tables Structure:

#### `institutes`
- Stores educational institutions
- Fields: `id`, `name`, `logo`

#### `courses`
- Stores course information
- Fields: `id`, `code`, `name`, `professor`

#### `lectures`
- Stores lecture metadata
- Fields: `id`, `number`, `date`, `topic`, `course_id`
- Foreign key to `courses`

#### `lecture_content`
- Stores detailed lecture content as JSONB
- Fields: `lecture_id`, `topic`, `definition`, `recording_url`, `book_reference`, `content_data`
- Foreign key to `lectures`

#### `professors`
- Stores professor information
- Fields: `id`, `name`, `email`

#### `students`
- Stores student information
- Fields: `id`, `name`, `email`, `course_id`, `year`, `institute_id`
- Foreign keys to `courses` and `institutes`

#### `doubts`
- Stores student doubts and professor replies
- Fields: `id`, `course_id`, `student_name`, `question`, `date`, `reply`
- Foreign key to `courses`

## Features Now Available

### For Students:
- View courses from Supabase
- Browse lectures dynamically loaded
- Access lecture content stored in the database

### For Professors:
- Create new courses (saved to Supabase)
- Upload course materials
- View and reply to student doubts
- Manage courses and content

## Troubleshooting

### Error: "Invalid API key"
- Make sure your `.env.local` file has the correct Supabase credentials
- Restart your development server after updating environment variables

### Error: "Table does not exist"
- Make sure you ran the SQL schema from `supabase_schema.sql`
- Check the SQL Editor history to verify the tables were created

### No data showing
- The SQL schema includes sample data inserts
- Check your Supabase dashboard to see if data exists in the tables
- You can add more data directly from the Supabase dashboard or through the application

## Next Steps

1. **Row Level Security (RLS)**: Configure RLS policies in Supabase for data security
2. **Authentication**: Implement Supabase Auth for user authentication
3. **Real-time**: Enable Supabase Realtime for live updates
4. **Storage**: Use Supabase Storage for file uploads (slides, recordings, notes)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
