import {it,expect} from 'vitest';
import {tactics} from '../src/data';
import {validate,sample} from '../src/engine';
it('all branch timelines are valid and different',()=>{for(const t of tactics){for(const v of Object.values(t.variants||{})){expect(validate({...t,...v}),t.id).toBe(true);expect(sample({...t,...v},v.duration).ball.x).toBeGreaterThanOrEqual(0)}}expect(Object.keys(tactics[0].variants!)).toHaveLength(5)});
it('linear interpolation and end step remain correct',()=>{const t={...tactics[0],interpolation:'linear' as const};expect(sample(t,t.duration).step).toBe(t.steps.length-1);expect(sample(t,2.5).positions.o5.x).toBeCloseTo(30.5)});
it('malformed nested input returns false without throwing',()=>{expect(validate({...tactics[0],players:[null,...tactics[0].players.slice(1)]})).toBe(false)});
