import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  IdCard, 
  School, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  GraduationCap,
  Info,
  Vote,
  BarChart3,
  Download
} from 'lucide-react';
import { RegisteredVoter, ElectionSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { SCHOOL_CLASSES } from '../../data/studentVoters';

interface LoginPageProps {
  electionSettings: ElectionSettings;
  onVoterLoginSuccess: (voter: RegisteredVoter) => void;
  onAdminLoginSuccess: () => void;
  onViewPublicQuickCount: () => void;
}

const CLASS_OPTIONS = SCHOOL_CLASSES;

export const LoginPage: React.FC<LoginPageProps> = ({
  electionSettings,
  onVoterLoginSuccess,
  onAdminLoginSuccess,
  onViewPublicQuickCount,
}) => {
  const [activeTab, setActiveTab] = useState<'voter' | 'admin'>('voter');

  // Voter Form State
  const [nisn, setNisn] = useState('');
  const [isSelfRegistering, setIsSelfRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentClass, setStudentClass] = useState('X-A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [voterError, setVoterError] = useState<string | null>(null);

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Handle Login Siswa
  const handleVoterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoterError(null);

    const cleanNisn = nisn.trim();
    if (!cleanNisn) {
      setVoterError('Silakan masukkan NISN/NIS Anda.');
      return;
    }

    // Jika pemilihan ditutup oleh admin
    if (!electionSettings.isVotingOpen) {
      setVoterError(electionSettings.closedMessage || 'Pemungutan suara saat ini sedang ditutup.');
      return;
    }

    // Cek apakah siswa terdaftar di DPT
    const existing = storageService.findVoterByNisn(cleanNisn);

    if (!existing) {
      if (!isSelfRegistering && electionSettings.allowSelfRegistration) {
        setIsSelfRegistering(true);
        setVoterError('NISN belum terdaftar di DPT. Silakan lengkapi Nama dan Kelas untuk pendaftaran mandiri.');
        return;
      }

      if (isSelfRegistering) {
        if (!fullName.trim() || fullName.trim().length < 3) {
          setVoterError('Nama lengkap siswa minimal 3 karakter.');
          return;
        }
      }
    }

    const res = await storageService.loginVoterAsync(
      cleanNisn,
      isSelfRegistering ? fullName : undefined,
      isSelfRegistering ? studentClass : undefined,
      gender
    );

    if (res.success && res.voter) {
      // Siswa berhasil login!
      onVoterLoginSuccess(res.voter);
    } else {
      setVoterError(res.message);
    }
  };

  // Handle Login Admin
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const isValid = storageService.verifyAdmin(adminUsername, adminPassword);
    if (isValid) {
      onAdminLoginSuccess();
    } else {
      setAdminError('Username atau kata sandi admin salah. Silakan periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      
      {/* Top Banner App Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white border-2 border-emerald-500/40 p-1 shadow-xl shadow-emerald-950/15 mb-4">
          <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
            <img 
              src={electionSettings.schoolLogoUrl || './logo-sman1cikampek.svg'} 
              alt="Logo Badminton SMAN 1 Cikampek" 
              className="w-full h-full object-contain p-1" 
            />
          </div>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-emerald-300">
          BADMINTON CLUB
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          {electionSettings.schoolName || 'SMAN 1 CIKAMPEK'}
        </h1>
        <p className="text-sm text-slate-600 mt-1 font-semibold">
          {electionSettings.title || 'Pemilihan Ketua & Wakil Ketua'} ({electionSettings.academicYear || '2026/2027'})
        </p>

        {/* Voting Status Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs">
          {electionSettings.isVotingOpen ? (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              TPS / Pemungutan Suara Sedang DIBUKA
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Pemungutan Suara DITUTUP Panitia
            </span>
          )}
        </div>
      </div>

      {/* Main Card with Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('voter');
              setVoterError(null);
            }}
            className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'voter'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Login Siswa / Pemilih</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminError(null);
            }}
            className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Panel Admin / Panitia</span>
          </button>
        </div>

        {/* Tab 1: Form Siswa */}
        {activeTab === 'voter' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Masuk ke Bilik Suara
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan NISN Anda untuk verifikasi identitas pemilih bulutangkis.
              </p>
            </div>

            {voterError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>{voterError}</div>
              </div>
            )}

            <form onSubmit={handleVoterSubmit} className="space-y-4">
              {/* NISN Input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor Induk Siswa Nasional (NISN / NIS) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => {
                      setNisn(e.target.value.trim());
                      setVoterError(null);
                    }}
                    placeholder="Contoh: 64001 (NIS 5 Digit/Karakter)"
                    maxLength={15}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-base font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Self-registration fields (if NISN not found & allowed) */}
              {isSelfRegistering && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Lengkapi Data DPT Baru:</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Siswa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap sesuai absen"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kelas
                      </label>
                      <select
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {CLASS_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kategori
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setGender('L')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            gender === 'L' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600'
                          }`}
                        >
                          Putra
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('P')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            gender === 'P' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600'
                          }`}
                        >
                          Putri
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!electionSettings.isVotingOpen}
                className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  electionSettings.isVotingOpen
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/25'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <span>{isSelfRegistering ? 'Daftar & Masuk Bilik Suara' : 'Verifikasi & Mulai Memilih'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onViewPublicQuickCount}
                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Lihat Quick Count Hasil Sementara Tanpa Login</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Form Admin */}
        {activeTab === 'admin' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Login Panitia & Admin
                </h2>
                <p className="text-xs text-slate-500">
                  Akses khusus untuk mengedit kandidat, DPT siswa, dan kontrol pemilu.
                </p>
              </div>
            </div>

            {adminError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>{adminError}</div>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Username Panitia / Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi Admin
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Masukkan kata sandi admin"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Masuk ke Panel Kontrol Admin</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Unduh ZIP Web Siap Hosting Banner */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/80 backdrop-blur border border-teal-500/30 rounded-2xl text-slate-200 text-xs shadow-lg max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-xs">File Web Siap Hosting (SMAN 1 CIKAMPEK)</p>
            <p className="text-[11px] text-slate-400">Versi terbaru dengan logo dan nama sekolah resmi.</p>
          </div>
        </div>

        <a
          href="./voting-siap-hosting.zip"
          download="voting-siap-hosting.zip"
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh ZIP Terbaru</span>
        </a>
      </div>

    </div>
  );
};
