import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Server,
  CloudUpload,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { SupabaseConfig } from '../types';
import { storageService } from '../services/storageService';
import { ConfirmModal } from './Common/ConfirmModal';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (url: string, anonKey: string, tableName: string) => void;
  onSyncComplete: () => void;
  unsyncedCount: number;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncComplete,
  unsyncedCount,
}) => {
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [tableName, setTableName] = useState(config.tableName || 'badminton_vote');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // In-App Confirm State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await storageService.testSupabaseConnection(url, anonKey, tableName);
      setTestResult(res);
      if (res.detectedTable && res.detectedTable !== tableName) {
        setTableName(res.detectedTable);
        onSaveConfig(url, anonKey, res.detectedTable);
      } else if (res.success) {
        onSaveConfig(url, anonKey, tableName);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Koneksi gagal ke Supabase.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(url, anonKey, tableName);
    setTestResult({
      success: true,
      message: 'Pengaturan Supabase berhasil disimpan di peramban ini!',
    });
  };

  const handleCopySQL = () => {
    const sql = storageService.getSQLSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await storageService.syncAllLocalToSupabase();
      if (res.errors.length > 0) {
        setSyncFeedback(`Tersinkron ${res.syncedCount} suara. Ada kendala: ${res.errors[0]}`);
      } else {
        setSyncFeedback(`Berhasil mensinkronkan ${res.syncedCount} suara ke tabel Supabase!`);
      }
      onSyncComplete();
    } catch (err: any) {
      setSyncFeedback(`Gagal sinkron: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Kotak Suara ke 0?',
      message: 'Yakin ingin mereset seluruh data suara masuk ke 0? Gunakan ini untuk membersihkan suara percobaan sebelum pemilu resmi dimulai.',
      onConfirm: async () => {
        await storageService.resetAllVotes();
        onSyncComplete();
        setSyncFeedback('Data suara berhasil direset total!');
        setConfirmModal(null);
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Penyimpanan Data & Cloud Database
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Konfigurasi Supabase
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            config.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <Server className={`w-5 h-5 shrink-0 mt-0.5 ${config.isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <h4 className="text-sm font-black">
                {config.isConnected ? 'Supabase Telah Terkonfigurasi' : 'Supabase Belum Dikonfigurasi'}
              </h4>
              <p className="text-xs mt-0.5 leading-relaxed">
                {config.isConnected
                  ? 'Setiap nama siswa yang memilih langsung dikirim ke tabel Supabase secara otomatis dan dicadangkan di penyimpanan lokal.'
                  : 'Sistem tetap aman berjalan menggunakan penyimpanan lokal (offline-first). Masukkan URL dan Anon Key Supabase Anda di bawah untuk mengaktifkan cloud database.'}
              </p>
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Supabase Project URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefghijklmnop.supabase.co"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Supabase Anon / Public Key <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                rows={2}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Nama Tabel Supabase
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="badminton_votes"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Test result alert */}
            {testResult && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>{testResult.message}</div>
              </div>
            )}

            {/* Tombol Uji & Simpan */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Menguji...' : 'Uji Koneksi Supabase'}</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-700/20"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Simpan Konfigurasi</span>
              </button>
            </div>
          </form>

          {/* Sync Button if any unsynced votes */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Sinkronisasi Suara Lokal ke Cloud
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terdapat <strong>{unsyncedCount}</strong> suara di penyimpanan lokal peramban ini.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={syncing || !config.isConnected}
                className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {syncFeedback && (
              <div className="text-xs font-semibold text-teal-800 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                {syncFeedback}
              </div>
            )}
          </div>

          {/* SQL Schema Generator Box */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Script SQL Tabel Supabase (RLS Ready)
                </h4>
              </div>

              <button
                type="button"
                onClick={handleCopySQL}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Script SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Jalankan script ini di menu <strong>SQL Editor</strong> di dashboard Supabase Anda. Script ini sudah dilengkapi izin pembacaan dan pengiriman suara publik (Row Level Security).
            </p>

            <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36">
              {storageService.getSQLSchema()}
            </pre>
          </div>

          {/* Reset Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan & Reset Data Uji Coba</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>

    {/* In-App Confirm Modal */}
    {confirmModal && (
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Ya, Reset Sekarang"
        variant="danger"
        iconType="trash"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    )}
  </>
);
};
