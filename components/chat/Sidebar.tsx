"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { fetchUsers } from '@/services/user';
import { Button, Input } from '@/components/ui';
import { Search, LogOut, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface User {
  id: number;
  username: string;
  name: string;
}

interface SidebarProps {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
}

export const Sidebar = ({ onSelectUser, selectedUser }: SidebarProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const { user: currentUser, logout } = useAuth();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await fetchUsers();
        setUsers(data.filter((u: User) => u.id !== currentUser?.id));
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-700 bg-slate-950 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Lumina</h1>
          <p className="text-sm text-slate-400">Select a chat contact</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-700 text-slate-100"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filteredUsers.map((u) => {
          const isOnline = onlineUsers.has(u.id);

          return (
            <button
              key={u.id}
              onClick={() => onSelectUser(u)}
              className={clsx(
                'w-full rounded-2xl p-3 text-left transition-colors duration-150',
                selectedUser?.id === u.id ? 'bg-blue-600/10' : 'hover:bg-slate-900'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                  <UserIcon className="h-5 w-5" />
                  {isOnline && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{u.name}</p>
                  <p className="truncate text-xs text-slate-500">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-4 text-center text-sm text-slate-500">
            No users found.
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            {currentUser?.name?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentUser?.name}</p>
            <p className="text-xs text-slate-500">@{currentUser?.username?.split('@')[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
