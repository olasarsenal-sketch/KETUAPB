import React from 'react';
import { 
  X, 
  Target, 
  ListOrdered, 
  Trophy, 
  Zap, 
  Check, 
  GraduationCap
} from 'lucide-react';
import { Candidate } from '../types';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  isSelected: boolean;
  onClose: () => void;
  onSelect: (candidate: Candidate) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isSelected,
  onClose,
  onSelect,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with photo background snippet */}
        <div className="relative bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={candidate.photoUrl}
              alt={candidate.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-white text-xs font-black">
                  NO. {candidate.number}
                </span>
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                  {candidate.category === 'putra' ? 'Calon Ketua Putra' : 'Calon Ketua / Wakil Putri'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {candidate.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  Kelas {candidate.classGrade}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  {candidate.racketSpecialty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Motto */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 font-semibold italic text-sm text-center">
            "{candidate.motto}"
          </div>

          {/* Visi */}
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Visi Kepemimpinan:</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
              {candidate.vision}
            </p>
          </div>

          {/* Misi */}
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-2">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>Misi & Program Kerja Unggulan:</span>
            </div>
            <ul className="space-y-2.5">
              {candidate.missions.map((mission, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{mission}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prestasi */}
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Prestasi & Rekam Jejak Bulutangkis:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {candidate.achievements.map((achieve, index) => (
                <div key={index} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span>{achieve}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onSelect(candidate);
              onClose();
            }}
            className={`py-2.5 px-6 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-md'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSelected ? 'Sudah Terpilih' : `Pilih Calon ${candidate.number}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
