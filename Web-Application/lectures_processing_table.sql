-- Create lectures_processing table to track lecture processing status
CREATE TABLE public.lectures_processing (
  id TEXT NOT NULL,
  lecture_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('uploading', 'processing', 'generating', 'completed')),
  audio_file TEXT,
  video_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT lectures_processing_pkey PRIMARY KEY (id),
  CONSTRAINT fk_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lectures_processing_lecture_id ON public.lectures_processing USING btree (lecture_id) TABLESPACE pg_default;

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_lectures_processing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lectures_processing_timestamp
BEFORE UPDATE ON public.lectures_processing
FOR EACH ROW
EXECUTE FUNCTION update_lectures_processing_updated_at();