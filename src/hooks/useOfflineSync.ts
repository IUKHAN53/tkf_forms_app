import { useCallback, useEffect, useRef } from 'react';
import { submitForm } from '../api/forms';
import { useOfflineQueueStore } from '../store/offlineQueueStore';

export function useOfflineSync(isAuthenticated: boolean) {
  const { queue, loadQueue, removeFromQueue, setLastSync, setSyncStatus } = useOfflineQueueStore();
  const syncing = useRef(false);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const sync = useCallback(async () => {
    if (!isAuthenticated || syncing.current || queue.length === 0) return;
    syncing.current = true;
    setSyncStatus('syncing');
    let hadError = false;
    try {
      for (const item of queue) {
        try {
          const payload = JSON.parse(item.payload);
          await submitForm(item.formId, payload);
          if (item.id) {
            await removeFromQueue(item.id);
          }
          setLastSync(new Date().toISOString());
        } catch (err) {
          // stop processing on first failure to retry later
          setSyncStatus('error');
          hadError = true;
          break;
        }
      }
      if (!hadError) {
        setSyncStatus('idle');
      }
    } finally {
      syncing.current = false;
    }
  }, [isAuthenticated, queue, removeFromQueue, setLastSync, setSyncStatus]);

  useEffect(() => {
    sync();
  }, [sync]);
}
