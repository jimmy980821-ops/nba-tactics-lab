export type Point={x:number;y:number};
export type Player={id:string;team:'offense'|'defense';number:number;position:string;initialPosition:Point};
export type Action={type:'Move'|'Pass'|'Dribble'|'Screen'|'Cut'|'Shoot';player:string;target?:string};
export type Keyframe={time:number;playerPositions:Record<string,Point>;ballPosition?:Point;ballHandler:string|null;actions:Action[]};
export type Step={id:string;startTime:number;endTime:number;title:string;description:string};
export type Tactic={id:string;name:string;english:string;category:'進攻'|'防守'|'自訂';description:string;duration:number;players:Player[];keyframes:Keyframe[];steps:Step[];branches:string[];tags:string[];purpose:string;strength:string;weakness:string;counter:string;interpolation?:'linear'|'ease-in-out';variants?:Record<string,{duration:number;keyframes:Keyframe[];steps:Step[]}>;fullCourt?:boolean};
export function sample(t:Tactic,time:number){
 const at=Math.max(0,Math.min(time,t.duration));let i=t.keyframes.findIndex(k=>k.time>at);if(i<0)i=t.keyframes.length-1;const b=t.keyframes[i],a=t.keyframes[Math.max(0,i-1)];const p=b.time===a.time?1:(at-a.time)/(b.time-a.time);const e=t.interpolation==='linear'?p:p*p*(3-2*p);const lerp=(u:Point,v:Point)=>({x:u.x+(v.x-u.x)*e,y:u.y+(v.y-u.y)*e});
 const positions=Object.fromEntries(t.players.map(pl=>[pl.id,lerp(a.playerPositions[pl.id]||pl.initialPosition,b.playerPositions[pl.id]||pl.initialPosition)]));
 const ballAt=(k:Keyframe)=>k.ballPosition||(k.ballHandler?k.playerPositions[k.ballHandler]:undefined)||{x:25,y:5.25};
 const ball=lerp(ballAt(a),ballAt(b));const passing=a.ballHandler!==b.ballHandler;const handler=passing&&p>0&&p<1?null:(p>=1?b.ballHandler:a.ballHandler);
 return {positions,ball,handler,actions:b.actions,step:at>=t.duration?t.steps.length-1:Math.max(0,t.steps.findIndex(s=>at>=s.startTime&&at<s.endTime))};
}
export function validate(t:unknown):t is Tactic{try{return validateInternal(t)}catch{return false}}
function validateInternal(t:unknown):t is Tactic{
 if(!t||typeof t!=='object')return false;const q=t as Tactic;
 return typeof q.id==='string'&&typeof q.name==='string'&&typeof q.english==='string'&&typeof q.description==='string'&&['進攻','防守','自訂'].includes(q.category)&&Number.isFinite(q.duration)&&q.duration>0&&Array.isArray(q.players)&&q.players.length===10&&new Set(q.players.map(p=>p.id)).size===10&&q.players.every(p=>typeof p.id==='string'&&['offense','defense'].includes(p.team)&&Number.isFinite(p.number)&&typeof p.position==='string'&&validPoint(p.initialPosition))&&Array.isArray(q.keyframes)&&q.keyframes.length>=2&&q.keyframes[0].time===0&&q.keyframes.at(-1)!.time===q.duration&&q.keyframes.every((k,i)=>Number.isFinite(k.time)&&(i===0||k.time>q.keyframes[i-1].time)&&q.players.every(p=>validPoint(k.playerPositions?.[p.id]))&&(k.ballHandler===null||q.players.some(p=>p.id===k.ballHandler))&&(!k.ballPosition||validPoint(k.ballPosition))&&Array.isArray(k.actions)&&k.actions.every(a=>!!a&&['Move','Pass','Dribble','Screen','Cut','Shoot'].includes(a.type)&&q.players.some(p=>p.id===a.player)&&(!a.target||q.players.some(p=>p.id===a.target))))&&Array.isArray(q.steps)&&q.steps.length>0&&q.steps.every(s=>typeof s.title==='string'&&typeof s.description==='string'&&s.startTime>=0&&s.endTime>s.startTime&&s.endTime<=q.duration)&&Array.isArray(q.tags)&&q.tags.every(v=>typeof v==='string')&&Array.isArray(q.branches)&&q.branches.every(v=>typeof v==='string')&&(!q.variants||Object.values(q.variants).every(v=>validate({...q,...v,variants:undefined})));
}
function validPoint(p:Point){return !!p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=50&&p.y>=0&&p.y<=94}

