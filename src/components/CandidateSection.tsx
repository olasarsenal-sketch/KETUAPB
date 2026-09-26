import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  User, 
  Sparkles,
  ShieldCheck,
  Send,
  RotateCcw
} from 'lucide-react';
import { Candidate, VoterInfo } from '../types';
import { CandidateCard } from './CandidateCard';
import { CandidateDetailModal } from './CandidateDetailModal';

interface CandidateSectionProps {
  voterInfo: VoterInfo;
  candidates: Candidate[];
  selectedPutra: Candidate | null;
  selectedPutri: Candidate | null;
  onSelectPutra: (candidate: Candidate) => void;
  onSelectPutri: (candidate: Candidate) => void;
  onBackToRegistration: () => void;
  onProceedToReview: () => void;
}

export const CandidateSection: React.FC<CandidateSectionProps> = ({
  voterInfo,
  candidates,
  selectedPutra,
  selectedPutri,
  onSelectPutra,
  onSelectPutri,
  onBackToRegistration,
  onProceedToReview,
}) => {
  // Tab kategori aktif: 'putra' atau 'putri'
  const [activeCategory, setActiveCategory] = useState<'putra' | 'putri'>('putra');
  const [inspectingCandidate, setInspectingCandidate] = useState<Candidate | null>(null);

  const putraCandidates = candidates.filter(c => c.category === 'putra');
  const putriCandidates = candidates.filter(c => c.category === 'putri');

  const isBothSelected = Boolean(selectedPutra && selectedPutri);

  return (
    <div className="max-w-7xl mx-auto pb-36">
      
      {/* Top Banner Pemilih Aktif */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-500/20">
            {voterInfo.gender === 'L' ? '🏸' : '🏸'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pemilih Terverifikasi:</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {voterInfo.studentClass}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              {voterInfo.name} <span className="text-sm font-normal text-slate-500 font-mono">({voterInfo.nisn})</span>
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToRegistration}
          className="text-xs font-bold text-slate-600 hover:text-emerald-700 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ganti Identitas Pemilih
        </button>
      </div>

      {/* Kategori Tab Selector (Putra vs Putri) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex p-1.5 bg-slate-200/80 rounded-2xl w-full sm:w-auto shadow-inner border border-slate-300/60">
          <button
            type="button"
            onClick={() => setActiveCategory('putra')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              activeCategory === 'putra'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. Calon Ketua Putra</span>
            {selectedPutra && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('putri')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              activeCategory === 'putri'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>2. Calon Ketua/Wakil Putri</span>
            {selectedPutri && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Status pilihan ringkas */}
        <div className="text-xs font-semibold text-slate-600 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedPutra ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Putra: {selectedPutra ? selectedPutra.nickname : 'Belum dipilih'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedPutri ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Putri: {selectedPutri ? selectedPutri.nickname : 'Belum dipilih'}</span>
          </div>
        </div>
      </div>

      {/* Konten Kategori Putra */}
      {activeCategory === 'putra' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-lg border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Kategori 1: Calon Ketua Putra Periode 2026/2027
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Pilih 1 Kandidat Ketua Putra
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Silakan pelajari visi, misi, dan keunggulan raket dari setiap kandidat di bawah ini. Klik "Pilih Calon" pada kandidat pilihan Anda. Tampilan dijamin bersih tanpa popup yang mengganggu.
            </p>
          </div>

          {/* Grid Kandidat Putra */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {putraCandidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                isSelected={selectedPutra?.id === cand.id}
                onSelect={(selected) => {
                  onSelectPutra(selected);
                  // Opsional: Jika putri belum dipilih, tawarkan kemudahan lanjut
                }}
                onViewDetails={(c) => setInspectingCandidate(c)}
              />
            ))}
          </div>

          {/* Tombol Lanjut ke Putri di bawah kartu (Non-obstructive) */}
          <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Langkah Berikutnya:
              </p>
              <p className="text-sm font-black text-slate-900">
                {selectedPutra
                  ? `Kandidat Putra terpilih: ${selectedPutra.number} - ${selectedPutra.name}`
                  : 'Silakan pilih 1 Kandidat Putra di atas sebelum melanjutkan.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('putri')}
              className={`py-3 px-6 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                selectedPutra
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <span>Lanjut Pilih Calon Putri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Konten Kategori Putri */}
      {activeCategory === 'putri' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-lg border border-teal-500/20">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Kategori 2: Calon Ketua / Wakil Ketua Putri Periode 2026/2027
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Pilih 1 Kandidat Ketua / Wakil Putri
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Setiap pemilih wajib menentukan 1 perwakilan putri untuk kepengurusan ekstrakurikuler yang seimbang, berdaya saing, dan berprestasi tinggi.
            </p>
          </div>

          {/* Grid Kandidat Putri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {putriCandidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                isSelected={selectedPutri?.id === cand.id}
                onSelect={(selected) => onSelectPutri(selected)}
                onViewDetails={(c) => setInspectingCandidate(c)}
              />
            ))}
          </div>

          {/* Navigasi kembali ke Putra atau maju ke Review */}
          <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveCategory('putra')}
              className="py-3 px-5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Pilihan Putra</span>
            </button>

            <button
              type="button"
              onClick={onProceedToReview}
              disabled={!isBothSelected}
              className={`py-3.5 px-8 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                isBothSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-700/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Ringkasan & Konfirmasi Suara</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar (Non-obstructive dock) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white px-4 py-3 sm:py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Summary badges */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={`w-3 h-3 rounded-full ${selectedPutra ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-600'}`}></span>
              <div>
                <span className="text-slate-400 text-[11px] block sm:inline sm:mr-1">Putra:</span>
                <span className="font-bold text-white">
                  {selectedPutra ? `No. ${selectedPutra.number} (${selectedPutra.nickname})` : 'Belum dipilih'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={`w-3 h-3 rounded-full ${selectedPutri ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-600'}`}></span>
              <div>
                <span className="text-slate-400 text-[11px] block sm:inline sm:mr-1">Putri:</span>
                <span className="font-bold text-white">
                  {selectedPutri ? `No. ${selectedPutri.number} (${selectedPutri.nickname})` : 'Belum dipilih'}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onProceedToReview}
            disabled={!isBothSelected}
            className={`py-2.5 sm:py-3 px-5 sm:px-8 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              isBothSelected
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isBothSelected ? 'Kirim Suara Sah' : 'Lengkapi 2 Pilihan'}</span>
          </button>
        </div>
      </div>

      {/* Modal Detail Kandidat */}
      <CandidateDetailModal
        candidate={inspectingCandidate}
        isSelected={
          inspectingCandidate
            ? (inspectingCandidate.category === 'putra' && selectedPutra?.id === inspectingCandidate.id) ||
              (inspectingCandidate.category === 'putri' && selectedPutri?.id === inspectingCandidate.id)
            : false
        }
        onClose={() => setInspectingCandidate(null)}
        onSelect={(cand) => {
          if (cand.category === 'putra') onSelectPutra(cand);
          else onSelectPutri(cand);
        }}
      />
    </div>
  );
};
