-- Messaging Tables Migration
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants (for 1:1 and future group support)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Function to update conversation updated_at when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SIMPLIFIED RLS POLICIES (avoids recursion)
-- =============================================

-- Conversation participants: Users can see their own participation records
CREATE POLICY "Users can view own participations"
  ON public.conversation_participants FOR SELECT
  USING (user_id = auth.uid());

-- Conversation participants: Users can see other participants in conversations they're in
-- Uses a subquery that only checks user_id, avoiding recursion
CREATE POLICY "Users can view co-participants"
  ON public.conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT cp.conversation_id 
      FROM public.conversation_participants cp 
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own participation"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Conversations: Users can only see conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- Messages: Users can see messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Enable Realtime for messages (if not already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

