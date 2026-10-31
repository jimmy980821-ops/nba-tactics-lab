import type { Scene } from './animation/types';
import { sampleScene } from './animation/sampleScene';
export type Point = {
    x: number;
    y: number;
};
export type Player = {
    id: string;
    team: 'offense' | 'defense';
    number: number;
    position: string;
    initialPosition: Point;
};
export type Action = {
    type: 'Move' | 'Pass' | 'Dribble' | 'Screen' | 'Cut' | 'Shoot';
    player: string;
    target?: string;
};
export type Keyframe = {
    time: number;
    playerPositions: Record<string, Point>;
    ballPosition?: Point;
    ballHandler: string | null;
    actions: Action[];
};
export type Step = {
    id: string;
    startTime: number;
    endTime: number;
    title: string;
    description: string;
};
export type Tactic = {
    id: string;
    name: string;
    english: string;
    category: '進攻' | '防守' | '自訂';
    description: string;
    duration: number;
    players: Player[];
    keyframes: Keyframe[];
    steps: Step[];
    branches: string[];
    tags: string[];
    purpose: string;
    strength: string;
    weakness: string;
    counter: string;
    interpolation?: 'linear' | 'ease-in-out';
    variants?: Record<string, {
        duration: number;
        keyframes: Keyframe[];
        steps: Step[];
    }>;
    scene?: Scene;
    fullCourt?: boolean;
};
export function sample(t: Tactic, time: number) {
    if (t.scene)
        return sampleScene(t, time);
    const at = Math.max(0, Math.min(time, t.duration));
    let i = t.keyframes.findIndex(k => k.time > at);
    if (i < 0)
        i = t.keyframes.length - 1;
    const b = t.keyframes[i], a = t.keyframes[Math.max(0, i - 1)];
    const p = b.time === a.time ? 1 : (at - a.time) / (b.time - a.time);
    const e = t.interpolation === 'linear' ? p : p * p * (3 - 2 * p);
    const lerp = (u: Point, v: Point) => ({ x: u.x + (v.x - u.x) * e, y: u.y + (v.y - u.y) * e });
    const positions = Object.fromEntries(t.players.map(pl => [pl.id, lerp(a.playerPositions[pl.id] || pl.initialPosition, b.playerPositions[pl.id] || pl.initialPosition)]));
    const ballAt = (k: Keyframe) => k.ballPosition || (k.ballHandler ? k.playerPositions[k.ballHandler] : undefined) || { x: 25, y: 5.25 };
    const ball = lerp(ballAt(a), ballAt(b));
    const passing = a.ballHandler !== b.ballHandler;
    const handler = passing && p > 0 && p < 1 ? null : (p >= 1 ? b.ballHandler : a.ballHandler);
    const headings = Object.fromEntries(t.players.map(pl => { const from = a.playerPositions[pl.id], to = b.playerPositions[pl.id]; return [pl.id, Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI]; }));
    return { positions, ball, handler, actions: b.actions, headings, poses: Object.fromEntries(t.players.map(p => [p.id, b.actions.find(ac => ac.player === p.id)?.type || 'Idle'])), flight: null, routes: [], annotations: [], zones: [], step: at >= t.duration ? t.steps.length - 1 : Math.max(0, t.steps.findIndex(s => at >= s.startTime && at < s.endTime)) };
}
export function validate(t: unknown): t is Tactic { try {
    return validateInternal(t);
}
catch {
    return false;
} }
function validateInternal(t: unknown): t is Tactic {
    if (!t || typeof t !== 'object')
        return false;
    const q = t as Tactic;
    return typeof q.id === 'string' && typeof q.name === 'string' && typeof q.english === 'string' && typeof q.description === 'string' && ['進攻', '防守', '自訂'].includes(q.category) && Number.isFinite(q.duration) && q.duration > 0 && Array.isArray(q.players) && q.players.length === 10 && new Set(q.players.map(p => p.id)).size === 10 && q.players.every(p => typeof p.id === 'string' && ['offense', 'defense'].includes(p.team) && Number.isFinite(p.number) && typeof p.position === 'string' && validPoint(p.initialPosition)) && Array.isArray(q.keyframes) && q.keyframes.length >= 2 && q.keyframes[0].time === 0 && q.keyframes.at(-1)!.time === q.duration && q.keyframes.every((k, i) => Number.isFinite(k.time) && (i === 0 || k.time > q.keyframes[i - 1].time) && q.players.every(p => validPoint(k.playerPositions?.[p.id])) && (k.ballHandler === null || q.players.some(p => p.id === k.ballHandler)) && (!k.ballPosition || validPoint(k.ballPosition)) && Array.isArray(k.actions) && k.actions.every(a => !!a && ['Move', 'Pass', 'Dribble', 'Screen', 'Cut', 'Shoot'].includes(a.type) && q.players.some(p => p.id === a.player) && (!a.target || q.players.some(p => p.id === a.target)))) && Array.isArray(q.steps) && q.steps.length > 0 && q.steps.every(s => typeof s.title === 'string' && typeof s.description === 'string' && s.startTime >= 0 && s.endTime > s.startTime && s.endTime <= q.duration) && Array.isArray(q.tags) && q.tags.every(v => typeof v === 'string') && Array.isArray(q.branches) && q.branches.every(v => typeof v === 'string') && validScene(q) && (!q.variants || Object.values(q.variants).every(v => validate({ ...q, ...v, variants: undefined })));
}
function validPoint(p: Point) { return !!p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 50 && p.y >= 0 && p.y <= 94; }
function validScene(q: Tactic) {
    const scene = q.scene;
    if (!scene) return true;
    const id = (value: string) => q.players.some(player => player.id === value);
    const span = (value: {start:number;end:number}) => Number.isFinite(value.start) && Number.isFinite(value.end) && value.start >= 0 && value.end > value.start && value.end <= q.duration;
    const textList = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
    if (scene.version !== 2 || !id(scene.initialHandler) || typeof scene.coverage !== 'string' || typeof scene.outcome !== 'string') return false;
    if (!Array.isArray(scene.tracks) || !scene.tracks.every(track => id(track.player) && span(track) && ['Move','Dribble','Screen','Roll','Pop','Cut','Chase','Switch','Help Defense'].includes(track.kind) && Array.isArray(track.points) && track.points.length > 0 && track.points.every(validPoint))) return false;
    for (const player of q.players) {
        let previous = player.initialPosition, end = 0;
        for (const track of scene.tracks.filter(track => track.player === player.id)) {
            if (track.start < end || Math.hypot(track.points[0].x - previous.x, track.points[0].y - previous.y) > .001) return false;
            previous = track.points.at(-1)!;
            end = track.end;
        }
    }
    if (!Array.isArray(scene.ballEvents)) return false;
    let owner: string | null = scene.initialHandler, eventEnd = 0;
    for (const event of scene.ballEvents) {
        if (!span(event) || event.start < eventEnd || event.from !== owner || !id(event.from) || (event.target && !validPoint(event.target))) return false;
        if (event.kind === 'Pass' ? !event.to || !id(event.to) || event.to === event.from : event.kind !== 'Shoot' || event.to !== null) return false;
        owner = event.to;
        eventEnd = event.end;
    }
    if (!Array.isArray(scene.annotations) || !scene.annotations.every(a => span(a) && typeof a.label === 'string' && ['screen','movement','defense','shot'].includes(a.kind) && (!a.player || id(a.player)) && (!a.point || validPoint(a.point)))) return false;
    if (!Array.isArray(scene.zones) || !scene.zones.every(z => span(z) && validPoint(z.center) && Number.isFinite(z.rx) && Number.isFinite(z.ry) && z.rx > 0 && z.ry > 0 && ['space','coverage'].includes(z.kind) && typeof z.label === 'string')) return false;
    const analysis = scene.analysis;
    return !!analysis && ['formation','initiator','defense','read'].every(key => typeof analysis[key as keyof typeof analysis] === 'string') && !!analysis.roles && q.players.every(p => typeof analysis.roles[p.id] === 'string') && textList(analysis.keys) && textList(analysis.failures);
}
