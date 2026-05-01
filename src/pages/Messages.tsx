import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export function Messages() {
  const { currentUser } = useAppStore();
  const location = useLocation();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState<string>(location.state?.sellerId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || !supabase) return;

    // Fetch message history for current chat
    async function fetchMessages() {
      if (!receiverId) return;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser!.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser!.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    }
    fetchMessages();

    // Setup realtime subscription
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMessage = payload.new;
        if (
          (newMessage.sender_id === currentUser.id && newMessage.receiver_id === receiverId) ||
          (newMessage.sender_id === receiverId && newMessage.receiver_id === currentUser.id)
        ) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !receiverId || !currentUser || !supabase) return;

    const newMsg = {
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content
    };

    setContent('');

    const { error } = await supabase.from('messages').insert(newMsg);
    if (error) console.error("Error sending message:", error);
  };

  if (!currentUser) return null; // ProtectedRoute handles redirect

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex rounded-2xl border border-[#24272F] overflow-hidden bg-[#12141C]">
      {/* Sidebar for conversations - Simplified for now */}
      <div className="w-64 border-r border-[#24272F] bg-[#161821] p-4 flex flex-col gap-4">
        <h3 className="font-bold text-[#E0E2E7]">Chats</h3>
        <input 
          type="text"
          placeholder="Receiver ID..."
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="w-full bg-[#0D0F16] border border-[#24272F] rounded-lg px-3 py-2 text-sm text-[#E0E2E7]"
        />
        <div className="text-xs text-slate-500">
          Enter a user ID to start chatting. If you just purchased an item, the seller's ID is pre-filled.
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0D0F16]">
        {receiverId ? (
          <>
            <div className="p-4 border-b border-[#24272F] bg-[#161821]">
              <div className="font-bold">Chatting with: <span className="font-mono text-xs text-slate-400">{receiverId}</span></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === currentUser.id;
                return (
                  <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#1F222C] text-[#E0E2E7] rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-[#161821] border-t border-[#24272F] flex gap-2">
              <input 
                type="text" 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#0D0F16] border border-[#24272F] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button type="submit" disabled={!content.trim()} className="bg-blue-600 px-4 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-500 transition-colors">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select or enter a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
