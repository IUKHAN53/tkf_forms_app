import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('offline_queue.db');

type QueuedSubmission = {
  id?: number;
  formId: number;
  payload: string; // JSON stringified
};

const ensureTable = async () => {
  if (db.withTransactionAsync && db.execAsync) {
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, formId INTEGER, payload TEXT);'
    );
  } else {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, formId INTEGER, payload TEXT);'
      );
    });
  }
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
    await ensureTable();
    if (db.getAllAsync) {
      const result = await db.getAllAsync<QueuedSubmission>('SELECT * FROM submissions');
      set({ queue: result ?? [] });
    } else {
      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM submissions', [], (_, res) => {
          const rows = [] as QueuedSubmission[];
          for (let i = 0; i < res.rows.length; i += 1) {
            rows.push(res.rows.item(i) as QueuedSubmission);
          }
          set({ queue: rows });
        });
      });
    }
  },
  addToQueue: async (formId, payload) => {
    await ensureTable();
    const payloadStr = JSON.stringify(payload);
    if (db.runAsync) {
      const res = await db.runAsync('INSERT INTO submissions (formId, payload) VALUES (?, ?)', [formId, payloadStr]);
      set({ queue: [...get().queue, { id: res?.lastInsertRowId, formId, payload: payloadStr }] });
    } else {
      db.transaction((tx) => {
        tx.executeSql('INSERT INTO submissions (formId, payload) VALUES (?, ?)', [formId, payloadStr], (_, res) => {
          set({ queue: [...get().queue, { id: res.insertId, formId, payload: payloadStr }] });
        });
      });
    }
  },
  removeFromQueue: async (id) => {
    await ensureTable();
    if (db.runAsync) {
      await db.runAsync('DELETE FROM submissions WHERE id = ?', [id]);
    } else {
      db.transaction((tx) => {
        tx.executeSql('DELETE FROM submissions WHERE id = ?', [id]);
      });
    }
    set({ queue: get().queue.filter((item) => item.id !== id) });
  },
}));
