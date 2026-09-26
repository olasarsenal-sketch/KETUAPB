import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  Database, 
  Power, 
  LogOut, 
  TrendingUp, 
  Trophy, 
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Candidate, RegisteredVoter, ElectionSettings, VoteRecord, SupabaseConfig } from '../../types';
import { CandidateManager } from './CandidateManager';
import { VoterManager } from './VoterManager';
import { ElectionSettingsPanel } from './ElectionSettingsPanel';
import { ConfirmModal } from '../Common/ConfirmModal';

interface AdminDashboardProps {
  candidates: Candidate[];
  voters: RegisteredVoter[];
  settings: ElectionSettings;
  votes: VoteRecord[];
  supabaseConfig: SupabaseConfig;
  onSaveCandidates: (candidates: Candidate[]) => void;
  onResetCandidates: () => void;
  onAddVoter: (voter: Omit<RegisteredVoter, 'id' | 'hasVoted'>) => void;
  onUpdateVoter: (voter: RegisteredVoter) => void;
  onDeleteVoter: (id: string) => void;
  onResetVoterStatus: (nisn: string) => void;
  onResetAllVotersToDefault?: () => void;
  onDeleteAllVoters?: () => void;
  onSaveSettings: (settings: ElectionSettings) => void;
  onResetAllVotes: () => void;
  onSeedSampleVotes?: () => void;
  onOpenSupabaseSettings: () => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  candidates,
  voters,
  settings,
  votes,
  supabaseConfig,
  onSaveCandidates,
  onResetCandidates,
  onAddVoter,
  onUpdateVoter,
  onDeleteVoter,
  onResetVoterStatus,
  onResetAllVotersToDefault,
  onDeleteAllVoters,
  onSaveSettings,
  onResetAllVotes,
  onSeedSampleVotes,
  onOpenSupabaseSettings,
  onLogoutAdmin,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'candidates' | 'voters' | 'settings'>('overview');
  const [confirmResetVotesOpen, setConfirmResetVotesOpen] = useState(false);

  const totalDPT = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const unvotedCount = totalDPT - votedCount;
  const participationRate = totalDPT > 0 ? ((votedCount / totalDPT) * 100).toFixed(1) : '0.0';

  const putraCount = candidates.filter(c => c.category === 'putra').length;
  const putriCount = candidates.filter(c => c.category === 'putri').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel Kontrol Administrator & Panitia
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
              settings.isVotingOpen 
                ? 'bg-emerald-500 text-slate-950' 
                : 'bg-rose-500 text-white'
            }`}>
              {settings.isVotingOpen ? 'TPS BUKA' : 'TPS TUTUP'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pusat Pengelolaan E-Badminton
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Kelola kandidat ketua & wakil, daftar pemilih tetap (DPT), pantau rekapitulasi, dan konfigurasi database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenSupabaseSettings}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Database ({supabaseConfig.isConnected ? 'Supabase' : 'Lokal'})</span>
          </button>

          <button
            type="button"
            onClick={onLogoutAdmin}
            className="py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl w-full sm:w-auto shadow-inner border border-slate-300/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdminTab('overview')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'overview'
              ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
          <span>Ringkasan & Status</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('candidates')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'candidates'
              ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-emerald-600" />
          <span>Kelola Kandidat ({candidates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('voters')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'voters'
              ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Kelola Pemilih & DPT ({voters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('settings')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'settings'
              ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan Pemilu</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Total DPT Siswa</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{totalDPT}</span>
                <span className="text-[11px] text-slate-400 block">Terdaftar resmi</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-teal-700 font-bold block uppercase tracking-wider">Suara Masuk</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{votes.length}</span>
                <span className="text-[11px] text-emerald-600 font-bold block">{participationRate}% Partisipasi</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Total Kandidat</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{candidates.length}</span>
                <span className="text-[11px] text-slate-400 block">{putraCount} Putra • {putriCount} Putri</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                settings.isVotingOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                <Power className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Status Pemilu</span>
                <span className={`text-base font-black ${settings.isVotingOpen ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {settings.isVotingOpen ? 'DIBUKA' : 'DITUTUP'}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {settings.isVotingOpen ? 'Siswa dapat memilih' : 'Bilik suara ditutup'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Reset Kotak Suara Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-rose-950">
                  Pembersihan Kotak Suara ({votes.length} Suara Masuk)
                </h4>
                <p className="text-xs text-rose-800/80 mt-0.5 max-w-xl leading-relaxed">
                  Kosongkan seluruh suara hasil pemilu kembali ke 0. Status seluruh siswa di DPT akan dikembalikan menjadi "Belum Memilih" sehingga pemilihan dapat dimulai bersih.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setConfirmResetVotesOpen(true)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-rose-900/20 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Kotak Suara (0 Suara)</span>
              </button>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  Kandidat Terdaftar
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Daftar Calon Ketua & Wakil
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Terdapat {putraCount} Calon Ketua Putra dan {putriCount} Calon Ketua/Wakil Putri yang sedang bersaing dalam pemilihan ini. Anda dapat mengedit nama, foto, atau visi-misi mereka.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  Masa Bakti {settings.academicYear}
                </span>
                <button
                  type="button"
                  onClick={() => setAdminTab('candidates')}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  Buka Menu Kandidat →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Partisipasi Pemilih (DPT)
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {votedCount} dari {totalDPT} Siswa Sudah Memilih
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sisa {unvotedCount} siswa yang belum menggunakan hak suaranya. Anda dapat menambah siswa baru atau mereset hak suara siswa jika terjadi kesalahan teknis di bilik suara.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold">
                  {participationRate}% Suara Masuk
                </span>
                <button
                  type="button"
                  onClick={() => setAdminTab('voters')}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  Buka Menu DPT →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. KELOLA KANDIDAT */}
      {adminTab === 'candidates' && (
        <CandidateManager
          candidates={candidates}
          onSaveCandidates={onSaveCandidates}
          onResetCandidates={onResetCandidates}
        />
      )}

      {/* 3. KELOLA PEMILIH & DPT */}
      {adminTab === 'voters' && (
        <VoterManager
          voters={voters}
          onAddVoter={onAddVoter}
          onUpdateVoter={onUpdateVoter}
          onDeleteVoter={onDeleteVoter}
          onResetVoterStatus={onResetVoterStatus}
          onResetAllVotersToDefault={onResetAllVotersToDefault}
          onDeleteAllVoters={onDeleteAllVoters}
        />
      )}

      {/* 4. PENGATURAN PEMILIHAN */}
      {adminTab === 'settings' && (
        <ElectionSettingsPanel
          settings={settings}
          onSaveSettings={onSaveSettings}
          onResetAllVotes={onResetAllVotes}
          onSeedSampleVotes={onSeedSampleVotes}
        />
      )}

      {/* In-App Confirmation Modal for Reset Votes */}
      <ConfirmModal
        isOpen={confirmResetVotesOpen}
        title="Kosongkan Seluruh Kotak Suara (0 Suara)?"
        message={`Apakah Anda yakin ingin menghapus semua ${votes.length} suara yang masuk dan mereset hasil pemilu?`}
        detailNote="Status seluruh siswa di DPT akan dikembalikan menjadi 'Belum Memilih'. Rekapitulasi Quick Count dan Data Pemilih akan kembali bersih (0 suara)."
        confirmLabel="Ya, Kosongkan Suara Sekarang"
        variant="danger"
        iconType="trash"
        onConfirm={() => {
          onResetAllVotes();
          setConfirmResetVotesOpen(false);
        }}
        onCancel={() => setConfirmResetVotesOpen(false)}
      />

    </div>
  );
};
