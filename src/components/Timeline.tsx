import { Pause, Play, RotateCcw, SkipBack, SkipForward, Repeat, StepBack, StepForward } from 'lucide-react';
import { sample, type Tactic } from '../engine';
import { usePlayback } from '../store';
export default function Timeline({ t, duration = t.duration }: {
    t: Tactic;
    duration?: number;
}) {
    const { time, playing, speed, loop, set } = usePlayback(), step = sample(t, time).step;
    function seek(value: number) { set({ time: Math.max(0, Math.min(duration, value)), playing: false }); }
    const previous = () => seek([...t.steps].reverse().find(s => s.startTime < time - .01)?.startTime || 0);
    const next = () => seek(t.steps.find(s => s.startTime > time + .01)?.startTime ?? duration);
    return <div className="controls professional-timeline"><div className="timeline-label"><span><b>{String(step + 1).padStart(2, '0')}</b> {t.steps[step]?.title}</span><span className="timecode">{time.toFixed(2)} <em>/ {duration.toFixed(2)} s</em></span></div>
 <div className="timeline-chapters">{t.steps.map((s, i) => <button key={s.id} aria-label={`跳至 ${s.title}`} className={i === step ? 'active' : ''} style={{ width: `${(s.endTime - s.startTime) / duration * 100}%` }} onClick={() => seek(s.startTime)} title={`${s.startTime}s ${s.title}`}><span>{s.title}</span></button>)}</div>
 <input aria-label="播放時間" type="range" min="0" max={duration} step="0.01" value={Math.min(time, duration)} onChange={e => set({ time: +e.target.value })}/>
 <div className="timeline-ruler">{Array.from({ length: 7 }, (_, i) => <span key={i}>{(duration * i / 6).toFixed(0)}s</span>)}</div>
 <div className="transport"><div className="transport-main"><button aria-label="重新播放" title="重新播放" onClick={() => set({ time: 0, playing: true })}><RotateCcw size={16}/></button><button aria-label="上一步" title="上一步" onClick={previous}><SkipBack size={17}/></button><button aria-label="逐格後退" title="逐格後退 · 1/60 秒" onClick={() => seek(time - 1 / 60)}><StepBack size={16}/></button><button className="play" aria-label={playing ? '暫停' : '播放'} onClick={() => set({ playing: !playing, time: time >= duration ? 0 : time })}>{playing ? <Pause size={20}/> : <Play size={20}/>}</button><button aria-label="逐格前進" title="逐格前進 · 1/60 秒" onClick={() => seek(time + 1 / 60)}><StepForward size={16}/></button><button aria-label="下一步" title="下一步" onClick={next}><SkipForward size={17}/></button><button aria-label="循環播放" title="循環播放" aria-pressed={loop} className={loop ? 'active' : ''} onClick={() => set({ loop: !loop })}><Repeat size={16}/></button></div>
 <div className="speed-controls"><label>播放速度 <select aria-label="播放速度" value={speed} onChange={e => set({ speed: +e.target.value })}>{Array.from(new Set([.25, .5, 1, 1.5, 2, speed])).sort((a, b) => a - b).map(v => <option key={v} value={v}>{v}×</option>)}</select></label><label className="custom-speed">自訂 <input aria-label="自訂倍速" type="number" min=".1" max="4" step=".1" value={speed} onChange={e => { const value = +e.target.value; if (value >= .1 && value <= 4)
        set({ speed: value }); }}/>×</label></div></div>
 <div className="timeline-footnote"><span>單一時間源 · 60 fps 逐格 · 所有事件可重播與跳轉</span><span>{t.scene ? 'CURVED PATH ENGINE' : 'KEYFRAME ENGINE'}</span></div>
 </div>;
}
