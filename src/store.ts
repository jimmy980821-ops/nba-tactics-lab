import { create } from 'zustand';
export type Playback = {
    time: number;
    playing: boolean;
    speed: number;
    loop: boolean;
};
export function advancePlayback(state: Playback, elapsed: number, duration: number): Pick<Playback, 'time' | 'playing'> {
    if (!state.playing || duration <= 0)
        return { time: state.time, playing: state.playing };
    const next = state.time + Math.max(0, elapsed) * state.speed;
    if (next >= duration)
        return state.loop ? { time: next % duration, playing: true } : { time: duration, playing: false };
    return { time: next, playing: true };
}
export const usePlayback = create<Playback & {
    set: (v: Partial<Playback>) => void;
}>(set => ({ time: 0, playing: false, speed: 1, loop: false, set }));
