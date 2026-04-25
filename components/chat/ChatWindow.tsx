"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { getConversation } from '@/services/message';
import { Button, Input } from '@/components/ui';
import { Send } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface User {
  id: number;
  username: string;
  name: string;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  selectedUser: User;
}

export const ChatWindow = ({ selectedUser }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { socket } = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        const { data } = await getConversation(selectedUser.id, user.id);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load conversation', error);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: Message) => {
      const isRelated =
        (msg.senderId === user?.id && msg.recipientId === selectedUser.id) ||
        (msg.senderId === selectedUser.id && msg.recipientId === user?.id);

      if (isRelated) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket, selectedUser, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    socket.emit('message', {
      senderId: user.id,
      recipientId: selectedUser.id,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-950">
      <div className="border-b border-slate-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-semibold">
            {selectedUser.name[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{selectedUser.name}</h2>
            <p className="text-sm text-slate-400">@{selectedUser.username.split('@')[0]}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 p-6 text-slate-500">
            <p>No messages yet.</p>
            <p className="text-sm mt-2">Type a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={clsx('max-w-[80%] rounded-3xl p-3', isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none')}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="mt-2 text-xs text-slate-400 text-right">{msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'Now'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-700 bg-slate-900 px-4 py-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
          <Button type="submit" className="min-w-[80px] rounded-full">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
