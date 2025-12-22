/*
  # Drop Unused Indexes

  This migration removes unused indexes that are not being utilized by queries,
  reducing database maintenance overhead and improving write performance.

  ## Changes
  
  1. Drop unused indexes:
     - `idx_query_history_parent_query_id` on query_history table
     - `idx_query_history_user_id` on query_history table
     - `idx_saved_outputs_user_id` on saved_outputs table
  
  ## Notes
  
  - These indexes were identified as unused by Supabase monitoring
  - Dropping unused indexes reduces storage overhead and improves INSERT/UPDATE performance
  - If query patterns change and these indexes become needed, they can be recreated
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_query_history_parent_query_id;
DROP INDEX IF EXISTS idx_query_history_user_id;
DROP INDEX IF EXISTS idx_saved_outputs_user_id;
