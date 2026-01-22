-- Create slides table to track uploaded slides
CREATE TABLE public.slides (
  id TEXT NOT NULL,
  lecture_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT slides_pkey PRIMARY KEY (id),
  CONSTRAINT fk_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_slides_lecture_id ON public.slides USING btree (lecture_id) TABLESPACE pg_default;