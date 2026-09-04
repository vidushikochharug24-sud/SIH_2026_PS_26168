import { useEffect, useRef, useState } from 'react';
import { useReplayStore } from '../state/replayStore';

const API_BASE = 'http://localhost:8000/api/replay';
const WS_URL = 'ws://localhost:8000/ws/replay';

export function useReplaySocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const processTickPayload = useReplayStore((s) => s.processTickPayload);
  const setTripBounds = useReplayStore((s) => s.setTripBounds);
  const resetState = useReplayStore((s) => s.resetState);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to IDR WebSocket backend stream.');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'bounds') {
          setTripBounds(msg.data);
        } else if (msg.type === 'tick') {
          processTickPayload(msg.data);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('IDR WebSocket disconnected.');
    };

    return () => {
      ws.close();
    };
  }, [processTickPayload, setTripBounds]);

  const startReplay = async () => {
    try {
      await fetch(`${API_BASE}/start`, { method: 'POST' });
    } catch (e) {
      console.error('Error starting replay:', e);
    }
  };

  const pauseReplay = async () => {
    try {
      await fetch(`${API_BASE}/pause`, { method: 'POST' });
    } catch (e) {
      console.error('Error pausing replay:', e);
    }
  };

  const resetReplay = async () => {
    try {
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
      resetState();
    } catch (e) {
      console.error('Error resetting replay:', e);
    }
  };

  const triggerOutage = async (durationSec: number = 30) => {
    try {
      await fetch(`${API_BASE}/outage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_sec: durationSec }),
      });
    } catch (e) {
      console.error('Error triggering outage:', e);
    }
  };

  const restoreGnss = async () => {
    try {
      await fetch(`${API_BASE}/restore`, { method: 'POST' });
    } catch (e) {
      console.error('Error restoring GNSS:', e);
    }
  };

  const updateOutageDuration = async (durationSec: number) => {
    try {
      await fetch(`${API_BASE}/outage-duration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_sec: durationSec }),
      });
    } catch (e) {
      console.error('Error setting outage duration:', e);
    }
  };

  return {
    isConnected,
    startReplay,
    pauseReplay,
    resetReplay,
    triggerOutage,
    restoreGnss,
    updateOutageDuration,
  };
}
