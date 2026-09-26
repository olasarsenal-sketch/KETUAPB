import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Send, 
  User, 
  Users, 
  School, 
  IdCard, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Candidate, VoterInfo } from '../types';

interface ReviewConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  voterInfo: VoterInfo;
  selectedPutra: Candidate | null;
  selectedPutri: Candidate | null;
  onClose: () => void;
  onConfirmSubmit: () => void;
}

export const ReviewConfirmModal: React.FC<ReviewConfirmModalProps> = ({
  isOpen,
  isSubmitting,
  voterInfo,
  selectedPutra,
  selectedPutri,
  onClose,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Konfirmasi Hak Suara Sah
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Verifikasi Sebelum Pengiriman
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Box Identitas Pemilih */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Data Pemilih Resmi
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-xs text-slate-500 block">Nama Pemilih:</span>
                <span className="text-sm font-black text-slate-900">{voterInfo.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">NISN / NIS:</span>
                <span className="text-sm font-mono font-bold text-slate-800">{voterInfo.nisn}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Kelas:</span>
                <span className="text-sm font-bold text-slate-800">{voterInfo.studentClass}</span>
              </div>
            </div>
          </div>

          {/* Side by Side Preview Pilihan Putra & Putri */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Ringkasan Pasangan Kandidat Pilihan Anda:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pilihan Calon Putra */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 relative flex gap-3.5 items-center">
                <img
                  src={selectedPutra?.photoUrl}
                  alt={selectedPutra?.name}
                  className="w-16 h-16 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-1.5 py-0.2 text-[10px] font-black bg-emerald-600 text-white rounded">
                      NO. {selectedPutra?.number}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">
                      Ketua Putra
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm leading-tight">
                    {selectedPutra?.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {selectedPutra?.classGrade} • {selectedPutra?.racketSpecialty}
                  </p>
                </div>
              </div>

              {/* Pilihan Calon Putri */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 relative flex gap-3.5 items-center">
                <img
                  src={selectedPutri?.photoUrl}
                  alt={selectedPutri?.name}
                  className="w-16 h-16 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-1.5 py-0.2 text-[10px] font-black bg-emerald-600 text-white rounded">
                      NO. {selectedPutri?.number}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">
                      Ketua / Wakil Putri
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm leading-tight">
                    {selectedPutri?.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {selectedPutri?.classGrade} • {selectedPutri?.racketSpecialty}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Peringatan Hukum Pemilihan */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Pemberitahuan Sistem:</strong> Setelah tombol konfirmasi diklik, suara Anda akan disegel dan dimasukkan ke dalam basis data rekapitulasi. Pilihan tidak dapat diubah kembali.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Kembali & Ubah Pilihan
          </button>

          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Suara Sah...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ya, Kirim Suara Resmi Saya</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
