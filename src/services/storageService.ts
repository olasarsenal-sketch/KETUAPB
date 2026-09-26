import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  SupabaseConfig, 
  VoteRecord, 
  VoterInfo, 
  Candidate, 
  RegisteredVoter, 
  ElectionSettings, 
  AuthSession 
} from '../types';
import { INITIAL_CANDIDATES } from '../data/initialCandidates';
import { OFFICIAL_REGISTERED_VOTERS } from '../data/studentVoters';

const STORAGE_KEYS = {
  VOTES: 'ebadminton_votes_v2',
  SUPABASE_URL: 'ebadminton_supabase_url',
  SUPABASE_ANON_KEY: 'ebadminton_supabase_anon_key',
  SUPABASE_TABLE: 'ebadminton_supabase_table',
  VOTED_NISN_LIST: 'ebadminton_voted_nisn_list',
  CANDIDATES: 'ebadminton_candidates_v2',
  REGISTERED_VOTERS: 'ebadminton_registered_voters_v2',
  ELECTION_SETTINGS: 'ebadminton_election_settings_v2',
  ADMIN_PASSWORD: 'ebadminton_admin_pwd_v2',
  AUTH_SESSION: 'ebadminton_auth_session_v2',
  LAST_RESET_TIME: 'ebadminton_last_reset_time_v2',
  DELETED_VOTE_CODES: 'ebadminton_deleted_codes_v2',
};

const DEFAULT_TABLE_NAME = 'badminton_vote';

const DEFAULT_ELECTION_SETTINGS: ElectionSettings = {
  isVotingOpen: true,
  title: 'Pemilihan Ketua & Wakil Ketua Ekstrakurikuler Bulutangkis',
  academicYear: '2026/2027',
  schoolName: 'SMA Negeri 1 Bulutangkis',
  schoolLogoUrl: '',
  allowSelfRegistration: true, // Pemilih baru dapat langsung mengisi identitas saat login
  closedMessage: 'Pemungutan suara resmi telah ditutup oleh panitia pemilihan. Terima kasih atas partisipasi Anda.',
};

const INITIAL_REGISTERED_VOTERS: RegisteredVoter[] = OFFICIAL_REGISTERED_VOTERS;



// Initial sample votes so charts and tables look alive and realistic
const SAMPLE_VOTES: VoteRecord[] = [
  {
    id: 'sample-01',
    voteCode: 'VOTE-BDM-8821',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    voterName: 'Aditia Pratama',
    nisn: '0081294812',
    studentClass: 'X MIPA 1',
    candidatePutraId: 'putra-01',
    candidatePutraName: 'Muhammad Fajar Pratama',
    candidatePutraNumber: '01',
    candidatePutriId: 'putri-01',
    candidatePutriName: 'Siti Zahra Aulia',
    candidatePutriNumber: '01',
    syncedToSupabase: true,
  },
  {
    id: 'sample-02',
    voteCode: 'VOTE-BDM-9134',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    voterName: 'Dina Kusuma Wardani',
    nisn: '0073849102',
    studentClass: 'XI IPS 2',
    candidatePutraId: 'putra-02',
    candidatePutraName: 'Kevin Arya Wicaksana',
    candidatePutraNumber: '02',
    candidatePutriId: 'putri-01',
    candidatePutriName: 'Siti Zahra Aulia',
    candidatePutriNumber: '01',
    syncedToSupabase: true,
  },
  {
    id: 'sample-03',
    voteCode: 'VOTE-BDM-7462',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    voterName: 'Bagus Setyawan',
    nisn: '0069382019',
    studentClass: 'XII MIPA 3',
    candidatePutraId: 'putra-01',
    candidatePutraName: 'Muhammad Fajar Pratama',
    candidatePutraNumber: '01',
    candidatePutriId: 'putri-02',
    candidatePutriName: 'Nayla Putri Maharani',
    candidatePutriNumber: '02',
    syncedToSupabase: true,
  },
  {
    id: 'sample-04',
    voteCode: 'VOTE-BDM-6321',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    voterName: 'Rani Maharani Dewi',
    nisn: '0085930291',
    studentClass: 'X IPS 1',
    candidatePutraId: 'putra-03',
    candidatePutraName: 'Rizky Bintang Ramadhan',
    candidatePutraNumber: '03',
    candidatePutriId: 'putri-03',
    candidatePutriName: 'Amanda Cinta Lestari',
    candidatePutriNumber: '03',
    syncedToSupabase: true,
  },
  {
    id: 'sample-05',
    voteCode: 'VOTE-BDM-5109',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    voterName: 'Gilang Ramadhan',
    nisn: '0074928172',
    studentClass: 'XI MIPA 2',
    candidatePutraId: 'putra-02',
    candidatePutraName: 'Kevin Arya Wicaksana',
    candidatePutraNumber: '02',
    candidatePutriId: 'putri-02',
    candidatePutriName: 'Nayla Putri Maharani',
    candidatePutriNumber: '02',
    syncedToSupabase: true,
  }
];

class StorageService {
  private supabase: SupabaseClient | null = null;
  private lastSupabaseError: string | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    tableName: DEFAULT_TABLE_NAME,
    isConnected: false,
  };

  constructor() {
    this.initSupabase();
    this.ensureLocalSeeds();
  }

  public getLastSupabaseError(): string | null {
    return this.lastSupabaseError;
  }

  private getAlternateTableName(tableName: string): string {
    const t = (tableName || DEFAULT_TABLE_NAME).trim();
    if (t === 'badminton_vote') return 'badminton_votes';
    if (t === 'badminton_votes') return 'badminton_vote';
    if (t === 'BADMINTON_VOTE') return 'badminton_vote';
    return t.endsWith('s') ? t.slice(0, -1) : `${t}s`;
  }

  public initSupabase() {
    try {
      // Prioritas 1: LocalStorage yang diinput pengguna di Web UI
      const savedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
      const savedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY) || '';
      const savedTable = localStorage.getItem(STORAGE_KEYS.SUPABASE_TABLE) || DEFAULT_TABLE_NAME;

      // Prioritas 2: Environment variables dari .env Vite
      const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
      const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

      const effectiveUrl = (savedUrl || envUrl || '').trim();
      const effectiveKey = (savedKey || envKey || '').trim();

      this.config = {
        url: effectiveUrl,
        anonKey: effectiveKey,
        tableName: savedTable,
        isConnected: Boolean(effectiveUrl && effectiveKey),
      };

      if (effectiveUrl && effectiveKey) {
        this.supabase = createClient(effectiveUrl, effectiveKey, {
          auth: { persistSession: false },
        });
      } else {
        this.supabase = null;
      }
    } catch (err) {
      console.warn('Gagal inisialisasi Supabase Client:', err);
      this.supabase = null;
      this.config.isConnected = false;
    }
  }

  private ensureLocalSeeds() {
    try {
      // 1. Inisialisasi Daftar Pemilih Tetap (DPT) dengan 127 Siswa Resmi (Kelas X, XI, XII)
      const existingVoters = localStorage.getItem(STORAGE_KEYS.REGISTERED_VOTERS);
      const isOfficialLoaded = localStorage.getItem('ebadminton_dpt_official_127_loaded');

      if (!existingVoters || !isOfficialLoaded) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_VOTERS, JSON.stringify(OFFICIAL_REGISTERED_VOTERS));
        localStorage.setItem('ebadminton_dpt_official_127_loaded', 'true');

        // Kosongkan suara lama bawaan demo agar kotak suara bersih (0 suara)
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify([]));
      }

      // 2. Inisialisasi Kandidat
      const existingCandidates = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      if (!existingCandidates) {
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
      }

      // 3. Inisialisasi Suara jika belum ada
      const existingVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
      if (!existingVotes) {
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify([]));
      }

      // 4. Inisialisasi Pengaturan Pemilu
      const existingSettings = localStorage.getItem(STORAGE_KEYS.ELECTION_SETTINGS);
      if (!existingSettings) {
        localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(DEFAULT_ELECTION_SETTINGS));
      }

      // 5. Inisialisasi Password Admin (Default: admin123)
      const existingAdminPwd = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
      if (!existingAdminPwd) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, 'admin123');
      }
    } catch (e) {
      console.error('Error saat inisialisasi local storage:', e);
    }
  }

  public getSupabaseConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public saveSupabaseConfig(url: string, anonKey: string, tableName = DEFAULT_TABLE_NAME) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, anonKey.trim());
    localStorage.setItem(STORAGE_KEYS.SUPABASE_TABLE, tableName.trim() || DEFAULT_TABLE_NAME);
    this.initSupabase();
  }

  public async testSupabaseConnection(url: string, anonKey: string, tableName: string): Promise<{ success: boolean; message: string; rowCount?: number; detectedTable?: string }> {
    try {
      if (!url.startsWith('https://')) {
        return { success: false, message: 'URL Supabase harus diawali dengan https://' };
      }
      if (!anonKey || anonKey.length < 20) {
        return { success: false, message: 'Anon Key Supabase tidak valid atau terlalu pendek.' };
      }

      const client = createClient(url, anonKey, {
        auth: { persistSession: false },
      });

      const targetTable = (tableName || DEFAULT_TABLE_NAME).trim();

      // Uji query sederhana ke tabel utama
      const { data, error } = await client.from(targetTable).select('*').limit(1);

      if (error) {
        if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
          // Coba otomatis tabel alternatif (misal badminton_vote vs badminton_votes)
          const altTable = this.getAlternateTableName(targetTable);
          const altTest = await client.from(altTable).select('*').limit(1);
          if (!altTest.error) {
            return {
              success: true,
              message: `Tabel "${targetTable}" tidak ditemukan, tetapi tabel "${altTable}" AKTIF di database Supabase Anda! Nama tabel otomatis disesuaikan ke "${altTable}".`,
              rowCount: altTest.data ? altTest.data.length : 0,
              detectedTable: altTable,
            };
          }

          return {
            success: false,
            message: `Tabel "${targetTable}" belum dibuat di Supabase (Error 42P01: relation does not exist). Buka SQL Editor di Supabase dan jalankan script SQL di bawah ini untuk membuat tabel "${targetTable}".`
          };
        }
        if (error.message.includes('JWT') || error.code === 'PGRST301') {
          return { success: false, message: 'Kunci Anon Key tidak valid atau kedaluwarsa.' };
        }
        if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security') || error.message?.toLowerCase().includes('policy')) {
          return {
            success: false,
            message: `Tabel "${targetTable}" ditemukan, namun diblokir oleh Row Level Security (RLS). Pastikan Anda telah membuat Policy SELECT dan INSERT.`
          };
        }
        return {
          success: false,
          message: `Terhubung ke Supabase, namun query tabel gagal: ${error.message}.`
        };
      }

      return {
        success: true,
        message: `Berhasil terhubung ke Supabase! Tabel "${targetTable}" aktif dan siap digunakan.`,
        rowCount: data ? data.length : 0,
        detectedTable: targetTable,
      };
    } catch (err: any) {
      return { success: false, message: `Gagal menghubungkan ke Supabase: ${err.message || 'Network error'}` };
    }
  }

  public getSQLSchema(): string {
    const table = this.config.tableName || DEFAULT_TABLE_NAME;
    return `-- ========================================================
-- SCRIPT TABEL SUPABASE E-VOTING BADMINTON RESMI
-- Salin dan jalankan script ini di menu "SQL Editor" di Supabase Anda
-- ========================================================

-- 1. Buat Tabel Data Suara (Votes)
CREATE TABLE IF NOT EXISTS public.${table} (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    vote_code TEXT UNIQUE NOT NULL,
    voter_name TEXT NOT NULL,
    nisn TEXT NOT NULL,
    student_class TEXT NOT NULL,
    candidate_putra_id TEXT NOT NULL,
    candidate_putra_name TEXT NOT NULL,
    candidate_putra_number TEXT NOT NULL,
    candidate_putri_id TEXT NOT NULL,
    candidate_putri_name TEXT NOT NULL,
    candidate_putri_number TEXT NOT NULL,
    user_agent TEXT
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Izin Membaca (Semua pemilih dapat melihat rekapitulasi)
CREATE POLICY "Izinkan publik membaca data suara" 
ON public.${table} 
FOR SELECT 
USING (true);

-- 4. Kebijakan Izin Menyimpan Suara (Publik/Anonim dapat mengirim vote)
CREATE POLICY "Izinkan publik mengirim suara vote" 
ON public.${table} 
FOR INSERT 
WITH CHECK (true);

-- 5. Kebijakan Izin Menghapus Suara (Untuk reset pemilu atau penghapusan data oleh panitia)
CREATE POLICY "Izinkan panitia menghapus suara vote" 
ON public.${table} 
FOR DELETE 
USING (true);

-- 6. Kebijakan Izin Memperbarui Suara
CREATE POLICY "Izinkan panitia memperbarui suara vote" 
ON public.${table} 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 7. Buat Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_${table}_nisn ON public.${table} (nisn);
CREATE INDEX IF NOT EXISTS idx_${table}_created_at ON public.${table} (created_at DESC);
`;
  }

  // Cek apakah NISN sudah pernah memilih
  public hasVoted(nisn: string): { voted: boolean; record?: VoteRecord } {
    if (!nisn) return { voted: false };
    const votes = this.getLocalVotes();
    const cleanNisn = nisn.trim().toLowerCase();
    const found = votes.find(v => v.nisn.trim().toLowerCase() === cleanNisn);
    if (found) {
      return { voted: true, record: found };
    }
    return { voted: false };
  }

  public getLocalVotes(): VoteRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Mengambil semua suara (Kombinasi Supabase jika aktif, digabung dengan data lokal)
  public async getAllVotes(): Promise<VoteRecord[]> {
    const localVotes = this.getLocalVotes();
    const lastResetTime = localStorage.getItem(STORAGE_KEYS.LAST_RESET_TIME);
    const deletedCodes: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_VOTE_CODES) || '[]');
    const deletedSet = new Set(deletedCodes);

    // Saring data lokal
    const validLocalVotes = localVotes.filter(v => {
      if (deletedSet.has(v.voteCode)) return false;
      if (lastResetTime && new Date(v.createdAt).getTime() <= new Date(lastResetTime).getTime()) return false;
      return true;
    });

    if (this.supabase && this.config.isConnected) {
      try {
        let targetTable = (this.config.tableName || DEFAULT_TABLE_NAME).trim();
        let { data, error } = await this.supabase
          .from(targetTable)
          .select('*')
          .order('created_at', { ascending: false });

        if (error && (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist'))) {
          const altTable = this.getAlternateTableName(targetTable);
          const retry = await this.supabase
            .from(altTable)
            .select('*')
            .order('created_at', { ascending: false });
          if (!retry.error) {
            data = retry.data;
            error = null;
            this.config.tableName = altTable;
            localStorage.setItem(STORAGE_KEYS.SUPABASE_TABLE, altTable);
          }
        }

        if (!error && data && data.length > 0) {
          // Petakan kembali dari format database Supabase snake_case ke CamelCase
          const remoteVotes: VoteRecord[] = data
            .map((item: any) => ({
              id: item.id || item.vote_code,
              voteCode: item.vote_code,
              createdAt: item.created_at,
              voterName: item.voter_name || 'Siswa Pemilih',
              nisn: item.nisn || '-',
              studentClass: item.student_class || '-',
              candidatePutraId: item.candidate_putra_id,
              candidatePutraName: item.candidate_putra_name,
              candidatePutraNumber: item.candidate_putra_number,
              candidatePutriId: item.candidate_putri_id,
              candidatePutriName: item.candidate_putri_name,
              candidatePutriNumber: item.candidate_putri_number,
              syncedToSupabase: true,
              userAgent: item.user_agent,
            }))
            .filter((v: VoteRecord) => {
              if (deletedSet.has(v.voteCode)) return false;
              if (lastResetTime && new Date(v.createdAt).getTime() <= new Date(lastResetTime).getTime()) return false;
              return true;
            });

          // Gabungkan data unik berdasarkan voteCode
          const combinedMap = new Map<string, VoteRecord>();
          remoteVotes.forEach(v => combinedMap.set(v.voteCode, v));
          validLocalVotes.forEach(v => {
            if (!combinedMap.has(v.voteCode)) {
              combinedMap.set(v.voteCode, v);
            }
          });

          const merged = Array.from(combinedMap.values());
          // Update cache lokal
          localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.warn('Gagal fetch dari Supabase, menggunakan data lokal:', e);
      }
    }

    if (validLocalVotes.length !== localVotes.length) {
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(validLocalVotes));
    }
    return validLocalVotes;
  }

  // Simpan suara pemilih dengan jaminan nama dan identitas pemilih masuk
  public async submitVote(
    voter: VoterInfo,
    putra: { id: string; name: string; number: string },
    putri: { id: string; name: string; number: string }
  ): Promise<{ success: boolean; record: VoteRecord; message: string; supabaseSynced: boolean }> {
    // 1. Validasi input nama pemilih dan identitas
    const voterName = (voter.name || '').trim();
    const nisn = (voter.nisn || '').trim();
    const studentClass = (voter.studentClass || '').trim();

    if (!voterName) {
      throw new Error('Nama Lengkap Pemilih wajib diisi!');
    }
    if (!nisn) {
      throw new Error('NISN/NIS wajib diisi!');
    }
    if (!studentClass) {
      throw new Error('Kelas wajib dipilih!');
    }

    // 2. Cek duplikasi hak suara
    const check = this.hasVoted(nisn);
    if (check.voted) {
      throw new Error(`NISN ${nisn} atas nama ${check.record?.voterName} sudah menggunakan hak suaranya pada ${new Date(check.record?.createdAt || '').toLocaleString('id-ID')}. Satu pemilih hanya dapat memilih satu kali.`);
    }

    // 3. Generate Kode Suara Unik dan ID
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const voteCode = `BDM-${Date.now().toString().slice(-4)}-${randomDigits}`;
    const newRecord: VoteRecord = {
      id: `vote-${Date.now()}-${randomDigits}`,
      voteCode,
      createdAt: new Date().toISOString(),
      voterName,
      nisn,
      studentClass,
      candidatePutraId: putra.id,
      candidatePutraName: putra.name,
      candidatePutraNumber: putra.number,
      candidatePutriId: putri.id,
      candidatePutriName: putri.name,
      candidatePutriNumber: putri.number,
      syncedToSupabase: false,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // 4. SELALU simpan ke Local Storage terlebih dahulu (JAMINAN DATA NAMA PEMILIH TIDAK AKAN HILANG)
    const localVotes = this.getLocalVotes();
    localVotes.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(localVotes));

    // Catat NISN ke daftar yang sudah vote
    try {
      const nisnList = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTED_NISN_LIST) || '[]');
      if (!nisnList.includes(nisn)) {
        nisnList.push(nisn);
        localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify(nisnList));
      }

      // Perbarui juga status pada Daftar Pemilih Tetap (DPT)
      const voters = this.getRegisteredVoters();
      let matched = false;
      const updatedVoters = voters.map(v => {
        if (v.nisn.trim().toLowerCase() === nisn.toLowerCase()) {
          matched = true;
          return { ...v, hasVoted: true, voteCode: newRecord.voteCode, votedAt: newRecord.createdAt };
        }
        return v;
      });
      if (!matched) {
        updatedVoters.push({
          id: `voter-${Date.now()}`,
          nisn,
          name: voterName,
          studentClass,
          gender: voter.gender,
          hasVoted: true,
          voteCode: newRecord.voteCode,
          votedAt: newRecord.createdAt
        });
      }
      this.saveRegisteredVoters(updatedVoters);
    } catch {}

    // 5. Coba simpan langsung ke Supabase jika terkonfigurasi
    let supabaseSynced = false;
    let syncMessage = 'Tersimpan aman di penyimpanan lokal sistem.';

    if (this.supabase && this.config.isConnected) {
      try {
        const payload = {
          vote_code: newRecord.voteCode,
          voter_name: newRecord.voterName,
          nisn: newRecord.nisn,
          student_class: newRecord.studentClass,
          candidate_putra_id: newRecord.candidatePutraId,
          candidate_putra_name: newRecord.candidatePutraName,
          candidate_putra_number: newRecord.candidatePutraNumber,
          candidate_putri_id: newRecord.candidatePutriId,
          candidate_putri_name: newRecord.candidatePutriName,
          candidate_putri_number: newRecord.candidatePutriNumber,
          user_agent: newRecord.userAgent,
          created_at: newRecord.createdAt,
        };

        let targetTable = (this.config.tableName || DEFAULT_TABLE_NAME).trim();
        let { error } = await this.supabase
          .from(targetTable)
          .insert([payload]);

        // Auto fallback jika nama tabel berbeda (misal badminton_vote vs badminton_votes)
        if (error && (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist'))) {
          const altTable = this.getAlternateTableName(targetTable);
          const retry = await this.supabase
            .from(altTable)
            .insert([payload]);
          if (!retry.error) {
            error = null;
            this.config.tableName = altTable;
            targetTable = altTable;
            localStorage.setItem(STORAGE_KEYS.SUPABASE_TABLE, altTable);
          } else {
            error = retry.error;
          }
        }

        if (error) {
          this.lastSupabaseError = `Gagal simpan ke tabel "${targetTable}": ${error.message} (${error.code || 'ERR'})`;
          console.warn('Supabase insert warning:', error);
          syncMessage = `Disimpan lokal (Supabase notice: ${error.message})`;
        } else {
          this.lastSupabaseError = null;
          supabaseSynced = true;
          newRecord.syncedToSupabase = true;
          syncMessage = `Berhasil tersimpan dan tersinkronisasi langsung ke tabel "${targetTable}" Supabase!`;

          // Update flag sync di local storage
          const updated = this.getLocalVotes().map(v => 
            v.voteCode === newRecord.voteCode ? { ...v, syncedToSupabase: true } : v
          );
          localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(updated));
        }
      } catch (err: any) {
        this.lastSupabaseError = `Eksepsi Supabase: ${err.message || 'Network error'}`;
        console.warn('Gagal sync realtime ke Supabase:', err);
        syncMessage = 'Disimpan di database lokal. Anda dapat mensinkronkan ke Supabase kapan saja via Pengaturan.';
      }
    } else {
      this.lastSupabaseError = 'Supabase belum dikonfigurasi (URL dan Anon Key belum dimasukkan).';
    }

    return {
      success: true,
      record: newRecord,
      message: syncMessage,
      supabaseSynced,
    };
  }

  // Sinkronkan semua data lokal yang belum masuk ke Supabase
  public async syncAllLocalToSupabase(): Promise<{ syncedCount: number; errors: string[] }> {
    if (!this.supabase || !this.config.isConnected) {
      throw new Error('Supabase belum terhubung. Konfigurasikan URL dan Anon Key terlebih dahulu.');
    }

    const localVotes = this.getLocalVotes();
    const unsynced = localVotes.filter(v => !v.syncedToSupabase);
    let syncedCount = 0;
    const errors: string[] = [];
    let targetTable = (this.config.tableName || DEFAULT_TABLE_NAME).trim();

    for (const item of unsynced) {
      try {
        const payload = {
          vote_code: item.voteCode,
          voter_name: item.voterName,
          nisn: item.nisn,
          student_class: item.studentClass,
          candidate_putra_id: item.candidatePutraId,
          candidate_putra_name: item.candidatePutraName,
          candidate_putra_number: item.candidatePutraNumber,
          candidate_putri_id: item.candidatePutriId,
          candidate_putri_name: item.candidatePutriName,
          candidate_putri_number: item.candidatePutriNumber,
          created_at: item.createdAt,
        };

        let { error } = await this.supabase
          .from(targetTable)
          .upsert([payload], { onConflict: 'vote_code' });

        if (error && (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist'))) {
          const altTable = this.getAlternateTableName(targetTable);
          const retry = await this.supabase
            .from(altTable)
            .upsert([payload], { onConflict: 'vote_code' });
          if (!retry.error) {
            error = null;
            this.config.tableName = altTable;
            targetTable = altTable;
            localStorage.setItem(STORAGE_KEYS.SUPABASE_TABLE, altTable);
          } else {
            error = retry.error;
          }
        }

        if (error) {
          errors.push(`Vote ${item.voteCode} (${item.voterName}): ${error.message}`);
        } else {
          item.syncedToSupabase = true;
          syncedCount++;
        }
      } catch (err: any) {
        errors.push(`Vote ${item.voteCode}: ${err.message}`);
      }
    }

    // Perbarui local storage
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(localVotes));
    return { syncedCount, errors };
  }

  // ==========================================
  // MANAJEMEN KANDIDAT (CRUD KANDIDAT PUTRA & PUTRI)
  // ==========================================
  public getCandidates(): Candidate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      return data ? JSON.parse(data) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  }

  public saveCandidates(candidates: Candidate[]): void {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }

  public addCandidate(candidate: Candidate): void {
    const list = this.getCandidates();
    list.push(candidate);
    this.saveCandidates(list);
  }

  public updateCandidate(updated: Candidate): void {
    const list = this.getCandidates().map(c => c.id === updated.id ? updated : c);
    this.saveCandidates(list);
  }

  public deleteCandidate(id: string): void {
    const list = this.getCandidates().filter(c => c.id !== id);
    this.saveCandidates(list);
  }

  public resetCandidates(): void {
    this.saveCandidates(INITIAL_CANDIDATES);
  }

  // ==========================================
  // MANAJEMEN DAFTAR PEMILIH TETAP (DPT / USER)
  // ==========================================
  public getRegisteredVoters(): RegisteredVoter[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_VOTERS);
      return data ? JSON.parse(data) : INITIAL_REGISTERED_VOTERS;
    } catch {
      return INITIAL_REGISTERED_VOTERS;
    }
  }

  public saveRegisteredVoters(voters: RegisteredVoter[]): void {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_VOTERS, JSON.stringify(voters));
  }

  public addRegisteredVoter(voterData: Omit<RegisteredVoter, 'id' | 'hasVoted'>): RegisteredVoter {
    const list = this.getRegisteredVoters();
    const cleanNisn = voterData.nisn.trim();
    if (list.some(v => v.nisn.toLowerCase() === cleanNisn.toLowerCase())) {
      throw new Error(`Siswa dengan NISN ${cleanNisn} sudah ada di daftar DPT.`);
    }

    const newVoter: RegisteredVoter = {
      ...voterData,
      id: `voter-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nisn: cleanNisn,
      hasVoted: false,
    };
    list.push(newVoter);
    this.saveRegisteredVoters(list);
    return newVoter;
  }

  public updateRegisteredVoter(voter: RegisteredVoter): void {
    const list = this.getRegisteredVoters().map(v => v.id === voter.id ? voter : v);
    this.saveRegisteredVoters(list);
  }

  public async deleteRegisteredVoter(id: string): Promise<void> {
    const voter = this.getRegisteredVoters().find(v => v.id === id);
    const list = this.getRegisteredVoters().filter(v => v.id !== id);
    this.saveRegisteredVoters(list);

    if (voter) {
      const voterNisn = voter.nisn.trim().toLowerCase();
      // 1. Hapus NISN dari daftar yang sudah vote
      try {
        const nisnList: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTED_NISN_LIST) || '[]');
        const filteredNisn = nisnList.filter(n => n.trim().toLowerCase() !== voterNisn);
        localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify(filteredNisn));
      } catch {}

      // 2. Tandai kode suara siswa ini agar tidak ditarik kembali dari Supabase
      const allLocal = this.getLocalVotes();
      const votesOfThisStudent = allLocal.filter(v => v.nisn.trim().toLowerCase() === voterNisn);
      if (votesOfThisStudent.length > 0) {
        try {
          const deletedCodes: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_VOTE_CODES) || '[]');
          votesOfThisStudent.forEach(v => {
            if (!deletedCodes.includes(v.voteCode)) deletedCodes.push(v.voteCode);
          });
          localStorage.setItem(STORAGE_KEYS.DELETED_VOTE_CODES, JSON.stringify(deletedCodes));
        } catch {}
      }

      // 3. Hapus juga rekaman suara jika siswa ini sudah memilih
      const remainingVotes = allLocal.filter(v => v.nisn.trim().toLowerCase() !== voterNisn);
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(remainingVotes));

      // 4. Hapus juga dari Supabase jika terhubung
      if (this.supabase && this.config.isConnected) {
        try {
          await this.supabase.from(this.config.tableName).delete().eq('nisn', voter.nisn);
        } catch (e) {
          console.warn('Gagal hapus vote dari Supabase:', e);
        }
      }
    }
  }

  public deleteAllRegisteredVoters(): void {
    this.saveRegisteredVoters([]);
  }

  public resetRegisteredVotersToDefault(): void {
    this.saveRegisteredVoters(INITIAL_REGISTERED_VOTERS);
  }

  // Reset status vote siswa (misal jika ada kesalahan sistem / izin ulang vote)
  public async resetVoterVoteStatus(nisn: string): Promise<void> {
    const cleanNisn = nisn.trim().toLowerCase();
    // 1. Reset di DPT
    const list = this.getRegisteredVoters().map(v => {
      if (v.nisn.trim().toLowerCase() === cleanNisn) {
        return { ...v, hasVoted: false, voteCode: undefined, votedAt: undefined };
      }
      return v;
    });
    this.saveRegisteredVoters(list);

    // 2. Hapus dari daftar NISN yang sudah vote
    try {
      const nisnList: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTED_NISN_LIST) || '[]');
      const filtered = nisnList.filter(n => n.trim().toLowerCase() !== cleanNisn);
      localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify(filtered));
    } catch {}

    // 3. Tandai kode suara siswa ini agar tidak ditarik kembali dari Supabase
    const allLocal = this.getLocalVotes();
    const votesOfThisStudent = allLocal.filter(v => v.nisn.trim().toLowerCase() === cleanNisn);
    if (votesOfThisStudent.length > 0) {
      try {
        const deletedCodes: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_VOTE_CODES) || '[]');
        votesOfThisStudent.forEach(v => {
          if (!deletedCodes.includes(v.voteCode)) deletedCodes.push(v.voteCode);
        });
        localStorage.setItem(STORAGE_KEYS.DELETED_VOTE_CODES, JSON.stringify(deletedCodes));
      } catch {}
    }

    // 4. Hapus suara dari daftar votes jika ada
    const remainingVotes = allLocal.filter(v => v.nisn.trim().toLowerCase() !== cleanNisn);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(remainingVotes));

    // 5. Hapus dari Supabase jika terhubung
    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase.from(this.config.tableName).delete().eq('nisn', nisn);
      } catch (e) {
        console.warn('Gagal hapus vote siswa dari Supabase:', e);
      }
    }
  }

  public findVoterByNisn(nisn: string): RegisteredVoter | undefined {
    const list = this.getRegisteredVoters();
    return list.find(v => v.nisn.trim().toLowerCase() === nisn.trim().toLowerCase());
  }

  // Login Siswa / Pemilih
  public loginVoter(
    nisn: string, 
    name?: string, 
    studentClass?: string, 
    gender?: 'L' | 'P'
  ): { success: boolean; voter?: RegisteredVoter; message: string; isNew?: boolean } {
    const cleanNisn = nisn.trim();
    if (!cleanNisn) {
      return { success: false, message: 'NISN tidak boleh kosong.' };
    }

    const settings = this.getElectionSettings();
    let existing = this.findVoterByNisn(cleanNisn);

    if (existing) {
      // Periksa apakah NISN sudah pernah vote berdasarkan daftar votes
      const voteCheck = this.hasVoted(cleanNisn);
      if (voteCheck.voted) {
        existing.hasVoted = true;
        existing.voteCode = voteCheck.record?.voteCode;
        existing.votedAt = voteCheck.record?.createdAt;
      }
      return {
        success: true,
        voter: existing,
        message: existing.hasVoted 
          ? 'Anda telah menggunakan hak suara sebelumnya.'
          : 'Berhasil login ke bilik suara.',
      };
    }

    // Jika siswa belum terdaftar di DPT, periksa apakah self-registration diizinkan
    if (settings.allowSelfRegistration) {
      if (!name || !studentClass) {
        return {
          success: false,
          message: 'NISN belum terdaftar. Silakan lengkapi Nama Lengkap & Kelas untuk registrasi mandiri.',
        };
      }

      const newVoter = this.addRegisteredVoter({
        nisn: cleanNisn,
        name: name.trim(),
        studentClass: studentClass.trim(),
        gender: gender || 'L',
      });

      return {
        success: true,
        voter: newVoter,
        isNew: true,
        message: 'Registrasi pemilih baru berhasil! Silakan gunakan hak suara Anda.',
      };
    }

    return {
      success: false,
      message: 'NISN Anda tidak terdaftar di DPT Pemilihan Bulutangkis. Silakan hubungi Panitia.',
    };
  }

  // ==========================================
  // PENGATURAN PEMILIHAN (ELECTION SETTINGS)
  // ==========================================
  public getElectionSettings(): ElectionSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ELECTION_SETTINGS);
      return data ? { ...DEFAULT_ELECTION_SETTINGS, ...JSON.parse(data) } : DEFAULT_ELECTION_SETTINGS;
    } catch {
      return DEFAULT_ELECTION_SETTINGS;
    }
  }

  public saveElectionSettings(settings: ElectionSettings): void {
    localStorage.setItem(STORAGE_KEYS.ELECTION_SETTINGS, JSON.stringify(settings));
  }

  // ==========================================
  // AUTENTIKASI ADMIN
  // ==========================================
  public verifyAdmin(username: string, password: string): boolean {
    const savedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'admin123';
    return (username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'panitia') && 
           password === savedPassword;
  }

  public changeAdminPassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 5) {
      throw new Error('Kata sandi admin minimal 5 karakter.');
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
  }

  // ==========================================
  // SESI PENGGUNA (AUTH SESSION)
  // ==========================================
  public getAuthSession(): AuthSession {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (data) return JSON.parse(data);
    } catch {}
    return { role: 'guest' };
  }

  public setAuthSession(session: AuthSession): void {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  }

  public clearAuthSession(): void {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  // Hapus satu suara berdasarkan kode suara
  public async deleteVoteByCode(voteCode: string): Promise<void> {
    const allVotes = this.getLocalVotes();
    const target = allVotes.find(v => v.voteCode === voteCode);
    if (!target) return;

    // 1. Simpan di DELETED_VOTE_CODES
    try {
      const deletedCodes: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_VOTE_CODES) || '[]');
      if (!deletedCodes.includes(voteCode)) deletedCodes.push(voteCode);
      localStorage.setItem(STORAGE_KEYS.DELETED_VOTE_CODES, JSON.stringify(deletedCodes));
    } catch {}

    // 2. Hapus dari list votes lokal
    const remaining = allVotes.filter(v => v.voteCode !== voteCode);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(remaining));

    // 3. Reset status pemilih di DPT
    const voterNisn = target.nisn.trim().toLowerCase();
    const updatedVoters = this.getRegisteredVoters().map(v => {
      if (v.nisn.trim().toLowerCase() === voterNisn) {
        return { ...v, hasVoted: false, voteCode: undefined, votedAt: undefined };
      }
      return v;
    });
    this.saveRegisteredVoters(updatedVoters);

    // 4. Hapus NISN dari VOTED_NISN_LIST
    try {
      const nisnList: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTED_NISN_LIST) || '[]');
      const filtered = nisnList.filter(n => n.trim().toLowerCase() !== voterNisn);
      localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify(filtered));
    } catch {}

    // 5. Hapus dari Supabase jika terhubung
    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase.from(this.config.tableName).delete().eq('vote_code', voteCode);
      } catch (e) {
        console.warn('Gagal hapus vote spesifik dari Supabase:', e);
      }
    }
  }

  // Reset semua suara pemilu ke 0 (mengosongkan kotak suara pemilu)
  public async resetAllVotes(): Promise<{ success: boolean; message: string }> {
    const nowIso = new Date().toISOString();
    // 1. Simpan tanda waktu reset agar data Supabase lama tidak ditarik kembali
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_TIME, nowIso);
    localStorage.removeItem(STORAGE_KEYS.DELETED_VOTE_CODES);

    // 2. Kosongkan votes dan voted list di local storage
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify([]));

    // 3. Reset status hasVoted pada semua DPT agar semua siswa dapat memilih lagi
    const resetVoters = this.getRegisteredVoters().map(v => ({
      ...v,
      hasVoted: false,
      voteCode: undefined,
      votedAt: undefined,
    }));
    this.saveRegisteredVoters(resetVoters);

    // 4. Jika Supabase terhubung, kosongkan tabel votes di Supabase
    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase
          .from(this.config.tableName)
          .delete()
          .gte('created_at', '1970-01-01T00:00:00Z');
      } catch (e) {
        console.warn('Gagal mengosongkan tabel suara di Supabase:', e);
      }
    }

    return { success: true, message: 'Kotak suara berhasil direset total (0 suara).' };
  }

  public async resetLocalData(): Promise<void> {
    await this.resetAllVotes();
  }

  // Isi kembali suara simulasi / sampel jika panitia ingin demo / uji coba
  public seedSampleVotes(): void {
    localStorage.removeItem(STORAGE_KEYS.LAST_RESET_TIME);
    localStorage.removeItem(STORAGE_KEYS.DELETED_VOTE_CODES);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(SAMPLE_VOTES));
    const nisnList = SAMPLE_VOTES.map(v => v.nisn);
    localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify(nisnList));
    const updatedVoters = this.getRegisteredVoters().map(v => {
      const match = SAMPLE_VOTES.find(s => s.nisn.toLowerCase() === v.nisn.toLowerCase());
      if (match) {
        return { ...v, hasVoted: true, voteCode: match.voteCode, votedAt: match.createdAt };
      }
      return v;
    });
    this.saveRegisteredVoters(updatedVoters);
  }
}

export const storageService = new StorageService();
