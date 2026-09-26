import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Database, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  CloudCheck,
  Check,
  Filter,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { VoteRecord } from '../types';
import { ConfirmModal } from './Common/ConfirmModal';

interface VoterListViewProps {
  votes: VoteRecord[];
  onRefresh: () => void;
  isLoading: boolean;
  onDeleteVote?: (voteCode: string) => void;
  onResetAllVotes?: () => void;
  isAdmin?: boolean;
}

export const VoterListView: React.FC<VoterListViewProps> = ({
  votes,
  onRefresh,
  isLoading,
  onDeleteVote,
  onResetAllVotes,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    detailNote?: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    iconType?: 'trash' | 'reset';
    onConfirm: () => void;
  } | null>(null);

  // Filter votes berdasarkan search & kelas
  const filteredVotes = votes.filter(vote => {
    const matchesSearch = 
      vote.voterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.voteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.candidatePutraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.candidatePutriName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClassFilter === 'all' || vote.studentClass === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  // Ambil list unik kelas
  const uniqueClasses = Array.from(new Set(votes.map(v => v.studentClass))).sort();

  // Export to CSV
  const handleExportCSV = () => {
    if (votes.length === 0) return;

    const headers = [
      'No',
      'Kode Suara',
      'Waktu Vote',
      'Nama Pemilih',
      'NISN',
      'Kelas',
      'No Urut Putra',
      'Nama Calon Putra',
      'No Urut Putri',
      'Nama Calon Putri',
      'Status Supabase'
    ];

    const rows = votes.map((v, i) => [
      i + 1,
      `"${v.voteCode}"`,
      `"${new Date(v.createdAt).toLocaleString('id-ID')}"`,
      `"${v.voterName}"`,
      `"${v.nisn}"`,
      `"${v.studentClass}"`,
      `"${v.candidatePutraNumber}"`,
      `"${v.candidatePutraName}"`,
      `"${v.candidatePutriNumber}"`,
      `"${v.candidatePutriName}"`,
      v.syncedToSupabase ? 'Tersinkron Supabase' : 'Lokal'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Pemilih_EBadminton_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Audit & Transparansi Hak Pilih
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daftar Pemilih & Log Suara Masuk
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Setiap nama siswa yang mengisi formulir bilik suara tersimpan secara permanen dan tercantum pada tabel ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {onResetAllVotes && (
            <button
              type="button"
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Kosongkan Seluruh Kotak Suara (0 Suara)?',
                  message: `Apakah Anda yakin ingin menghapus seluruh ${votes.length} suara yang masuk dan mereset hasil pemilu ke 0?`,
                  detailNote: 'Status seluruh siswa di DPT akan dikembalikan menjadi "Belum Memilih". Rekapitulasi suara akan bersih.',
                  confirmLabel: 'Ya, Kosongkan Suara (Reset 0)',
                  variant: 'danger',
                  iconType: 'trash',
                  onConfirm: () => {
                    onResetAllVotes();
                    setConfirmModal(null);
                  },
                });
              }}
              disabled={votes.length === 0}
              className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-900/20 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Suara (0)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={votes.length === 0}
            className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, NISN, atau kode..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Kelas */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Kelas:</span>
          </div>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Semua Kelas ({votes.length})</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Daftar Suara */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-900 text-white text-xs uppercase font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 text-center w-14">No</th>
                <th className="py-4 px-4">Nama Lengkap Pemilih</th>
                <th className="py-4 px-4">NISN</th>
                <th className="py-4 px-4">Kelas</th>
                <th className="py-4 px-4">Pilihan Putra</th>
                <th className="py-4 px-4">Pilihan Putri</th>
                <th className="py-4 px-4">Waktu Vote</th>
                <th className="py-4 px-4 text-center">Status Data</th>
                {onDeleteVote && <th className="py-4 px-4 text-center w-16">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data pemilih yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredVotes.map((vote, index) => (
                  <tr key={vote.voteCode} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* NAMA PEMILIH (Sangat Menonjol) */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-base">
                        {vote.voterName}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Tiket: {vote.voteCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 text-xs">
                      {vote.nisn}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {vote.studentClass}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {vote.candidatePutraNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {vote.candidatePutraName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-teal-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {vote.candidatePutriNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {vote.candidatePutriName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(vote.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })},{' '}
                      {new Date(vote.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {vote.syncedToSupabase ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 stroke-[3]" /> Supabase
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Database className="w-3 h-3" /> Lokal
                        </span>
                      )}
                    </td>

                    {onDeleteVote && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: `Hapus Suara "${vote.voterName}"?`,
                              message: `Batalkan dan hapus suara untuk siswa "${vote.voterName}" (${vote.studentClass} - NISN: ${vote.nisn})?`,
                              detailNote: 'Status siswa di DPT akan dikembalikan menjadi "Belum Memilih" sehingga siswa dapat memilih ulang jika diperlukan.',
                              confirmLabel: 'Ya, Hapus Suara Ini',
                              variant: 'danger',
                              iconType: 'trash',
                              onConfirm: () => {
                                onDeleteVote(vote.voteCode);
                                setConfirmModal(null);
                              },
                            });
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Hapus / Batalkan Suara Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredVotes.length} dari {votes.length} suara sah yang masuk</span>
          <span>Sistem E-Voting Badminton v2.0</span>
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
