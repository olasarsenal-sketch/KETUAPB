import React from 'react';
import { 
  Check, 
  Award, 
  Target, 
  Eye, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (candidate: Candidate) => void;
  onViewDetails: (candidate: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  onSelect,
  onViewDetails,
}) => {
  const isPutra = candidate.category === 'putra';

  return (
    <div
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden ${
        isSelected
          ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-2xl scale-[1.01]'
          : 'border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-xl'
      }`}
    >
      {/* Top Banner / Number Tag */}
      <div className={`py-2 px-4 flex items-center justify-between ${
        isSelected 
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
          : 'bg-slate-900 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-300">
            {isPutra ? 'Calon Ketua Putra' : 'Calon Ketua / Wakil Putri'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-300 font-semibold">Nomor Urut</span>
          <span className="text-base font-black px-2 py-0.5 rounded bg-white text-slate-900 shadow-sm">
            {candidate.number}
          </span>
        </div>
      </div>

      {/* Candidate Image & Badges */}
      <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-100 overflow-hidden">
        <img
          src={candidate.photoUrl}
          alt={candidate.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

        {/* Selected Overlay Indicator */}
        {isSelected && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 animate-in zoom-in-75">
            <Check className="w-4 h-4 stroke-[3]" />
            PILIHAN ANDA
          </div>
        )}

        {/* Quick badge on bottom of photo */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/90 text-white mb-1 shadow-sm">
            {candidate.classGrade}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
            {candidate.name}
          </h3>
          <p className="text-xs text-emerald-200 font-medium flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3" />
            {candidate.racketSpecialty}
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white space-y-4">
        {/* Motto / Slogan */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 italic text-xs text-slate-700 font-medium leading-relaxed relative">
          <span className="text-emerald-500 font-serif text-lg leading-none mr-1">“</span>
          {candidate.motto}
          <span className="text-emerald-500 font-serif text-lg leading-none ml-1">”</span>
        </div>

        {/* Vision Preview */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fokus Visi:</span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {candidate.vision}
          </p>
        </div>

        {/* Top Achievement Pill */}
        {candidate.achievements.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
            <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium line-clamp-1">{candidate.achievements[0]}</span>
          </div>
        )}

        {/* Actions Button Group */}
        <div className="pt-2 space-y-2 border-t border-slate-100">
          {/* Detail Button */}
          <button
            type="button"
            onClick={() => onViewDetails(candidate)}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat Visi, Misi & Rekam Jejak
          </button>

          {/* Select Button */}
          <button
            type="button"
            onClick={() => onSelect(candidate)}
            className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-emerald-700/30 ring-2 ring-emerald-600 ring-offset-1'
                : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Terpilih sebagai Suara Anda</span>
              </>
            ) : (
              <>
                <span>Pilih Kandidat {candidate.number}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
