/*
  # Fix Query History Type Mismatches
  
  1. Purpose
     - Update existing query_history records to use correct unified query_type values
     - Maps legacy query_type values to their unified equivalents
  
  2. Changes
     - Updates "prose" → "fictional_prose_unified"
     - Updates "poetry" → "poetry_unified"
     - Updates "nonfiction" → "nonfiction_unified"
     - Updates "content" → "content_creation_unified"
     - Updates "songwriting" → "songwriting_unified"
     - Updates "stage" → "stage_screen_unified"
     - Updates "stage_screen" → "stage_screen_unified"
  
  3. Notes
     - This fixes the issue where queries weren't appearing in history pages
     - The application now saves with unified types, this updates old records
*/

-- Update prose queries
UPDATE query_history
SET query_type = 'fictional_prose_unified'
WHERE query_type = 'prose';

-- Update poetry queries
UPDATE query_history
SET query_type = 'poetry_unified'
WHERE query_type = 'poetry';

-- Update nonfiction queries
UPDATE query_history
SET query_type = 'nonfiction_unified'
WHERE query_type = 'nonfiction';

-- Update content queries
UPDATE query_history
SET query_type = 'content_creation_unified'
WHERE query_type = 'content';

-- Update songwriting queries
UPDATE query_history
SET query_type = 'songwriting_unified'
WHERE query_type = 'songwriting';

-- Update stage/stage_screen queries
UPDATE query_history
SET query_type = 'stage_screen_unified'
WHERE query_type IN ('stage', 'stage_screen');