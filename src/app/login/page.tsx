'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import { Cinzel } from 'next/font/google';
import { Truck, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle minimal={true} />
      </div>
      {/* Background Image */}
      <img
        src="/images/login-bg.jpg"
        alt="Mining fleet with dump trucks and excavators"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/60 z-[1] backdrop-blur-[2px] transition-colors"></div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700 relative z-10 transition-colors">
        {/* Header */}
        <div className="bg-slate-900/95 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4 border border-white/20 shadow-lg">
              <Truck size={32} />
            </div>
            <h1 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-300 tracking-wider drop-shadow-sm ${cinzel.className}`}>
              AiCrone
            </h1>
            <p className="text-blue-200/70 text-xs uppercase tracking-[0.3em] mt-2 font-light">
              Fleet Management System
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please sign in to your account</p>
          </div>

          <form action={dispatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="admin@aicrone.com"
                  defaultValue="admin@aicrone.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  defaultValue="password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {errorMessage}
              </div>
            )}

            <button
              className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              aria-disabled={isPending}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
