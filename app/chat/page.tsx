"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { SessionPanel } from '@/components/chat/SessionPanel';
import { createSession, joinSession, SessionUser } from '@/services/session';

interface User {
  id: number;
  username: string;
  name: string;
}

interface ActivityEvent {
  id: string;
  text: string;
  timestamp: number;
  type: 'system' | 'message' | 'editor';
}

export const SESSION_STORAGE_KEY = 'lumina-chat-session';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [sessionError, setSessionError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedId) {
      setSessionId(storedId);
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleUsersUpdate = (users: SessionUser[]) => {
      setSessionUsers(users);
    };

    const handleActivity = (text: string) => {
      const activityEvent: ActivityEvent = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        timestamp: Date.now(),
        type: 'system',
      };

      setActivityFeed((prev) => [activityEvent, ...prev].slice(0, 30));
    };

    const handleEditorUpdate = (content: string) => {
      setEditorContent(content);
      const editorEvent: ActivityEvent = {
        id: `${Date.now()}-${Math.random()}`,
        text: 'Shared editor updated',
        timestamp: Date.now(),
        type: 'editor',
      };

      setActivityFeed((prev) => [editorEvent, ...prev].slice(0, 30));
    };

    socket.on('users_update', handleUsersUpdate);
    socket.on('activity', handleActivity);
    socket.on('editor_update', handleEditorUpdate);

    return () => {
      socket.off('users_update', handleUsersUpdate);
      socket.off('activity', handleActivity);
      socket.off('editor_update', handleEditorUpdate);
    };
  }, [socket, user]);

  useEffect(() => {
    if (!socket || !socket.connected || !sessionId || !user) return;

    socket.emit('join_session', {
      sessionId,
      username: user.name,
    });
  }, [socket, sessionId, user]);

  const joinSessionRoom = useCallback(async (id: string) => {
    if (!user || !socket) {
      setSessionError('Socket is not connected yet. Please wait a moment and try again.');
      return;
    }
    setSessionError('');

    try {
      const { data } = await joinSession(id, user.username);
      setSessionId(data.id);
      setSessionUsers(data.users || []);
      setEditorContent(data.editorContent || '');
      localStorage.setItem(SESSION_STORAGE_KEY, data.id);
      socket.emit('join_session', {
        sessionId: data.id,
        username: user.name,
      });
    } catch (error) {
      console.error('Could not join session', error);
      setSessionError('Unable to join session. Please verify the session ID.');
    }
  }, [socket, user]);

  const createNewSession = useCallback(async (username: string) => {
    if (!user || !socket) {
      setSessionError('Socket is not connected yet. Please wait a moment and try again.');
      return;
    }
    setSessionError('');

    try {
      const { data } = await createSession(username);
      setSessionId(data.id);
      setSessionUsers(data.users || []);
      setEditorContent(data.editorContent || '');
      localStorage.setItem(SESSION_STORAGE_KEY, data.id);
      socket.emit('join_session', {
        sessionId: data.id,
        username: user.name,
      });
    } catch (error) {
      console.error('Unable to create session', error);
      setSessionError('Unable to create session. Please try again.');
    }
  }, [socket, user]);

  const leaveSession = useCallback(() => {
    if (!socket || !sessionId || !user) return;

    socket.emit('leave_session', {
      sessionId,
      username: user.name,
    });
    setSessionId(null);
    setSessionUsers([]);
    setActivityFeed([]);
    setEditorContent('');
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [socket, sessionId, user]);

  const handleEditorUpdate = useCallback((content: string) => {
    if (!socket || !sessionId) return;
    setEditorContent(content);
    socket.emit('editor_update', {
      sessionId,
      editorContent: content,
    });
  }, [socket, sessionId]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">Loading...</div>;
  if (!user) return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">Redirecting to username entry...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="lg:w-80">
            <Sidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <SessionPanel
              userName={user.name}
              sessionId={sessionId}
              sessionUsers={sessionUsers}
              activityFeed={activityFeed}
              editorContent={editorContent}
              sessionError={sessionError}
              isConnected={isConnected}
              onCreateSession={createNewSession}
              onJoinSession={joinSessionRoom}
              onLeaveSession={leaveSession}
              onUpdateEditor={handleEditorUpdate}
            />

            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 min-h-[420px]">
              {selectedUser ? (
                <ChatWindow selectedUser={selectedUser} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-400">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-4xl">👋</div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Welcome, {user.name}</h2>
                    <p className="mt-2 max-w-md">Choose a contact from the left sidebar to open the chat window and start messaging.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
