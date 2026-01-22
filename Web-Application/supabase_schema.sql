-- Smart Scribes Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Institutes Table
CREATE TABLE IF NOT EXISTS institutes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    professor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lectures Table
CREATE TABLE IF NOT EXISTS lectures (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    date DATE NOT NULL,
    topic TEXT NOT NULL,
    course_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lecture Content Table (stored as JSONB for flexibility)
CREATE TABLE IF NOT EXISTS lecture_content (
    id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL UNIQUE,
    topic TEXT NOT NULL,
    definition TEXT,
    recording_url TEXT,
    book_reference TEXT,
    content_data JSONB NOT NULL, -- Stores the entire lecture content structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_lecture FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
);

-- Professors Table
CREATE TABLE IF NOT EXISTS professors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_professor_email UNIQUE(email)
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    course_id TEXT,
    year TEXT,
    institute_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_email UNIQUE(email),
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    CONSTRAINT fk_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
);

-- Doubts Table (for professor-student interactions)
CREATE TABLE IF NOT EXISTS doubts (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    question TEXT NOT NULL,
    date DATE NOT NULL,
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_lecture_content_lecture_id ON lecture_content(lecture_id);
CREATE INDEX IF NOT EXISTS idx_doubts_course_id ON doubts(course_id);
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);

-- Insert sample data (optional - can be removed if you don't want seed data)
-- You can also use Supabase's data import feature instead

INSERT INTO institutes (id, name, logo) VALUES
('iit-mandi', 'IIT Mandi', 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop'),
('iit-roorkee', 'IIT Roorkee', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&h=100&fit=crop'),
('iit-delhi', 'IIT Delhi', 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=100&h=100&fit=crop'),
('iisc', 'IISc Bangalore', 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=100&h=100&fit=crop'),
('nit-trichy', 'NIT Trichy', 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=100&h=100&fit=crop'),
('nit-warangal', 'NIT Warangal', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&h=100&fit=crop'),
('aiims-delhi', 'AIIMS Delhi', 'https://via.placeholder.com/100'),
('iiit-delhi', 'IIIT Delhi', 'https://via.placeholder.com/100'),
('dtu', 'DTU', 'https://via.placeholder.com/100')
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, code, name, professor) VALUES
('ic-252', 'IC-252', 'Digital Signal Processing', 'Dr. Rajesh Kumar'),
('ic-112', 'IC-112', 'Data Structures & Algorithms', 'Dr. Priya Sharma'),
('ic-256', 'IC-256', 'Machine Learning', 'Dr. Amit Patel'),
('dc-256', 'DC-256', 'Computer Networks', 'Dr. Sanjay Verma'),
('ic-301', 'IC-301', 'Artificial Intelligence', 'Dr. Neha Singh'),
('dc-202', 'DC-202', 'Database Management Systems', 'Dr. Rahul Mehta')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lectures (id, number, date, topic, course_id) VALUES
('ic252-l1', 1, '2025-01-15', 'Introduction to Digital Signals', 'ic-252'),
('ic252-l2', 2, '2025-01-17', 'Fourier Transform Fundamentals', 'ic-252'),
('ic252-l3', 3, '2025-01-20', 'Z-Transform and Its Applications', 'ic-252'),
('ic252-l4', 4, '2025-01-22', 'FIR Filter Design', 'ic-252'),
('ic252-l5', 5, '2025-01-24', 'IIR Filter Design', 'ic-252'),
('ic112-l1', 1, '2025-01-16', 'QuickSort Algorithm - Complete Analysis', 'ic-112'),
('ic112-l2', 2, '2025-01-18', 'Stacks and Queues', 'ic-112'),
('ic112-l3', 3, '2025-01-21', 'Trees and Binary Search Trees', 'ic-112'),
('ic112-l4', 4, '2025-01-23', 'Graph Algorithms', 'ic-112'),
('ic112-l5', 5, '2025-01-25', 'Dynamic Programming', 'ic-112'),
('ic256-l1', 1, '2025-01-14', 'Introduction to Machine Learning', 'ic-256'),
('ic256-l2', 2, '2025-01-16', 'Linear Regression', 'ic-256'),
('ic256-l3', 3, '2025-01-19', 'Logistic Regression & Classification', 'ic-256'),
('ic256-l4', 4, '2025-01-21', 'Neural Networks Basics', 'ic-256'),
('ic256-l5', 5, '2025-01-23', 'Backpropagation Algorithm', 'ic-256'),
('dc256-l1', 1, '2025-01-15', 'OSI Model & Network Layers', 'dc-256'),
('dc256-l2', 2, '2025-01-17', 'TCP/IP Protocol Suite', 'dc-256'),
('dc256-l3', 3, '2025-01-20', 'Routing Algorithms', 'dc-256')
ON CONFLICT (id) DO NOTHING;
