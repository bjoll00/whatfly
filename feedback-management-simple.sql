-- Simple Feedback Management Script
-- Run this in your Supabase SQL editor

-- 1. Create view to see all feedback with user info
CREATE OR REPLACE VIEW feedback_with_users AS
SELECT 
  f.*,
  au.email as user_email,
  au.created_at as user_created_at
FROM feedback f
LEFT JOIN auth.users au ON f.user_id = au.id
ORDER BY f.created_at DESC;

-- 2. Create feedback statistics view
CREATE OR REPLACE VIEW feedback_stats AS
SELECT 
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN type = 'bug_report' THEN 1 END) as bug_reports,
  COUNT(CASE WHEN type = 'feature_request' THEN 1 END) as feature_requests,
  COUNT(CASE WHEN type = 'general_feedback' THEN 1 END) as general_feedback,
  COUNT(CASE WHEN type = 'improvement_suggestion' THEN 1 END) as improvement_suggestions,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
  COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
  COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
FROM feedback;

-- 3. Function to bulk update feedback status
CREATE OR REPLACE FUNCTION bulk_update_feedback_status(
  feedback_ids UUID[],
  new_status TEXT
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE feedback 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = ANY(feedback_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to archive old completed feedback
CREATE OR REPLACE FUNCTION archive_old_feedback(
  days_old INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Create archive table if it doesn't exist
  CREATE TABLE IF NOT EXISTS feedback_archive (LIKE feedback INCLUDING ALL);
  
  -- Move old completed feedback to archive
  WITH old_feedback AS (
    DELETE FROM feedback 
    WHERE status = 'completed' 
      AND updated_at < NOW() - INTERVAL '1 day' * days_old
    RETURNING *
  )
  INSERT INTO feedback_archive 
  SELECT * FROM old_feedback;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to delete rejected feedback older than X days
CREATE OR REPLACE FUNCTION cleanup_rejected_feedback(
  days_old INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM feedback 
  WHERE status = 'rejected' 
    AND updated_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get feedback summary by type
CREATE OR REPLACE FUNCTION get_feedback_summary()
RETURNS TABLE (
  feedback_type TEXT,
  total_count BIGINT,
  pending_count BIGINT,
  completed_count BIGINT,
  avg_priority NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.type::TEXT,
    COUNT(*) as total_count,
    COUNT(CASE WHEN f.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN f.status = 'completed' THEN 1 END) as completed_count,
    AVG(CASE 
      WHEN f.priority = 'low' THEN 1
      WHEN f.priority = 'medium' THEN 2
      WHEN f.priority = 'high' THEN 3
      ELSE 0
    END) as avg_priority
  FROM feedback f
  GROUP BY f.type
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;
