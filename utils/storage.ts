// Simple storage utility that works across platforms
// Uses localStorage for web and a simple in-memory fallback

interface StorageData {
  [key: string]: string;
}

let memoryStorage: StorageData = {};

const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    } catch {
      return memoryStorage[key] || null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        window.localStorage.setItem(key, value);
      }
      memoryStorage[key] = value;
    } catch {
      memoryStorage[key] = value;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },

  clear: async (): Promise<void> => {
    try {
      if (isWeb) {
        window.localStorage.clear();
      }
      memoryStorage = {};
    } catch {
      memoryStorage = {};
    }
  },
};

export default AsyncStorage;
