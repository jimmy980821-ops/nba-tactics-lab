import { describe, it, expect } from 'vitest';
import { createPickAndRoll, coverages } from '../src/tactics/pickAndRoll';
import { tactics } from '../src/data';
import { sample, validate } from '../src/engine';
import { alongPath } from '../src/animation/geometry';
import { advancePlayback } from '../src/store';
describe('professional PnR scene', () => {
    it('validates all coverage and outcome combinations', () => { for (const coverage of coverages)
        for (const outcome of tactics[0].branches) {
            const t = createPickAndRoll(tactics[0], coverage, outcome);
            expect(validate(t), `${coverage}/${outcome}`).toBe(true);
        } });
    it('keeps all ten players separated across all 24 authored coverage / outcome combinations', () => { const issues: string[] = []; for (const coverage of coverages)
        for (const outcome of tactics[0].branches) {
            const t = createPickAndRoll(tactics[0], coverage, outcome);
            let minimum = 100, detail = '';
            for (let frame = 0; frame <= 720; frame++) {
                const at = frame / 60, positions = sample(t, at).positions;
                const ids = Object.keys(positions);
                for (let i = 0; i < ids.length; i++)
                    for (let j = i + 1; j < ids.length; j++) {
                        const a = positions[ids[i]], b = positions[ids[j]], d = Math.hypot(a.x - b.x, a.y - b.y);
                        if (d < minimum) {
                            minimum = d;
                            detail = `${at.toFixed(2)}s ${ids[i]}/${ids[j]}`;
                        }
                    }
            }
            if (minimum < 1.7)
                issues.push(`${coverage}/${outcome}: ${minimum.toFixed(3)}ft ${detail}`);
        } expect(issues).toEqual([]); });
    it('holds the screener then rolls on a genuinely curved route', () => { const t = createPickAndRoll(tactics[0]); expect(sample(t, 3).positions.o5).toEqual(sample(t, 4).positions.o5); const route = t.scene!.tracks.find(r => r.kind === 'Roll')!; const mid = alongPath(route.points, .5); const a = route.points[0], b = route.points.at(-1)!; expect(Math.abs((b.x - a.x) * (mid.y - a.y) - (b.y - a.y) * (mid.x - a.x))).toBeGreaterThan(2); });
    it('synchronizes pass release, flight, catch and shot', () => { const t = createPickAndRoll(tactics[0]); expect(sample(t, 8.44).handler).toBe('o1'); expect(sample(t, 8.7).handler).toBeNull(); expect(sample(t, 9.1).handler).toBe('o5'); expect(sample(t, 9.11).poses.o5).toBe('Catch'); expect(sample(t, 11).flight?.kind).toBe('Shoot'); expect(sample(t, 12).ball).toEqual({ x: 25, y: 5.25 }); });
    it('changes defensive assignments and offensive finishes', () => { const snapshots = coverages.map(c => sample(createPickAndRoll(tactics[0], c), 6).positions); expect(new Set(snapshots.map(s => JSON.stringify([s.d1, s.d5]))).size).toBe(4); expect(sample(createPickAndRoll(tactics[0], 'Drop', 'Guard Drive'), 9).handler).toBe('o1'); expect(sample(createPickAndRoll(tactics[0], 'Blitz', 'Kick-out'), 9.2).handler).toBe('o3'); });
    it('is deterministic and continuous when seeking', () => { const t = createPickAndRoll(tactics[0]); expect(sample(t, 6.4)).toEqual(sample(t, 6.4)); for (let time = 0; time < 12; time += 1 / 60) {
        const a = sample(t, time), b = sample(t, time + 1 / 60);
        for (const id of Object.keys(a.positions)) {
            const d = Math.hypot(a.positions[id].x - b.positions[id].x, a.positions[id].y - b.positions[id].y);
            expect(d, id).toBeLessThan(.5);
        }
    } });
});
describe('timeline and geometry', () => { it('loops, pauses and stops deterministically', () => { const state = { time: 11.9, speed: 2, playing: true, loop: true }; expect(advancePlayback(state, .1, 12).time).toBeCloseTo(.1); expect(advancePlayback({ ...state, loop: false }, .1, 12)).toEqual({ time: 12, playing: false }); expect(advancePlayback({ ...state, playing: false }, 1, 12).time).toBe(11.9); }); it('rejects invalid scene paths', () => { const t = createPickAndRoll(tactics[0]); t.scene!.tracks[0].points[0].x = NaN; expect(validate(t)).toBe(false); }); });

it('rejects discontinuous paths, invalid possession and incomplete analysis imports',()=>{
 const discontinuous=createPickAndRoll(tactics[0]);discontinuous.scene!.tracks[1].points[0]={x:1,y:1};expect(validate(discontinuous)).toBe(false);
 const possession=createPickAndRoll(tactics[0]);possession.scene!.ballEvents[0].from='o2';expect(validate(possession)).toBe(false);
 const analysis=createPickAndRoll(tactics[0]);delete analysis.scene!.analysis.roles.o1;expect(validate(analysis)).toBe(false);
});
