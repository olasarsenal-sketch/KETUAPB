export interface Candidate {
  id: string;
  category: 'putra' | 'putri';
  number: string; // e.g. "01", "02", "03"
  name: string;
  nickname: string;
  classGrade: string;
  photoUrl: string;
  motto: string;
  vision: string;
  missions: string[];
  achievements: string[];
  racketSpecialty: string; // e.g. "Tunggal Putra / Smash Power", "Ganda Campuran / Playmaker"
}

export interface VoterInfo {
  name: string;
  nisn: string;
  studentClass: string;
  gender: 'L' | 'P';
}

export interface VoteRecord {
  id: string;
  voteCode: string;
  createdAt: string;
  voterName: string;
  nisn: string;
  studentClass: string;
  candidatePutraId: string;
  candidatePutraName: string;
  candidatePutraNumber: string;
  candidatePutriId: string;
  candidatePutriName: string;
  candidatePutriNumber: string;
  syncedToSupabase: boolean;
  userAgent?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  isConnected: boolean;
}

export interface RegisteredVoter {
  id: string;
  nisn: string;
  name: string;
  studentClass: string;
  gender: 'L' | 'P';
  hasVoted: boolean;
  voteCode?: string;
  votedAt?: string;
}

export interface ElectionSettings {
  isVotingOpen: boolean;
  title: string;
  academicYear: string;
  schoolName: string;
  schoolLogoUrl: string;
  allowSelfRegistration: boolean; // if true, new students can register at login
  closedMessage: string;
}

export type UserRole = 'guest' | 'voter' | 'admin';

export interface AuthSession {
  role: UserRole;
  voter?: RegisteredVoter;
  adminUsername?: string;
}

