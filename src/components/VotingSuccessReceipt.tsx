import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Printer, 
  BarChart3, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Database,
  CloudCheck,
  Check
} from 'lucide-react';
import { VoteRecord } from '../types';

interface VotingSuccessReceiptProps {
  voteRecord: VoteRecord;
  onResetForNextVoter: () => void;
  onViewQuickCount: () => void;
  schoolName?: string;
  schoolLogoUrl?: string;
}

export const VotingSuccessReceipt: React.FC<VotingSuccessReceiptProps> = ({
  voteRecord,
  onResetForNextVoter,
  onViewQuickCount,
  schoolName,
  schoolLogoUrl,
}) => {
  useEffect(() => {
    // Fireworks / Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
      });
    } catch {}
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 sm:px-0">
      
      {/* Kartu Struk Digital */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-2xl overflow-hidden relative print:border-none print:shadow-none">
        
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto mb-3 text-white backdrop-blur-sm shadow-md animate-in zoom-in-75 overflow-hidden">
            {schoolLogoUrl ? (
              <img src={schoolLogoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <CheckCircle2 className="w-10 h-10" />
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Hak Suara Berhasil Disimpan
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            BUKTI RESMI E-VOTING BADMINTON
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            {schoolName || 'Ekstrakurikuler Bulutangkis SMA - Masa Bakti 2026/2027'}
          </p>
        </div>

        {/* Struk Content */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          
          {/* Barcode & Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Kode Verifikasi Suara:
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                {voteRecord.voteCode}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Waktu: {new Date(voteRecord.createdAt).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="text-center sm:text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                SUARA SAH TERCATAT
              </span>
              <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-center sm:justify-end gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>
                  {voteRecord.syncedToSupabase
                    ? 'Tersinkron di Supabase Cloud'
                    : 'Tersimpan Aman di Database Lokal'}
                </span>
              </div>
            </div>
          </div>

          {/* Rincian Identitas Pemilih */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Identitas Pemilih Terdaftar:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block">Nama Siswa / Pemilih:</span>
                <span className="text-base font-black text-slate-900 leading-snug">
                  {voteRecord.voterName}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block">Nomor Induk (NISN):</span>
                <span className="text-base font-mono font-bold text-slate-800">
                  {voteRecord.nisn}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block">Kelas:</span>
                <span className="text-base font-bold text-slate-800">
                  {voteRecord.studentClass}
                </span>
              </div>
            </div>
          </div>

          {/* Rincian Calon Terpilih */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Kandidat yang Anda Pilih:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pilihan Putra */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-200 inline-block mb-1.5">
                  Ketua Putra
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {voteRecord.candidatePutraNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {voteRecord.candidatePutraName}
                    </h4>
                    <span className="text-xs text-slate-500">Nomor Urut {voteRecord.candidatePutraNumber}</span>
                  </div>
                </div>
              </div>

              {/* Pilihan Putri */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-200 inline-block mb-1.5">
                  Ketua / Wakil Putri
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {voteRecord.candidatePutriNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {voteRecord.candidatePutriName}
                    </h4>
                    <span className="text-xs text-slate-500">Nomor Urut {voteRecord.candidatePutriNumber}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Watermark Catatan Panitia */}
          <div className="text-center text-xs text-slate-400 italic pt-2 border-t border-slate-100">
            Terima kasih telah berpartisipasi menyukseskan demokrasi ekstrakurikuler bulutangkis secara jujur, adil, dan transparan.
          </div>

        </div>

        {/* Action Buttons (Hidden when printed) */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onViewQuickCount}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Lihat Quick Count</span>
            </button>

            <button
              type="button"
              onClick={onResetForNextVoter}
              className="flex-1 sm:flex-initial py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-700/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Pemilih Berikutnya</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
