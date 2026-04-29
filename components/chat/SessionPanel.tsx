"use client";

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { SessionUser } from '@/services/session';
import { SESSION_STORAGE_KEY } from '@/app/chat/page';

interface ActivityEvent {
  id: string;
  text: string;
  timestamp: number;
  type: 'system' | 'message' | 'editor';
}

interface Props {
  userName: string;
  sessionId: string | null;
  sessionUsers: SessionUser[];
  activityFeed: ActivityEvent[];
  editorContent: string;
  sessionError?: string;
  isConnected: boolean;
  onCreateSession: (sessionName: string) => void;
  onJoinSession: (sessionId: string) => void;
  onLeaveSession: () => void;
  onUpdateEditor: (content: string) => void;
}

export const SessionPanel = ({
  userName,
  sessionId,
  sessionUsers,
  activityFeed,
  editorContent,
  sessionError,
  isConnected,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onUpdateEditor,
}: Props) => {
  const [sessionInput, setSessionInput] = useState('');
  const [editorDraft, setEditorDraft] = useState(editorContent);
  const [copied, setCopied] = useState(false);

  const displayedSessionId = sessionId || localStorage.getItem(SESSION_STORAGE_KEY) || '';

  useEffect(() => {
    setEditorDraft(editorContent);
  }, [editorContent]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCreate = () => {
    onCreateSession(userName);
  };

  const handleCopySessionId = () => {
    if (!displayedSessionId) return;

    navigator.clipboard.writeText(displayedSessionId).then(() => {
      setCopied(true);
    });
  };

  const handleJoin = () => {
    if (!sessionInput.trim()) return;
    onJoinSession(sessionInput.trim());
  };

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5 shadow-sm">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Real-time session</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Collaboration hub</h2>
        <p className="mt-2 text-sm text-slate-400">Create or join a shared session to see participant activity and editor updates.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Button type="button" className="w-full" onClick={handleCreate}>
            Create session
          </Button>
          <div className="space-y-2">
            <Input
              placeholder="Session ID"
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-100"
            />
            <Button type="button" variant="secondary" className="w-full" onClick={handleJoin}>
              Join session
            </Button>
          </div>

          {sessionError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {sessionError}
            </div>
          )}

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white">Participants</p>
              <p className="text-xs text-slate-500">
                {sessionUsers.length ? `${sessionUsers.length} participant${sessionUsers.length === 1 ? '' : 's'}` : 'No participants yet'}
              </p>
              <p
                className={`text-xs ${displayedSessionId ? 'cursor-pointer text-slate-500 hover:text-white' : 'text-slate-500'}`}
                onClick={displayedSessionId ? handleCopySessionId : undefined}
                title={displayedSessionId ? 'Click to copy session ID' : undefined}
              >
                Copy ID
                {copied && displayedSessionId ? ' · Copied!' : ''}
              </p>
            </div>
            <div className="mt-4 space-y-3 max-h-52 overflow-y-auto pr-2">
              {sessionUsers.length ? (
                sessionUsers.map((participant) => (
                  <div key={participant.socketId} className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      {participant.username[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white truncate">{participant.username}</p>
                      <p className="text-xs text-slate-500">Live participant</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No one has joined yet. Create a session or share the ID.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Activity feed</p>
              <p className="text-xs text-slate-500">New events show here.</p>
            </div>
            {sessionId && (
              <Button type="button" variant="ghost" size="sm" onClick={onLeaveSession} className="text-red-300 hover:text-white">
                Leave
              </Button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
            {activityFeed.length ? (
              activityFeed.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
                  <p>{event.text}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Activity will appear after you join or create a session.</p>
            )}
          </div>
        </div>
      </div>

      {sessionId && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Shared editor</h3>
              <p className="text-sm text-slate-500">Save notes or shared content here.</p>
            </div>
            <Button type="button" className="rounded-full px-5" onClick={() => onUpdateEditor(editorDraft)}>
              Save
            </Button>
          </div>
          <textarea
            value={editorDraft}
            onChange={(e) => setEditorDraft(e.target.value)}
            rows={6}
            className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type shared notes or code here..."
          />
        </div>
      )}
    </div>
  );
};
