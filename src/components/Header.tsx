import React from 'react';
import { 
  Trophy, 
  Vote, 
  BarChart3, 
  Users, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  LogOut
} from 'lucide-react';
import { SupabaseConfig, AuthSession } from '../types';

interface HeaderProps {
  activeTab: 'login' | 'vote' | 'admin' | 'quick-count' | 'voter-list';
  setActiveTab: (tab: 'login' | 'vote' | 'admin' | 'quick-count' | 'voter-list') => void;
  supabaseConfig: SupabaseConfig;
  onOpenSettings: () => void;
  totalVotesCount: number;
  session: AuthSession;
  onLogout: () => void;
  schoolName?: string;
  schoolLogoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  supabaseConfig,
  onOpenSettings,
  totalVotesCount,
  session,
  onLogout,
  schoolName,
  schoolLogoUrl,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Judul Ekskul */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer" 
            onClick={() => {
              if (session.role === 'admin') setActiveTab('admin');
              else if (session.role === 'voter') setActiveTab('vote');
              else setActiveTab('login');
            }}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400 p-0.5 shadow-md shadow-emerald-900/40">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                {schoolLogoUrl ? (
                  <img src={schoolLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  /* Shuttlecock SVG Icon */
                  <svg 
                    className="w-7 h-7 text-emerald-400 transform -rotate-12 hover:rotate-0 transition-transform" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="5" r="3" fill="currentColor" fillOpacity="0.2" />
                    <path d="M12 8v4" />
                    <path d="m7.5 13 4.5 9 4.5-9" />
                    <path d="M5 13h14" />
                    <path d="M9 13v3" />
                    <path d="M15 13v3" />
                  </svg>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent uppercase">
                  E-Badminton
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  E-VOTING RESMI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-md">
                {schoolName || 'Pemilihan Ketua & Wakil Ketua Ekstrakurikuler Periode 2026/2027'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            {/* If Admin */}
            {session.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                    : 'text-emerald-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Panel Admin
              </button>
            )}

            {/* If Voter or Guest */}
            {session.role === 'voter' && (
              <button
                onClick={() => setActiveTab('vote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'vote'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Vote className="w-4 h-4" />
                Bilik Suara
              </button>
            )}

            {session.role === 'guest' && (
              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <User className="w-4 h-4" />
                Login Masuk
              </button>
            )}

            <button
              onClick={() => setActiveTab('quick-count')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'quick-count'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Quick Count
              {totalVotesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-slate-900 text-emerald-300 rounded-full border border-emerald-500/30">
                  {totalVotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('voter-list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'voter-list'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Pemilih
            </button>
          </nav>

          {/* Right Actions: Session Status & Supabase Settings */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Status Button */}
            <button
              onClick={onOpenSettings}
              title="Konfigurasi Supabase & Database"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80 shadow-sm'
                  : 'bg-amber-950/50 border-amber-500/50 text-amber-300 hover:bg-amber-900/70'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="hidden lg:inline">
                  {supabaseConfig.isConnected ? 'Supabase' : 'DB Lokal'}
                </span>
              </div>
            </button>

            {/* Session Pill / Logout Button */}
            {session.role === 'admin' && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                  👑 ADMIN
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Keluar dari Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}

            {session.role === 'voter' && session.voter && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold max-w-[140px] truncate">
                  👤 {session.voter.name.split(' ')[0]} ({session.voter.studentClass})
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ganti Pemilih / Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ganti Siswa</span>
                </button>
              </div>
            )}

            {session.role === 'guest' && (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile menu switcher */}
            <div className="flex md:hidden items-center bg-slate-800 p-1 rounded-lg border border-slate-700 ml-1">
              {session.role === 'admin' ? (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`p-2 rounded ${activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  title="Panel Admin"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              ) : session.role === 'voter' ? (
                <button
                  onClick={() => setActiveTab('vote')}
                  className={`p-2 rounded ${activeTab === 'vote' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  title="Bilik Suara"
                >
                  <Vote className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('login')}
                  className={`p-2 rounded ${activeTab === 'login' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  title="Login"
                >
                  <User className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setActiveTab('quick-count')}
                className={`p-2 rounded ${activeTab === 'quick-count' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                title="Hasil Suara"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('voter-list')}
                className={`p-2 rounded ${activeTab === 'voter-list' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                title="Data Pemilih"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
