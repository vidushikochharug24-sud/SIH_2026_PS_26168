import { create } from 'zustand';
import { Point } from '../lib/glowLine';

export interface LiveMetrics {
  elapsed_outage: number;
  distance: number;
  dr_error: number;
  ai_error: number;
  drift_reduction: number;
}

export interface FinalMetrics {
  mean_dr_err: number;
  mean_ai_err: number;
  max_dr_err: number;
  max_ai_err: number;
  overall_drift_reduction: number;
}

export interface EventLogItem {
  id: string;
  time: string;
  text: string;
  type: 'init' | 'outage' | 'restore' | 'info';
}

export interface TripBounds {
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

interface ReplayStoreState {
  currentView: 'landing' | 'predictor';
  gnssStatus: 'IDLE' | 'REPLAYING' | 'OUTAGE' | 'RESTORED';
  stepIdx: number;
  totalSteps: number;
  aiTrajectory: Point[];
  drTrajectory: Point[];
  gtTrajectory: Point[];
  accelHistory: number[];
  gyroHistory: number[];
  velHistory: number[];
  dispHistory: number[];
  liveMetrics: LiveMetrics;
  eventLogs: EventLogItem[];
  finalMetrics: FinalMetrics | null;
  tripBounds: TripBounds | null;
  outageDurationSec: number;

  // Actions
  setStoreView: (view: 'landing' | 'predictor') => void;
  setTripBounds: (bounds: TripBounds) => void;
  setOutageDuration: (durationSec: number) => void;
  processTickPayload: (data: any) => void;
  resetState: () => void;
}

export const useReplayStore = create<ReplayStoreState>((set) => ({
  currentView: 'landing',
  gnssStatus: 'IDLE',
  stepIdx: 0,
  totalSteps: 1200,
  aiTrajectory: [],
  drTrajectory: [],
  gtTrajectory: [],
  accelHistory: [],
  gyroHistory: [],
  velHistory: [],
  dispHistory: [],
  liveMetrics: {
    elapsed_outage: 0,
    distance: 0,
    dr_error: 0,
    ai_error: 0,
    drift_reduction: 0,
  },
  eventLogs: [
    { id: '1', time: new Date().toLocaleTimeString(), text: 'System initialized. Ready to connect.', type: 'init' }
  ],
  finalMetrics: null,
  tripBounds: null,
  outageDurationSec: 30,

  setStoreView: (view) => set({ currentView: view }),
  setTripBounds: (bounds) => set({ tripBounds: bounds }),
  setOutageDuration: (durationSec) => set({ outageDurationSec: durationSec }),

  resetState: () => set({
    gnssStatus: 'IDLE',
    stepIdx: 0,
    aiTrajectory: [],
    drTrajectory: [],
    gtTrajectory: [],
    accelHistory: [],
    gyroHistory: [],
    velHistory: [],
    dispHistory: [],
    liveMetrics: { elapsed_outage: 0, distance: 0, dr_error: 0, ai_error: 0, drift_reduction: 0 },
    finalMetrics: null,
    eventLogs: [{ id: Date.now().toString(), time: new Date().toLocaleTimeString(), text: 'Replay state reset.', type: 'init' }]
  }),

  processTickPayload: (data: any) => set((state) => {
    const timeStr = new Date().toLocaleTimeString();

    const newAi = [...state.aiTrajectory, { x: data.ai_pos.x, y: data.ai_pos.y }];
    const newDr = [...state.drTrajectory, { x: data.dr_pos.x, y: data.dr_pos.y }];
    const newGt = [...state.gtTrajectory, { x: data.gt_pos.x, y: data.gt_pos.y }];

    const newAccel = [...state.accelHistory.slice(-59), data.accel_mag];
    const newGyro = [...state.gyroHistory.slice(-59), data.gyro_mag];
    const newVel = [...state.velHistory.slice(-59), data.pred_vel];
    const newDisp = [...state.dispHistory.slice(-59), data.pred_disp];

    let newLogs = [...state.eventLogs];
    if (data.event) {
      newLogs.unshift({
        id: Math.random().toString(),
        time: timeStr,
        text: data.event,
        type: data.event_type || 'info',
      });
      if (newLogs.length > 40) newLogs.pop();
    }

    return {
      gnssStatus: data.gnss_status,
      stepIdx: data.step_idx,
      totalSteps: data.total_steps,
      aiTrajectory: newAi,
      drTrajectory: newDr,
      gtTrajectory: newGt,
      accelHistory: newAccel,
      gyroHistory: newGyro,
      velHistory: newVel,
      dispHistory: newDisp,
      liveMetrics: data.metrics,
      eventLogs: newLogs,
      finalMetrics: data.final_metrics ? data.final_metrics : state.finalMetrics
    };
  })
}));
