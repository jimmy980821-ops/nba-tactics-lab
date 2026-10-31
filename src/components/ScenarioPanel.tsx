import type { Tactic } from '../engine';
import { coverages, coverageNotes, type Coverage } from '../tactics/pickAndRoll';
export function ScenarioBar({ coverage, choose, branch, setBranch }: {
    coverage: Coverage;
    choose: (v: Coverage) => void;
    branch: string;
    setBranch: (b: string) => void;
}) {
    return <section className="scenario-bar" aria-label="擋拆攻防方案"><div className="scenario-section"><div className="scenario-label"><strong>防守閱讀</strong><span>切換方案，觀察五名防守者的責任變化</span></div><div className="segmented coverage-options">{coverages.map(c => <button key={c} aria-pressed={coverage === c} onClick={() => choose(c)}>{c}</button>)}</div></div><div className="coverage-explanation"><b>{coverage}</b><p>{coverageNotes[coverage].description}</p></div><div className="scenario-section outcome-section"><span className="scenario-label">進攻選擇</span><div className="outcome-options">{[['Roll', '順下傳球'], ['Guard Drive', '持球攻框'], ['Kick-out', '外線分球']].map(([b, label]) => <button key={b} aria-label={b} aria-pressed={branch === b} onClick={() => setBranch(b)}>{label}{coverageNotes[coverage].recommendation === b && <span>建議閱讀</span>}</button>)}</div></div></section>;
}
export function AnalysisDepth({ t, selected }: {
    t: Tactic;
    selected: string | null;
}) {
    const analysis = t.scene?.analysis;
    return <section className="analysis-depth"><h3>教練筆記</h3><details open><summary>初始站位與發動者</summary><p>{analysis?.formation || `${t.english} 的初始位置由第一畫格定義；點擊球員可查看角色與目前動作。`}</p><p>{analysis?.initiator || `發動者：${t.keyframes[0].ballHandler?.toUpperCase() || '團隊轉移球'}。`}</p></details>
 <details open={!!selected}><summary>每位球員的任務 {selected && `· ${selected.toUpperCase()}`}</summary><div className="roster-roles">{t.players.map(p => <div key={p.id} className={selected === p.id ? 'selected' : ''}><b className={p.team}>{p.team === 'offense' ? 'O' : 'D'}{p.number} <small>{p.position}</small></b><p>{analysis?.roles[p.id] || `${p.team === 'offense' ? '進攻：維持站位與接應，依步驟執行 ' + (t.keyframes.flatMap(k => k.actions).find(a => a.player === p.id)?.type || '空間牽制') : '防守：追蹤對位並在球轉移時完成補位'}。`}</p></div>)}</div></details>
 <details open><summary>防守反應與進攻破解</summary><p>{analysis?.defense || t.counter}</p><p className="read-note">{analysis?.read || t.purpose}</p></details>
 <details><summary>成功關鍵</summary><ul>{(analysis?.keys || [t.strength, '在傳球前確認接球者與協防者的相對位置。']).map(x => <li key={x}>{x}</li>)}</ul></details>
 <details><summary>常見失敗原因</summary><ul>{(analysis?.failures || [t.weakness, '站位過近導致傳球與突破空間縮小。']).map(x => <li key={x}>{x}</li>)}</ul></details>
 </section>;
}
