import { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { BottomNavigation } from '@/components/BottomNavigation';
import { HomeTab } from '@/components/HomeTab';
import { ChallengeSubmissionModal } from '@/components/ChallengeSubmissionModal';
import { GroupTab } from '@/components/GroupTab';
import { ProfileTab } from '@/components/ProfileTab';
import { useAuthDatabase } from '@/hooks/useAuthDatabase';
import { Challenge } from '@shared/schema';

export default function Home() {
  const { user, loading } = useAuthDatabase();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  const handleStartChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowSubmissionModal(true);
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionModal(false);
    setSelectedChallenge(null);
    // Optionally refresh data here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-white text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p className="text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Tab Content */}
      {activeTab === 'home' && (
        <HomeTab onStartChallenge={handleStartChallenge} />
      )}
      {activeTab === 'challenges' && (
        <HomeTab onStartChallenge={handleStartChallenge} />
      )}
      {activeTab === 'group' && <GroupTab />}
      {activeTab === 'profile' && <ProfileTab />}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Challenge Submission Modal */}
      <ChallengeSubmissionModal
        challenge={selectedChallenge}
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        onSubmitSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}
