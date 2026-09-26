import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  IdCard, 
  School, 
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { VoterInfo } from '../types';
import { storageService } from '../services/storageService';
import { SCHOOL_CLASSES } from '../data/studentVoters';

interface VoterRegistrationProps {
  onRegisterComplete: (info: VoterInfo) => void;
  initialInfo?: VoterInfo;
}

const CLASS_OPTIONS = SCHOOL_CLASSES;

export const VoterRegistration: React.FC<VoterRegistrationProps> = ({
  onRegisterComplete,
  initialInfo,
}) => {
  const [name, setName] = useState(initialInfo?.name || '');
  const [nisn, setNisn] = useState(initialInfo?.nisn || '');
  const [studentClass, setStudentClass] = useState(initialInfo?.studentClass || 'X-A');
  const [gender, setGender] = useState<'L' | 'P'>(initialInfo?.gender || 'L');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanNisn = nisn.trim();

    if (!cleanName) {
      setErrorMsg('Nama Lengkap Pemilih wajib diisi!');
      return;
    }

    if (cleanName.length < 3) {
      setErrorMsg('Nama Lengkap minimal 3 karakter.');
      return;
    }

    if (!cleanNisn) {
      setErrorMsg('NIS / NISN wajib diisi untuk verifikasi hak suara.');
      return;
    }

    if (cleanNisn.length < 3 || cleanNisn.length > 20) {
      setErrorMsg('NIS / NISN minimal 3 karakter.');
      return;
    }

    // Periksa apakah NISN sudah pernah digunakan
    const check = storageService.hasVoted(cleanNisn);
    if (check.voted) {
      setErrorMsg(
        `PERINGATAN: NISN "${cleanNisn}" atas nama "${check.record?.voterName}" sudah tercatat telah memberikan suara pada ${new Date(check.record?.createdAt || '').toLocaleString('id-ID')}. Satu pemilih hanya berhak 1 kali memilih.`
      );
      return;
    }

    onRegisterComplete({
      name: cleanName,
      nisn: cleanNisn,
      studentClass,
      gender,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Kartu Header Sambutan */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
            <UserCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Langkah 1 dari 4: Verifikasi Hak Pilih
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Presensi & Verifikasi Pemilih
            </h1>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Masukkan identitas siswa Anda secara akurat. Data nama dan kelas akan dicatat secara resmi ke dalam sistem e-voting dan basis data ekstrakurikuler bulutangkis.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-relaxed">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Input Nama Lengkap */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Nama Lengkap Siswa / Siswi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IdCard className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Muhammad Fajar Pratama"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-base font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Pastikan nama ditulis dengan benar sesuai daftar absen kelas.
            </p>
          </div>

          {/* Grid NISN & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Input NISN */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Nomor Induk Siswa (NIS / NISN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nisn}
                onChange={(e) => setNisn(e.target.value.trim())}
                placeholder="Contoh: 64001 (5 Digit/Karakter)"
                maxLength={15}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-base font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Gunakan NIS 5 digit/karakter Anda sesuai DPT sekolah.
              </p>
            </div>

            {/* Input Kelas */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Kelas & Jurusan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <School className="w-5 h-5" />
                </div>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm cursor-pointer appearance-none"
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Gender Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Jenis Kelamin
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('L')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  gender === 'L'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Putra (Laki-laki)</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('P')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  gender === 'P'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Putri (Perempuan)</span>
              </button>
            </div>
          </div>

          {/* Notice box asas LUBER JURDIL */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Integritas & Asas Pemilihan
            </div>
            <p>
              1. Pemilihan bersifat <strong>Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil</strong>.
            </p>
            <p>
              2. Setiap pemilih wajib memilih <strong>1 Calon Ketua Putra</strong> dan <strong>1 Calon Ketua/Wakil Putri</strong>.
            </p>
            <p>
              3. Data nama pemilih akan diverifikasi ke daftar absensi ekstrakurikuler dan tersimpan aman di database e-voting.
            </p>
          </div>

          {/* Tombol Lanjut ke Bilik Suara */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer"
          >
            <span>Masuk ke Bilik Suara & Pilih Kandidat</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
