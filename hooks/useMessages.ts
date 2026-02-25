import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';
import { Message, getConversationMessages, sendMessage } from '../lib/messagingService';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch and subscribe to messages in a conversation
 * Integrates Supabase Realtime with TanStack Query
 */
export function useMessages(conversationId: string | null, currentUserId: string | null) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Query for fetching messages
  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      return getConversationMessages(conversationId);
    },
    enabled: !!conversationId,
  });

  // Set up Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    // Create channel for this conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
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
          
          // Don't add if it's from the current user (already added optimistically)
          if (newMessage.sender_id === currentUserId) return;

          // Fetch sender info for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender: Message = {
            ...newMessage,
            sender: senderData || undefined,
          };

          // Update cache immediately
          queryClient.setQueryData<Message[]>(
            ['messages', conversationId],
            (old) => {
              if (!old) return [messageWithSender];
              // Check if message already exists (avoid duplicates)
              if (old.some(m => m.id === newMessage.id)) return old;
              return [...old, messageWithSender];
            }
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, currentUserId, queryClient]);

  return messagesQuery;
}

/**
 * Hook for sending messages with optimistic updates
 */
export function useSendMessage(conversationId: string | null, currentUserId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!conversationId || !currentUserId) {
        throw new Error('Missing conversation or user ID');
      }
      return sendMessage(conversationId, currentUserId, content);
    },
    
    // Optimistic update - add message to UI immediately
    onMutate: async ({ content }) => {
      if (!conversationId || !currentUserId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
        created_at: new Date().toISOString(),
        is_read: false,
        sender: undefined, // Will be filled by the actual response
      };

      // Optimistically update cache
      queryClient.setQueryData<Message[]>(
        ['messages', conversationId],
        (old) => [...(old || []), optimisticMessage]
      );

      // Return context with previous value for rollback
      return { previousMessages, optimisticMessage };
    },

    // On success, replace optimistic message with real one
    onSuccess: (newMessage, _, context) => {
      if (!conversationId || !newMessage || !context) return;

      queryClient.setQueryData<Message[]>(
        ['messages', conversationId],
        (old) => {
          if (!old) return [newMessage];
          // Replace the optimistic message with the real one
          return old.map(m => 
            m.id === context.optimisticMessage.id ? newMessage : m
          );
        }
      );
    },

    // On error, rollback to previous state
    onError: (_, __, context) => {
      if (context?.previousMessages && conversationId) {
        queryClient.setQueryData(
          ['messages', conversationId],
          context.previousMessages
        );
      }
    },
  });
}

/**
 * Hook to invalidate messages cache (useful after marking as read)
 */
export function useInvalidateMessages() {
  const queryClient = useQueryClient();
  
  return (conversationId: string) => {
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
  };
}
