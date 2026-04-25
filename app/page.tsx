"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading, login } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/chat');
    }
  }, [loading, user, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a username to continue.');
      return;
    }

    login(trimmed);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold">Lumina Chat</h1>
          <p className="mt-2 text-slate-400">Simple group chat for learning and collaboration.</p>
        </header>

        <main className="space-y-8">
          <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Start with a username</h2>
            <p className="mt-2 text-slate-400">Enter a username and you are ready to chat with people in the app.</p>
          </section>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
            <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your username"
              autoComplete="off"
            />
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg" className="w-full sm:w-auto rounded-full px-8">
                Enter Chat <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-slate-500">Your username is saved in the browser.</p>
            </div>
          </form>
        </main>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          © 2026 Lumina Chat. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
