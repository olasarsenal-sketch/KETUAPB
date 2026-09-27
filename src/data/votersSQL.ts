// Script SQL Otomatis untuk 127 Siswa DPT SMAN 1 Cikampek
export const VOTERS_127_SQL_SCHEMA = `-- ========================================================
-- SCRIPT TABEL DPT (127 SISWA PEMILIH) SUPABASE
-- E-Voting Badminton Club SMAN 1 Cikampek
-- Hak Suara Terproteksi: 1 Siswa = 1 Kali Pakai
-- ========================================================

-- 1. Buat Tabel Data Pemilih (public.voters)
CREATE TABLE IF NOT EXISTS public.voters (
    id TEXT PRIMARY KEY,
    nisn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    student_class TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('L', 'P')),
    has_voted BOOLEAN DEFAULT false NOT NULL,
    vote_code TEXT DEFAULT NULL,
    voted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Izin Membaca (Semua pemilih dapat cek status & login)
DROP POLICY IF EXISTS "Izinkan publik membaca data pemilih" ON public.voters;
CREATE POLICY "Izinkan publik membaca data pemilih" 
ON public.voters 
FOR SELECT 
USING (true);

-- 4. Kebijakan Izin Menggunakan Hak Suara (Update status has_voted = true)
DROP POLICY IF EXISTS "Izinkan publik menggunakan hak suara" ON public.voters;
CREATE POLICY "Izinkan publik menggunakan hak suara" 
ON public.voters 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 5. Kebijakan Izin Menambah Pemilih (Admin / Panitia)
DROP POLICY IF EXISTS "Izinkan admin menambah pemilih" ON public.voters;
CREATE POLICY "Izinkan admin menambah pemilih" 
ON public.voters 
FOR INSERT 
WITH CHECK (true);

-- 6. Kebijakan Izin Menghapus Pemilih (Admin / Panitia)
DROP POLICY IF EXISTS "Izinkan admin menghapus pemilih" ON public.voters;
CREATE POLICY "Izinkan admin menghapus pemilih" 
ON public.voters 
FOR DELETE 
USING (true);

-- 7. Aktifkan Supabase Realtime untuk tabel voters
ALTER PUBLICATION supabase_realtime ADD TABLE public.voters;

-- 8. Buat Index Unik NISN untuk memastikan 1 NISN hanya 1 kali
CREATE UNIQUE INDEX IF NOT EXISTS idx_voters_nisn ON public.voters (nisn);

-- 9. Masukkan Data 127 Siswa Pemilih Tetap Resmi SMAN 1 Cikampek
INSERT INTO public.voters (id, nisn, name, student_class, gender, has_voted) VALUES
('voter-64001', '64001', 'Achmad Gilang Ganesha', 'X-A', 'L', false),
('voter-64002', '64002', 'Aidasyifa', 'X-A', 'P', false),
('voter-64003', '64003', 'Raisya', 'X-A', 'P', false),
('voter-64004', '64004', 'Silvia Rahman', 'X-A', 'P', false),
('voter-64005', '64005', 'Siti Nur Khoerunnisa', 'X-A', 'P', false),
('voter-64006', '64006', 'Syifa', 'X-A', 'P', false),
('voter-64007', '64007', 'Vania Ibthihal Ozara', 'X-A', 'P', false),
('voter-64008', '64008', 'Zaqi Abdoel Sofyan', 'X-A', 'L', false),
('voter-64009', '64009', 'Fahru Raffasya Pratama', 'X-B', 'L', false),
('voter-64010', '64010', 'M. Alfaro Almahbubi', 'X-B', 'L', false),
('voter-64011', '64011', 'Muhamad Zulkarnaen Nurholik', 'X-B', 'L', false),
('voter-64012', '64012', 'Alvino Rafan Zahir', 'X-C', 'L', false),
('voter-64013', '64013', 'Dian Nuralifah', 'X-C', 'P', false),
('voter-64014', '64014', 'Fahry Ramadhan', 'X-C', 'L', false),
('voter-64015', '64015', 'Muhammad Fadhli Abdurrasyid', 'X-C', 'L', false),
('voter-64016', '64016', 'Nadira Atiqah R.', 'X-C', 'P', false),
('voter-64017', '64017', 'Raissa Anindya S.', 'X-C', 'P', false),
('voter-64018', '64018', 'Rama Rafael', 'X-C', 'L', false),
('voter-64019', '64019', 'Siti Rohmah Budiasih', 'X-C', 'P', false),
('voter-64020', '64020', 'Tegar Nugraha', 'X-C', 'L', false),
('voter-64021', '64021', 'Andini Wulansari', 'X-D', 'P', false),
('voter-64022', '64022', 'Keisha Khalifa Ramadhani Darmawan', 'X-D', 'P', false),
('voter-64023', '64023', 'M. Wali Ul Amri', 'X-D', 'L', false),
('voter-64024', '64024', 'Mutiara Syabina', 'X-D', 'P', false),
('voter-64025', '64025', 'Naqyla', 'X-D', 'P', false),
('voter-64026', '64026', 'Nirvana Zahra Oktaviani', 'X-D', 'P', false),
('voter-64027', '64027', 'Novi Alfizah Rahmah', 'X-D', 'P', false),
('voter-64028', '64028', 'Raisya Dinul Zayyani', 'X-D', 'P', false),
('voter-64029', '64029', 'Rhaudatunnadya Althafunnisa', 'X-D', 'P', false),
('voter-64030', '64030', 'Zulva Paujiah Octaviyani', 'X-D', 'P', false),
('voter-64031', '64031', 'Aulia Rizti Rabbani', 'X-E', 'P', false),
('voter-64032', '64032', 'Dinsha Aura Yonashi', 'X-E', 'P', false),
('voter-64033', '64033', 'Naida Zulfa', 'X-E', 'P', false),
('voter-64034', '64034', 'Nabilah F.', 'X-E', 'P', false),
('voter-64035', '64035', 'Sehan Sesilia Nur Wafa', 'X-E', 'P', false),
('voter-64036', '64036', 'Siti Nazwa Nurmahmuda', 'X-E', 'P', false),
('voter-64037', '64037', 'Angga Putra Yana', 'X-F', 'L', false),
('voter-64038', '64038', 'Dinar Fathir Yanuar', 'X-F', 'L', false),
('voter-64039', '64039', 'Faaiz Kurniawan Subagyo', 'X-F', 'L', false),
('voter-64040', '64040', 'Raditya Fathar Rafisqy', 'X-F', 'L', false),
('voter-64041', '64041', 'Hanifa Luthfiya Chandra', 'X-G', 'P', false),
('voter-64042', '64042', 'Kaiyla Leticia Apriansyah', 'X-G', 'P', false),
('voter-64043', '64043', 'Kania Putri Suhadi', 'X-G', 'P', false),
('voter-64044', '64044', 'Muhammad Raihaan Al Malik', 'X-G', 'L', false),
('voter-64045', '64045', 'Naufal Fadillah', 'X-G', 'L', false),
('voter-64046', '64046', 'Salma Nur Huwaida', 'X-G', 'P', false),
('voter-64047', '64047', 'Syifa Nurhamidah', 'X-G', 'P', false),
('voter-64048', '64048', 'Beryl Bagus Wicaksana', 'X-H', 'L', false),
('voter-64049', '64049', 'Muhammad Nabil Putra Priatna', 'X-H', 'L', false),
('voter-64050', '64050', 'Nadhinta Kirainy W.P.', 'X-H', 'P', false),
('voter-64051', '64051', 'Nayla Putri Ramadhani', 'X-H', 'P', false),
('voter-64052', '64052', 'Rava Pratama', 'X-H', 'L', false),
('voter-64053', '64053', 'Zulfa Agnia Jelita', 'X-H', 'P', false),
('voter-64054', '64054', 'Agha Ghufron Sujatmiko', 'X-I', 'L', false),
('voter-64055', '64055', 'Alisya Amanatta Adami', 'X-I', 'P', false),
('voter-64056', '64056', 'Aulia Agustin Rahmadani', 'X-I', 'P', false),
('voter-64057', '64057', 'Gabriel Hernandes', 'X-I', 'L', false),
('voter-64058', '64058', 'Nayda Farradita Bardiansyah', 'X-I', 'P', false),
('voter-64059', '64059', 'Qonita Aurelia Putri', 'X-I', 'P', false),
('voter-64060', '64060', 'Zaenal Muttaqien Saepudin', 'X-I', 'L', false),
('voter-64061', '64061', 'Zaskia Dwi Melianti', 'X-I', 'P', false),
('voter-64062', '64062', 'Agus Ramdan', 'X-J', 'L', false),
('voter-64063', '64063', 'Aldiansyah', 'X-J', 'L', false),
('voter-64064', '64064', 'Davin Ilham Girinoto', 'X-J', 'L', false),
('voter-64065', '64065', 'Fajar Ahmad Fahrurrozy', 'X-J', 'L', false),
('voter-64066', '64066', 'Galang Dharmma Yukti', 'X-J', 'L', false),
('voter-64067', '64067', 'Khaizuran Abdurafi', 'X-J', 'L', false),
('voter-64068', '64068', 'M. Hakeem Rajata', 'X-J', 'L', false),
('voter-64069', '64069', 'Muhamad Denny Izza Fadlillah', 'X-J', 'L', false),
('voter-64070', '64070', 'Muhammad Rafif', 'X-J', 'L', false),
('voter-64071', '64071', 'Rabia Nurfarhana', 'X-J', 'P', false),
('voter-64072', '64072', 'Yuliane', 'X-J', 'P', false),
('voter-64073', '64073', 'Fakhry Muhammad Hamzah', 'X-K', 'L', false),
('voter-64074', '64074', 'Kinanti Edelweis Alkautsar', 'X-K', 'P', false),
('voter-64075', '64075', 'Nada Tisyarasita', 'X-K', 'P', false),
('voter-64076', '64076', 'Revana Erla', 'X-K', 'P', false),
('voter-63001', '63001', 'Cahaya Bintang', 'XI-A', 'P', false),
('voter-63002', '63002', 'Syifa Oktavia', 'XI-A', 'P', false),
('voter-63003', '63003', 'Talitha Tri Rahmawati', 'XI-A', 'P', false),
('voter-63004', '63004', 'Hilman Jaelani', 'XI-B', 'L', false),
('voter-63005', '63005', 'Muhammad Fakhry Aditya Hermawan', 'XI-B', 'L', false),
('voter-63006', '63006', 'Zhivara Rizki Wenanti', 'XI-B', 'P', false),
('voter-63007', '63007', 'Bondan Setya Pramudya', 'XI-C', 'L', false),
('voter-63008', '63008', 'Keyla Raisya Az Zahra', 'XI-C', 'P', false),
('voter-63009', '63009', 'Noerlitasari Nabila Putri', 'XI-C', 'P', false),
('voter-63010', '63010', 'Yasina Dananiro', 'XI-C', 'P', false),
('voter-63011', '63011', 'Indra Danendra Sulaeman', 'XI-D', 'L', false),
('voter-63012', '63012', 'Sausan Shakila Ettrijanto Puyda', 'XI-D', 'P', false),
('voter-63013', '63013', 'Widya Anggraeni Khairunnisa', 'XI-D', 'P', false),
('voter-63014', '63014', 'Aqila Khanza Fauziah', 'XI-E', 'P', false),
('voter-63015', '63015', 'Bunga Novrianti', 'XI-E', 'P', false),
('voter-63016', '63016', 'Kanza Attayah', 'XI-E', 'P', false),
('voter-63017', '63017', 'Muhamad Rafiqul A''la', 'XI-E', 'L', false),
('voter-63018', '63018', 'Nirvia Bilqis Candrakirana', 'XI-E', 'P', false),
('voter-63019', '63019', 'Siti Latifha', 'XI-E', 'P', false),
('voter-63020', '63020', 'Aira Najwa', 'XI-F', 'P', false),
('voter-63021', '63021', 'Amelia Dwi Septiani', 'XI-F', 'P', false),
('voter-63022', '63022', 'Asri Puput Maharani', 'XI-F', 'P', false),
('voter-63023', '63023', 'Dinda Dwi Aprillia', 'XI-F', 'P', false),
('voter-63024', '63024', 'Nova Zahrotusyifa', 'XI-F', 'P', false),
('voter-63025', '63025', 'Siti Nurlayla', 'XI-F', 'P', false),
('voter-63026', '63026', 'Gabrial Alvaro', 'XI-G', 'L', false),
('voter-63027', '63027', 'Sendy Alghifari', 'XI-G', 'L', false),
('voter-63028', '63028', 'Akhdan Fahreza', 'XI-H', 'L', false),
('voter-63029', '63029', 'Alena Syakirah D.S.', 'XI-H', 'P', false),
('voter-63030', '63030', 'Silmi Ayuni Inayah', 'XI-H', 'P', false),
('voter-63031', '63031', 'Syafa Carisa Aneira Dewi', 'XI-H', 'P', false),
('voter-63032', '63032', 'Messi', 'XI-I', 'L', false),
('voter-63033', '63033', 'Airin Putri Jumiati', 'XI-J', 'P', false),
('voter-63034', '63034', 'Marliana', 'XI-J', 'P', false),
('voter-63035', '63035', 'Zaiza Kirana Putri', 'XI-J', 'P', false),
('voter-62001', '62001', 'Alfatira Milano', 'XII-A', 'L', false),
('voter-62002', '62002', 'Muhammad Lailul Mustafid', 'XII-A', 'L', false),
('voter-62003', '62003', 'Naufal Rifqii Al-Fathir', 'XII-A', 'L', false),
('voter-62004', '62004', 'Petrus Suryanto Marbun', 'XII-A', 'L', false),
('voter-62005', '62005', 'Fauzi Muzakki', 'XII-B', 'L', false),
('voter-62006', '62006', 'Muhammad Eka Nugraha', 'XII-D', 'L', false),
('voter-62007', '62007', 'Dwie Fany A.S.', 'XII-E', 'P', false),
('voter-62008', '62008', 'Agung Desgukara', 'XII-F', 'L', false),
('voter-62009', '62009', 'Alvin Fadillah', 'XII-F', 'L', false),
('voter-62010', '62010', 'Al Zaira Qurrotulaini', 'XII-G', 'P', false),
('voter-62011', '62011', 'Lusiana Tambunan', 'XII-G', 'P', false),
('voter-62012', '62012', 'Wulan Intan Sapitri', 'XII-G', 'P', false),
('voter-62013', '62013', 'Reggina Azzahra Cecilia Putri', 'XII-H', 'P', false),
('voter-62014', '62014', 'Muhammad Afgan', 'XII-J', 'L', false),
('voter-62015', '62015', 'Shepia Cahaya Ramadhani', 'XII-J', 'P', false),
('voter-62016', '62016', 'Annisa Aulia Syakira', 'XII-K', 'P', false)
ON CONFLICT (nisn) DO NOTHING;
`;
