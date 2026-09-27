import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Check, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  FolderMinus,
  Database,
  Copy
} from 'lucide-react';
import { RegisteredVoter } from '../../types';
import { ConfirmModal } from '../Common/ConfirmModal';
import { SCHOOL_CLASSES } from '../../data/studentVoters';
import { storageService } from '../../services/storageService';

interface VoterManagerProps {
  voters: RegisteredVoter[];
  onAddVoter: (voter: Omit<RegisteredVoter, 'id' | 'hasVoted'>) => void | Promise<void>;
  onUpdateVoter: (voter: RegisteredVoter) => void | Promise<void>;
  onDeleteVoter: (id: string) => void | Promise<void>;
  onResetVoterStatus: (nisn: string) => void | Promise<void>;
  onResetAllVotersToDefault?: () => void | Promise<void>;
  onDeleteAllVoters?: () => void | Promise<void>;
  onRefreshVoters?: () => Promise<void>;
  isSupabaseConnected?: boolean;
}

export const VoterManager: React.FC<VoterManagerProps> = ({
  voters,
  onAddVoter,
  onUpdateVoter,
  onDeleteVoter,
  onResetVoterStatus,
  onResetAllVotersToDefault,
  onDeleteAllVoters,
  onRefreshVoters,
  isSupabaseConnected = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'voted' | 'unvoted'>('all');
  const [classFilter, setClassFilter] = useState('all');
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingToSupabase, setIsSyncingToSupabase] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(storageService.getVotersSQLSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    showToast('success', 'Script SQL 127 Siswa DPT Supabase berhasil disalin!');
  };

  const handleSync127ToSupabase = async () => {
    setIsSyncingToSupabase(true);
    try {
      const res = await storageService.sync127VotersToSupabase();
      if (res.success) {
        showToast('success', res.message);
        if (onRefreshVoters) {
          await onRefreshVoters();
        }
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal sinkronkan 127 data DPT ke Supabase.');
    } finally {
      setIsSyncingToSupabase(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshVoters) {
        await onRefreshVoters();
      } else {
        await storageService.fetchRegisteredVotersFromSupabase();
      }
      showToast('success', 'Data DPT berhasil dimuat ulang dari Supabase.');
    } catch {
      showToast('error', 'Gagal memuat ulang data DPT dari Supabase.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // In-App Confirmation Modal State (replaces window.confirm)
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<RegisteredVoter | null>(null);
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('X-A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [modalError, setModalError] = useState<string | null>(null);

  const availableClasses = Array.from(new Set([
    ...SCHOOL_CLASSES,
    ...voters.map(v => v.studentClass).filter(Boolean)
  ]));

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackToast({ type, text });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Statistics
  const totalDPT = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const unvotedCount = totalDPT - votedCount;
  const participationRate = totalDPT > 0 ? ((votedCount / totalDPT) * 100).toFixed(1) : '0.0';

  // Filtered List
  const filtered = voters.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.voteCode && v.voteCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'voted' ? v.hasVoted :
      !v.hasVoted;

    const matchesClass = classFilter === 'all' || v.studentClass === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleOpenAdd = () => {
    setEditingVoter(null);
    setNisn('');
    setName('');
    setStudentClass('X-A');
    setGender('L');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: RegisteredVoter) => {
    setEditingVoter(v);
    setNisn(v.nisn);
    setName(v.name);
    setStudentClass(v.studentClass);
    setGender(v.gender);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanNisn = nisn.trim();
    const cleanName = name.trim();

    if (!cleanNisn || !cleanName) {
      setModalError('NISN dan Nama Lengkap wajib diisi!');
      return;
    }

    try {
      if (editingVoter) {
        onUpdateVoter({
          ...editingVoter,
          nisn: cleanNisn,
          name: cleanName,
          studentClass,
          gender,
        });
        showToast('success', `Data siswa "${cleanName}" berhasil diperbarui.`);
      } else {
        onAddVoter({
          nisn: cleanNisn,
          name: cleanName,
          studentClass,
          gender,
        });
        showToast('success', `Siswa "${cleanName}" (${cleanNisn}) berhasil didaftarkan ke DPT.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Gagal menyimpan data siswa.');
    }
  };

  // TOMBOL RESET HAK SUARA PER SISWA
  const handleResetVoter = (v: RegisteredVoter) => {
    setConfirmModal({
      isOpen: true,
      title: `Reset Hak Suara Siswa?`,
      message: `Yakin ingin mereset hak suara untuk siswa "${v.name}" (${v.nisn})?`,
      detailNote: `Suara pilihan sebelumnya akan dihapus dan status siswa kembali menjadi 'Belum Memilih' agar dapat memilih ulang di bilik suara.`,
      confirmLabel: 'Ya, Reset Hak Suara',
      variant: 'warning',
      iconType: 'reset',
      onConfirm: () => {
        onResetVoterStatus(v.nisn);
        showToast('success', `Hak suara siswa "${v.name}" berhasil direset! Siswa dapat memilih ulang.`);
        setConfirmModal(null);
      },
    });
  };

  // TOMBOL DELETE SISWA DARI DPT
  const handleDelete = (v: RegisteredVoter) => {
    setConfirmModal({
      isOpen: true,
      title: `Hapus Siswa "${v.name}"?`,
      message: `Yakin ingin menghapus siswa "${v.name}" (NISN: ${v.nisn}) dari Daftar Pemilih Tetap (DPT)?`,
      detailNote: `Jika siswa sudah pernah memilih, rekaman suara dan hak suaranya juga akan dibersihkan dari rekapitulasi.`,
      confirmLabel: 'Ya, Hapus Siswa',
      variant: 'danger',
      iconType: 'trash',
      onConfirm: () => {
        onDeleteVoter(v.id);
        showToast('success', `Siswa "${v.name}" berhasil dihapus dari daftar DPT.`);
        setConfirmModal(null);
      },
    });
  };

  // TOMBOL RESET DPT KE DEFAULT
  const handleResetDPTToDefault = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kembalikan DPT ke Default?',
      message: 'Kembalikan daftar pemilih tetap (DPT) ke susunan awal standar sekolah?',
      confirmLabel: 'Ya, Kembalikan Default',
      variant: 'warning',
      iconType: 'reset',
      onConfirm: () => {
        if (onResetAllVotersToDefault) {
          onResetAllVotersToDefault();
        }
        showToast('success', 'Daftar DPT berhasil dikembalikan ke default awal.');
        setConfirmModal(null);
      },
    });
  };

  // TOMBOL KOSONGKAN DPT
  const handleDeleteAllDPT = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kosongkan Seluruh DPT?',
      message: 'PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh daftar pemilih tetap (DPT)?',
      detailNote: 'Semua siswa terdaftar akan dihapus. Anda dapat mendaftarkan siswa sekolah Anda sendiri setelahnya.',
      confirmLabel: 'Ya, Kosongkan Seluruh DPT',
      variant: 'danger',
      iconType: 'trash',
      onConfirm: () => {
        if (onDeleteAllVoters) {
          onDeleteAllVoters();
        }
        showToast('success', 'Seluruh DPT telah dikosongkan.');
        setConfirmModal(null);
      },
    });
  };

  const handleExportDPT = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Jenis Kelamin', 'Status Vote', 'Kode Suara'];
    const rows = voters.map((v, i) => [
      i + 1,
      `"${v.nisn}"`,
      `"${v.name}"`,
      `"${v.studentClass}"`,
      v.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      v.hasVoted ? 'Sudah Memilih' : 'Belum Memilih',
      `"${v.voteCode || '-'}"`
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `DPT_Badminton_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total DPT Siswa</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1 block">{totalDPT}</span>
          <span className="text-xs text-slate-400">Pemilih Terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Sudah Memilih</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono mt-1 block">{votedCount}</span>
          <span className="text-xs text-emerald-700 font-semibold">{participationRate}% Partisipasi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Belum Memilih</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono mt-1 block">{unvotedCount}</span>
          <span className="text-xs text-slate-400">Hak Suara Tersedia</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Aksi DPT</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
            <button
              type="button"
              onClick={handleExportDPT}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Ekspor CSV DPT"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetDPTToDefault}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Kembalikan DPT Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Supabase 127 DPT Sync & SQL Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1">
              <Database className="w-3 h-3" /> Supabase Real-Time
            </span>
            <span className="text-xs text-emerald-300 font-semibold">1 Siswa = 1 Kali Pakai</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            Data 127 Siswa DPT SMAN 1 Cikampek
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Data 127 siswa resmi disimpan di tabel <code className="text-emerald-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">voters</code> Supabase. Sistem otomatis memproteksi hak suara sehingga setiap siswa hanya dapat memilih satu kali di perangkat mana pun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSync127ToSupabase}
            disabled={isSyncingToSupabase}
            className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Unggah 127 data siswa DPT ke tabel voters Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingToSupabase ? 'animate-spin' : ''}`} />
            <span>{isSyncingToSupabase ? 'Mengunggah 127 Siswa...' : '🚀 Sinkron 127 DPT ke Supabase'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="flex-1 md:flex-none py-2.5 px-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            title="Lihat & Salin Script SQL DPT Supabase"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Script SQL 127 DPT</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh dari Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, NISN, atau kode..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Semua ({voters.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('voted')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'voted' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Sudah ({votedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unvoted')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'unvoted' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Belum ({unvotedCount})
            </button>
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Kelas</option>
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {voters.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllDPT}
              className="py-1.5 px-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              title="Kosongkan seluruh DPT"
            >
              <FolderMinus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table DPT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-900 text-white uppercase font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Status Hak Suara</th>
                <th className="py-3 px-4 text-center">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ditemukan data siswa pada DPT.
                  </td>
                </tr>
              ) : (
                filtered.map((voter, index) => (
                  <tr key={voter.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {voter.name}
                      </div>
                      {voter.voteCode && (
                        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {voter.voteCode}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {voter.nisn}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
                        {voter.studentClass}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold text-slate-600">
                        {voter.gender === 'L' ? 'Putra (L)' : 'Putri (P)'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {voter.hasVoted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Sudah Memilih
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Belum Memilih
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Reset Vote Button */}
                        {voter.hasVoted && (
                          <button
                            type="button"
                            onClick={() => handleResetVoter(voter)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 font-bold transition-colors cursor-pointer"
                            title="Reset Hak Suara (Izinkan Siswa Memilih Ulang)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(voter)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                          title="Edit Identitas Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (DIPERBAIKI) */}
                        <button
                          type="button"
                          onClick={() => handleDelete(voter)}
                          className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer"
                          title="Hapus Siswa dari DPT"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filtered.length} dari {voters.length} siswa DPT</span>
          <span>Sistem Manajemen Pemilih Bulutangkis</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 relative">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black">
                {editingVoter ? `Edit Siswa: ${editingVoter.name}` : 'Tambah Siswa ke DPT'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pastikan NISN dan nama lengkap siswa valid.
              </p>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs text-slate-800">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                  NIS / NISN (5 Digit/Karakter) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.trim())}
                  placeholder="Contoh: 64001"
                  maxLength={15}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Achmad Gilang Ganesha"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                    Kelas & Jurusan
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-slate-700 mb-1">
                    Kategori Siswa
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        gender === 'L' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      Putra
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        gender === 'P' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      Putri
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Simpan Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SCRIPT SQL 127 SISWA DPT SUPABASE */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Script SQL Tabel DPT (127 Siswa Pemilih) Supabase
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tabel <code className="text-emerald-600 font-mono font-bold">public.voters</code> • Proteksi 1 Siswa = 1 Kali Pakai
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong>Jaminan 1 Siswa = 1 Kali Pakai:</strong> Script ini otomatis menyertakan constraint <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">nisn UNIQUE</code>, kolom <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">has_voted BOOLEAN</code>, aturan keamanan RLS, serta data 127 siswa pemilih resmi lengkap dengan NISN dan kelas.
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Langkah Menjalankan di Supabase:</span>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600 leading-relaxed">
                  <li>Buka dashboard Supabase project Anda di browser.</li>
                  <li>Pilih menu <strong>SQL Editor</strong> di bilah kiri, lalu klik <strong>New Query</strong>.</li>
                  <li>Klik tombol hijau <strong>"Salin Seluruh Script SQL"</strong> di bawah, lalu paste ke SQL Editor.</li>
                  <li>Klik tombol <strong>Run</strong> (atau Ctrl+Enter). Tabel <code className="font-mono text-emerald-700 bg-slate-100 px-1 py-0.5 rounded">voters</code> dan 127 siswa akan otomatis terbuat!</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Kode SQL Tabel voters & 127 Siswa SMAN 1 Cikampek:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Script</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-56 leading-relaxed select-all">
                  {storageService.getVotersSQLSchema()}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSync127ToSupabase}
                disabled={isSyncingToSupabase}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingToSupabase ? 'animate-spin' : ''}`} />
                <span>{isSyncingToSupabase ? 'Sedang Mengunggah...' : '🚀 Unggah Langsung ke Supabase (API)'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Tersalin!' : 'Salin Script SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
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
