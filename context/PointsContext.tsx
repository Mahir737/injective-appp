import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@/utils/storage';

interface PointsContextType {
  points: number;
  level: number;
  streak: number;
  badges: string[];
  addPoints: (amount: number, action: string) => void;
  checkStreak: () => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const BADGE_THRESHOLDS: { [key: string]: { points: number; name: string } } = {
  first_action: { points: 10, name: 'First Steps' },
  explorer: { points: 100, name: 'Explorer' },
  trader: { points: 500, name: 'Trader' },
  whale: { points: 1000, name: 'Whale' },
  legend: { points: 5000, name: 'Legend' },
};

const ACTION_BADGES: { [key: string]: string } = {
  wallet_create: 'Wallet Creator',
  wallet_import: 'Wallet Importer',
  transaction_send: 'First Transaction',
  dapp_visit: 'DApp Explorer',
  bookmark_add: 'Bookmarker',
};

export function PointsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate level based on points
    const newLevel = Math.floor(points / 1000) + 1;
    setLevel(newLevel);
  }, [points]);

  const loadData = async () => {
    try {
      const savedPoints = await AsyncStorage.getItem('points');
      const savedStreak = await AsyncStorage.getItem('streak');
      const savedBadges = await AsyncStorage.getItem('badges');
      const savedLastActive = await AsyncStorage.getItem('lastActiveDate');
      const savedActions = await AsyncStorage.getItem('actionHistory');

      if (savedPoints) setPoints(parseInt(savedPoints, 10));
      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (savedBadges) setBadges(JSON.parse(savedBadges));
      if (savedLastActive) setLastActiveDate(savedLastActive);
      if (savedActions) setActionHistory(JSON.parse(savedActions));

      checkStreak();
    } catch (error) {
      console.log('Error loading points data');
    }
  };

  const saveData = async (
    newPoints: number,
    newStreak: number,
    newBadges: string[],
    newActions: string[]
  ) => {
    try {
      await AsyncStorage.setItem('points', newPoints.toString());
      await AsyncStorage.setItem('streak', newStreak.toString());
      await AsyncStorage.setItem('badges', JSON.stringify(newBadges));
      await AsyncStorage.setItem('lastActiveDate', new Date().toDateString());
      await AsyncStorage.setItem('actionHistory', JSON.stringify(newActions));
    } catch (error) {
      console.log('Error saving points data');
    }
  };

  const checkStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActiveDate === yesterday) {
      // Continue streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastActiveDate(today);
    } else if (lastActiveDate !== today) {
      // Reset streak
      setStreak(1);
      setLastActiveDate(today);
    }
  };

  const addPoints = (amount: number, action: string) => {
    const newPoints = points + amount;
    setPoints(newPoints);

    // Check for new badges
    const newBadges = [...badges];
    const newActions = [...actionHistory];

    // Check action-based badges
    if (ACTION_BADGES[action] && !newBadges.includes(ACTION_BADGES[action])) {
      newBadges.push(ACTION_BADGES[action]);
    }

    // Check points-based badges
    Object.entries(BADGE_THRESHOLDS).forEach(([key, { points: threshold, name }]) => {
      if (newPoints >= threshold && !newBadges.includes(name)) {
        newBadges.push(name);
      }
    });

    // Track action
    if (!newActions.includes(action)) {
      newActions.push(action);
    }

    setBadges(newBadges);
    setActionHistory(newActions);
    saveData(newPoints, streak, newBadges, newActions);
  };

  return (
    <PointsContext.Provider
      value={{
        points,
        level,
        streak,
        badges,
        addPoints,
        checkStreak,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
