import type { Point } from '../engine';
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export function curvePoint(points: Point[], u: number): Point {
    if (points.length === 1)
        return { ...points[0] };
    const at = clamp(u) * (points.length - 1), i = Math.min(points.length - 2, Math.floor(at)), t = at - i;
    const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)];
    const axis = (k: 'x' | 'y') => .5 * ((2 * b[k]) + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t);
    return { x: axis('x'), y: axis('y') };
}
// Arc-length lookup keeps movement speed independent of control-point spacing.
const cache = new WeakMap<Point[], {
    points: Point[];
    lengths: number[];
    total: number;
}>();
function table(points: Point[]) { const existing = cache.get(points); if (existing)
    return existing; const samples = Array.from({ length: 97 }, (_, i) => curvePoint(points, i / 96)); let total = 0; const lengths = samples.map((p, i) => { if (i)
    total += distance(samples[i - 1], p); return total; }); const value = { points: samples, lengths, total }; cache.set(points, value); return value; }
export function alongPath(points: Point[], progress: number) { const data = table(points); if (data.total < 1e-8)
    return { ...points[0] }; const target = clamp(progress) * data.total; const i = data.lengths.findIndex(v => v >= target); if (i <= 0)
    return { ...data.points[0] }; const delta = data.lengths[i] - data.lengths[i - 1]; return mix(data.points[i - 1], data.points[i], delta ? (target - data.lengths[i - 1]) / delta : 0); }
export function easing(t: number, type = 'smooth') { t = clamp(t); return type === 'linear' ? t : type === 'accelerate' ? t * t : type === 'decelerate' ? 1 - (1 - t) * (1 - t) : t * t * (3 - 2 * t); }
export function pathD(points: Point[], progress = 1) { const n = Math.max(2, Math.ceil(clamp(progress) * 48)); return Array.from({ length: n + 1 }, (_, i) => { const p = alongPath(points, progress * i / n); return `${i ? 'L' : 'M'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`; }).join(' '); }
