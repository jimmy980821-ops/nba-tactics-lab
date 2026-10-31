import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { advancePlayback, usePlayback } from '../store';
/** One RAF clock drives both comparison boards. No timer per player or event. */
export function usePlaybackClock(duration: number, secondaryDuration: number, secondaryPlaying: boolean, sync: boolean, setSecondaryTime: Dispatch<SetStateAction<number>>) {
    const playing = usePlayback(s => s.playing);
    useEffect(() => {
        if (!playing && (!secondaryPlaying || sync))
            return;
        let frame = 0, last: number | null = null;
        function tick(now: number) {
            if (last !== null) {
                const elapsed = Math.min((now - last) / 1000, .1), state = usePlayback.getState();
                if (state.playing)
                    state.set(advancePlayback(state, elapsed, duration));
                if (secondaryPlaying && !sync)
                    setSecondaryTime(t => Math.min(secondaryDuration, t + elapsed * state.speed));
            }
            last = now;
            frame = requestAnimationFrame(tick);
        }
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [duration, secondaryDuration, playing, secondaryPlaying, sync, setSecondaryTime]);
}
