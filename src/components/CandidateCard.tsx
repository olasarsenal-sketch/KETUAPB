import React from 'react';
import { 
  Check, 
  Target, 
  ListOrdered,
  Eye
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

      {/* Candidate Image (1:1 Ratio) */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
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

        {/* Name and Class on bottom of photo */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/90 text-white mb-1 shadow-sm">
            Kelas {candidate.classGrade}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
            {candidate.name}
          </h3>
        </div>
      </div>

      {/* Card Content Body: Hanya Visi dan Misi */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white space-y-4">
        <div className="space-y-4">
          {/* Visi */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Visi:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
              {candidate.vision}
            </p>
          </div>

          {/* Misi */}
          {candidate.missions && candidate.missions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                <span>Misi:</span>
              </div>
              <ul className="space-y-1.5">
                {candidate.missions.map((mission, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions Button Group */}
        <div className="pt-2 space-y-2 border-t border-slate-100">
          {/* Detail Button */}
          <button
            type="button"
            onClick={() => onViewDetails(candidate)}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat Detail Visi & Misi
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
