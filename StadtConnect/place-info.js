/* Nutzerrelevante Ortsinformationen. Keine Netzabfragen beim Anzeigen eines Orts. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.StadtInfo=factory()})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const DAYS=['Mo','Tu','We','Th','Fr','Sa','Su'];
 const DAY_DE={Mo:'Mo',Tu:'Di',We:'Mi',Th:'Do',Fr:'Fr',Sa:'Sa',Su:'So'};
 const GERMAN={Montag:'Mo',Dienstag:'Tu',Mittwoch:'We',Donnerstag:'Th',Freitag:'Fr',Samstag:'Sa',Sonntag:'Su'};
 const SPORTS={'Basketballplätze':'Basketball','Beachvolleyballplätze':'Beachvolleyball','Bibliotheken':'Bibliothek','BMX-Anlagen':'BMX','Calisthenics-Anlagen':'Calisthenics','Fußballplätze / Bolzplätze':'Fußball','Laufbahnen':'Laufen','Outdoor-Fitnessanlagen':'Outdoor-Fitness','Parkour-Anlagen':'Parkour','Skateparks':'Skaten','Tischtennisplatten':'Tischtennis','Volleyballplätze':'Volleyball'};
 const unknown=()=>({status:'unknown',entries:[],candidates:[]});
 const sourceValid=s=>{try{const u=new URL(s?.url);return ['https:','http:'].includes(u.protocol)&&Number.isFinite(Date.parse(s.checkedAt))}catch{return false}};
 function time(value){const m=String(value).trim().match(/^(\d{1,2})(?:[.:](\d{2}))?$/);if(!m)return null;const h=+m[1],n=+(m[2]||0);return h<=24&&n<60&&(h!==24||n===0)?`${String(h).padStart(2,'0')}:${String(n).padStart(2,'0')}`:null}
 function intervals(value){
  const result=[];
  for(const part of value.replace(/Uhr/gi,'').trim().split(/\s*(?:\+|,| und )\s*/)){const m=part.trim().match(/^(\d{1,2}(?:[.:]\d{2})?)\s*(?:bis|[-–])\s*(\d{1,2}(?:[.:]\d{2})?)$/);if(!m)return null;const a=time(m[1]),b=time(m[2]);if(!a||!b||a===b)return null;result.push([a,b])}
  return result;
 }
 const formatTimes=times=>times.length?times.map(t=>t.join('–')).join(' und ')+' Uhr':'Geschlossen';
 function parseOfficial(rows,source){
  if(!sourceValid(source)||!Array.isArray(rows)||!rows.length)return null;
  const week={},entries=[];
  for(const raw of rows){const parts=raw.split('|').map(x=>x.trim());if(parts.length!==2)return null;const days=parts[0].split(/\s*(?:\+|\/|,| und )\s*/).map(d=>GERMAN[d]);const times=intervals(parts[1]);if(!days.length||days.some(d=>!d)||!times)return null;
   for(const day of days){if(week[day]&&JSON.stringify(week[day])!==JSON.stringify(times))return null;week[day]=times}
   entries.push({days:days.map(d=>DAY_DE[d]).join(' / '),times:formatTimes(times)});
  }
  return {kind:'opening',source,raw:rows,week,entries};
 }
 function parseOSM(raw,source){
  if(!sourceValid(source)||typeof raw!=='string'||!raw.trim())return null;
  if(raw.trim()==='24/7')return {kind:'opening',source,raw,week:Object.fromEntries(DAYS.map(d=>[d,[['00:00','24:00']]])),entries:[{days:'Täglich',times:'24 Stunden geöffnet'}]};
  const week={},entries=[];let holidayNote='';
  for(const rule of raw.split(';').map(x=>x.trim())){
   if(/^PH\s+(off|closed)$/.test(rule)){holidayNote='An Feiertagen geschlossen laut Quelle.';continue}
   const m=rule.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:[-,](?:Mo|Tu|We|Th|Fr|Sa|Su))*)\s+(.+)$/);if(!m)return null;
   const days=[];for(const part of m[1].split(',')){const range=part.split('-');if(range.length===1)days.push(range[0]);else{let i=DAYS.indexOf(range[0]);const end=DAYS.indexOf(range[1]);for(let k=0;k<7;k++,i=(i+1)%7){days.push(DAYS[i]);if(i===end)break}}}
   const times=/^(off|closed)$/.test(m[2])?[]:intervals(m[2]);if(times===null)return null;
   for(const day of days){if(week[day]&&JSON.stringify(week[day])!==JSON.stringify(times))return null;week[day]=times}
   const label=m[1].replace(/Mo|Tu|We|Th|Fr|Sa|Su/g,d=>DAY_DE[d]).replace(/-/g,'–').replace(/,/g,' / ');entries.push({days:label,times:formatTimes(times)});
  }
  return entries.length?{kind:'opening',source,raw,week,entries,holidayNote}:null;
 }
 function resolveHours(candidates){
  const eligible=(Array.isArray(candidates)?candidates:[]).filter(c=>c?.kind==='opening'&&sourceValid(c.source)&&c.week&&c.entries?.length);
  if(!eligible.length)return unknown();
  for(let i=0;i<eligible.length;i++)for(let j=i+1;j<eligible.length;j++)for(const day of DAYS){if(eligible[i].week[day]&&eligible[j].week[day]&&JSON.stringify(eligible[i].week[day])!==JSON.stringify(eligible[j].week[day]))return {status:'conflict',entries:[],candidates:eligible}}
  const chosen=eligible.find(c=>c.source.kind==='official')||eligible[0];return {status:'confirmed',entries:chosen.entries,source:chosen.source,holidayNote:chosen.holidayNote||'',candidates:eligible};
 }
 function mergeInfo(a={},b={}){
  a=a&&typeof a==='object'?a:{};b=b&&typeof b==='object'?b:{};
  const candidates=[...(a.openingHours?.candidates||[]),...(b.openingHours?.candidates||[])];
  const unique=[...new Map(candidates.map(c=>[JSON.stringify([c.source,c.raw]),c])).values()];
  return {...a,...b,openingHours:resolveHours(unique),amenities:[...new Set([...(a.amenities||[]),...(b.amenities||[])])]};
 }
 function fromOSM(tags,source){
  const candidate=parseOSM(tags.opening_hours,source),amenities=[];
  const surface={asphalt:'Asphalt',grass:'Rasen',artificial_turf:'Kunstrasen',concrete:'Beton',sand:'Sand',clay:'Tenne',tartan:'Kunststoff'}[tags.surface];
  if(surface)amenities.push('Belag: '+surface);if(tags.lit==='yes')amenities.push('Beleuchtung');if(tags.lit==='no')amenities.push('Keine Beleuchtung laut Kartendaten');if(tags.bench==='yes')amenities.push('Sitzmöglichkeiten');
  const access=tags.access==='yes'||tags.access==='public'?{status:'public',detail:'Laut Kartendaten; bitte Hinweise vor Ort beachten.'}:tags.access==='permissive'?{status:'restricted',detail:'Zugang nach den Bedingungen des Betreibers.'}:{status:'unknown',detail:''};
  return {openingHours:resolveHours(candidate?[candidate]:[]),amenities,access};
 }
 function view(place){
  const info=place.info||{},library=place.categories.includes('Bibliotheken');
  const fallback=place.sourceKind==='osm'&&place.sourceVersion&&place.sourceTimestamp?fromOSM(place.tags||{},{kind:'osm',label:'OpenStreetMap',url:place.sourceUrl,checkedAt:place.sourceTimestamp}):{};
  const openingHours=resolveHours([...(info.openingHours?.candidates||[]),...(fallback.openingHours?.candidates||[])]);
  const access=info.access||fallback.access||{status:'unknown',detail:''};
  const location=place.address?place.address.split(/,\s*/).filter(Boolean):[`${place.subdistrict||place.district}, Mannheim`];
  if(place.address&&!location.some(line=>/\bMannheim\b/i.test(line)))location.push('Mannheim');
  return {library,openingHours,access:{label:{public:'Öffentlich zugänglich',restricted:'Eingeschränkter Zugang'}[access.status]||'Zugang nicht bestätigt',detail:access.detail||''},
   sports:library?[]:place.categories.map(c=>SPORTS[c]).filter(Boolean),amenities:[...new Set([...(info.amenities||[]),...(fallback.amenities||[])])],
   location};
 }
 return {SPORTS,parseOfficial,parseOSM,resolveHours,mergeInfo,fromOSM,view};
});
