import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@/utils/storage';

interface Token {
  name: string;
  symbol: string;
  balance: string;
  value: number;
  icon?: string;
}

interface WalletData {
  address: string;
  mnemonic: string;
}

interface WalletContextType {
  wallet: WalletData | null;
  balance: number;
  tokens: Token[];
  createWallet: () => Promise<string | null>;
  importWallet: (mnemonic: string) => Promise<boolean>;
  deleteWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const MOCK_TOKENS: Token[] = [
  { name: 'Injective', symbol: 'INJ', balance: '125.50', value: 3082.28 },
  { name: 'Tether USD', symbol: 'USDT', balance: '500.00', value: 500.00 },
  { name: 'USD Coin', symbol: 'USDC', balance: '250.00', value: 250.00 },
  { name: 'Wrapped Ethereum', symbol: 'WETH', balance: '0.5', value: 1250.00 },
];

// Simple mnemonic generator for demo purposes
const generateMnemonic = (): string => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  ];
  
  const mnemonic: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    mnemonic.push(words[randomIndex]);
  }
  return mnemonic.join(' ');
};

// Simple address generator for demo purposes
const generateAddress = (mnemonic: string): string => {
  const hash = mnemonic.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const addressPart = Math.abs(hash).toString(16).padStart(38, '0').slice(0, 38);
  return `inj1${addressPart}`;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS);

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (wallet) {
      calculateBalance();
    }
  }, [tokens, wallet]);

  const loadWallet = async () => {
    try {
      const savedWallet = await AsyncStorage.getItem('wallet');
      if (savedWallet) {
        setWallet(JSON.parse(savedWallet));
      }
    } catch (error) {
      console.log('Error loading wallet');
    }
  };

  const calculateBalance = () => {
    const total = tokens.reduce((acc, token) => acc + token.value, 0);
    setBalance(total);
  };

  const createWallet = async (): Promise<string | null> => {
    try {
      const mnemonic = generateMnemonic();
      const address = generateAddress(mnemonic);
      
      const newWallet: WalletData = {
        address,
        mnemonic,
      };

      await AsyncStorage.setItem('wallet', JSON.stringify(newWallet));
      setWallet(newWallet);
      return mnemonic;
    } catch (error) {
      console.log('Error creating wallet');
      return null;
    }
  };

  const importWallet = async (mnemonic: string): Promise<boolean> => {
    try {
      const words = mnemonic.trim().split(' ');
      if (words.length !== 12 && words.length !== 24) {
        return false;
      }

      const address = generateAddress(mnemonic);
      
      const newWallet: WalletData = {
        address,
        mnemonic,
      };

      await AsyncStorage.setItem('wallet', JSON.stringify(newWallet));
      setWallet(newWallet);
      return true;
    } catch (error) {
      console.log('Error importing wallet');
      return false;
    }
  };

  const deleteWallet = async () => {
    try {
      await AsyncStorage.removeItem('wallet');
      setWallet(null);
      setBalance(0);
    } catch (error) {
      console.log('Error deleting wallet');
    }
  };

  const refreshBalance = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Randomly adjust balances slightly for demo
    const updatedTokens = tokens.map((token) => ({
      ...token,
      value: token.value * (0.98 + Math.random() * 0.04),
    }));
    setTokens(updatedTokens);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        tokens,
        createWallet,
        importWallet,
        deleteWallet,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
