-- Sample Lecture Content Data
-- This file contains sample lecture content to insert into the lecture_content table
-- Run this after running the main schema.sql file in Supabase SQL Editor

-- Note: This is just a sample. The full lecture content from mockData.ts would need to be adapted
-- For now, we'll insert a basic structure

-- You can manually insert more content by running similar INSERT statements
-- or by using the Supabase dashboard's Table Editor

-- Example: Insert sample QuickSort lecture content
INSERT INTO lecture_content (
  id,
  lecture_id,
  topic,
  definition,
  recording_url,
  book_reference,
  content_data
) VALUES (
  'content-ic112-l1',
  'ic112-l1',
  'QuickSort Algorithm - Complete Analysis',
  'QuickSort is a divide-and-conquer sorting algorithm...',
  'https://example.com/quicksort-lecture',
  'Introduction to Algorithms (CLRS) - Chapter 7',
  '{"content":[{"id":"qs1","type":"concept","title":"00:00–05:00 — Overview and Intuition","content":"QuickSort is one of the most important sorting algorithms...","timestamp":"00:00–05:00"},{"id":"qs2","type":"algorithm","title":"05:00–12:00 — Pseudocode and Partition","content":"Here is the complete QuickSort algorithm...","timestamp":"05:00–12:00"}],"doubts":[],"examples":[],"animations":[]}'::jsonb
) ON CONFLICT (lecture_id) DO NOTHING;

-- You can add more lecture content following the same pattern
-- The content_data field accepts JSONB format

-- To add content for other lectures, adapt the JSON structure from your mockData.ts file
