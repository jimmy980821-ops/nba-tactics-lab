import type { Tactic, Point, Action } from '../engine';
import { alongPath, clamp, easing, mix } from './geometry';
import type { Track } from './types';
export function trackProgress(track: Track, time: number) { return easing((time - track.start) / (track.end - track.start), track.easing); }
function positionsAt(t: Tactic, time: number) { return Object.fromEntries(t.players.map(player => { let p = player.initialPosition; for (const track of t.scene!.tracks) {
    if (track.player !== player.id || time < track.start)
        continue;
    p = alongPath(track.points, trackProgress(track, time));
} return [player.id, p]; })) as Record<string, Point>; }
export function sampleScene(t: Tactic, time: number) {
    const scene = t.scene!, at = clamp(time, 0, t.duration), positions = positionsAt(t, at), before = positionsAt(t, Math.max(0, at - .04)), after = positionsAt(t, Math.min(t.duration, at + .04));
    const headings: Record<string, number> = {}, poses: Record<string, string> = {};
    for (const player of t.players) {
        const active = scene.tracks.filter(r => r.player === player.id && r.start <= at).at(-1);
        const d = { x: after[player.id].x - before[player.id].x, y: after[player.id].y - before[player.id].y };
        const moving = Math.hypot(d.x, d.y) > .001;
        const ahead = active ? alongPath(active.points, clamp(trackProgress(active, at) + .015)) : positions[player.id];
        const behind = active ? alongPath(active.points, clamp(trackProgress(active, at) - .015)) : positions[player.id];
        headings[player.id] = moving ? Math.atan2(d.y, d.x) * 180 / Math.PI : active && Math.hypot(ahead.x - behind.x, ahead.y - behind.y) > .001 ? Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI : -90;
        if (active?.kind === 'Screen') {
            const previous = scene.tracks.filter(r => r.player === player.id && r.end <= active.start && r !== active).at(-1);
            if (previous) {
                const a = alongPath(previous.points, .97), b = previous.points.at(-1)!;
                const from = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
                const delta = ((-90 - from + 540) % 360) - 180;
                headings[player.id] = from + delta * easing(clamp((at - active.start) / .4));
            }
        }
        poses[player.id] = active && at <= active.end ? active.kind : 'Idle';
    }
    const hand = (p: Point) => ({ x: p.x + .85, y: p.y - .25 });
    let handler: string | null = scene.initialHandler, ball = hand(positions[handler]), flight: null | {
        kind: 'Pass' | 'Shoot';
        progress: number;
        from: Point;
        to: Point;
    } = null;
    for (const event of scene.ballEvents) {
        if (at < event.start)
            break;
        const start = hand(positionsAt(t, event.start)[event.from]), end = event.target || (event.to ? hand(positionsAt(t, event.end)[event.to]) : { x: 25, y: 5.25 });
        if (at < event.end) {
            const p = clamp((at - event.start) / (event.end - event.start));
            handler = null;
            ball = mix(start, end, p);
            flight = { kind: event.kind, progress: p, from: start, to: end };
            poses[event.from] = event.kind;
            break;
        }
        handler = event.to;
        ball = handler ? hand(positions[handler]) : end;
        if (event.to && at < event.end + .28)
            poses[event.to] = 'Catch';
    }
    if (handler)
        ball = hand(positions[handler]);
    for (const id of Object.keys(poses))
        if (poses[id] === 'Dribble' && handler !== id)
            poses[id] = 'Move';
    for (const id of Object.keys(poses)) {
        if ((poses[id] === 'Idle' || poses[id] === 'Help Defense') && id !== handler) headings[id] = Math.atan2(ball.y - positions[id].y, ball.x - positions[id].x) * 180 / Math.PI;
    }
    const activeTracks = scene.tracks.filter(r => at >= r.start && at <= r.end);
    const actions: Action[] = activeTracks.map(r => ({ player: r.player, type: r.kind === 'Screen' ? 'Screen' : r.kind === 'Dribble' ? 'Dribble' : r.kind === 'Cut' || r.kind === 'Roll' ? 'Cut' : 'Move' }));
    if (flight) {
        const event = scene.ballEvents.find(e => at >= e.start && at < e.end)!;
        actions.push({ type: event.kind, player: event.from, target: event.to || undefined });
    }
    return { positions, ball, handler, actions, headings, poses, flight, routes: activeTracks.map(track => ({ track, progress: trackProgress(track, at) })), annotations: scene.annotations.filter(a => at >= a.start && at <= a.end), zones: scene.zones.filter(z => at >= z.start && at <= z.end), step: at >= t.duration ? t.steps.length - 1 : Math.max(0, t.steps.findIndex(s => at >= s.startTime && at < s.endTime)) };
}
