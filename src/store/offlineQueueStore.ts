import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  // Prevent multiple concurrent initialization attempts
  if (dbInitPromise) {
    return dbInitPromise;
  }
  
  if (db) {
    return db;
  }

  dbInitPromise = (async () => {
    try {
      const database = await SQLite.openDatabaseAsync('offline_queue.db');
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, formId INTEGER, payload TEXT);'
      );
      db = database;
      return database;
    } catch (error) {
      console.warn('Failed to initialize SQLite database:', error);
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
};

type QueuedSubmission = {
  id?: number;
  formId: number;
  payload: string; // JSON stringified
};

interface OfflineQueueState {
  queue: QueuedSubmission[];
  addToQueue: (formId: number, payload: object) => Promise<void>;
  removeFromQueue: (id: number) => Promise<void>;
  loadQueue: () => Promise<void>;
  setLastSync: (iso: string | null) => void;
  lastSyncAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>((set, get) => ({
  queue: [],
  lastSyncAt: null,
  syncStatus: 'idle',
  setLastSync: (iso) => set({ lastSyncAt: iso }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  loadQueue: async () => {
    try {
      const database = await getDb();
      const result = await database.getAllAsync<QueuedSubmission>('SELECT * FROM submissions');
      set({ queue: result ?? [] });
    } catch (e) {
      console.warn('Failed to load offline queue', e);
      set({ queue: [] });
    }
  },
  addToQueue: async (formId, payload) => {
    try {
      const database = await getDb();
      const payloadStr = JSON.stringify(payload);
      const res = await database.runAsync('INSERT INTO submissions (formId, payload) VALUES (?, ?)', [formId, payloadStr]);
      set({ queue: [...get().queue, { id: res.lastInsertRowId, formId, payload: payloadStr }] });
    } catch (e) {
      console.warn('Failed to add to offline queue', e);
    }
  },
  removeFromQueue: async (id) => {
    try {
      const database = await getDb();
      await database.runAsync('DELETE FROM submissions WHERE id = ?', [id]);
      set({ queue: get().queue.filter((item) => item.id !== id) });
    } catch (e) {
      console.warn('Failed to remove from offline queue', e);
    }
  },
}));
