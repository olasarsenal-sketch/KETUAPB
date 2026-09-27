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
import { VOTERS_127_SQL_SCHEMA } from '../data/votersSQL';

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
  title: 'Pemilihan Ketua & Wakil Ketua Badminton Club',
  academicYear: '2026/2027',
  schoolName: 'SMAN 1 CIKAMPEK',
  schoolLogoUrl: './logo-sman1cikampek.svg',
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

      let candidatesInfo = '';
      let votersInfo = '';

      try {
        const cTest = await client.from('candidates').select('id', { count: 'exact', head: true });
        if (!cTest.error) {
          candidatesInfo = ` • Tabel "candidates" Aktif (${cTest.count ?? 0} kandidat)`;
        }
      } catch {}

      try {
        const vTest = await client.from('voters').select('id', { count: 'exact', head: true });
        if (!vTest.error) {
          votersInfo = ` • Tabel "voters" Aktif (${vTest.count ?? 0} siswa DPT)`;
        }
      } catch {}

      return {
        success: true,
        message: `Berhasil terhubung ke Supabase! Tabel "${targetTable}" aktif.${candidatesInfo}${votersInfo}`,
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
-- SCRIPT TABEL SUPABASE E-VOTING BADMINTON RESMI (SMAN 1 CIKAMPEK)
-- Salin dan jalankan seluruh script ini di menu "SQL Editor" Supabase
-- ========================================================

-- BAGIAN 1: TABEL DATA SUARA HASIL PEMILIHAN (VOTES)
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

ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca data suara" ON public.${table};
CREATE POLICY "Izinkan publik membaca data suara" ON public.${table} FOR SELECT USING (true);

DROP POLICY IF EXISTS "Izinkan publik mengirim suara vote" ON public.${table};
CREATE POLICY "Izinkan publik mengirim suara vote" ON public.${table} FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Izinkan panitia menghapus suara vote" ON public.${table};
CREATE POLICY "Izinkan panitia menghapus suara vote" ON public.${table} FOR DELETE USING (true);

DROP POLICY IF EXISTS "Izinkan panitia memperbarui suara vote" ON public.${table};
CREATE POLICY "Izinkan panitia memperbarui suara vote" ON public.${table} FOR UPDATE USING (true) WITH CHECK (true);

-- Proteksi 1 Siswa = 1 Kali Pakai di Level Database
CREATE UNIQUE INDEX IF NOT EXISTS idx_${table}_nisn_unique ON public.${table} (nisn);
CREATE INDEX IF NOT EXISTS idx_${table}_nisn ON public.${table} (nisn);
CREATE INDEX IF NOT EXISTS idx_${table}_created_at ON public.${table} (created_at DESC);


-- BAGIAN 2: TABEL DATA KANDIDAT KETUA & WAKIL (CANDIDATES - REAL-TIME)
CREATE TABLE IF NOT EXISTS public.candidates (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('putra', 'putri')),
    number TEXT NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    class_grade TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    motto TEXT DEFAULT '',
    racket_specialty TEXT DEFAULT '',
    vision TEXT DEFAULT '',
    missions JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca data kandidat" ON public.candidates;
CREATE POLICY "Izinkan publik membaca data kandidat" ON public.candidates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Izinkan admin menambah data kandidat" ON public.candidates;
CREATE POLICY "Izinkan admin menambah data kandidat" ON public.candidates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Izinkan admin memperbarui data kandidat" ON public.candidates;
CREATE POLICY "Izinkan admin memperbarui data kandidat" ON public.candidates FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Izinkan admin menghapus data kandidat" ON public.candidates;
CREATE POLICY "Izinkan admin menghapus data kandidat" ON public.candidates FOR DELETE USING (true);

-- Aktifkan Real-Time Sinkronisasi Supabase untuk Tabel Kandidat
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;

-- Data Awal Resmi Kandidat (Opsional / Seed Data)
INSERT INTO public.candidates (id, category, number, name, nickname, class_grade, photo_url, motto, racket_specialty, vision, missions, achievements)
VALUES
('putra-01', 'putra', '01', 'Fajar Nur Hidayat', 'Fajar', 'XI MIPA 1', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'Disiplin adalah Kunci Juara Sejati', 'Tunggal Putra / Power Smash & Net Play', 'Menjadikan Ekstrakurikuler Bulutangkis SMAN 1 Cikampek sebagai wadah pengembangan atlet berprestasi, berintegritas, dan menjunjung tinggi sportivitas di tingkat Kabupaten maupun Provinsi.', '["Mengadakan jadwal latihan intensif terprogram 3 kali seminggu bersama pelatih berlisensi","Menjalin sparing partner rutin antarsekolah tiap 2 bulan untuk mengasah mental bertanding","Membentuk tim khusus regenerasi dari kelas X untuk persiapan turnamen O2SN"]'::jsonb, '["Juara 1 Tunggal Putra O2SN Tingkat Kabupaten 2025","Medali Emas Kejurkab Bulutangkis Pelajar 2024"]'::jsonb),
('putra-02', 'putra', '02', 'Kevin Arya Wicaksana', 'Kevin', 'XI IPS 2', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'Kompak di Lapangan, Juara di Podium', 'Ganda Putra / Playmaker & Drive Cepat', 'Membangun klub bulutangkis yang solid, inklusif bagi pemula maupun atlet, serta konsisten meraih podium di kejuaraan antarsekolah.', '["Memfasilitasi program pembinaan berjenjang dari pemula (basic skills) hingga kelas tanding (atlet)","Menyelenggarakan turnamen internal Smansa Badminton Cup setiap semester","Memperbaiki manajemen inventaris dan perawatan perlengkapan raket dan shuttlecock"]'::jsonb, '["Juara 2 Ganda Putra Kejuaraan Antar Pelajar 2025","Semifinalis Sirkuit Remaja Regional 2024"]'::jsonb),
('putra-03', 'putra', '03', 'Rizky Bintang Ramadhan', 'Bintang', 'XI MIPA 3', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'Pantang Pulang Sebelum Kok Menyentuh Lantai', 'Tunggal & Ganda / Rally Ketahanan Fisik', 'Mencetak atlet bulutangkis yang tangguh secara mental, memiliki stamina prima, dan mampu bersaing di tingkat nasional.', '["Fokus pada pelatihan fisik atletik modern, kelincahan footwork, dan pemulihan stamina","Mengadakan sesi bedah taktik pertandingan menggunakan rekaman video analisis","Menyediakan beasiswa peralatan (raket & senar) untuk atlet berprestasi kurang mampu"]'::jsonb, '["Juara 1 Kejuaraan Bulutangkis Kapolres Cup 2025","Peringkat 8 Besar Popda Jawa Barat 2024"]'::jsonb),
('putri-01', 'putri', '01', 'Siti Nurhaliza Putri', 'Liza', 'XI MIPA 2', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'Sportif, Berprestasi, dan Berkarakter', 'Tunggal Putri / Deception & Dropshot Akurat', 'Mewujudkan tim bulutangkis putri yang disegani dengan kombinasi kecerdasan taktik, kedisiplinan, dan kekeluargaan yang erat.', '["Meningkatkan porsi latihan teknik penempatan bola dan kelenturan tubuh untuk atlet putri","Menyelenggarakan workshop mental bertanding dan nutrisi atlet bersama alumni berprestasi","Mengadakan bakti sosial dan coaching clinic bulutangkis untuk siswa SMP sekitar"]'::jsonb, '["Juara 1 Tunggal Putri O2SN Kabupaten 2025","Best Player Turnamen Pelajar Se-Jabar 2024"]'::jsonb),
('putri-02', 'putri', '02', 'Nayla Putri Maharani', 'Nayla', 'XI IPS 1', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'Bersama Mengukir Prestasi Emas', 'Ganda Putri & Campuran / Intercept Cepat', 'Menjadikan bulutangkis putri sebagai cabang ekstrakurikuler unggulan utama sekolah dengan tata kelola profesional dan transparan.', '["Menyusun sistem evaluasi kemajuan latihan berbasis data statistik setiap bulan","Memperbanyak uji tanding persahabatan ke klub-klub bulutangkis ternama","Mempererat kekeluargaan anggota melalui kegiatan gathering tahunan"]'::jsonb, '["Juara 2 Ganda Putri Kejurkab 2025","Juara 3 Ganda Campuran Kejurda 2024"]'::jsonb),
('putri-03', 'putri', '03', 'Amanda Cinta Lestari', 'Amanda', 'XI MIPA 4', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 'Tekad Kuat Menembus Batas Prestasi', 'Tunggal Putri / Agresif Smash & Serangan Cepat', 'Membangun generasi pebulutangkis putri yang percaya diri, memiliki mental juara di setiap turnamen, dan seimbang dengan prestasi akademik.', '["Pendampingan akademik bagi anggota ekskul agar nilai pelajaran tetap unggul saat persiapan lomba","Latihan khusus kekuatan pergelangan tangan dan variasi servis mematikan","Mengikutsertakan seluruh anggota dalam turnamen terbuka tingkat karesidenan"]'::jsonb, '["Juara 1 Kejuaraan Pelajar Provinsi 2025","Juara 2 Tunggal Putri Djarum Sirnas 2024"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  number = EXCLUDED.number,
  name = EXCLUDED.name,
  nickname = EXCLUDED.nickname,
  class_grade = EXCLUDED.class_grade,
  photo_url = EXCLUDED.photo_url,
  motto = EXCLUDED.motto,
  racket_specialty = EXCLUDED.racket_specialty,
  vision = EXCLUDED.vision,
  missions = EXCLUDED.missions,
  achievements = EXCLUDED.achievements;
\n\n` + VOTERS_127_SQL_SCHEMA;
  }

  // Script SQL Khusus untuk 127 Siswa DPT Supabase (1 Siswa = 1 Kali Pakai)
  public getVotersSQLSchema(): string {
    return VOTERS_127_SQL_SCHEMA;
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

    // Cek duplikasi hak suara secara real-time di Supabase (Jaminan 1 Siswa = 1 Kali Pakai)
    if (this.supabase && this.config.isConnected) {
      try {
        const { data: remoteVCheck } = await this.supabase
          .from('voters')
          .select('has_voted, name, vote_code')
          .ilike('nisn', nisn)
          .limit(1);

        if (remoteVCheck && remoteVCheck.length > 0 && remoteVCheck[0].has_voted) {
          throw new Error(`NISN ${nisn} atas nama ${remoteVCheck[0].name} sudah menggunakan hak suaranya sebelumnya (Kode: ${remoteVCheck[0].vote_code || '-'}). Setiap siswa hanya dapat memilih 1 kali.`);
        }
      } catch (err: any) {
        if (err.message?.includes('sudah menggunakan hak suara')) throw err;
      }
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

          // Kunci status hak suara di tabel voters Supabase (1 Siswa = 1 Kali Pakai)
          try {
            await this.supabase
              .from('voters')
              .update({
                has_voted: true,
                vote_code: newRecord.voteCode,
                voted_at: newRecord.createdAt,
              })
              .ilike('nisn', newRecord.nisn);
          } catch (vErr) {
            console.warn('Gagal update status voter di Supabase:', vErr);
          }
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
  // MANAJEMEN KANDIDAT (CRUD KANDIDAT PUTRA & PUTRI + SUPABASE REAL-TIME)
  // ==========================================

  // Konversi dari model Candidate ke baris Supabase (snake_case)
  private candidateToRow(c: Candidate): any {
    return {
      id: c.id,
      category: c.category,
      number: c.number,
      name: c.name,
      nickname: c.nickname || c.name.split(' ')[0] || '',
      class_grade: c.classGrade || '',
      photo_url: c.photoUrl || '',
      motto: c.motto || '',
      racket_specialty: c.racketSpecialty || '',
      vision: c.vision || '',
      missions: Array.isArray(c.missions) ? c.missions : [],
      achievements: Array.isArray(c.achievements) ? c.achievements : [],
    };
  }

  // Konversi dari baris Supabase ke model Candidate
  private rowToCandidate(row: any): Candidate {
    let missions: string[] = [];
    if (Array.isArray(row.missions)) {
      missions = row.missions;
    } else if (typeof row.missions === 'string') {
      try {
        const parsed = JSON.parse(row.missions);
        missions = Array.isArray(parsed) ? parsed : [row.missions];
      } catch {
        missions = [row.missions];
      }
    }

    let achievements: string[] = [];
    if (Array.isArray(row.achievements)) {
      achievements = row.achievements;
    } else if (typeof row.achievements === 'string') {
      try {
        const parsed = JSON.parse(row.achievements);
        achievements = Array.isArray(parsed) ? parsed : [row.achievements];
      } catch {
        achievements = [row.achievements];
      }
    }

    return {
      id: String(row.id),
      category: row.category === 'putri' ? 'putri' : 'putra',
      number: String(row.number || '01').padStart(2, '0'),
      name: row.name || 'Kandidat',
      nickname: row.nickname || (row.name ? row.name.split(' ')[0] : 'Kandidat'),
      classGrade: row.class_grade || row.classGrade || 'XI',
      photoUrl: row.photo_url || row.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      motto: row.motto || '',
      racketSpecialty: row.racket_specialty || row.racketSpecialty || '',
      vision: row.vision || '',
      missions: missions.length > 0 ? missions : ['Mengembangkan ekstrakurikuler bulutangkis'],
      achievements: achievements.length > 0 ? achievements : ['Anggota aktif ekstrakurikuler'],
    };
  }

  // Baca kandidat dari cache lokal (cepat & sinkron untuk render awal)
  public getCandidates(): Candidate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      return data ? JSON.parse(data) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  }

  // Simpan ke cache lokal
  public saveCandidatesLocal(candidates: Candidate[]): void {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }

  // 1. SELECT (AMBIL) KANDIDAT DARI SUPABASE
  public async fetchCandidatesFromSupabase(): Promise<Candidate[]> {
    if (!this.supabase || !this.config.isConnected) {
      return this.getCandidates();
    }

    try {
      const { data, error } = await this.supabase
        .from('candidates')
        .select('*')
        .order('category', { ascending: false })
        .order('number', { ascending: true });

      if (error) {
        // Jika tabel belum dibuat (Error 42P01), jangan crash, gunakan data lokal
        if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
          console.warn('Tabel "candidates" belum dibuat di Supabase. Menampilkan kandidat dari penyimpanan lokal.');
        } else {
          console.warn('Gagal query candidates dari Supabase:', error.message);
        }
        return this.getCandidates();
      }

      if (data && data.length > 0) {
        const candidates = data.map((r: any) => this.rowToCandidate(r));
        this.saveCandidatesLocal(candidates);
        return candidates;
      } else {
        // Jika tabel candidates di Supabase masih kosong (0 baris), otomatis upload INITIAL_CANDIDATES
        console.log('Tabel candidates di Supabase kosong. Melakukan inisialisasi kandidat awal ke Supabase...');
        const initial = this.getCandidates();
        try {
          const rows = initial.map(c => this.candidateToRow(c));
          await this.supabase.from('candidates').insert(rows);
        } catch (seedErr) {
          console.warn('Gagal otomatis seed candidates:', seedErr);
        }
        return initial;
      }
    } catch (err) {
      console.warn('Error saat mengambil kandidat dari Supabase:', err);
      return this.getCandidates();
    }
  }

  // Ambil kandidat secara asinkron (mencoba Supabase terlebih dahulu, fallback ke lokal)
  public async getCandidatesAsync(): Promise<Candidate[]> {
    if (this.supabase && this.config.isConnected) {
      return await this.fetchCandidatesFromSupabase();
    }
    return this.getCandidates();
  }

  // 2. INSERT (TAMBAH) KANDIDAT KE SUPABASE
  public async addCandidate(candidate: Candidate): Promise<{ success: boolean; message: string }> {
    // Simpan ke local cache terlebih dahulu
    const list = this.getCandidates();
    const updatedList = list.filter(c => c.id !== candidate.id);
    updatedList.push(candidate);
    this.saveCandidatesLocal(updatedList);

    // Kirim INSERT ke Supabase
    if (this.supabase && this.config.isConnected) {
      try {
        const row = this.candidateToRow(candidate);
        const { error } = await this.supabase
          .from('candidates')
          .insert(row);

        if (error) {
          console.error('Supabase INSERT candidate error:', error);
          return {
            success: true,
            message: `Kandidat "${candidate.name}" tersimpan secara lokal, namun gagal sinkron ke Supabase: ${error.message}. Pastikan tabel "candidates" sudah dibuat.`
          };
        }
        return {
          success: true,
          message: `Kandidat "${candidate.name}" berhasil ditambahkan dan disinkronkan langsung ke Supabase!`
        };
      } catch (err: any) {
        return {
          success: true,
          message: `Kandidat tersimpan di perangkat (${err.message}).`
        };
      }
    }

    return {
      success: true,
      message: `Kandidat "${candidate.name}" berhasil disimpan di perangkat lokal.`
    };
  }

  // 3. UPDATE (EDIT) KANDIDAT DI SUPABASE
  public async updateCandidate(candidate: Candidate): Promise<{ success: boolean; message: string }> {
    // Perbarui local cache terlebih dahulu
    const list = this.getCandidates().map(c => c.id === candidate.id ? candidate : c);
    this.saveCandidatesLocal(list);

    // Kirim UPDATE ke Supabase
    if (this.supabase && this.config.isConnected) {
      try {
        const row = this.candidateToRow(candidate);
        const { error } = await this.supabase
          .from('candidates')
          .update(row)
          .eq('id', candidate.id);

        if (error) {
          console.error('Supabase UPDATE candidate error:', error);
          return {
            success: true,
            message: `Perubahan tersimpan lokal, namun gagal sinkron ke Supabase: ${error.message}`
          };
        }
        return {
          success: true,
          message: `Data kandidat "${candidate.name}" berhasil diperbarui langsung di Supabase!`
        };
      } catch (err: any) {
        return {
          success: true,
          message: `Perubahan tersimpan secara lokal (${err.message}).`
        };
      }
    }

    return {
      success: true,
      message: `Data kandidat "${candidate.name}" berhasil diperbarui.`
    };
  }

  // 4. DELETE (HAPUS) KANDIDAT DARI SUPABASE
  public async deleteCandidate(id: string): Promise<{ success: boolean; message: string }> {
    const candidate = this.getCandidates().find(c => c.id === id);
    const candName = candidate ? candidate.name : id;

    // Hapus dari local cache
    const list = this.getCandidates().filter(c => c.id !== id);
    this.saveCandidatesLocal(list);

    // Kirim DELETE ke Supabase
    if (this.supabase && this.config.isConnected) {
      try {
        const { error } = await this.supabase
          .from('candidates')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase DELETE candidate error:', error);
          return {
            success: true,
            message: `Kandidat dihapus secara lokal, namun gagal hapus di Supabase: ${error.message}`
          };
        }
        return {
          success: true,
          message: `Kandidat "${candName}" berhasil dihapus dari Supabase!`
        };
      } catch (err: any) {
        return {
          success: true,
          message: `Kandidat dihapus secara lokal (${err.message}).`
        };
      }
    }

    return {
      success: true,
      message: `Kandidat "${candName}" berhasil dihapus.`
    };
  }

  // Simpan banyak kandidat sekaligus (Bulk Upsert)
  public async saveCandidates(candidates: Candidate[]): Promise<{ success: boolean; message: string }> {
    this.saveCandidatesLocal(candidates);
    if (this.supabase && this.config.isConnected) {
      try {
        const rows = candidates.map(c => this.candidateToRow(c));
        const { error } = await this.supabase
          .from('candidates')
          .upsert(rows, { onConflict: 'id' });

        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, message: 'Data kandidat berhasil disinkronkan ke Supabase.' };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }
    return { success: true, message: 'Data kandidat disimpan di lokal.' };
  }

  // Kembalikan seluruh kandidat ke susunan default
  public async resetCandidates(): Promise<{ success: boolean; message: string }> {
    this.saveCandidatesLocal(INITIAL_CANDIDATES);
    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase.from('candidates').delete().neq('id', '___dummy___');
        const rows = INITIAL_CANDIDATES.map(c => this.candidateToRow(c));
        await this.supabase.from('candidates').insert(rows);
        return { success: true, message: 'Daftar kandidat di Supabase berhasil direset ke susunan default!' };
      } catch (err: any) {
        console.warn('Gagal reset kandidat di Supabase:', err);
      }
    }
    return { success: true, message: 'Daftar kandidat berhasil dikembalikan ke default.' };
  }

  // 5. REAL-TIME SUBSCRIPTION KE SUPABASE UNTUK TABEL KANDIDAT
  public subscribeCandidates(callback: (candidates: Candidate[]) => void): () => void {
    if (!this.supabase || !this.config.isConnected) {
      return () => {};
    }
    try {
      const channelName = `realtime_candidates_${Math.random().toString(36).substring(2, 8)}`;
      const channel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'candidates' },
          async (payload) => {
            console.log('📡 Perubahan data kandidat realtime terdeteksi:', payload.eventType);
            const fresh = await this.fetchCandidatesFromSupabase();
            callback(fresh);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime candidates channel aktif');
          }
        });

      return () => {
        try {
          this.supabase?.removeChannel(channel);
        } catch (e) {
          console.warn('Error removing channel:', e);
        }
      };
    } catch (err) {
      console.warn('Gagal membuat realtime subscription candidates:', err);
      return () => {};
    }
  }

  // Script SQL Khusus untuk Tabel Candidates di Supabase
  public getCandidatesSQLSchema(): string {
    return `-- ========================================================
-- SCRIPT TABEL KANDIDAT SUPABASE (REAL-TIME SINKRONISASI)
-- Salin dan jalankan script ini di menu "SQL Editor" di Supabase Anda
-- ========================================================

-- 1. Buat Tabel Data Kandidat (Candidates)
CREATE TABLE IF NOT EXISTS public.candidates (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('putra', 'putri')),
    number TEXT NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    class_grade TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    motto TEXT DEFAULT '',
    racket_specialty TEXT DEFAULT '',
    vision TEXT DEFAULT '',
    missions JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Izin Membaca (Semua pemilih dapat melihat calon)
DROP POLICY IF EXISTS "Izinkan publik membaca data kandidat" ON public.candidates;
CREATE POLICY "Izinkan publik membaca data kandidat" 
ON public.candidates 
FOR SELECT 
USING (true);

-- 4. Kebijakan Izin Menambah Kandidat (Admin)
DROP POLICY IF EXISTS "Izinkan admin menambah data kandidat" ON public.candidates;
CREATE POLICY "Izinkan admin menambah data kandidat" 
ON public.candidates 
FOR INSERT 
WITH CHECK (true);

-- 5. Kebijakan Izin Memperbarui Kandidat (Admin)
DROP POLICY IF EXISTS "Izinkan admin memperbarui data kandidat" ON public.candidates;
CREATE POLICY "Izinkan admin memperbarui data kandidat" 
ON public.candidates 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 6. Kebijakan Izin Menghapus Kandidat (Admin)
DROP POLICY IF EXISTS "Izinkan admin menghapus data kandidat" ON public.candidates;
CREATE POLICY "Izinkan admin menghapus data kandidat" 
ON public.candidates 
FOR DELETE 
USING (true);

-- 7. Aktifkan Supabase Realtime untuk tabel candidates
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;

-- 8. Masukkan Data Calon Awal Resmi SMAN 1 Cikampek (Seed Data)
INSERT INTO public.candidates (id, category, number, name, nickname, class_grade, photo_url, motto, racket_specialty, vision, missions, achievements)
VALUES
('putra-01', 'putra', '01', 'Fajar Nur Hidayat', 'Fajar', 'XI MIPA 1', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'Disiplin adalah Kunci Juara Sejati', 'Tunggal Putra / Power Smash & Net Play', 'Menjadikan Ekstrakurikuler Bulutangkis SMAN 1 Cikampek sebagai wadah pengembangan atlet berprestasi, berintegritas, dan menjunjung tinggi sportivitas di tingkat Kabupaten maupun Provinsi.', '["Mengadakan jadwal latihan intensif terprogram 3 kali seminggu bersama pelatih berlisensi","Menjalin sparing partner rutin antarsekolah tiap 2 bulan untuk mengasah mental bertanding","Membentuk tim khusus regenerasi dari kelas X untuk persiapan turnamen O2SN"]'::jsonb, '["Juara 1 Tunggal Putra O2SN Tingkat Kabupaten 2025","Medali Emas Kejurkab Bulutangkis Pelajar 2024"]'::jsonb),
('putra-02', 'putra', '02', 'Kevin Arya Wicaksana', 'Kevin', 'XI IPS 2', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'Kompak di Lapangan, Juara di Podium', 'Ganda Putra / Playmaker & Drive Cepat', 'Membangun klub bulutangkis yang solid, inklusif bagi pemula maupun atlet, serta konsisten meraih podium di kejuaraan antarsekolah.', '["Memfasilitasi program pembinaan berjenjang dari pemula (basic skills) hingga kelas tanding (atlet)","Menyelenggarakan turnamen internal Smansa Badminton Cup setiap semester","Memperbaiki manajemen inventaris dan perawatan perlengkapan raket dan shuttlecock"]'::jsonb, '["Juara 2 Ganda Putra Kejuaraan Antar Pelajar 2025","Semifinalis Sirkuit Remaja Regional 2024"]'::jsonb),
('putra-03', 'putra', '03', 'Rizky Bintang Ramadhan', 'Bintang', 'XI MIPA 3', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'Pantang Pulang Sebelum Kok Menyentuh Lantai', 'Tunggal & Ganda / Rally Ketahanan Fisik', 'Mencetak atlet bulutangkis yang tangguh secara mental, memiliki stamina prima, dan mampu bersaing di tingkat nasional.', '["Fokus pada pelatihan fisik atletik modern, kelincahan footwork, dan pemulihan stamina","Mengadakan sesi bedah taktik pertandingan menggunakan rekaman video analisis","Menyediakan beasiswa peralatan (raket & senar) untuk atlet berprestasi kurang mampu"]'::jsonb, '["Juara 1 Kejuaraan Bulutangkis Kapolres Cup 2025","Peringkat 8 Besar Popda Jawa Barat 2024"]'::jsonb),
('putri-01', 'putri', '01', 'Siti Nurhaliza Putri', 'Liza', 'XI MIPA 2', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'Sportif, Berprestasi, dan Berkarakter', 'Tunggal Putri / Deception & Dropshot Akurat', 'Mewujudkan tim bulutangkis putri yang disegani dengan kombinasi kecerdasan taktik, kedisiplinan, dan kekeluargaan yang erat.', '["Meningkatkan porsi latihan teknik penempatan bola dan kelenturan tubuh untuk atlet putri","Menyelenggarakan workshop mental bertanding dan nutrisi atlet bersama alumni berprestasi","Mengadakan bakti sosial dan coaching clinic bulutangkis untuk siswa SMP sekitar"]'::jsonb, '["Juara 1 Tunggal Putri O2SN Kabupaten 2025","Best Player Turnamen Pelajar Se-Jabar 2024"]'::jsonb),
('putri-02', 'putri', '02', 'Nayla Putri Maharani', 'Nayla', 'XI IPS 1', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'Bersama Mengukir Prestasi Emas', 'Ganda Putri & Campuran / Intercept Cepat', 'Menjadikan bulutangkis putri sebagai cabang ekstrakurikuler unggulan utama sekolah dengan tata kelola profesional dan transparan.', '["Menyusun sistem evaluasi kemajuan latihan berbasis data statistik setiap bulan","Memperbanyak uji tanding persahabatan ke klub-klub bulutangkis ternama","Mempererat kekeluargaan anggota melalui kegiatan gathering tahunan"]'::jsonb, '["Juara 2 Ganda Putri Kejurkab 2025","Juara 3 Ganda Campuran Kejurda 2024"]'::jsonb),
('putri-03', 'putri', '03', 'Amanda Cinta Lestari', 'Amanda', 'XI MIPA 4', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 'Tekad Kuat Menembus Batas Prestasi', 'Tunggal Putri / Agresif Smash & Serangan Cepat', 'Membangun generasi pebulutangkis putri yang percaya diri, memiliki mental juara di setiap turnamen, dan seimbang dengan prestasi akademik.', '["Pendampingan akademik bagi anggota ekskul agar nilai pelajaran tetap unggul saat persiapan lomba","Latihan khusus kekuatan pergelangan tangan dan variasi servis mematikan","Mengikutsertakan seluruh anggota dalam turnamen terbuka tingkat karesidenan"]'::jsonb, '["Juara 1 Kejuaraan Pelajar Provinsi 2025","Juara 2 Tunggal Putri Djarum Sirnas 2024"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  number = EXCLUDED.number,
  name = EXCLUDED.name,
  nickname = EXCLUDED.nickname,
  class_grade = EXCLUDED.class_grade,
  photo_url = EXCLUDED.photo_url,
  motto = EXCLUDED.motto,
  racket_specialty = EXCLUDED.racket_specialty,
  vision = EXCLUDED.vision,
  missions = EXCLUDED.missions,
  achievements = EXCLUDED.achievements;
`;
  }

  // ==========================================
  // MANAJEMEN DAFTAR PEMILIH TETAP (127 SISWA DPT + SUPABASE REAL-TIME)
  // Hak Suara Terproteksi: 1 Siswa = 1 Kali Pakai
  // ==========================================

  private voterToRow(v: RegisteredVoter): any {
    return {
      id: v.id,
      nisn: v.nisn.trim(),
      name: v.name.trim(),
      student_class: v.studentClass.trim(),
      gender: v.gender,
      has_voted: Boolean(v.hasVoted),
      vote_code: v.voteCode || null,
      voted_at: v.votedAt || null,
    };
  }

  private rowToVoter(row: any): RegisteredVoter {
    return {
      id: String(row.id || `voter-${row.nisn}`),
      nisn: String(row.nisn).trim(),
      name: String(row.name || 'Siswa').trim(),
      studentClass: String(row.student_class || row.studentClass || '-').trim(),
      gender: (row.gender === 'P' ? 'P' : 'L') as 'L' | 'P',
      hasVoted: Boolean(row.has_voted),
      voteCode: row.vote_code || undefined,
      votedAt: row.voted_at || undefined,
    };
  }

  // Baca DPT dari cache lokal (cepat untuk render UI)
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

  // 1. SELECT (AMBIL) 127 PEMILIH DARI SUPABASE
  public async fetchRegisteredVotersFromSupabase(): Promise<RegisteredVoter[]> {
    if (!this.supabase || !this.config.isConnected) {
      return this.getRegisteredVoters();
    }

    try {
      const { data, error } = await this.supabase
        .from('voters')
        .select('*')
        .order('nisn', { ascending: true });

      if (error) {
        if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
          console.warn('Tabel "voters" belum ada di Supabase. Menggunakan data lokal DPT 127 siswa.');
        } else {
          console.warn('Gagal ambil data voters dari Supabase:', error.message);
        }
        return this.getRegisteredVoters();
      }

      if (data && data.length > 0) {
        const mapped = data.map((r: any) => this.rowToVoter(r));
        this.saveRegisteredVoters(mapped);
        return mapped;
      } else {
        // Tabel voters di Supabase kosong: otomatis seed 127 siswa DPT ke Supabase!
        console.log('Tabel voters di Supabase masih kosong. Melakukan sinkronisasi 127 siswa DPT awal...');
        const initial = this.getRegisteredVoters();
        await this.seedVotersToSupabase(initial);
        return initial;
      }
    } catch (err) {
      console.warn('Error saat fetch registered voters:', err);
      return this.getRegisteredVoters();
    }
  }

  // Unggah batch 127 siswa pemilih ke Supabase
  public async seedVotersToSupabase(voters: RegisteredVoter[]): Promise<void> {
    if (!this.supabase || !this.config.isConnected) return;
    try {
      const rows = voters.map(v => this.voterToRow(v));
      // Chunk per 40 baris agar request stabil
      for (let i = 0; i < rows.length; i += 40) {
        const chunk = rows.slice(i, i + 40);
        await this.supabase.from('voters').upsert(chunk, { onConflict: 'nisn' });
      }
      console.log(`✅ Berhasil menyinkronkan ${voters.length} pemilih ke tabel voters Supabase`);
    } catch (e) {
      console.warn('Gagal seed voters ke Supabase:', e);
    }
  }

  // Unggah batch 127 siswa pemilih resmi ke Supabase (1-Klik Sinkronisasi DPT)
  public async sync127VotersToSupabase(): Promise<{ success: boolean; count: number; message: string }> {
    if (!this.supabase || !this.config.isConnected) {
      this.saveRegisteredVoters(OFFICIAL_REGISTERED_VOTERS);
      return {
        success: false,
        count: OFFICIAL_REGISTERED_VOTERS.length,
        message: 'Supabase belum terhubung. Harap isi URL dan Anon Key di Pengaturan Database terlebih dahulu.'
      };
    }

    try {
      const rows = OFFICIAL_REGISTERED_VOTERS.map(v => this.voterToRow(v));
      let syncedCount = 0;

      // Batch 30 baris per request agar stabil dan terhindar dari payload limit
      for (let i = 0; i < rows.length; i += 30) {
        const chunk = rows.slice(i, i + 30);
        const { error } = await this.supabase
          .from('voters')
          .upsert(chunk, { onConflict: 'nisn' });

        if (error) {
          if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
            throw new Error(`Tabel "voters" belum ada di Supabase. Silakan jalankan script SQL tabel DPT di menu Pengaturan / DPT terlebih dahulu.`);
          }
          throw error;
        }
        syncedCount += chunk.length;
      }

      // Refresh data lokal dari Supabase
      const fresh = await this.fetchRegisteredVotersFromSupabase();

      return {
        success: true,
        count: fresh.length || syncedCount,
        message: `Berhasil mengunggah dan menyinkronkan 127 Siswa DPT SMAN 1 Cikampek ke Supabase! Hak suara terproteksi (1 Siswa = 1 Kali Pakai).`
      };
    } catch (err: any) {
      console.error('Error sync 127 voters to Supabase:', err);
      return {
        success: false,
        count: 0,
        message: err.message || 'Gagal menyinkronkan 127 data siswa ke Supabase.'
      };
    }
  }

  public async getRegisteredVotersAsync(): Promise<RegisteredVoter[]> {
    if (this.supabase && this.config.isConnected) {
      return await this.fetchRegisteredVotersFromSupabase();
    }
    return this.getRegisteredVoters();
  }

  // 2. INSERT (TAMBAH) PEMILIH KE SUPABASE
  public async addRegisteredVoter(voterData: Omit<RegisteredVoter, 'id' | 'hasVoted'>): Promise<RegisteredVoter> {
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

    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase.from('voters').insert([this.voterToRow(newVoter)]);
      } catch (err) {
        console.warn('Gagal insert voter ke Supabase:', err);
      }
    }

    return newVoter;
  }

  // 3. UPDATE (EDIT) PEMILIH DI SUPABASE
  public async updateRegisteredVoter(voter: RegisteredVoter): Promise<void> {
    const list = this.getRegisteredVoters().map(v => v.id === voter.id ? voter : v);
    this.saveRegisteredVoters(list);

    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase
          .from('voters')
          .update(this.voterToRow(voter))
          .eq('nisn', voter.nisn);
      } catch (err) {
        console.warn('Gagal update voter di Supabase:', err);
      }
    }
  }

  // 4. DELETE (HAPUS) PEMILIH DARI SUPABASE
  public async deleteRegisteredVoter(id: string): Promise<void> {
    const voter = this.getRegisteredVoters().find(v => v.id === id);
    const list = this.getRegisteredVoters().filter(v => v.id !== id);
    this.saveRegisteredVoters(list);

    if (voter) {
      const voterNisn = voter.nisn.trim().toLowerCase();
      try {
        const nisnList: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTED_NISN_LIST) || '[]');
        const filteredNisn = nisnList.filter(n => n.trim().toLowerCase() !== voterNisn);
        localStorage.setItem(STORAGE_KEYS.VOTED_NISN_LIST, JSON.stringify(filteredNisn));
      } catch {}

      const allLocal = this.getLocalVotes();
      const remainingVotes = allLocal.filter(v => v.nisn.trim().toLowerCase() !== voterNisn);
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(remainingVotes));

      if (this.supabase && this.config.isConnected) {
        try {
          await this.supabase.from(this.config.tableName).delete().eq('nisn', voter.nisn);
          await this.supabase.from('voters').delete().eq('nisn', voter.nisn);
        } catch (e) {
          console.warn('Gagal hapus vote dari Supabase:', e);
        }
      }
    }
  }

  public async deleteAllRegisteredVoters(): Promise<void> {
    this.saveRegisteredVoters([]);
    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase.from('voters').delete().neq('id', '___dummy___');
      } catch (e) {
        console.warn('Gagal hapus semua voters di Supabase:', e);
      }
    }
  }

  public async resetRegisteredVotersToDefault(): Promise<void> {
    this.saveRegisteredVoters(INITIAL_REGISTERED_VOTERS);
    if (this.supabase && this.config.isConnected) {
      try {
        await this.seedVotersToSupabase(INITIAL_REGISTERED_VOTERS);
      } catch (e) {
        console.warn('Gagal reset voters default di Supabase:', e);
      }
    }
  }

  // Reset status vote siswa (mengembalikan has_voted = false di lokal dan Supabase)
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

    // 3. Hapus suara dari daftar votes jika ada
    const allLocal = this.getLocalVotes();
    const remainingVotes = allLocal.filter(v => v.nisn.trim().toLowerCase() !== cleanNisn);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(remainingVotes));

    // 4. Update di Supabase tabel voters (has_voted = false) dan hapus dari tabel votes
    if (this.supabase && this.config.isConnected) {
      try {
        await this.supabase.from(this.config.tableName).delete().eq('nisn', nisn);
        await this.supabase
          .from('voters')
          .update({ has_voted: false, vote_code: null, voted_at: null })
          .ilike('nisn', nisn);
      } catch (e) {
        console.warn('Gagal reset voter status di Supabase:', e);
      }
    }
  }

  // 5. REAL-TIME SUBSCRIPTION KE SUPABASE UNTUK TABEL VOTERS
  public subscribeVoters(callback: (voters: RegisteredVoter[]) => void): () => void {
    if (!this.supabase || !this.config.isConnected) {
      return () => {};
    }
    try {
      const channelName = `realtime_voters_${Math.random().toString(36).substring(2, 8)}`;
      const channel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'voters' },
          async (payload) => {
            console.log('📡 Perubahan status DPT voter realtime terdeteksi:', payload.eventType);
            const fresh = await this.fetchRegisteredVotersFromSupabase();
            callback(fresh);
          }
        )
        .subscribe();

      return () => {
        try {
          this.supabase?.removeChannel(channel);
        } catch (e) {
          console.warn('Error removing channel:', e);
        }
      };
    } catch (err) {
      console.warn('Gagal membuat realtime subscription voters:', err);
      return () => {};
    }
  }

  public findVoterByNisn(nisn: string): RegisteredVoter | undefined {
    const list = this.getRegisteredVoters();
    return list.find(v => v.nisn.trim().toLowerCase() === nisn.trim().toLowerCase());
  }

  // Login Siswa / Pemilih dengan Sinkronisasi Supabase Real-time
  public async loginVoterAsync(
    nisn: string, 
    name?: string, 
    studentClass?: string, 
    gender?: 'L' | 'P'
  ): Promise<{ success: boolean; voter?: RegisteredVoter; message: string; isNew?: boolean }> {
    const cleanNisn = nisn.trim();
    if (!cleanNisn) {
      return { success: false, message: 'NISN tidak boleh kosong.' };
    }

    // 1. Cek langsung ke database Supabase jika aktif (Jaminan 1 Siswa = 1 Kali Pakai)
    if (this.supabase && this.config.isConnected) {
      try {
        const { data } = await this.supabase
          .from('voters')
          .select('*')
          .ilike('nisn', cleanNisn)
          .limit(1);

        if (data && data.length > 0) {
          const remoteVoter = this.rowToVoter(data[0]);
          
          // Perbarui status lokal agar sinkron
          const list = this.getRegisteredVoters();
          const updatedList = list.map(v => v.nisn.toLowerCase() === cleanNisn.toLowerCase() ? remoteVoter : v);
          this.saveRegisteredVoters(updatedList);

          if (remoteVoter.hasVoted) {
            return {
              success: true,
              voter: remoteVoter,
              message: 'Hak suara Anda telah digunakan sebelumnya (1 Siswa = 1 Hak Suara).',
            };
          }

          return {
            success: true,
            voter: remoteVoter,
            message: 'Berhasil login ke bilik suara!',
          };
        }
      } catch (e) {
        console.warn('Gagal cek login ke Supabase, fallback ke data lokal:', e);
      }
    }

    // 2. Fallback login lokal
    return this.loginVoter(cleanNisn, name, studentClass, gender);
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
          ? 'Anda telah menggunakan hak suara sebelumnya (1 Siswa = 1 Hak Suara).'
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

      const newVoter: RegisteredVoter = {
        id: `voter-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nisn: cleanNisn,
        name: name.trim(),
        studentClass: studentClass.trim(),
        gender: gender || 'L',
        hasVoted: false,
      };

      const list = this.getRegisteredVoters();
      list.push(newVoter);
      this.saveRegisteredVoters(list);

      // Simpan juga ke Supabase jika terhubung
      if (this.supabase && this.config.isConnected) {
        this.supabase.from('voters').insert([this.voterToRow(newVoter)]).then();
      }

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
      if (!data) return DEFAULT_ELECTION_SETTINGS;
      const parsed = JSON.parse(data);
      // Migrasi otomatis jika masih ada nilai placeholder lama
      if (!parsed.schoolName || parsed.schoolName.includes('SMA Negeri 1 Bulutangkis')) {
        parsed.schoolName = 'SMAN 1 CIKAMPEK';
      }
      if (!parsed.schoolLogoUrl || parsed.schoolLogoUrl === '') {
        parsed.schoolLogoUrl = './logo-sman1cikampek.svg';
      }
      return { ...DEFAULT_ELECTION_SETTINGS, ...parsed };
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
