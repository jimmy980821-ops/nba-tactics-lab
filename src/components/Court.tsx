import { useId, useRef } from 'react';
import type { PointerEvent } from 'react';
import { sample, type Tactic, type Point } from '../engine';
import { pathD, clamp } from '../animation/geometry';
export type Options = {
    names: boolean;
    numbers: boolean;
    routes: boolean;
    passes: boolean;
    screens: boolean;
    defense: boolean;
    marks: boolean;
};
type Props = {
    t: Tactic;
    time: number;
    options: Options;
    full: boolean;
    flip: boolean;
    zoom: number;
    select: (id: string) => void;
    edit?: (id: string, p: Point) => void;
    onEditStart?: () => void;
    selected: string | null;
    surface?: 'dark' | 'wood';
    perspective?: boolean;
    follow?: boolean;
    focus?: boolean;
};
const arcY = 5.25 + Math.sqrt(23.75 ** 2 - 22 ** 2);
function CourtLines({ bottom = false }: {
    bottom?: boolean;
}) {
    return <g transform={bottom ? 'translate(50 94) rotate(180)' : undefined}>
 <path d="M17 0V19H33V0"/>
 <path d="M19 19A6 6 0 0 0 31 19"/><path d="M19 19A6 6 0 0 1 31 19" strokeDasharray=".7 .6"/>
 <path d={`M3 0V${arcY}A23.75 23.75 0 0 0 47 ${arcY}V0`}/>
 <path d="M21 4V5.25A4 4 0 0 0 29 5.25V4M22 4H28"/>
 {[7, 8, 11, 14].map(y => <path key={y} d={`M16.3 ${y}H17M33 ${y}H33.7`}/>)}
 <path d="M0 28H.7M49.3 28H50M0 14H.7M49.3 14H50"/>
 <circle cx="25" cy="5.25" r=".75" className="court-rim"/><path d="M24.4 5.5L24.7 6.6H25.3L25.6 5.5" className="court-net"/>
 </g>;
}
export default function Court({ t, time, options, full, flip, zoom, select, edit, onEditStart, selected, surface = 'dark', perspective = false, follow = false, focus = false }: Props) {
    const id = useId().replace(/:/g, ''), world = useRef<SVGGElement>(null), drag = useRef<string | null>(null), state = sample(t, time), height = full ? 94 : 47;
    const focusPlayer = state.annotations.find(a => a.kind === 'screen')?.player || state.handler || 'o1';
    const center = focus ? state.positions[focusPlayer] : follow ? state.ball : { x: 25, y: height / 2 };
    const scale = zoom * (follow ? 1.12 : 1) * (focus ? 1.22 : 1);
    const cx = clamp(center.x, 17, 33), cy = clamp(center.y, height * .3, height * .7);
    const camera = `translate(25 ${height / 2}) scale(${scale} ${scale * (perspective ? .85 : 1)}) skewX(${perspective ? -8 : 0}) translate(${-cx} ${-cy})`;
    function point(e: PointerEvent) { const matrix = world.current?.getScreenCTM(); if (!matrix)
        return { x: 25, y: 24 }; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse()); return { x: clamp(p.x, 1, 49), y: clamp(p.y, 1, height - 1) }; }
    const flightLine = state.flight ? Array.from({ length: 33 }, (_, i) => { const u = state.flight!.progress * i / 32, f = state.flight!; return `${i ? 'L' : 'M'}${f.from.x + (f.to.x - f.from.x) * u} ${f.from.y + (f.to.y - f.from.y) * u - (f.kind === 'Shoot' ? Math.sin(u * Math.PI) * 3.5 : 0)}`; }).join(' ') : '';
    const legacyDestination = t.keyframes.find(k => k.time > time);
    const legacyStart = t.keyframes.filter(k => k.time <= time).at(-1);
    return <svg className={`court court-${surface}`} viewBox={`-5 -4 60 ${height + 8}`} role="group" aria-label="互動籃球戰術板，五名進攻與五名防守球員" data-scene={t.scene ? 'advanced' : 'basic'} data-coverage={t.scene?.coverage} onPointerMove={e => { if (drag.current && edit)
        edit(drag.current, point(e)); }} onPointerUp={() => drag.current = null} onPointerCancel={() => drag.current = null}>
 <defs>
 <pattern id={`${id}-wood`} width="5" height="14" patternUnits="userSpaceOnUse"><rect width="5" height="14" fill="#9f794f"/><path d="M0 0V14M5 0V14M0 7H2.5M2.5 0V14" stroke="#745335" strokeWidth=".08"/><path d="M.4 0Q1.1 5 .6 14M3 0Q3.7 7 3.2 14" stroke="#bd9568" strokeWidth=".1" opacity=".5"/></pattern>
 <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#253843"/><stop offset=".55" stopColor="#172832"/><stop offset="1" stopColor="#0e1a23"/></linearGradient>
 <linearGradient id={`${id}-offense`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#66c1ff"/><stop offset="1" stopColor="#2162be"/></linearGradient>
 <linearGradient id={`${id}-defense`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff9b9b"/><stop offset="1" stopColor="#ad3a4d"/></linearGradient>
 <radialGradient id={`${id}-ball`} cx=".3" cy=".25"><stop stopColor="#ffca7a"/><stop offset="1" stopColor="#d97723"/></radialGradient>
 <clipPath id={`${id}-clip`}><rect width="50" height={height}/></clipPath>
 <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="3" markerHeight="3" orient="auto"><path d="M1 1L6 4L1 7" fill="none" stroke="context-stroke" strokeWidth="1.4"/></marker>
 <filter id={`${id}-shadow`} x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="0" dy=".3" stdDeviation=".2" floodOpacity=".45"/></filter>
 </defs>
 <rect x="-2" y="-2" width="54" height={height + 4} rx="1" className="court-surround"/>
 <text x="0" y="-2.8" className="court-coordinate">50 FT / {full ? '94' : '47'} FT</text><text x="50" y="-2.8" textAnchor="end" className="court-coordinate">{t.scene ? 'COACH VIEW' : 'FOUNDATION VIEW'}</text>
 <g transform={camera} style={{ transition: follow || focus ? 'none' : 'transform .45s cubic-bezier(.2,.8,.2,1)' }}><g ref={world} transform={flip ? `translate(50 ${height}) rotate(180)` : undefined}>
 <rect width="50" height={height} fill={`url(#${id}-${surface === 'wood' ? 'wood' : 'floor'})`}/>
 <g clipPath={`url(#${id}-clip)`}>
 <path d="M17 0H33V19H17Z" fill={surface === 'wood' ? '#5c40252b' : '#0d1a2388'}/>{full && <path d="M17 94H33V75H17Z" fill="#0d1a2388"/>}
 <g className="court-lines" opacity={options.marks ? 1 : 0}><rect width="50" height={height}/><CourtLines />{full && <CourtLines bottom/>}<path d="M0 47H50"/><circle cx="25" cy="47" r="6"/><circle cx="25" cy="47" r="2"/></g>
 <text x="25" y={full ? 47 : 43} textAnchor="middle" className="court-brand">TACTICS LAB</text>
 {state.zones.filter(z => z.kind === 'space' || options.defense).map((z, i) => <g key={i} className={`tactical-zone zone-${z.kind}`} opacity={Math.min(1, (time - z.start) / .4, (z.end - time) / .3)}><ellipse cx={z.center.x} cy={z.center.y} rx={z.rx} ry={z.ry}/><text x={z.center.x} y={z.center.y + z.ry + .9} textAnchor="middle">{z.label}</text></g>)}
 {options.routes && state.routes.filter(({ track }) => options.defense || track.player.startsWith('o')).map(({ track, progress }, i) => progress > .015 && track.kind !== 'Screen' ? <g key={i} className={`route route-${track.player.startsWith('d') ? 'defense' : track.kind === 'Dribble' ? 'dribble' : 'move'}`}><path d={pathD(track.points, progress)} markerEnd={`url(#${id}-arrow)`}/>{track.kind === 'Dribble' && Array.from({ length: Math.floor(progress * 12) }, (_, j) => { const d = (j + 1) / 13, p = pathD(track.points, d); return <path key={j} d={p} className="dribble-ticks"/>; })}</g> : null)}
 {!t.scene && options.routes && legacyStart && legacyDestination && t.players.map(p => { if (p.team === 'defense' && !options.defense)
        return null; const a = legacyStart.playerPositions[p.id], b = state.positions[p.id]; return Math.hypot(a.x - b.x, a.y - b.y) > 1 ? <path key={p.id} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} className={`legacy-route ${p.team}`} markerEnd={`url(#${id}-arrow)`}/> : null; })}
 {options.passes && state.flight && <path className={`ball-route ${state.flight.kind === 'Shoot' ? 'shot-route' : ''}`} d={flightLine} markerEnd={`url(#${id}-arrow)`}/>}
 {options.screens && state.actions.filter(a => a.type === 'Screen').map(a => { const p = state.positions[a.player]; return <path key={a.player} className="screen-symbol" d={`M${p.x - 1.7} ${p.y - 1.6}v-.6h3.4v.6`}/>; })}
 {t.players.map(p => {
            const pos = state.positions[p.id], pose = state.poses[p.id], moving = state.routes.some(r => r.track.player === p.id && r.track.kind !== 'Screen'), gait = moving ? Math.sin(time * 10 + p.number) * .22 : 0, angle = state.headings[p.id] + 90, highlight = selected === p.id || state.annotations.some(a => a.player === p.id && (a.kind === 'screen' || a.kind === 'shot'));
            return <g key={p.id} transform={`translate(${pos.x} ${pos.y})`} className={`player player-${p.team} ${highlight ? 'key-player' : ''}`} role="button" tabIndex={0} aria-label={`${p.team === 'offense' ? '進攻' : '防守'} ${p.position} ${p.number}`} data-player={p.id} data-pose={pose} data-x={pos.x.toFixed(4)} data-y={pos.y.toFixed(4)} onPointerDown={e => { select(p.id); if (edit) {
                onEditStart?.();
                drag.current = p.id;
                e.currentTarget.setPointerCapture(e.pointerId);
            } }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select(p.id);
            } }}>
 <ellipse cy=".45" rx="1.05" ry=".72" className="player-shadow"/>
 {(highlight || state.handler === p.id) && <circle r="1.65" className={state.handler === p.id ? 'possession-ring' : 'focus-ring'}/>}
 <g transform={`rotate(${angle})`} filter={`url(#${id}-shadow)`}>
 <path d={`M-.45 .6L${-.5 - gait} 1.35M.45 .6L${.5 + gait} 1.35`} className="player-legs"/>
 <path d={pose === 'Screen' ? 'M-.55 -.3L-1.3 -.65M.55 -.3L1.3 -.65' : pose === 'Pass' || pose === 'Shoot' ? 'M-.55 -.3L-.8 -1.1M.55 -.3L.8 -1.1' : `M-.6 -.3L${-.9 + gait} .4M.6 -.3L${.9 - gait} .4`} className="player-arms"/>
 <path d="M-.83 -.62Q-.45 -.87 0 -.7Q.45 -.87 .83 -.62L.58 .85Q0 1.04 -.58 .85Z" fill={`url(#${id}-${p.team})`} className="player-jersey"/>
 <path d="M-.35 -.66Q0 -.22 .35 -.66M-.61 -.45L-.43 .65M.61 -.45L.43 .65" className="jersey-seam"/>
 <circle cy="-1.05" r=".34" className="player-head"/>
 <path d="M-.23 -1.28Q0 -1.5 .25 -1.25" className="player-hair"/>
 {options.numbers && <text textAnchor="middle" y=".42" className="jersey-number">{p.number}</text>}
 </g>
 {options.names && <g transform={flip ? 'rotate(180)' : undefined}><text textAnchor="middle" y="2.8" className="player-label">{p.position}{state.handler === p.id ? ' · BALL' : ''}</text></g>}
 </g>;
        })}
 <g className="basketball" data-handler={state.handler || 'flight'}>
 <ellipse cx={state.ball.x} cy={state.ball.y + .6} rx={state.flight?.kind === 'Shoot' ? .55 : .45} ry=".24" fill="#000" opacity=".35"/>
 <g transform={`translate(${state.ball.x} ${state.ball.y - (state.flight?.kind === 'Shoot' ? Math.sin(state.flight.progress * Math.PI) * 3.5 : state.handler && state.poses[state.handler] === 'Dribble' ? Math.abs(Math.sin(time * 12)) * .22 : 0)}) rotate(${time * 190})`}><circle r=".52" fill={`url(#${id}-ball)`} stroke="#612d13" strokeWidth=".08"/><path d="M-.52 0H.52M0 -.52V.52M-.34 -.4Q.25 0 -.34 .4M.34 -.4Q-.25 0 .34 .4" fill="none" stroke="#773d19" strokeWidth=".065"/></g>
 </g>
 {state.annotations.filter(a => (options.screens || a.kind !== 'screen') && (options.defense || a.kind !== 'defense')).map((a, i) => { const p = a.point || (a.player ? state.positions[a.player] : { x: 25, y: 20 }); return <g key={i} transform={`translate(${p.x} ${p.y - 3.5}) ${flip ? 'rotate(180)' : ''}`} className={`tactic-callout callout-${a.kind}`}><rect x={-Math.max(3, a.label.length * .34)} y="-1.25" width={Math.max(6, a.label.length * .68)} height="2.2" rx=".45"/><text textAnchor="middle" y=".23">{a.label}</text></g>; })}
 </g></g></g>
 <text x="25" y={height + 2.8} textAnchor="middle" className="court-coordinate">{t.scene ? '手工編排 / 曲線路徑 / 共用時間軸' : '基礎戰術示意 / 共用時間軸'}</text>
 </svg>;
}
