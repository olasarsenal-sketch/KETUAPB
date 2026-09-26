import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  User, 
  Users, 
  Award, 
  Target, 
  Image as ImageIcon,
  Zap,
  Sparkles,
  Upload,
  Camera,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { Candidate } from '../../types';
import { compressImageFile } from '../../utils/imageUtils';
import { ConfirmModal } from '../Common/ConfirmModal';

interface CandidateManagerProps {
  candidates: Candidate[];
  onSaveCandidates: (candidates: Candidate[]) => void;
  onResetCandidates: () => void;
}

const PRESET_BADMINTON_AVATARS = [
  { label: 'Putra 1 (Atletik)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putra 2 (Sportif)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putra 3 (Semifinalis)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putra 4 (Smash)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putri 1 (Juara)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putri 2 (Drive Cepat)', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putri 3 (Pemberdayaan)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Putri 4 (Kapten)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
];

export const CandidateManager: React.FC<CandidateManagerProps> = ({
  candidates,
  onSaveCandidates,
  onResetCandidates,
}) => {
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'putra' | 'putri'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Form states for modal
  const [category, setCategory] = useState<'putra' | 'putri'>('putra');
  const [number, setNumber] = useState('01');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classGrade, setClassGrade] = useState('XI MIPA 1');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploadSource, setPhotoUploadSource] = useState<'upload' | 'url' | 'preset'>('upload');
  const [motto, setMotto] = useState('');
  const [racketSpecialty, setRacketSpecialty] = useState('');
  const [vision, setVision] = useState('');
  const [missionsText, setMissionsText] = useState('');
  const [achievementsText, setAchievementsText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = candidates.filter(c => filterCategory === 'all' || c.category === filterCategory);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleOpenAddModal = (cat: 'putra' | 'putri') => {
    const existingInCat = candidates.filter(c => c.category === cat);
    const nextNum = (existingInCat.length + 1).toString().padStart(2, '0');

    setEditingCandidate(null);
    setCategory(cat);
    setNumber(nextNum);
    setName('');
    setNickname('');
    setClassGrade('XI MIPA 1');
    setPhotoUrl(cat === 'putra' ? PRESET_BADMINTON_AVATARS[0].url : PRESET_BADMINTON_AVATARS[4].url);
    setPhotoUploadSource('upload');
    setMotto('Bermain sportif, memimpin aktif!');
    setRacketSpecialty('Tunggal & Ganda / Rally & Serangan Cepat');
    setVision('Mewujudkan ekstrakurikuler bulutangkis yang berprestasi dan solid.');
    setMissionsText('Latihan rutin 2 kali seminggu\nTurnamen internal antar kelas\nPerawatan fasilitas raket dan shuttlecock');
    setAchievementsText('Juara O2SN Tingkat Sekolah\nAnggota aktif bulutangkis');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Candidate) => {
    setEditingCandidate(c);
    setCategory(c.category);
    setNumber(c.number);
    setName(c.name);
    setNickname(c.nickname);
    setClassGrade(c.classGrade);
    setPhotoUrl(c.photoUrl);
    setPhotoUploadSource('upload');
    setMotto(c.motto);
    setRacketSpecialty(c.racketSpecialty);
    setVision(c.vision);
    setMissionsText(c.missions.join('\n'));
    setAchievementsText(c.achievements.join('\n'));
    setIsModalOpen(true);
  };

  // Upload handler dari komputer / HP
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedBase64 = await compressImageFile(file, 640, 640, 0.82);
      setPhotoUrl(compressedBase64);
      showToast('success', `Foto "${file.name}" berhasil diunggah dan dikompres!`);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memproses file foto.');
    } finally {
      setIsUploading(false);
      // Reset input value agar dapat memilih file yang sama jika ingin
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanMissions = missionsText.split('\n').map(s => s.trim()).filter(Boolean);
    const cleanAchievements = achievementsText.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingCandidate) {
      // Update
      const updated: Candidate = {
        ...editingCandidate,
        category,
        number,
        name: name.trim(),
        nickname: nickname.trim() || name.trim().split(' ')[0],
        classGrade: classGrade.trim(),
        photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        motto: motto.trim(),
        racketSpecialty: racketSpecialty.trim(),
        vision: vision.trim(),
        missions: cleanMissions.length > 0 ? cleanMissions : ['Menyelenggarakan latihan berkualitas'],
        achievements: cleanAchievements.length > 0 ? cleanAchievements : ['Atlet bulutangkis sekolah'],
      };
      onSaveCandidates(candidates.map(c => c.id === updated.id ? updated : c));
      showToast('success', `Data kandidat "${updated.name}" berhasil diperbarui!`);
    } else {
      // Add
      const newCand: Candidate = {
        id: `${category}-${Date.now()}`,
        category,
        number,
        name: name.trim(),
        nickname: nickname.trim() || name.trim().split(' ')[0],
        classGrade: classGrade.trim(),
        photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        motto: motto.trim(),
        racketSpecialty: racketSpecialty.trim(),
        vision: vision.trim(),
        missions: cleanMissions.length > 0 ? cleanMissions : ['Menyelenggarakan latihan berkualitas'],
        achievements: cleanAchievements.length > 0 ? cleanAchievements : ['Atlet bulutangkis sekolah'],
      };
      onSaveCandidates([...candidates, newCand]);
      showToast('success', `Kandidat baru "${newCand.name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, candName: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Hapus Kandidat "${candName}"?`,
      message: `Yakin ingin menghapus kandidat "${candName}" dari daftar calon pemilihan?`,
      confirmLabel: 'Ya, Hapus Kandidat',
      variant: 'danger',
      iconType: 'trash',
      onConfirm: () => {
        onSaveCandidates(candidates.filter(c => c.id !== id));
        showToast('success', `Kandidat "${candName}" berhasil dihapus.`);
        setConfirmModal(null);
      },
    });
  };

  const handleReset = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kembalikan Kandidat ke Default?',
      message: 'Yakin ingin mereset seluruh daftar kandidat kembali ke susunan calon awal resmi (3 Putra & 3 Putri)?',
      confirmLabel: 'Ya, Kembalikan Default',
      variant: 'warning',
      iconType: 'reset',
      onConfirm: () => {
        onResetCandidates();
        showToast('success', 'Daftar kandidat berhasil dikembalikan ke default resmi!');
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Kelola Data Kandidat Ketua & Wakil
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah kandidat, upload foto langsung dari HP/komputer, edit visi-misi, atau hapus kandidat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAddModal('putra')}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Calon Putra</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal('putri')}
            className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Calon Putri</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kembalikan ke data kandidat default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua ({candidates.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('putra')}
          className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterCategory === 'putra'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Calon Putra ({candidates.filter(c => c.category === 'putra').length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('putri')}
          className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterCategory === 'putri'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Calon Putri ({candidates.filter(c => c.category === 'putri').length})
        </button>
      </div>

      {/* Grid Kartu Kandidat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            {/* Image Header with Number Tag */}
            <div className="relative aspect-16/10 bg-slate-100 overflow-hidden group">
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 text-white text-xs font-black shadow-sm">
                  NO. {candidate.number}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  candidate.category === 'putra' ? 'bg-emerald-500 text-slate-950' : 'bg-teal-500 text-slate-950'
                }`}>
                  {candidate.category === 'putra' ? 'Ketua Putra' : 'Ketua/Wakil Putri'}
                </span>
              </div>

              {/* Name & Class on Photo */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-black text-lg leading-tight truncate">
                  {candidate.name}
                </h3>
                <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                  Kelas {candidate.classGrade} • {candidate.racketSpecialty}
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs text-slate-700">
              <div className="italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 line-clamp-2">
                "{candidate.motto}"
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Visi Utama:</span>
                <p className="text-slate-600 line-clamp-2 leading-relaxed">
                  {candidate.vision}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(candidate)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit & Upload Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(candidate.id, candidate.name)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors cursor-pointer border border-rose-200"
                  title="Hapus Kandidat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH / EDIT KANDIDAT LENGKAP DENGAN FILE UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Formulir Kandidat
                </span>
                <h3 className="text-xl font-black">
                  {editingCandidate ? `Edit Kandidat: ${editingCandidate.name}` : 'Tambah Kandidat Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-800">
              
              {/* Kategori & Nomor Urut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori Kandidat <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('putra')}
                      className={`flex-1 py-2.5 rounded-xl font-extrabold border transition-all cursor-pointer ${
                        category === 'putra'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Calon Ketua Putra
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('putri')}
                      className={`flex-1 py-2.5 rounded-xl font-extrabold border transition-all cursor-pointer ${
                        category === 'putri'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Calon Ketua/Wakil Putri
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Nomor Urut Surat Suara <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Contoh: 01, 02, 03"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* BAGIAN UTAMA: FILE UPLOAD FOTO KANDIDAT */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <label className="font-black uppercase tracking-wider text-emerald-950 text-xs">
                      Foto Profil Kandidat (Upload File atau URL)
                    </label>
                  </div>

                  {/* Toggle Mode Upload / URL / Presets */}
                  <div className="flex bg-emerald-100/70 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPhotoUploadSource('upload')}
                      className={`py-1 px-2.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                        photoUploadSource === 'upload' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-700'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUploadSource('url')}
                      className={`py-1 px-2.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                        photoUploadSource === 'url' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-700'
                      }`}
                    >
                      Ketik URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUploadSource('preset')}
                      className={`py-1 px-2.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                        photoUploadSource === 'preset' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-700'
                      }`}
                    >
                      Pilihan Preset
                    </button>
                  </div>
                </div>

                {/* Preview Box & Upload Trigger */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  {/* Photo Preview Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 border-2 border-emerald-400 overflow-hidden shadow-md shrink-0">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[10px]">Tanpa Foto</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {photoUploadSource === 'upload' && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{isUploading ? 'Mengompres Foto...' : 'Pilih File Foto dari HP / Komputer'}</span>
                        </button>
                        <p className="text-[11px] text-slate-500 text-center sm:text-left">
                          Format JPG, PNG, WEBP. Foto otomatis dioptimalkan agar ringan dan jernih.
                        </p>
                      </div>
                    )}

                    {photoUploadSource === 'url' && (
                      <div className="space-y-1">
                        <input
                          type="url"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... atau URL foto eksternal"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-[11px] text-slate-500">
                          Masukkan link langsung ke file gambar JPG atau PNG.
                        </p>
                      </div>
                    )}

                    {photoUploadSource === 'preset' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_BADMINTON_AVATARS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPhotoUrl(preset.url)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold truncate flex items-center gap-1.5 transition-colors cursor-pointer ${
                              photoUrl === preset.url
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                            }`}
                          >
                            <img src={preset.url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nama Lengkap & Panggilan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                    Nama Lengkap Calon <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muhammad Fajar Pratama"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: Fajar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Kelas & Spesialisasi Raket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                    Kelas & Jurusan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    placeholder="Contoh: XI MIPA 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                    Spesialisasi Raket / Gaya Main
                  </label>
                  <input
                    type="text"
                    value={racketSpecialty}
                    onChange={(e) => setRacketSpecialty(e.target.value)}
                    placeholder="Contoh: Tunggal Putra / Smash Power & Netting"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Motto */}
              <div>
                <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                  Motto / Slogan Kampanye
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Contoh: Bermain dengan Jiwa Sportif, Memimpin dengan Nyata!"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Visi */}
              <div>
                <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                  Visi Kepemimpinan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Jelaskan visi besar kandidat untuk memajukan ekstrakurikuler bulutangkis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Misi (Pisahkan per baris) */}
              <div>
                <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                  Misi & Program Kerja Unggulan (Satu per baris)
                </label>
                <textarea
                  rows={3}
                  value={missionsText}
                  onChange={(e) => setMissionsText(e.target.value)}
                  placeholder="Program latihan fisik rutin&#10;Turnamen bulutangkis internal&#10;Sparing antar sekolah"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Prestasi (Pisahkan per baris) */}
              <div>
                <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                  Prestasi & Rekam Jejak Bulutangkis (Satu per baris)
                </label>
                <textarea
                  rows={2}
                  value={achievementsText}
                  onChange={(e) => setAchievementsText(e.target.value)}
                  placeholder="Juara 1 O2SN Bulutangkis Kota&#10;Kapten Tim Beregu Sekolah"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-700/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Simpan Kandidat</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
