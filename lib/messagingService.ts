import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  // Joined data
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  // Computed/joined data
  participants?: {
    id: string;
    username: string;
    avatar_url: string | null;
  }[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

// Get or create a conversation between two users
export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string | null> {
  try {
    // First, check if a conversation already exists between these two users
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (searchError) {
      console.error('Error searching conversations:', searchError);
      return null;
    }

    // For each conversation the current user is in, check if the other user is also a participant
    for (const conv of existingConversations || []) {
      const { data: otherParticipant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conv.conversation_id)
        .eq('user_id', otherUserId)
        .single();

      if (otherParticipant) {
        // Found existing conversation
        return conv.conversation_id;
      }
    }

    // No existing conversation, create a new one
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single();

    if (createError || !newConversation) {
      console.error('Error creating conversation:', createError);
      return null;
    }

    // Add both participants
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: otherUserId },
      ]);

    if (participantError) {
      console.error('Error adding participants:', participantError);
      return null;
    }

    return newConversation.id;
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    return null;
  }
}

// Get all conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    // Get all conversation IDs the user is part of
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partError || !participations?.length) {
      return [];
    }

    const conversationIds = participations.map(p => p.conversation_id);

    // Get conversations with their data
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (convError || !conversations) {
      console.error('Error fetching conversations:', convError);
      return [];
    }

    // For each conversation, get participants and last message
    const conversationsWithData = await Promise.all(
      conversations.map(async (conv) => {
        // Get other participants
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .neq('user_id', userId);

        // Get profiles for other participants
        const otherUserIds = participants?.map(p => p.user_id) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', otherUserIds);

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { data: myParticipation } = await supabase
          .from('conversation_participants')
          .select('last_read_at')
          .eq('conversation_id', conv.id)
          .eq('user_id', userId)
          .single();

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .gt('created_at', myParticipation?.last_read_at || '1970-01-01');

        return {
          ...conv,
          participants: profiles || [],
          last_message: lastMessage || undefined,
          unread_count: unreadCount || 0,
        };
      })
    );

    return conversationsWithData;
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
}

// Get messages for a conversation
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    if (!messages?.length) return [];

    // Get sender profiles
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return messages.map(msg => ({
      ...msg,
      sender: profileMap.get(msg.sender_id) || undefined,
    })).reverse(); // Reverse to show oldest first
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
}

// Mark messages as read / update last_read_at
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
}

// Subscribe to new messages in a conversation (real-time)
export function subscribeToConversation(
  conversationId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const newMessage = payload.new as Message;
        
        // Fetch sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', newMessage.sender_id)
          .single();

        onNewMessage({
          ...newMessage,
          sender: profile || undefined,
        });
      }
    )
    .subscribe();

  return channel;
}

// Unsubscribe from conversation
export function unsubscribeFromConversation(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

// Get total unread message count for a user
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (!participations?.length) return 0;

    let totalUnread = 0;

    for (const part of participations) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', part.conversation_id)
        .neq('sender_id', userId)
        .gt('created_at', part.last_read_at || '1970-01-01');

      totalUnread += count || 0;
    }

    return totalUnread;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
