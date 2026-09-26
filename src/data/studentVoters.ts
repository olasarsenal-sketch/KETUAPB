import { RegisteredVoter } from '../types';

export const SCHOOL_CLASSES = [
  'X-A', 'X-B', 'X-C', 'X-D', 'X-E', 'X-F', 'X-G', 'X-H', 'X-I', 'X-J', 'X-K',
  'XI-A', 'XI-B', 'XI-C', 'XI-D', 'XI-E', 'XI-F', 'XI-G', 'XI-H', 'XI-I', 'XI-J',
  'XII-A', 'XII-B', 'XII-C', 'XII-D', 'XII-E', 'XII-F', 'XII-G', 'XII-H', 'XII-I', 'XII-J', 'XII-K'
];

/**
 * Daftar Pemilih Tetap (DPT) Resmi
 * Angkatan 64 (Kelas X)  -> NIS 64001 s/d 64076 (5 Digit)
 * Angkatan 63 (Kelas XI) -> NIS 63001 s/d 63035 (5 Digit)
 * Angkatan 62 (Kelas XII)-> NIS 62001 s/d 62016 (5 Digit)
 * Total: 127 Siswa Pemilih
 */
export const OFFICIAL_REGISTERED_VOTERS: RegisteredVoter[] = [
  // ==========================================
  // KELAS X (Angkatan 64) - NIS 64001 .. 64076
  // ==========================================
  // X-A
  { id: 'voter-64001', nisn: '64001', name: 'Achmad Gilang Ganesha', studentClass: 'X-A', gender: 'L', hasVoted: false },
  { id: 'voter-64002', nisn: '64002', name: 'Aidasyifa', studentClass: 'X-A', gender: 'P', hasVoted: false },
  { id: 'voter-64003', nisn: '64003', name: 'Raisya', studentClass: 'X-A', gender: 'P', hasVoted: false },
  { id: 'voter-64004', nisn: '64004', name: 'Silvia Rahman', studentClass: 'X-A', gender: 'P', hasVoted: false },
  { id: 'voter-64005', nisn: '64005', name: 'Siti Nur Khoerunnisa', studentClass: 'X-A', gender: 'P', hasVoted: false },
  { id: 'voter-64006', nisn: '64006', name: 'Syifa', studentClass: 'X-A', gender: 'P', hasVoted: false },
  { id: 'voter-64007', nisn: '64007', name: 'Vania Ibthihal Ozara', studentClass: 'X-A', gender: 'P', hasVoted: false },
  { id: 'voter-64008', nisn: '64008', name: 'Zaqi Abdoel Sofyan', studentClass: 'X-A', gender: 'L', hasVoted: false },

  // X-B
  { id: 'voter-64009', nisn: '64009', name: 'Fahru Raffasya Pratama', studentClass: 'X-B', gender: 'L', hasVoted: false },
  { id: 'voter-64010', nisn: '64010', name: 'M. Alfaro Almahbubi', studentClass: 'X-B', gender: 'L', hasVoted: false },
  { id: 'voter-64011', nisn: '64011', name: 'Muhamad Zulkarnaen Nurholik', studentClass: 'X-B', gender: 'L', hasVoted: false },

  // X-C
  { id: 'voter-64012', nisn: '64012', name: 'Alvino Rafan Zahir', studentClass: 'X-C', gender: 'L', hasVoted: false },
  { id: 'voter-64013', nisn: '64013', name: 'Dian Nuralifah', studentClass: 'X-C', gender: 'P', hasVoted: false },
  { id: 'voter-64014', nisn: '64014', name: 'Fahry Ramadhan', studentClass: 'X-C', gender: 'L', hasVoted: false },
  { id: 'voter-64015', nisn: '64015', name: 'Muhammad Fadhli Abdurrasyid', studentClass: 'X-C', gender: 'L', hasVoted: false },
  { id: 'voter-64016', nisn: '64016', name: 'Nadira Atiqah R.', studentClass: 'X-C', gender: 'P', hasVoted: false },
  { id: 'voter-64017', nisn: '64017', name: 'Raissa Anindya S.', studentClass: 'X-C', gender: 'P', hasVoted: false },
  { id: 'voter-64018', nisn: '64018', name: 'Rama Rafael', studentClass: 'X-C', gender: 'L', hasVoted: false },
  { id: 'voter-64019', nisn: '64019', name: 'Siti Rohmah Budiasih', studentClass: 'X-C', gender: 'P', hasVoted: false },
  { id: 'voter-64020', nisn: '64020', name: 'Tegar Nugraha', studentClass: 'X-C', gender: 'L', hasVoted: false },

  // X-D
  { id: 'voter-64021', nisn: '64021', name: 'Andini Wulansari', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64022', nisn: '64022', name: 'Keisha Khalifa Ramadhani Darmawan', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64023', nisn: '64023', name: 'M. Wali Ul Amri', studentClass: 'X-D', gender: 'L', hasVoted: false },
  { id: 'voter-64024', nisn: '64024', name: 'Mutiara Syabina', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64025', nisn: '64025', name: 'Naqyla', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64026', nisn: '64026', name: 'Nirvana Zahra Oktaviani', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64027', nisn: '64027', name: 'Novi Alfizah Rahmah', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64028', nisn: '64028', name: 'Raisya Dinul Zayyani', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64029', nisn: '64029', name: 'Rhaudatunnadya Althafunnisa', studentClass: 'X-D', gender: 'P', hasVoted: false },
  { id: 'voter-64030', nisn: '64030', name: 'Zulva Paujiah Octaviyani', studentClass: 'X-D', gender: 'P', hasVoted: false },

  // X-E
  { id: 'voter-64031', nisn: '64031', name: 'Aulia Rizti Rabbani', studentClass: 'X-E', gender: 'P', hasVoted: false },
  { id: 'voter-64032', nisn: '64032', name: 'Dinsha Aura Yonashi', studentClass: 'X-E', gender: 'P', hasVoted: false },
  { id: 'voter-64033', nisn: '64033', name: 'Naida Zulfa', studentClass: 'X-E', gender: 'P', hasVoted: false },
  { id: 'voter-64034', nisn: '64034', name: 'Nabilah F.', studentClass: 'X-E', gender: 'P', hasVoted: false },
  { id: 'voter-64035', nisn: '64035', name: 'Sehan Sesilia Nur Wafa', studentClass: 'X-E', gender: 'P', hasVoted: false },
  { id: 'voter-64036', nisn: '64036', name: 'Siti Nazwa Nurmahmuda', studentClass: 'X-E', gender: 'P', hasVoted: false },

  // X-F
  { id: 'voter-64037', nisn: '64037', name: 'Angga Putra Yana', studentClass: 'X-F', gender: 'L', hasVoted: false },
  { id: 'voter-64038', nisn: '64038', name: 'Dinar Fathir Yanuar', studentClass: 'X-F', gender: 'L', hasVoted: false },
  { id: 'voter-64039', nisn: '64039', name: 'Faaiz Kurniawan Subagyo', studentClass: 'X-F', gender: 'L', hasVoted: false },
  { id: 'voter-64040', nisn: '64040', name: 'Raditya Fathar Rafisqy', studentClass: 'X-F', gender: 'L', hasVoted: false },

  // X-G
  { id: 'voter-64041', nisn: '64041', name: 'Hanifa Luthfiya Chandra', studentClass: 'X-G', gender: 'P', hasVoted: false },
  { id: 'voter-64042', nisn: '64042', name: 'Kaiyla Leticia Apriansyah', studentClass: 'X-G', gender: 'P', hasVoted: false },
  { id: 'voter-64043', nisn: '64043', name: 'Kania Putri Suhadi', studentClass: 'X-G', gender: 'P', hasVoted: false },
  { id: 'voter-64044', nisn: '64044', name: 'Muhammad Raihaan Al Malik', studentClass: 'X-G', gender: 'L', hasVoted: false },
  { id: 'voter-64045', nisn: '64045', name: 'Naufal Fadillah', studentClass: 'X-G', gender: 'L', hasVoted: false },
  { id: 'voter-64046', nisn: '64046', name: 'Salma Nur Huwaida', studentClass: 'X-G', gender: 'P', hasVoted: false },
  { id: 'voter-64047', nisn: '64047', name: 'Syifa Nurhamidah', studentClass: 'X-G', gender: 'P', hasVoted: false },

  // X-H
  { id: 'voter-64048', nisn: '64048', name: 'Beryl Bagus Wicaksana', studentClass: 'X-H', gender: 'L', hasVoted: false },
  { id: 'voter-64049', nisn: '64049', name: 'Muhammad Nabil Putra Priatna', studentClass: 'X-H', gender: 'L', hasVoted: false },
  { id: 'voter-64050', nisn: '64050', name: 'Nadhinta Kirainy W.P.', studentClass: 'X-H', gender: 'P', hasVoted: false },
  { id: 'voter-64051', nisn: '64051', name: 'Nayla Putri Ramadhani', studentClass: 'X-H', gender: 'P', hasVoted: false },
  { id: 'voter-64052', nisn: '64052', name: 'Rava Pratama', studentClass: 'X-H', gender: 'L', hasVoted: false },
  { id: 'voter-64053', nisn: '64053', name: 'Zulfa Agnia Jelita', studentClass: 'X-H', gender: 'P', hasVoted: false },

  // X-I
  { id: 'voter-64054', nisn: '64054', name: 'Agha Ghufron Sujatmiko', studentClass: 'X-I', gender: 'L', hasVoted: false },
  { id: 'voter-64055', nisn: '64055', name: 'Alisya Amanatta Adami', studentClass: 'X-I', gender: 'P', hasVoted: false },
  { id: 'voter-64056', nisn: '64056', name: 'Aulia Agustin Rahmadani', studentClass: 'X-I', gender: 'P', hasVoted: false },
  { id: 'voter-64057', nisn: '64057', name: 'Gabriel Hernandes', studentClass: 'X-I', gender: 'L', hasVoted: false },
  { id: 'voter-64058', nisn: '64058', name: 'Nayda Farradita Bardiansyah', studentClass: 'X-I', gender: 'P', hasVoted: false },
  { id: 'voter-64059', nisn: '64059', name: 'Qonita Aurelia Putri', studentClass: 'X-I', gender: 'P', hasVoted: false },
  { id: 'voter-64060', nisn: '64060', name: 'Zaenal Muttaqien Saepudin', studentClass: 'X-I', gender: 'L', hasVoted: false },
  { id: 'voter-64061', nisn: '64061', name: 'Zaskia Dwi Melianti', studentClass: 'X-I', gender: 'P', hasVoted: false },

  // X-J
  { id: 'voter-64062', nisn: '64062', name: 'Agus Ramdan', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64063', nisn: '64063', name: 'Aldiansyah', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64064', nisn: '64064', name: 'Davin Ilham Girinoto', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64065', nisn: '64065', name: 'Fajar Ahmad Fahrurrozy', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64066', nisn: '64066', name: 'Galang Dharmma Yukti', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64067', nisn: '64067', name: 'Khaizuran Abdurafi', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64068', nisn: '64068', name: 'M. Hakeem Rajata', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64069', nisn: '64069', name: 'Muhamad Denny Izza Fadlillah', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64070', nisn: '64070', name: 'Muhammad Rafif', studentClass: 'X-J', gender: 'L', hasVoted: false },
  { id: 'voter-64071', nisn: '64071', name: 'Rabia Nurfarhana', studentClass: 'X-J', gender: 'P', hasVoted: false },
  { id: 'voter-64072', nisn: '64072', name: 'Yuliane', studentClass: 'X-J', gender: 'P', hasVoted: false },

  // X-K
  { id: 'voter-64073', nisn: '64073', name: 'Fakhry Muhammad Hamzah', studentClass: 'X-K', gender: 'L', hasVoted: false },
  { id: 'voter-64074', nisn: '64074', name: 'Kinanti Edelweis Alkautsar', studentClass: 'X-K', gender: 'P', hasVoted: false },
  { id: 'voter-64075', nisn: '64075', name: 'Nada Tisyarasita', studentClass: 'X-K', gender: 'P', hasVoted: false },
  { id: 'voter-64076', nisn: '64076', name: 'Revana Erla', studentClass: 'X-K', gender: 'P', hasVoted: false },

  // ==========================================
  // KELAS XI (Angkatan 63) - NIS 63001 .. 63035
  // ==========================================
  // XI-A
  { id: 'voter-63001', nisn: '63001', name: 'Cahaya Bintang', studentClass: 'XI-A', gender: 'P', hasVoted: false },
  { id: 'voter-63002', nisn: '63002', name: 'Syifa Oktavia', studentClass: 'XI-A', gender: 'P', hasVoted: false },
  { id: 'voter-63003', nisn: '63003', name: 'Talitha Tri Rahmawati', studentClass: 'XI-A', gender: 'P', hasVoted: false },

  // XI-B
  { id: 'voter-63004', nisn: '63004', name: 'Hilman Jaelani', studentClass: 'XI-B', gender: 'L', hasVoted: false },
  { id: 'voter-63005', nisn: '63005', name: 'Muhammad Fakhry Aditya Hermawan', studentClass: 'XI-B', gender: 'L', hasVoted: false },
  { id: 'voter-63006', nisn: '63006', name: 'Zhivara Rizki Wenanti', studentClass: 'XI-B', gender: 'P', hasVoted: false },

  // XI-C
  { id: 'voter-63007', nisn: '63007', name: 'Bondan Setya Pramudya', studentClass: 'XI-C', gender: 'L', hasVoted: false },
  { id: 'voter-63008', nisn: '63008', name: 'Keyla Raisya Az Zahra', studentClass: 'XI-C', gender: 'P', hasVoted: false },
  { id: 'voter-63009', nisn: '63009', name: 'Noerlitasari Nabila Putri', studentClass: 'XI-C', gender: 'P', hasVoted: false },
  { id: 'voter-63010', nisn: '63010', name: 'Yasina Dananiro', studentClass: 'XI-C', gender: 'P', hasVoted: false },

  // XI-D
  { id: 'voter-63011', nisn: '63011', name: 'Indra Danendra Sulaeman', studentClass: 'XI-D', gender: 'L', hasVoted: false },
  { id: 'voter-63012', nisn: '63012', name: 'Sausan Shakila Ettrijanto Puyda', studentClass: 'XI-D', gender: 'P', hasVoted: false },
  { id: 'voter-63013', nisn: '63013', name: 'Widya Anggraeni Khairunnisa', studentClass: 'XI-D', gender: 'P', hasVoted: false },

  // XI-E
  { id: 'voter-63014', nisn: '63014', name: 'Aqila Khanza Fauziah', studentClass: 'XI-E', gender: 'P', hasVoted: false },
  { id: 'voter-63015', nisn: '63015', name: 'Bunga Novrianti', studentClass: 'XI-E', gender: 'P', hasVoted: false },
  { id: 'voter-63016', nisn: '63016', name: 'Kanza Attayah', studentClass: 'XI-E', gender: 'P', hasVoted: false },
  { id: 'voter-63017', nisn: '63017', name: 'Muhamad Rafiqul A\'la', studentClass: 'XI-E', gender: 'L', hasVoted: false },
  { id: 'voter-63018', nisn: '63018', name: 'Nirvia Bilqis Candrakirana', studentClass: 'XI-E', gender: 'P', hasVoted: false },
  { id: 'voter-63019', nisn: '63019', name: 'Siti Latifha', studentClass: 'XI-E', gender: 'P', hasVoted: false },

  // XI-F
  { id: 'voter-63020', nisn: '63020', name: 'Aira Najwa', studentClass: 'XI-F', gender: 'P', hasVoted: false },
  { id: 'voter-63021', nisn: '63021', name: 'Amelia Dwi Septiani', studentClass: 'XI-F', gender: 'P', hasVoted: false },
  { id: 'voter-63022', nisn: '63022', name: 'Asri Puput Maharani', studentClass: 'XI-F', gender: 'P', hasVoted: false },
  { id: 'voter-63023', nisn: '63023', name: 'Dinda Dwi Aprillia', studentClass: 'XI-F', gender: 'P', hasVoted: false },
  { id: 'voter-63024', nisn: '63024', name: 'Nova Zahrotusyifa', studentClass: 'XI-F', gender: 'P', hasVoted: false },
  { id: 'voter-63025', nisn: '63025', name: 'Siti Nurlayla', studentClass: 'XI-F', gender: 'P', hasVoted: false },

  // XI-G
  { id: 'voter-63026', nisn: '63026', name: 'Gabrial Alvaro', studentClass: 'XI-G', gender: 'L', hasVoted: false },
  { id: 'voter-63027', nisn: '63027', name: 'Sendy Alghifari', studentClass: 'XI-G', gender: 'L', hasVoted: false },

  // XI-H
  { id: 'voter-63028', nisn: '63028', name: 'Akhdan Fahreza', studentClass: 'XI-H', gender: 'L', hasVoted: false },
  { id: 'voter-63029', nisn: '63029', name: 'Alena Syakirah D.S.', studentClass: 'XI-H', gender: 'P', hasVoted: false },
  { id: 'voter-63030', nisn: '63030', name: 'Silmi Ayuni Inayah', studentClass: 'XI-H', gender: 'P', hasVoted: false },
  { id: 'voter-63031', nisn: '63031', name: 'Syafa Carisa Aneira Dewi', studentClass: 'XI-H', gender: 'P', hasVoted: false },

  // XI-I
  { id: 'voter-63032', nisn: '63032', name: 'Messi', studentClass: 'XI-I', gender: 'L', hasVoted: false },

  // XI-J
  { id: 'voter-63033', nisn: '63033', name: 'Airin Putri Jumiati', studentClass: 'XI-J', gender: 'P', hasVoted: false },
  { id: 'voter-63034', nisn: '63034', name: 'Marliana', studentClass: 'XI-J', gender: 'P', hasVoted: false },
  { id: 'voter-63035', nisn: '63035', name: 'Zaiza Kirana Putri', studentClass: 'XI-J', gender: 'P', hasVoted: false },

  // ==========================================
  // KELAS XII (Angkatan 62) - NIS 62001 .. 62016
  // ==========================================
  // XII-A
  { id: 'voter-62001', nisn: '62001', name: 'Alfatira Milano', studentClass: 'XII-A', gender: 'L', hasVoted: false },
  { id: 'voter-62002', nisn: '62002', name: 'Muhammad Lailul Mustafid', studentClass: 'XII-A', gender: 'L', hasVoted: false },
  { id: 'voter-62003', nisn: '62003', name: 'Naufal Rifqii Al-Fathir', studentClass: 'XII-A', gender: 'L', hasVoted: false },
  { id: 'voter-62004', nisn: '62004', name: 'Petrus Suryanto Marbun', studentClass: 'XII-A', gender: 'L', hasVoted: false },

  // XII-B
  { id: 'voter-62005', nisn: '62005', name: 'Fauzi Muzakki', studentClass: 'XII-B', gender: 'L', hasVoted: false },

  // XII-D
  { id: 'voter-62006', nisn: '62006', name: 'Muhammad Eka Nugraha', studentClass: 'XII-D', gender: 'L', hasVoted: false },

  // XII-E
  { id: 'voter-62007', nisn: '62007', name: 'Dwie Fany A.S.', studentClass: 'XII-E', gender: 'P', hasVoted: false },

  // XII-F
  { id: 'voter-62008', nisn: '62008', name: 'Agung Desgukara', studentClass: 'XII-F', gender: 'L', hasVoted: false },
  { id: 'voter-62009', nisn: '62009', name: 'Alvin Fadillah', studentClass: 'XII-F', gender: 'L', hasVoted: false },

  // XII-G
  { id: 'voter-62010', nisn: '62010', name: 'Al Zaira Qurrotulaini', studentClass: 'XII-G', gender: 'P', hasVoted: false },
  { id: 'voter-62011', nisn: '62011', name: 'Lusiana Tambunan', studentClass: 'XII-G', gender: 'P', hasVoted: false },
  { id: 'voter-62012', nisn: '62012', name: 'Wulan Intan Sapitri', studentClass: 'XII-G', gender: 'P', hasVoted: false },

  // XII-H
  { id: 'voter-62013', nisn: '62013', name: 'Reggina Azzahra Cecilia Putri', studentClass: 'XII-H', gender: 'P', hasVoted: false },

  // XII-J
  { id: 'voter-62014', nisn: '62014', name: 'Muhammad Afgan', studentClass: 'XII-J', gender: 'L', hasVoted: false },
  { id: 'voter-62015', nisn: '62015', name: 'Shepia Cahaya Ramadhani', studentClass: 'XII-J', gender: 'P', hasVoted: false },

  // XII-K
  { id: 'voter-62016', nisn: '62016', name: 'Annisa Aulia Syakira', studentClass: 'XII-K', gender: 'P', hasVoted: false },
];
