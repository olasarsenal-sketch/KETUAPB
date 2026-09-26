import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Lock, 
  Power, 
  Check, 
  AlertTriangle, 
  Trash2, 
  ShieldCheck, 
  KeyRound,
  RefreshCw,
  Sparkles,
  Upload,
  Image as ImageIcon,
  School,
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-react';
import { ElectionSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { compressImageFile } from '../../utils/imageUtils';
import { ConfirmModal } from '../Common/ConfirmModal';

interface ElectionSettingsPanelProps {
  settings: ElectionSettings;
  onSaveSettings: (settings: ElectionSettings) => void;
  onResetAllVotes: () => void;
  onSeedSampleVotes?: () => void;
}

export const ElectionSettingsPanel: React.FC<ElectionSettingsPanelProps> = ({
  settings,
  onSaveSettings,
  onResetAllVotes,
  onSeedSampleVotes,
}) => {
  // Settings Form State
  const [isVotingOpen, setIsVotingOpen] = useState(settings.isVotingOpen);
  const [title, setTitle] = useState(settings.title);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [schoolName, setSchoolName] = useState(settings.schoolName || 'SMA Negeri 1 Bulutangkis');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState(settings.schoolLogoUrl || '');
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(settings.allowSelfRegistration);
  const [closedMessage, setClosedMessage] = useState(settings.closedMessage);
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // In-App Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    detailNote?: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    iconType?: 'trash' | 'reset' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackToast({ type, text });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Upload Logo Sekolah
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const base64 = await compressImageFile(file, 400, 400, 0.85);
      setSchoolLogoUrl(base64);
      showToast('success', `Logo "${file.name}" berhasil diunggah! Jangan lupa klik Simpan Pengaturan.`);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memproses file logo.');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setSchoolLogoUrl('');
    showToast('success', 'Logo sekolah dihapus.');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      isVotingOpen,
      title: title.trim(),
      academicYear: academicYear.trim(),
      schoolName: schoolName.trim(),
      schoolLogoUrl: schoolLogoUrl.trim(),
      allowSelfRegistration,
      closedMessage: closedMessage.trim(),
    });
    setSavedSuccess(true);
    showToast('success', 'Semua pengaturan pemilihan dan logo sekolah berhasil disimpan!');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdFeedback(null);

    if (!newPassword || newPassword.length < 5) {
      setPwdFeedback({ success: false, message: 'Kata sandi minimal 5 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdFeedback({ success: false, message: 'Konfirmasi kata sandi tidak cocok!' });
      return;
    }

    try {
      storageService.changeAdminPassword(newPassword);
      setPwdFeedback({ success: true, message: 'Kata sandi admin berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', 'Kata sandi admin berhasil diganti.');
    } catch (err: any) {
      setPwdFeedback({ success: false, message: err.message || 'Gagal mengubah sandi.' });
    }
  };

  // RESET TOTAL SUARA MASUK (In-App Modal Confirmation)
  const handleResetVotes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Total Suara Pemilu (0 Suara)?',
      message: 'Apakah Anda yakin ingin mengosongkan seluruh kotak suara dan mereset hasil pemilihan kembali ke 0 suara?',
      detailNote: 'Semua rekaman suara masuk akan dihapus bersih. Status seluruh siswa di DPT akan dikembalikan menjadi "Belum Memilih" sehingga seluruh siswa dapat memilih dari awal. Sangat dianjurkan sebelum pemilu resmi dimulai.',
      confirmLabel: 'Ya, Kosongkan Suara (Reset 0)',
      variant: 'danger',
      iconType: 'trash',
      onConfirm: async () => {
        onResetAllVotes();
        showToast('success', 'Kotak suara berhasil direset total! Total suara saat ini: 0.');
        setConfirmModal(null);
      },
    });
  };

  // ISI KEMBALI CONTOH SUARA DEMO
  const handleSeedDemoVotes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Muat Data Suara Simulasi?',
      message: 'Muat 5 data suara simulasi untuk keperluan uji coba tampilan Quick Count dan Rekapitulasi Pemilih?',
      confirmLabel: 'Ya, Muat Data Simulasi',
      variant: 'warning',
      iconType: 'reset',
      onConfirm: () => {
        if (onSeedSampleVotes) {
          onSeedSampleVotes();
        } else {
          storageService.seedSampleVotes();
        }
        showToast('success', 'Data suara simulasi berhasil dimuat.');
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {feedbackToast && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in ${
          feedbackToast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>{feedbackToast.text}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pengaturan Pemilihan Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Konfigurasi Sistem Pemilihan & Identitas Sekolah
            </h3>
            <p className="text-xs text-slate-500">
              Upload logo sekolah, buka atau tutup bilik suara, ubah judul pemilu, dan atur kebijakan registrasi pemilih.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan pemilihan berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-5 text-xs text-slate-800">
          
          {/* Status TPS Sakelar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-black text-sm text-slate-900 block">
                Status Pemungutan Suara (Bilik Suara)
              </span>
              <span className="text-xs text-slate-500">
                {isVotingOpen 
                  ? 'Pemilihan SEDANG BUKA. Siswa dapat login dan memberikan suara.' 
                  : 'Pemilihan DITUTUP. Siswa tidak dapat mengirimkan suara baru.'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsVotingOpen(!isVotingOpen)}
              className={`py-2 px-5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isVotingOpen
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-rose-600 text-white shadow-md shadow-rose-700/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isVotingOpen ? 'TPS DIBUKA' : 'TPS DITUTUP'}</span>
            </button>
          </div>

          {/* BAGIAN UTAMA: UPLOAD LOGO SEKOLAH & NAMA INSTITUSI */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" />
              <h4 className="font-black uppercase tracking-wider text-slate-900 text-xs">
                Logo Sekolah & Identitas Organisasi
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Sekolah / Ekstrakurikuler
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: SMA Negeri 1 Bulutangkis"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Nama ini akan tertera di kop struk resmi dan bilah atas.
                </p>
              </div>

              {/* Upload Logo Area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  File Logo Sekolah / Lambang Ekskul
                </label>

                {/* Hidden input */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  {/* Logo Preview */}
                  <div className="w-14 h-14 rounded-xl bg-white border-2 border-emerald-400 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
                    {schoolLogoUrl ? (
                      <img src={schoolLogoUrl} alt="Logo Sekolah" className="w-full h-full object-contain p-1" />
                    ) : (
                      <School className="w-7 h-7 text-slate-300" />
                    )}
                  </div>

                  {/* Upload Action */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingLogo ? 'Mengunggah...' : 'Upload Logo Baru'}</span>
                      </button>

                      {schoolLogoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="py-2 px-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                          title="Hapus Logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Format PNG/JPG/WEBP transparan direkomendasikan.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                Judul Pemilihan
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                Tahun Ajaran / Periode
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Opsi Registrasi Mandiri */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">
                Izinkan Registrasi Mandiri Pemilih Baru
              </span>
              <span className="text-xs text-slate-500">
                Jika diaktifkan, siswa yang NISN-nya belum terdaftar di DPT dapat langsung melengkapi data nama & kelas di layar login.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAllowSelfRegistration(!allowSelfRegistration)}
              className={`py-1.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                allowSelfRegistration ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {allowSelfRegistration ? 'AKTIF' : 'NONAKTIF'}
            </button>
          </div>

          {/* Pesan saat tutup */}
          <div>
            <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
              Pesan Layar Ketika Pemilihan Ditutup
            </label>
            <textarea
              rows={2}
              value={closedMessage}
              onChange={(e) => setClosedMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-700/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Konfigurasi Pemilu</span>
            </button>
          </div>
        </form>
      </div>

      {/* Ubah Password Admin */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Ganti Kata Sandi Akun Administrator
            </h3>
            <p className="text-xs text-slate-500">
              Perbarui kata sandi login admin untuk menjaga keamanan pemilu (Default: admin123).
            </p>
          </div>
        </div>

        {pwdFeedback && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            pwdFeedback.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {pwdFeedback.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{pwdFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs text-slate-800 max-w-lg">
          <div>
            <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
              Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 5 karakter..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
              Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi kata sandi baru..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Perbarui Kata Sandi</span>
          </button>
        </form>
      </div>

      {/* ZONA PEMBERSIHAN DATA & RESET PEMILU */}
      <div className="bg-rose-50/50 rounded-2xl border-2 border-rose-200/80 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-rose-950">
              Pembersihan & Reset Suara Pemilu
            </h3>
            <p className="text-xs text-rose-800/80">
              Gunakan fungsi ini untuk mengosongkan kotak suara sebelum pemilu resmi atau memuat data simulasi.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {/* TOMBOL RESET KOSONGKAN SEMUA SUARA */}
          <button
            type="button"
            onClick={handleResetVotes}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-rose-900/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Kosongkan Seluruh Suara Masuk (Reset ke 0)</span>
          </button>

          {/* TOMBOL MUAT DATA SIMULASI */}
          <button
            type="button"
            onClick={handleSeedDemoVotes}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white border border-rose-300 text-slate-800 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Muat Data Suara Simulasi (Demo Quick Count)</span>
          </button>
        </div>
      </div>

      {/* In-App Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          detailNote={confirmModal.detailNote}
          confirmLabel={confirmModal.confirmLabel}
          variant={confirmModal.variant}
          iconType={confirmModal.iconType}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

    </div>
  );
};
