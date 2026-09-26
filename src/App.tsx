/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Vote, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  Candidate, 
  VoterInfo, 
  VoteRecord, 
  SupabaseConfig, 
  RegisteredVoter, 
  ElectionSettings, 
  AuthSession 
} from './types';
import { storageService } from './services/storageService';

import { Header } from './components/Header';
import { LoginPage } from './components/Auth/LoginPage';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';
import { VoterRegistration } from './components/VoterRegistration';
import { CandidateSection } from './components/CandidateSection';
import { ReviewConfirmModal } from './components/ReviewConfirmModal';
import { VotingSuccessReceipt } from './components/VotingSuccessReceipt';
import { QuickCountView } from './components/QuickCountView';
import { VoterListView } from './components/VoterListView';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';

export default function App() {
  // Authentication & Session State
  const [session, setSession] = useState<AuthSession>(() => storageService.getAuthSession());

  // Navigation Tabs: 'login' | 'vote' | 'admin' | 'quick-count' | 'voter-list'
  const [activeTab, setActiveTab] = useState<'login' | 'vote' | 'admin' | 'quick-count' | 'voter-list'>(() => {
    const s = storageService.getAuthSession();
    if (s.role === 'admin') return 'admin';
    if (s.role === 'voter') return 'vote';
    return 'login';
  });

  // Election Settings
  const [electionSettings, setElectionSettings] = useState<ElectionSettings>(() => storageService.getElectionSettings());

  // Candidate Data State
  const [candidates, setCandidates] = useState<Candidate[]>(() => storageService.getCandidates());

  // Registered Voters (DPT) State
  const [registeredVoters, setRegisteredVoters] = useState<RegisteredVoter[]>(() => storageService.getRegisteredVoters());

  // Voting Sub-steps: 'voting' | 'success'
  const [voteSubStep, setVoteSubStep] = useState<'voting' | 'success'>('voting');

  // Active Voter info
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(() => {
    const s = storageService.getAuthSession();
    if (s.role === 'voter' && s.voter) {
      return {
        name: s.voter.name,
        nisn: s.voter.nisn,
        studentClass: s.voter.studentClass,
        gender: s.voter.gender,
      };
    }
    return null;
  });

  const [selectedPutra, setSelectedPutra] = useState<Candidate | null>(null);
  const [selectedPutri, setSelectedPutri] = useState<Candidate | null>(null);

  // Review Modal State (Center modal, zero obstruction)
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastVoteReceipt, setLastVoteReceipt] = useState<VoteRecord | null>(null);

  // Database / Supabase State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => storageService.getSupabaseConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [allVotes, setAllVotes] = useState<VoteRecord[]>(() => storageService.getLocalVotes());
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);

  // Refresh votes & DPT
  const refreshAllData = useCallback(async () => {
    setIsLoadingVotes(true);
    try {
      const records = await storageService.getAllVotes();
      setAllVotes(records);
      setCandidates(storageService.getCandidates());
      setRegisteredVoters(storageService.getRegisteredVoters());
      setElectionSettings(storageService.getElectionSettings());
      setSupabaseConfig(storageService.getSupabaseConfig());
    } catch (e) {
      console.error('Gagal memuat data:', e);
      setAllVotes(storageService.getLocalVotes());
    } finally {
      setIsLoadingVotes(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // LOGIN HANDLERS
  const handleVoterLoginSuccess = (voter: RegisteredVoter) => {
    const newSession: AuthSession = { role: 'voter', voter };
    setSession(newSession);
    storageService.setAuthSession(newSession);

    setVoterInfo({
      name: voter.name,
      nisn: voter.nisn,
      studentClass: voter.studentClass,
      gender: voter.gender,
    });

    // Jika siswa sudah pernah vote, cek bukti suaranya
    if (voter.hasVoted) {
      const existingVote = allVotes.find(v => v.nisn.toLowerCase() === voter.nisn.toLowerCase());
      if (existingVote) {
        setLastVoteReceipt(existingVote);
        setVoteSubStep('success');
      } else {
        setVoteSubStep('voting');
      }
    } else {
      setLastVoteReceipt(null);
      setVoteSubStep('voting');
    }

    setActiveTab('vote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = () => {
    const newSession: AuthSession = { role: 'admin', adminUsername: 'admin' };
    setSession(newSession);
    storageService.setAuthSession(newSession);
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    storageService.clearAuthSession();
    setSession({ role: 'guest' });
    setVoterInfo(null);
    setSelectedPutra(null);
    setSelectedPutri(null);
    setLastVoteReceipt(null);
    setSubmitError(null);
    setActiveTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Suara Sah
  const handleConfirmVoteSubmit = async () => {
    if (!voterInfo || !selectedPutra || !selectedPutri) {
      setSubmitError('Pastikan data diri dan kedua pilihan kandidat telah lengkap.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await storageService.submitVote(
        voterInfo,
        { id: selectedPutra.id, name: selectedPutra.name, number: selectedPutra.number },
        { id: selectedPutri.id, name: selectedPutri.name, number: selectedPutri.number }
      );

      // Berhasil
      setLastVoteReceipt(result.record);
      setIsReviewOpen(false);
      setVoteSubStep('success');

      // Update sesi pemilih agar tercatat hasVoted
      if (session.voter) {
        const updatedVoter = {
          ...session.voter,
          hasVoted: true,
          voteCode: result.record.voteCode,
          votedAt: result.record.createdAt,
        };
        const updatedSession: AuthSession = { ...session, voter: updatedVoter };
        setSession(updatedSession);
        storageService.setAuthSession(updatedSession);
      }

      // Refresh data
      await refreshAllData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menyimpan suara.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset untuk Pemilih Berikutnya (Selesai vote)
  const handleResetForNextVoter = () => {
    handleLogout();
  };

  // ADMIN ACTIONS
  const handleSaveCandidates = (updatedList: Candidate[]) => {
    storageService.saveCandidates(updatedList);
    setCandidates(updatedList);
  };

  const handleResetCandidates = () => {
    storageService.resetCandidates();
    setCandidates(storageService.getCandidates());
  };

  const handleAddVoter = (voterData: Omit<RegisteredVoter, 'id' | 'hasVoted'>) => {
    storageService.addRegisteredVoter(voterData);
    setRegisteredVoters(storageService.getRegisteredVoters());
  };

  const handleUpdateVoter = (voter: RegisteredVoter) => {
    storageService.updateRegisteredVoter(voter);
    setRegisteredVoters(storageService.getRegisteredVoters());
  };

  const handleDeleteVoter = async (id: string) => {
    await storageService.deleteRegisteredVoter(id);
    setRegisteredVoters(storageService.getRegisteredVoters());
    setAllVotes(storageService.getLocalVotes());
    await refreshAllData();
  };

  const handleResetVoterStatus = async (nisn: string) => {
    await storageService.resetVoterVoteStatus(nisn);
    setRegisteredVoters(storageService.getRegisteredVoters());
    setAllVotes(storageService.getLocalVotes());
    await refreshAllData();
  };

  const handleResetAllVotersToDefault = async () => {
    storageService.resetRegisteredVotersToDefault();
    setRegisteredVoters(storageService.getRegisteredVoters());
    await refreshAllData();
  };

  const handleDeleteAllVoters = async () => {
    storageService.deleteAllRegisteredVoters();
    setRegisteredVoters([]);
    await refreshAllData();
  };

  const handleSaveSettings = (newSettings: ElectionSettings) => {
    storageService.saveElectionSettings(newSettings);
    setElectionSettings(newSettings);
  };

  const handleResetAllVotes = async () => {
    // Segera nol-kan state lokal di React agar UI langsung 0 suara
    setAllVotes([]);
    setLastVoteReceipt(null);
    if (session.role === 'voter' && session.voter) {
      const updatedVoter = { ...session.voter, hasVoted: false, voteCode: undefined, votedAt: undefined };
      const updatedSession: AuthSession = { ...session, voter: updatedVoter };
      setSession(updatedSession);
      storageService.setAuthSession(updatedSession);
    }
    await storageService.resetAllVotes();
    setRegisteredVoters(storageService.getRegisteredVoters());
    await refreshAllData();
  };

  const handleSeedSampleVotes = async () => {
    storageService.seedSampleVotes();
    setAllVotes(storageService.getLocalVotes());
    setRegisteredVoters(storageService.getRegisteredVoters());
    await refreshAllData();
  };

  const handleDeleteSingleVote = async (voteCode: string) => {
    await storageService.deleteVoteByCode(voteCode);
    setAllVotes(storageService.getLocalVotes());
    setRegisteredVoters(storageService.getRegisteredVoters());
    await refreshAllData();
  };

  const unsyncedCount = allVotes.filter(v => !v.syncedToSupabase).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Header Utama */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'vote' && tab !== 'login') {
            refreshAllData();
          }
        }}
        supabaseConfig={supabaseConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalVotesCount={allVotes.length}
        session={session}
        onLogout={handleLogout}
        schoolName={electionSettings.schoolName}
        schoolLogoUrl={electionSettings.schoolLogoUrl}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Error Notification if any */}
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm font-semibold leading-relaxed">
              {submitError}
            </div>
          </div>
        )}

        {/* 1. HALAMAN LOGIN (SISWA & ADMIN) */}
        {activeTab === 'login' && (
          <LoginPage
            electionSettings={electionSettings}
            onVoterLoginSuccess={handleVoterLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onViewPublicQuickCount={() => {
              setActiveTab('quick-count');
              refreshAllData();
            }}
          />
        )}

        {/* 2. PANEL ADMIN */}
        {activeTab === 'admin' && (
          session.role === 'admin' ? (
            <AdminDashboard
              candidates={candidates}
              voters={registeredVoters}
              settings={electionSettings}
              votes={allVotes}
              supabaseConfig={supabaseConfig}
              onSaveCandidates={handleSaveCandidates}
              onResetCandidates={handleResetCandidates}
              onAddVoter={handleAddVoter}
              onUpdateVoter={handleUpdateVoter}
              onDeleteVoter={handleDeleteVoter}
              onResetVoterStatus={handleResetVoterStatus}
              onResetAllVotersToDefault={handleResetAllVotersToDefault}
              onDeleteAllVoters={handleDeleteAllVoters}
              onSaveSettings={handleSaveSettings}
              onResetAllVotes={handleResetAllVotes}
              onSeedSampleVotes={handleSeedSampleVotes}
              onOpenSupabaseSettings={() => setIsSettingsOpen(true)}
              onLogoutAdmin={handleLogout}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Akses Dibatasi</h2>
              <p className="text-slate-500 text-sm mt-1">Anda harus login sebagai Admin / Panitia untuk membuka panel ini.</p>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Ke Halaman Login
              </button>
            </div>
          )
        )}

        {/* 3. BILIK SUARA (VOTING FLOW) */}
        {activeTab === 'vote' && (
          session.role === 'voter' && voterInfo ? (
            <>
              {voteSubStep === 'voting' && (
                <CandidateSection
                  voterInfo={voterInfo}
                  candidates={candidates}
                  selectedPutra={selectedPutra}
                  selectedPutri={selectedPutri}
                  onSelectPutra={(c) => setSelectedPutra(c)}
                  onSelectPutri={(c) => setSelectedPutri(c)}
                  onBackToRegistration={handleLogout}
                  onProceedToReview={() => setIsReviewOpen(true)}
                />
              )}

              {voteSubStep === 'success' && lastVoteReceipt && (
                <VotingSuccessReceipt
                  voteRecord={lastVoteReceipt}
                  onResetForNextVoter={handleResetForNextVoter}
                  onViewQuickCount={() => {
                    setActiveTab('quick-count');
                    refreshAllData();
                  }}
                  schoolName={electionSettings.schoolName}
                  schoolLogoUrl={electionSettings.schoolLogoUrl}
                />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Silakan Login Terlebih Dahulu</h2>
              <p className="text-slate-500 text-sm mt-1">Masukkan NISN Anda untuk memverifikasi hak suara di bilik suara.</p>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-700/20"
              >
                Login Siswa Sekarang
              </button>
            </div>
          )
        )}

        {/* 4. QUICK COUNT (HASIL REAL-TIME) */}
        {activeTab === 'quick-count' && (
          <QuickCountView
            candidates={candidates}
            votes={allVotes}
            onRefresh={refreshAllData}
            isLoading={isLoadingVotes}
            onResetVotes={handleResetAllVotes}
            isAdmin={session.role === 'admin'}
          />
        )}

        {/* 5. DATA PEMILIH (LOG AUDIT) */}
        {activeTab === 'voter-list' && (
          <VoterListView
            votes={allVotes}
            onRefresh={refreshAllData}
            isLoading={isLoadingVotes}
            onDeleteVote={handleDeleteSingleVote}
            onResetAllVotes={handleResetAllVotes}
            isAdmin={session.role === 'admin'}
          />
        )}

      </main>

      {/* Review Confirmation Modal (Fixed Center Overlay, NO Obstructing Cards) */}
      {voterInfo && (
        <ReviewConfirmModal
          isOpen={isReviewOpen}
          isSubmitting={isSubmitting}
          voterInfo={voterInfo}
          selectedPutra={selectedPutra}
          selectedPutri={selectedPutri}
          onClose={() => setIsReviewOpen(false)}
          onConfirmSubmit={handleConfirmVoteSubmit}
        />
      )}

      {/* Supabase Database Settings Modal */}
      <DatabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={supabaseConfig}
        onSaveConfig={(url, anonKey, tableName) => {
          storageService.saveSupabaseConfig(url, anonKey, tableName);
          setSupabaseConfig(storageService.getSupabaseConfig());
          refreshAllData();
        }}
        onSyncComplete={() => refreshAllData()}
        unsyncedCount={unsyncedCount}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-white">E-Badminton Voting System</span>
            <span>•</span>
            <span>Komisi Pemilihan Ketua Ekstrakurikuler</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Luber Jurdil</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('login')}
              className="text-slate-300 hover:text-white"
            >
              Halaman Login
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Pengaturan Supabase
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
