export const WORLD = 15360;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
export const score = meters => meters <= 30 ? 5000 : Math.round(5000*Math.exp(-(meters-30)/2000));
export const toUV = ({x,z}) => ({u:x/WORLD,v:1-z/WORLD});
export const fromUV = (u,v) => ({x:Math.round(clamp(u,0,1)*WORLD),z:Math.round((1-clamp(v,0,1))*WORLD)});
export function validateLocation(p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z) || p.x<0 || p.x>WORLD || p.z<0 || p.z>WORLD) throw new Error('Coordinates must be numbers from 0 to 15360 metres.');
  if (p.type && !['photo','panorama'].includes(p.type)) throw new Error('Type must be photo or panorama.');
  if (p.map && p.map !== 'chernarus') throw new Error('This pack supports the chernarus map only.');
  if (p.heading !== undefined && (!Number.isFinite(p.heading)||p.heading<0||p.heading>=360)) throw new Error('Heading must be from 0 up to (not including) 360.');
  for(const key of ['title','author','source','license']) if(p[key]!==undefined && typeof p[key]!=='string') throw new Error(`${key} must be text.`);
  return p;
}
export function seededRandom(seed) {
  let h=2166136261; for(const c of seed) h=Math.imul(h^c.charCodeAt(0),16777619);
  return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function selectRounds(items,seed,count=5) {
  const a=[...items].sort((x,y)=>x.id.localeCompare(y.id)),random=seededRandom(seed);
  for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,count);
}
