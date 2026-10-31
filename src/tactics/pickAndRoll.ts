import type { Tactic, Point } from '../engine';
import type { Scene, Movement, Track } from '../animation/types';
import { sampleScene } from '../animation/sampleScene';
export type Coverage = 'Drop' | 'Switch' | 'Hedge' | 'Blitz';
export const coverages: Coverage[] = ['Drop', 'Switch', 'Hedge', 'Blitz'];
export const coverageNotes: Record<Coverage, {
    description: string;
    read: string;
    recommendation: string;
}> = {
    Drop: { description: '內線沉退保護籃框，後衛從掩護上方追防。', read: '保持節奏迫使內線同時面對球與順下；觀察口袋傳球窗口。', recommendation: 'Roll' },
    Switch: { description: '內線接管持球者，原後衛轉而跟住順下球員。', read: '先辨認換防，持球者攻擊內線橫移，避免把球直接傳進小球員的防守範圍。', recommendation: 'Guard Drive' },
    Hedge: { description: '內線短暫上提延阻，後衛回追後再收回禁區。', read: '把球送到延阻者身後，利用回收前的 Short Roll 空間。', recommendation: 'Roll' },
    Blitz: { description: '兩名防守者封住持球者，弱側提前補位。', read: '提早出球並讓弱側接應，利用夾擊後形成的四打三。', recommendation: 'Kick-out' }
};
const point = (x: number, y: number): Point => ({ x, y });
export function createPickAndRoll(base: Tactic, coverage: Coverage = 'Drop', outcome = 'Roll'): Tactic {
    const players = structuredClone(base.players), initial: Record<string, Point> = { o1: point(25, 38), o2: point(4.5, 8.5), o3: point(45.5, 8.5), o4: point(8, 29), o5: point(31, 21), d1: point(23.8, 34.5), d2: point(7.5, 11.5), d3: point(42.5, 11.5), d4: point(12, 26), d5: point(28.5, 18) };
    players.forEach(p => p.initialPosition = initial[p.id]);
    const tracks: Track[] = [];
    function move(player: string, start: number, end: number, coords: number[][], kind: Movement = 'Move') {
        const last = tracks.filter(t => t.player === player).at(-1)?.points.at(-1) || initial[player];
        tracks.push({ player, start, end, points: [{ ...last }, ...coords.map(([x, y]) => point(x, y))], kind, easing: 'smooth' });
    }
    const reject = outcome === 'Reject Screen', pop = outcome === 'Pop', slip = outcome === 'Slip Screen', drive = outcome === 'Guard Drive', kick = outcome === 'Kick-out';
    move('o5', 0, 2.8, [[32, 24], [31.6, 28.5], [30, 31.8]], 'Move');
    move('o5', 2.8, slip ? 3.3 : 5.2, [[30, 31.8]], 'Screen');
    if (pop)
        move('o5', 5.2, 8.2, [[27.5, 32.5], [24, 35], [19, 35]], 'Pop');
    else
        move('o5', slip ? 3.3 : 5.2, 8.2, [[29, 27], [26, 21], [23.5, 15], [23, 9.2]], 'Roll');
    move('o1', 3.2, 7.4, reject ? [[21, 37], [17, 33], [15, 26], [18, 20]] : [[27, 36.5], [31.9, 33.7], [35.2, 28.5], [33.5, 21.5]], 'Dribble');
    if (drive)
        move('o1', 7.5, 10.5, [[34, 17.5], [32, 12.5], [28.7, 8]], 'Dribble');
    move('o4', 5, 8, [[6.5, 31], [8, 34]], 'Move');
    move('d2', 4.5, 7.5, [[9, 13.5], [11.5, 12.5]], 'Help Defense');
    move('d3', 4.6, kick && (coverage === 'Blitz' || coverage === 'Hedge') ? (coverage === 'Blitz' ? 6.9 : 7.1) : 8, [[38, 13.5], [32, 13], [29.5, 12]], 'Help Defense');
    if (kick)
        move('d3', coverage === 'Blitz' ? 7.2 : coverage === 'Hedge' ? 7.4 : 9.2, coverage === 'Blitz' ? 9.3 : coverage === 'Hedge' ? 9.5 : 11.3, [[35, 10], [40.5, 9.2]], 'Chase');
    move('d4', 4.4, 8, reject ? [[16, 25], [20, 24], [22, 19]] : [[16, 25], [18.5, 23], [18, 18]], 'Help Defense');
    if (reject) {
        move('d1', 3.2, 8, [[24, 36], [20, 35.5], [17, 29], [20.5, 22]], 'Chase');
        move('d5', 3, 8, [[25, 19], [22, 18], [21, 15]], 'Help Defense');
    }
    else if (coverage === 'Switch') {
        move('d1', 3.2, 8.2, [[26, 35.5], [26, 31], [23, 26], [20.5, 17]], 'Switch');
        move('d5', 2.8, 7.8, [[33, 24], [38.5, 30.5], [39, 28], [36.5, 23.5]], 'Switch');
    }
    else {
        move('d1', 3.2, 8, coverage === 'Blitz' ? [[25, 40], [28.5, 38.8], [31.5, 35.8], [32, 30], [31, 23.8]] : [[25, 33], [27, 31.5], [29, 29.5], [33, 29.8], [37, 27], [36, 23.8]], 'Chase');
        if (coverage === 'Drop')
            move('d5', 2.8, 8.2, [[30, 23], [29.5, 21], [28, 18], [27, 14.8]], 'Help Defense');
        if (coverage === 'Hedge') {
            move('d5', 2.8, 5.5, [[31.8, 27], [35.5, 34.5]], 'Help Defense');
            move('d5', 5.5, 8.2, [[32, 29], [30, 22], [28, 17]], 'Help Defense');
        }
        if (coverage === 'Blitz')
            move('d5', 2.8, 8.2, [[34, 23], [40, 27], [40, 33], [39, 29], [36.4, 22]], 'Help Defense');
    }
    if (coverage === 'Blitz' && !reject) {
        move('d1',8.2,10.3,[[27,27],[22,28]],'Help Defense');
        move('d5',8.3,10.4,drive?[[38,17],[34,10]]:[[33,17],[32.8,14]],'Help Defense');
    }
    const receiver = drive ? null : kick ? 'o3' : 'o5';
    const release = coverage === 'Hedge' ? 6.7 : coverage === 'Blitz' ? 6.5 : 8.45;
    const caught = release + .65;
    const events: Scene['ballEvents'] = drive ? [{ start: 10.8, end: 11.8, from: 'o1', to: null, kind: 'Shoot', target: point(25, 5.25) }] : [{ start: release, end: caught, from: 'o1', to: receiver, kind: 'Pass' }, { start: 10.7, end: 11.8, from: receiver!, to: null, kind: 'Shoot', target: point(25, 5.25) }];
    const info = reject ? {...coverageNotes[coverage],description:`進攻 Reject Screen 避開掩護，預設 ${coverage} 不觸發；後衛維持對位，中鋒先封切入側。`,read:'保持左側突破威脅，再閱讀中鋒與弱側協防的內縮。'} : coverageNotes[coverage];
    const scene: Scene = { version: 2, coverage, outcome, initialHandler: 'o1', tracks, ballEvents: events,
        annotations: [{ start: 2.8, end: slip ? 3.3 : 5.2, label: 'Screen', player: 'o5', kind: 'screen' }, { start: slip ? 3.3 : 5.2, end: 8.2, label: pop ? 'Pop' : slip ? 'Slip' : reject ? 'Reject' : 'Roll', player: 'o5', kind: 'movement' }, { start: 4.8, end: 7.4, label: reject ? 'Contain' : coverage === 'Switch' ? 'Switch' : coverage === 'Drop' ? 'Drop' : coverage === 'Hedge' ? 'Hedge & recover' : 'Blitz', player: 'd5', kind: 'defense' }, { start: 6, end: kick && coverage === 'Blitz' ? 7.2 : kick && coverage === 'Hedge' ? 7.4 : 8.5, label: 'Help Defense', player: 'd3', kind: 'defense' }, { start: 9.2, end: 10.7, label: drive ? 'Drive' : pop || kick ? 'Open Shot' : 'Catch & finish', player: drive ? 'o1' : receiver!, kind: 'shot' }],
        zones: [{ start: 4.2, end: 8.4, center: coverage === 'Drop' ? point(27, 16) : point(35, 29), rx: coverage === 'Drop' ? 6 : 4, ry: coverage === 'Drop' ? 7 : 5, kind: 'coverage', label: coverage === 'Drop' ? '籃框保護' : '持球壓力' }, { start: 6.2, end: 10.7, center: pop ? point(19, 35) : kick ? point(44, 10) : drive ? point(32, 13) : point(23, 12), rx: pop || kick ? 4 : 5, ry: pop || kick ? 3 : 6, kind: 'space', label: pop || kick ? '外線窗口' : '順下通道' }],
        analysis: { formation: '四外一內：控衛弧頂持球，中鋒右肘區準備上提；底角雙射手與弱側大前鋒拉開協防距離。', initiator: 'PG（1）發動；C（5）設定右側高位掩護。', roles: { o1: '保持運球、貼近掩護肩部，閱讀第二線防守再出球。', o2: '弱側底角維持空間，牽制底角協防者。', o3: '強側底角等待協防離開，準備接球出手。', o4: '弱側上提，延長協防回位距離並提供安全出口。', o5: pop ? '定住掩護後外彈，保持投籃準備。' : '先定住掩護，再轉身順下，展示接球目標。', d1: reject ? '拒用掩護後維持原對位，封住左側切入。' : coverage === 'Switch' ? '溝通換防並接管順下球員。' : '從掩護上方繞行，回到持球者身後追防。', d2: '保持弱側底角責任，必要時短暫內縮。', d3: '作為 Low Man 標記順下，出球後立即補回射手。', d4: '向 Nail 區域收縮，兼顧上提球員與切入。', d5: info.description }, defense: info.description, read: info.read, keys: ['掩護者先停穩，持球者再貼肩轉向，避免留出防守穿越空間。', '順下與持球推進錯開路徑；傳球在協防轉頭後送到接球者前方。', '弱側球員維持間距，不在同一條傳球線上擠成一團。'], failures: ['持球者過早加速，讓掩護尚未站穩便失去作用。', '中鋒順下太早或太慢，錯過出球窗口。', '預先決定傳球對象，忽略防守換防或弱側輪轉。'] } };
    const names = ['建立空間', '高位掩護', reject ? '拒絕掩護' : '利用掩護', pop ? '外彈閱讀' : '順下牽制', drive ? '後衛攻框' : kick ? '弱側分球' : '口袋傳球', drive ? '後衛終結' : pop || kick ? '空檔投籃' : '完成終結'];
    const descriptions = ['觀察五名進攻者的間距；球員分工與防守責任可在下方展開。', '中鋒上提後定住，持球者等待掩護角度；停頓由路徑時間資料控制。', info.description, info.read, drive ? '中鋒牽制護框者，後衛保留球權攻擊空隙。' : kick ? '弱側防守收縮後，球直接飛向底角接球點。' : `持球者在 ${release.toFixed(2)}s 出球，${caught.toFixed(2)}s 完成接球；傳球途中無人持球。`, '接球後先穩定身體，再完成出手；橙色球與陰影共享時間軸。'];
    if (!drive && release < 8) {
        names[3] = kick ? '提早分球' : 'Short Roll 接應';
        descriptions[3] = `${info.read} 出球 ${release.toFixed(2)}s，接球 ${caught.toFixed(2)}s。`;
        names[4] = '接球準備';
        descriptions[4] = '接球者穩定身體，觀察補防後準備終結。';
    }
    const result: Tactic = { ...base, players, duration: 12, scene, branches: [], steps: names.map((title, i) => ({ id: `pnr-${i}`, startTime: i * 2, endTime: i * 2 + 2, title, description: descriptions[i] })), variants: undefined, keyframes: [] };
    result.keyframes = Array.from({ length: 7 }, (_, i) => { const s = sampleScene(result, i * 2); return { time: i * 2, playerPositions: s.positions, ballHandler: s.handler, ballPosition: s.handler ? undefined : s.ball, actions: s.actions }; });
    return result;
}
