import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: '홈', icon: 'fas fa-home' },
    { id: 'challenges', label: '챌린지', icon: 'fas fa-trophy' },
    { id: 'group', label: '그룹', icon: 'fas fa-users' },
    { id: 'profile', label: '프로필', icon: 'fas fa-user' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center p-2 transition-colors",
              activeTab === tab.id
                ? "text-primary"
                : "text-neutral-400 hover:text-primary"
            )}
          >
            <i className={`${tab.icon} text-xl mb-1`}></i>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
