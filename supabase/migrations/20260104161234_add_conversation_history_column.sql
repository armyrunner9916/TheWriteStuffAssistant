/*
  # Add Conversation History Column to Query History Table

  1. Purpose
     - Store full conversation threads in a single row instead of multiple rows
     - Add a JSONB column to store conversation history as an array of messages
     - Maintain backward compatibility with existing data structure

  2. Changes
     - Add `conversation_history` JSONB column to `query_history` table
     - Set default value to empty array
     - Column will store array of objects with structure:
       [
         { role: 'user', content: 'message text', timestamp: 'ISO string' },
         { role: 'assistant', content: 'response text', timestamp: 'ISO string' }
       ]

  3. Notes
     - Existing rows will have NULL conversation_history (will be migrated gradually)
     - New threads will store full conversation in this column
     - Original query_text and response_text columns maintained for backward compatibility
     - Follow-ups will update the same row instead of creating new rows
*/

-- Add conversation_history JSONB column
ALTER TABLE query_history
ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance on conversation_history
CREATE INDEX IF NOT EXISTS idx_query_history_conversation_history 
ON query_history USING gin (conversation_history);

-- Add a flag to indicate if this is a thread root (vs a legacy follow-up row)
ALTER TABLE query_history
ADD COLUMN IF NOT EXISTS is_thread_root BOOLEAN DEFAULT true;

-- Create index on conversation_id for better thread querying
CREATE INDEX IF NOT EXISTS idx_query_history_conversation_id 
ON query_history (conversation_id) WHERE conversation_id IS NOT NULL;