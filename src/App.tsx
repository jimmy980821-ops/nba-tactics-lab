import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowLeftRight, BookOpen, ChevronRight, Download, Expand, Flag, LayoutDashboard, ListFilter, Plus, Redo2, Save, Search, Settings2, Trash2, Undo2, Upload, Users, Waypoints, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { tactics, teams } from './data';
import { sample, validate, type Tactic, type Point, type Action } from './engine';
import { usePlayback } from './store';
import { usePlaybackClock } from './animation/usePlaybackClock';
import Court, { type Options } from './components/Court';
import Controls from './components/Timeline';
import { ScenarioBar, AnalysisDepth } from './components/ScenarioPanel';
import { createPickAndRoll, coverageNotes, type Coverage } from './tactics/pickAndRoll';
const defaults: Options = { names: true, numbers: true, routes: true, passes: true, screens: true, defense: true, marks: true };
function loadSaved(): Tactic[] { try {
    return JSON.parse(localStorage.getItem('nba-tactics') || '[]').filter(validate);
}
catch {
    return [];
} }
export default function App() {
    const [saved, setSaved] = useState<Tactic[]>(loadSaved), [id, setId] = useState('pnr'), [page, setPage] = useState('戰術工作台'), [query, setQuery] = useState(''), [category, setCategory] = useState('全部'), [options, setOptions] = useState(defaults), [settings, setSettings] = useState(false), [full, setFull] = useState(false), [flip, setFlip] = useState(false), [zoom, setZoom] = useState(1), [selected, setSelected] = useState<string | null>(null), [branch, setBranch] = useState('Roll'), [compare, setCompare] = useState('spain'), [notice, setNotice] = useState(''), [draft, setDraft] = useState<Tactic | null>(null), [history, setHistory] = useState<Tactic[]>([]), [future, setFuture] = useState<Tactic[]>([]), [editStep, setEditStep] = useState(0), [action, setAction] = useState('Move'), [target, setTarget] = useState('o5'), [team, setTeam] = useState(0), [sync, setSync] = useState(true), [otherTime, setOtherTime] = useState(0), [otherPlaying, setOtherPlaying] = useState(false);
    const [coverage, setCoverage] = useState<Coverage>('Drop'), [surface, setSurface] = useState<'dark' | 'wood'>('dark'), [perspective, setPerspective] = useState(false), [follow, setFollow] = useState(false), [focus, setFocus] = useState(false), [libraryOpen, setLibraryOpen] = useState(true), [analysisOpen, setAnalysisOpen] = useState(true);
    const reduceMotion = useReducedMotion();
    const { time, playing, set } = usePlayback();
    const all = [...tactics, ...saved];
    const original = all.find(t => t.id === id) || tactics[0];
    let t = draft && page === '戰術編輯器' ? draft : original;
    const enhanced = useMemo(() => original.id === 'pnr' ? createPickAndRoll(original, coverage, branch) : null, [original, coverage, branch]);
    if (enhanced && page !== '戰術編輯器')
        t = enhanced;
    else if (t.variants?.[branch])
        t = { ...t, ...t.variants[branch] };
    const current = sample(t, time), otherBase = all.find(x => x.id === compare) || tactics[6];
    const other = useMemo(() => otherBase.id === 'pnr' ? createPickAndRoll(otherBase, coverage, 'Roll') : otherBase, [otherBase, coverage]);
    const stepsRef = useRef<HTMLDivElement>(null);
    useEffect(() => { const list = stepsRef.current, active = list?.querySelector('.current'); if (!list || !active)
        return; const box = list.getBoundingClientRect(), item = active.getBoundingClientRect(); if (item.top < box.top)
        list.scrollTop += item.top - box.top;
    else if (item.bottom > box.bottom)
        list.scrollTop += item.bottom - box.bottom; }, [current.step]);
    usePlaybackClock(page === '戰術比較' && sync ? Math.max(t.duration, other.duration) : t.duration, other.duration, otherPlaying, sync, setOtherTime);
    useEffect(() => { if (otherTime >= other.duration)
        setOtherPlaying(false); }, [otherTime, other.duration]);
    function choose(next: string) { setId(next); set({ time: 0, playing: false }); setFull(!!all.find(x => x.id === next)?.fullCourt); setBranch('Roll'); setSelected(null); setDraft(null); }
    function update(next: Tactic) { if (draft)
        setHistory(h => [...h.slice(-39), structuredClone(draft)]); setFuture([]); setDraft(next); }
    function begin() { const next = structuredClone(t); delete next.variants; delete next.scene; next.branches = []; setDraft(next); setHistory([]); setFuture([]); setPage('戰術編輯器'); setEditStep(0); set({ time: 0, playing: false }); }
    function persist(items: Tactic[]) { try {
        localStorage.setItem('nba-tactics', JSON.stringify(items));
        setSaved(items);
        return true;
    }
    catch {
        setNotice('儲存失敗：瀏覽器儲存空間不足。請匯出 JSON 備份。');
        return false;
    } }
    function save() { if (!draft)
        return; const next = { ...draft, id: draft.category === '自訂' ? draft.id : `custom-${Date.now()}`, category: '自訂' as const }; if (!validate(next)) {
        setNotice('戰術資料不完整，無法儲存。');
        return;
    } if (persist([...saved.filter(x => x.id !== next.id), next])) {
        setDraft(next);
        setId(next.id);
        setNotice('已儲存到此瀏覽器');
    } }
    function movePlayer(who: string, p: Point) { if (!draft)
        return; const next = structuredClone(draft); next.keyframes[editStep].playerPositions[who] = p; if (editStep === 0) {
        const player = next.players.find(pl => pl.id === who);
        if (player)
            player.initialPosition = p;
    } setDraft(next); }
    function exportJSON() { const url = URL.createObjectURL(new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `${t.id}.json`; a.click(); URL.revokeObjectURL(url); }
    async function importJSON(file?: File) { if (!file)
        return; try {
        const data = JSON.parse(await file.text());
        if (!validate(data))
            throw Error();
        const next = { ...data, id: `custom-${Date.now()}`, category: '自訂' as const };
        if (persist([...saved, next])) {
            choose(next.id);
            setNotice('已匯入戰術');
        }
    }
    catch {
        setNotice('匯入失敗：請選擇有效且完整的戰術 JSON。');
    } }
    const list = all.filter(t => (category === '全部' || t.category === category) && `${t.name} ${t.english}`.toLowerCase().includes(query.toLowerCase()));
    const board = (tt: Tactic, at: number, editing = false) => <Court t={tt} time={at} options={options} full={full} flip={flip} zoom={zoom} surface={surface} perspective={perspective} follow={follow && !editing} focus={focus && !editing} selected={selected} select={setSelected} onEditStart={() => { if (draft) {
        setHistory(h => [...h, structuredClone(draft)]);
        setFuture([]);
    } }} edit={editing ? movePlayer : undefined}/>;
    return <div className={`app ${libraryOpen ? '' : 'library-collapsed'} ${analysisOpen ? '' : 'analysis-collapsed'}`}><aside className="sidebar"><a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('戰術工作台'); }}><span className="brand-icon"><img src={`${import.meta.env.BASE_URL}brand/logo.svg`} width="40" height="40" alt=""/></span><span>NBA TACTICS<span>LAB <i>戰術研究室</i></span></span></a><div className="workspace-label">你的籃球戰術空間</div><nav>{[['戰術工作台', LayoutDashboard], ['球隊風格', Users], ['戰術比較', ArrowLeftRight], ['戰術編輯器', Waypoints]].map(([name, Icon]) => <button key={name as string} className={page === name ? 'active' : ''} onClick={() => name === '戰術編輯器' ? begin() : setPage(name as string)}><Icon size={18}/>{name as string}{page === name && <ChevronRight size={15}/>}</button>)}</nav><div className="library-heading"><span>戰術資料庫</span><span>{all.length}</span></div><div className="search"><Search size={15}/><input aria-label="搜尋戰術" placeholder="搜尋戰術名稱…" value={query} onChange={e => setQuery(e.target.value)}/></div><div className="filters">{['全部', '進攻', '防守', '自訂'].map(c => <button className={category === c ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div><div className="tactic-list">{list.map((item, i) => <button key={item.id} className={id === item.id ? 'selected' : ''} onClick={() => { choose(item.id); if (page === '戰術編輯器')
        setPage('戰術工作台'); }}><span className="list-number">{String(i + 1).padStart(2, '0')}</span><span>{item.english}<small>{item.name}</small></span>{id === item.id && <span className="selected-dot"/>}</button>)}{!list.length && <p className="empty">沒有符合的戰術，試試其他關鍵字。</p>}</div><button className="new-tactic" onClick={begin}><Plus size={16}/> 建立自訂戰術</button><div className="sidebar-footer"><span className="status-dot"/> 本機工作空間 <span>LOCAL</span></div></aside>
 <div className="main"><header><div className="breadcrumb"><button aria-label={libraryOpen ? "收合戰術資料庫" : "展開戰術資料庫"} aria-expanded={libraryOpen} onClick={() => setLibraryOpen(!libraryOpen)}><ListFilter size={17}/></button>研究室 <ChevronRight size={13}/><b>{page}</b></div><div className="header-right"><button aria-label={analysisOpen ? "收合分析面板" : "展開分析面板"} aria-expanded={analysisOpen} onClick={() => setAnalysisOpen(!analysisOpen)}><BookOpen size={17}/></button><span className="simulation">教學模擬</span><button title="顯示設定" aria-label="顯示設定" onClick={() => setSettings(!settings)}><Settings2 size={18}/></button><span className="avatar">TL</span></div></header><main><motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} className="page-title"><div><h1>{page === '球隊風格' ? '每支球隊，都有自己的籃球語言。' : page === '戰術比較' ? '並肩觀察，看懂戰術差異。' : page === '戰術編輯器' ? '把你的想法，畫成下一個戰術。' : '戰術工作台'}</h1><p>閱讀空間、時間與防守選擇。以教練視角拆解每一個回合。</p></div><button className="outline" onClick={exportJSON}><Download size={16}/> 匯出戰術</button></motion.div>
 {notice && <div className="notice" role="status">{notice}<button aria-label="關閉通知" onClick={() => setNotice('')}><X size={16}/></button></div>}
 {settings && <section className="settings"><h3>顯示設定</h3>{(Object.keys(options) as (keyof Options)[]).map((k, i) => <label key={k}><input type="checkbox" checked={options[k]} onChange={e => setOptions({ ...options, [k]: e.target.checked })}/>{['球員位置', '球員編號', '跑位路線', '傳球路線', '掩護標記', '防守輪轉', '球場標記'][i]}</label>)}</section>}
 {page === '球隊風格' ? <div className="teams-layout"><div className="team-picker">{teams.map((tm, i) => <button className={team === i ? 'active' : ''} onClick={() => setTeam(i)} key={tm.short}><span style={{ color: tm.color }}>{tm.short}</span>{tm.name}<ChevronRight size={16}/></button>)}</div><section className="team-detail"><span style={{ color: teams[team].color }} className="team-abbr">{teams[team].short}</span><h2>{teams[team].name}</h2><h3>{teams[team].style}</h3><p>以典型戰術概念呈現球隊風格，所有球員為位置示意，不代表即時陣容或特定比賽。</p><h4>常見進攻方式</h4><p>{teams[team].offense}</p><h4>防守策略</h4><p>{teams[team].defense}</p><h4>探索代表戰術</h4>{teams[team].ids.map(x => <button className="outline" key={x} onClick={() => { choose(x); setPage('戰術工作台'); }}>{all.find(t => t.id === x)?.english}<ChevronRight size={14}/></button>)}</section></div> : <>
 <div className="workbench"><section className="board-panel"><div className="board-heading"><div><span className="tag">{t.category}戰術</span><h2>{t.english}{' '}<span>{t.name}</span></h2><p>{t.id === 'pnr' ? '從一個掩護開始，創造兩種進攻威脅。' : t.description}</p></div><span className="duration">{t.duration}s <span>／ {t.steps.length} STEPS</span></span></div>
 {page === '戰術編輯器' && draft && <div className="editor-toolbar"><input aria-label="戰術名稱" value={draft.name} onChange={e => update({ ...draft, name: e.target.value })}/><button aria-label="Undo" disabled={!history.length} onClick={() => { setFuture(f => [structuredClone(draft), ...f]); setDraft(history.at(-1)!); setHistory(h => h.slice(0, -1)); }}><Undo2 size={17}/></button><button aria-label="Redo" disabled={!future.length} onClick={() => { setHistory(h => [...h, structuredClone(draft)]); setDraft(future[0]); setFuture(f => f.slice(1)); }}><Redo2 size={17}/></button><button className="primary" onClick={save}><Save size={15}/> 儲存</button></div>}

 <div className="court-toolbar"><div><button className={!full ? 'active' : ''} aria-pressed={!full} onClick={() => setFull(false)}>半場</button><button className={full ? 'active' : ''} aria-pressed={full} onClick={() => setFull(true)}>全場</button></div><div><button title="切換進攻方向" aria-label="切換進攻方向" onClick={() => setFlip(!flip)}><ArrowLeftRight size={16}/></button><label className="zoom-control"><Expand size={14}/><input aria-label="球場縮放" type="range" min=".85" max="1.6" step=".05" value={zoom} onChange={e => setZoom(+e.target.value)}/><span>{Math.round(zoom * 100)}%</span></label><button className={options.routes ? 'active' : ''} onClick={() => setOptions({ ...options, routes: !options.routes })}><Waypoints size={15}/> 路線</button></div></div>
 <div className="view-toolbar"><div className="segmented"><button aria-pressed={surface === 'dark'} onClick={() => setSurface('dark')}>深色球場</button><button aria-pressed={surface === 'wood'} onClick={() => setSurface('wood')}>木地板</button></div><div><button aria-pressed={perspective} onClick={() => setPerspective(!perspective)}>斜角視圖</button><button aria-pressed={follow} onClick={() => setFollow(!follow)}>攝影機跟隨</button><button aria-pressed={focus} onClick={() => setFocus(!focus)}>重點聚焦</button></div></div>
 <div className={`court-stage ${page === '戰術比較' ? 'compare' : ''}`}><div>{board(t, page === '戰術編輯器' && !playing ? draft?.keyframes[editStep]?.time || 0 : time, page === '戰術編輯器' && !playing)}{page === '戰術比較' && <strong>{t.english}</strong>}</div>{page === '戰術比較' && <div>{board(other, sync ? Math.min(time, other.duration) : otherTime)}<select aria-label="比較戰術" value={compare} onChange={e => { setCompare(e.target.value); setOtherTime(0); if (all.find(x => x.id === e.target.value)?.fullCourt)
            setFull(true); }}>{all.map(x => <option value={x.id} key={x.id}>{x.english}</option>)}</select>{!sync && <><button onClick={() => { setOtherPlaying(!otherPlaying); if (otherTime >= other.duration)
            setOtherTime(0); }}>{otherPlaying ? '暫停右側' : '播放右側'}</button><input aria-label="右側播放時間" type="range" min="0" max={other.duration} step=".01" value={otherTime} onChange={e => setOtherTime(+e.target.value)}/></>}</div>}</div>
 <div className="legend"><span><i className="blue"/>進攻球員</span><span><i className="red"/>防守球員</span><span><i className="orange"/>持球</span><span className="legend-line">跑位路線</span><span className="court-caption">NBA 50 × {full ? 94 : 47} FT · 模擬動畫</span></div><Controls t={t} duration={page === '戰術比較' && sync ? Math.max(t.duration, other.duration) : t.duration}/>
 {page === '戰術比較' && <div className="comparison-notes"><label><input type="checkbox" checked={sync} onChange={e => setSync(e.target.checked)}/> 同步播放與重播（相同秒數時間軸）</label><p><b>跑位與掩護：</b>{t.english} 有 {t.keyframes.flatMap(k => k.actions).filter(a => a.type === 'Screen').length} 個掩護事件；{other.english} 有 {other.keyframes.flatMap(k => k.actions).filter(a => a.type === 'Screen').length} 個。</p><p><b>傳球閱讀：</b>比較強側持球移動與弱側空間，再觀察防守是否需增加一次輪轉。</p><p><b>破解方式：</b>{t.counter} {other.counter}</p></div>}
 </section><aside className="analysis-panel">{original.id === 'pnr' && t.scene && <ScenarioBar coverage={coverage} choose={v => { setCoverage(v); setBranch(coverageNotes[v].recommendation); set({ time: 0, playing: false }); }} branch={branch} setBranch={b => { setBranch(b); set({ time: 0, playing: false }); }}/>}<div className="analysis-title"><BookOpen size={18}/><h3>{page === '戰術編輯器' ? '編輯戰術步驟' : '戰術解析'}</h3><span>{t.steps.length} 步驟</span></div><div className="step-list" ref={stepsRef}>{t.steps.map((step, i) => <button key={step.id} className={(page === '戰術編輯器' ? Math.max(0, editStep - 1) : current.step) === i ? 'current' : ''} onClick={() => { set({ time: step.startTime, playing: false }); setEditStep(i + 1); }}><span className="step-index">{String(i + 1).padStart(2, '0')}</span><div><span className="step-time">{step.startTime.toFixed(0)}–{step.endTime.toFixed(0)} SEC</span><h4>{step.title}</h4><p>{step.description}</p></div></button>)}</div>
 {page === '戰術編輯器' && draft ? <div className="editor-actions"><label>編輯畫格 <select aria-label="編輯畫格" value={editStep} onChange={e => { setEditStep(+e.target.value); set({ time: draft.keyframes[+e.target.value].time, playing: false }); }}>{draft.keyframes.map((k, i) => <option value={i} key={i}>{k.time}s {i === 0 ? '初始站位' : `步驟 ${i}`}</option>)}</select></label><p>暫停時拖曳球員。點選「記錄目前畫格」可建立額外還原點，拖曳也可 Undo。</p><button onClick={() => update(structuredClone(draft))}>記錄目前畫格</button><select aria-label="動作類型" value={action} onChange={e => setAction(e.target.value)}>{['Move', 'Pass', 'Dribble', 'Screen', 'Cut', 'Shoot'].map(a => <option key={a}>{a}</option>)}</select><select aria-label="傳球對象" value={target} onChange={e => setTarget(e.target.value)}>{draft.players.filter(p => p.team === 'offense').map(p => <option value={p.id} key={p.id}>{p.position}</option>)}</select><button onClick={() => { if (!selected) {
            setNotice('先在球場選擇一名球員。');
            return;
        } const n = structuredClone(draft), k = n.keyframes[editStep]; k.actions = [{ type: action as Action['type'], player: selected, target }]; if (action === 'Pass')
            k.ballHandler = target; if (action === 'Dribble')
            k.ballHandler = selected; if (action === 'Shoot') {
            k.ballHandler = null;
            k.ballPosition = { x: 25, y: 5.25 };
        } update(n); }}>套用動作</button>{editStep > 0 && <><input aria-label="步驟標題" value={draft.steps[editStep - 1]?.title || ''} onChange={e => { const n = structuredClone(draft); n.steps[editStep - 1].title = e.target.value; update(n); }}/><textarea aria-label="步驟說明" value={draft.steps[editStep - 1]?.description || ''} onChange={e => { const n = structuredClone(draft); n.steps[editStep - 1].description = e.target.value; update(n); }}/></>}<button onClick={() => { const n = structuredClone(draft); n.keyframes.push({ ...structuredClone(n.keyframes.at(-1)!), time: n.duration + 2 }); n.steps.push({ id: `s${Date.now()}`, startTime: n.duration, endTime: n.duration + 2, title: '新增步驟', description: '編輯球員位置與動作。' }); n.duration += 2; update(n); setEditStep(n.keyframes.length - 1); }}><Plus size={14}/> 新增步驟</button><button disabled={editStep === 0 || draft.steps.length <= 1} onClick={() => { const n = structuredClone(draft); n.keyframes.splice(editStep, 1); n.steps.splice(editStep - 1, 1); n.keyframes.forEach((k, i) => k.time = i * 2); n.steps.forEach((s, i) => { s.startTime = i * 2; s.endTime = i * 2 + 2; }); n.duration -= 2; update(n); setEditStep(Math.max(0, editStep - 1)); set({ time: 0, playing: false }); }}><Trash2 size={14}/> 刪除步驟</button><button disabled={editStep <= 1} onClick={() => { const n = structuredClone(draft); [n.keyframes[editStep - 1], n.keyframes[editStep]] = [n.keyframes[editStep], n.keyframes[editStep - 1]]; [n.steps[editStep - 2], n.steps[editStep - 1]] = [n.steps[editStep - 1], n.steps[editStep - 2]]; n.keyframes.forEach((k, i) => k.time = i * 2); n.steps.forEach((s, i) => { s.startTime = i * 2; s.endTime = i * 2 + 2; }); update(n); setEditStep(editStep - 1); }}>步驟上移</button></div> : <div className="coach-note"><Flag size={17}/><div><h4>教練觀察</h4><p>{t.purpose}留意弱側防守者的位置與順下球員的接球窗口。</p></div></div>}
 {page !== '戰術編輯器' && <AnalysisDepth t={t} selected={selected}/>}
 </aside></div>
 <div className="bottom-grid"><section className="insights"><div className="section-heading"><h3>閱讀戰術，掌握選擇</h3><span>{t.tags.join(' / ')}</span></div><div className="insight-columns"><div><h4>戰術優勢</h4><p>{t.strength}</p></div><div><h4>執行挑戰</h4><p>{t.weakness}</p></div><div><h4>防守破解</h4><p>{t.counter}</p></div></div>{original.branches.length > 0 && <div className="branches"><span>進攻分支</span>{original.branches.filter(b => !t.scene || !['Roll', 'Guard Drive', 'Kick-out'].includes(b)).map(b => <button className={branch === b ? 'active' : ''} key={b} onClick={() => { setBranch(b); set({ time: 0, playing: false }); }}>{b}</button>)}</div>}</section><section className="quick-actions"><h3>{selected ? `球員 ${selected.toUpperCase()}` : '把戰術變成你的戰術'}</h3><p>{selected ? `${t.players.find(p => p.id === selected)?.position} · ${current.handler === selected ? '目前持球' : '無球'} · ${current.poses[selected] || '維持空間'} · 目標 ${JSON.stringify(t.keyframes.find(k => k.time > time)?.playerPositions[selected] || current.positions[selected])}` : '從現有戰術出發，探索不同的跑位與選擇。'}</p><button onClick={begin}>複製並編輯 <ChevronRight size={15}/></button><label className="import"><Upload size={14}/> 匯入 JSON<input type="file" accept=".json,application/json" onChange={e => { importJSON(e.target.files?.[0]); e.target.value = ''; }}/></label>{original.category === '自訂' && <button onClick={() => { if (persist(saved.filter(x => x.id !== id)))
            choose('pnr'); }}><Trash2 size={14}/> 刪除此自訂戰術</button>}</section></div></>}
 <footer><span>NBA Tactics Lab</span><span>為理解比賽而生。所有戰術皆為教學模擬，非真實賽事逐回合重建。</span></footer></main></div></div>;
}
