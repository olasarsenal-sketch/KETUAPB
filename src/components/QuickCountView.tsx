import React, { useState } from 'react';
import { 
  BarChart3, 
  Trophy, 
  RotateCw, 
  Users, 
  Percent, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Award,
  Trash2
} from 'lucide-react';
import { Candidate, VoteRecord } from '../types';
import { ConfirmModal } from './Common/ConfirmModal';

interface QuickCountViewProps {
  candidates: Candidate[];
  votes: VoteRecord[];
  onRefresh: () => void;
  isLoading: boolean;
  onResetVotes?: () => void;
  isAdmin?: boolean;
}

export const QuickCountView: React.FC<QuickCountViewProps> = ({
  candidates,
  votes,
  onRefresh,
  isLoading,
  onResetVotes,
  isAdmin = false,
}) => {
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const totalVotes = votes.length;

  const putraCandidates = candidates.filter(c => c.category === 'putra');
  const putriCandidates = candidates.filter(c => c.category === 'putri');

  // Hitung suara Putra
  const putraStats = putraCandidates.map(cand => {
    const count = votes.filter(v => v.candidatePutraId === cand.id).length;
    const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : '0.0';
    return {
      candidate: cand,
      count,
      percentage: parseFloat(percentage),
    };
  }).sort((a, b) => b.count - a.count);

  // Hitung suara Putri
  const putriStats = putriCandidates.map(cand => {
    const count = votes.filter(v => v.candidatePutriId === cand.id).length;
    const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : '0.0';
    return {
      candidate: cand,
      count,
      percentage: parseFloat(percentage),
    };
  }).sort((a, b) => b.count - a.count);

  const highestPutra = putraStats[0];
  const highestPutri = putriStats[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Rekapitulasi Cepat (Quick Count Real-Time)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hasil Pemungutan Suara Bulutangkis
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Data suara dihitung otomatis dan sinkron dengan basis data e-voting sekolah.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl text-center min-w-[130px]">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Suara</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">{totalVotes}</span>
            <span className="text-[11px] text-slate-400 block">Suara Sah Masuk</span>
          </div>

          {onResetVotes && (
            <button
              type="button"
              onClick={() => setConfirmResetModal(true)}
              className="py-3 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
              title="Reset Semua Suara Pemilu ke 0"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Suara (0)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-50"
            title="Muat ulang data terbaru"
          >
            <RotateCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid 2 Kolom: Perolehan Putra & Putri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kolom Hasil Putra */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Kategori 1
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Calon Ketua Putra
                </h2>
              </div>
              {highestPutra && highestPutra.count > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unggul: No. {highestPutra.candidate.number}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {putraStats.map(({ candidate, count, percentage }, index) => {
                const isLeading = index === 0 && count > 0;
                return (
                  <div key={candidate.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-black">
                            {candidate.number}
                          </span>
                          <h3 className="font-black text-slate-900 text-base truncate">
                            {candidate.name}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {candidate.classGrade} • {candidate.racketSpecialty}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 font-mono block">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {count} Suara
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLeading ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Dihitung dari {totalVotes} suara sah</span>
            <span>Masa Bakti 2026/2027</span>
          </div>
        </div>

        {/* Kolom Hasil Putri */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
                  Kategori 2
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Calon Ketua / Wakil Putri
                </h2>
              </div>
              {highestPutri && highestPutri.count > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unggul: No. {highestPutri.candidate.number}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {putriStats.map(({ candidate, count, percentage }, index) => {
                const isLeading = index === 0 && count > 0;
                return (
                  <div key={candidate.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-teal-300 transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-black">
                            {candidate.number}
                          </span>
                          <h3 className="font-black text-slate-900 text-base truncate">
                            {candidate.name}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {candidate.classGrade} • {candidate.racketSpecialty}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 font-mono block">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {count} Suara
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLeading ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Dihitung dari {totalVotes} suara sah</span>
            <span>Masa Bakti 2026/2027</span>
          </div>
        </div>

      </div>

      {/* In-App Confirmation Modal */}
      {confirmResetModal && onResetVotes && (
        <ConfirmModal
          isOpen={confirmResetModal}
          title="Kosongkan Seluruh Kotak Suara (0 Suara)?"
          message={`Apakah Anda yakin ingin menghapus semua ${totalVotes} suara yang masuk dan mereset hasil Quick Count ke 0?`}
          detailNote="Status seluruh siswa di DPT akan dikembalikan menjadi 'Belum Memilih' agar seluruh siswa dapat memilih ulang dari awal."
          confirmLabel="Ya, Kosongkan Suara (Reset 0)"
          variant="danger"
          iconType="trash"
          onConfirm={() => {
            onResetVotes();
            setConfirmResetModal(false);
          }}
          onCancel={() => setConfirmResetModal(false)}
        />
      )}

    </div>
  );
};
