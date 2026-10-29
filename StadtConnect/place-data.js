/* Dieselbe Datenprüfung beim Import, Laden alter Speicher und vor jeder Ortsauswahl. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geo.js'),require('./place-info.js'));else root.StadtPlaces=factory(root.StadtGeo,root.StadtInfo)})(typeof globalThis==='object'?globalThis:this,function(geo,info){
 'use strict';
 const categories=['Basketballplätze','Beachvolleyballplätze','Bibliotheken','BMX-Anlagen','Calisthenics-Anlagen','Fußballplätze / Bolzplätze','Laufbahnen','Outdoor-Fitnessanlagen','Parkour-Anlagen','Skateparks','Tischtennisplatten','Volleyballplätze'];
 function classify(t){
  const sport=String(t.sport||'').toLowerCase().split(/[;,]/).map(v=>v.trim()),leisure=t.leisure||'',has=(...values)=>values.some(s=>sport.includes(s)),cats=[];
  if(t.amenity==='library')cats.push('Bibliotheken');
  if(has('basketball')&&['pitch','sports_centre'].includes(leisure))cats.push('Basketballplätze');
  if(has('beachvolleyball','beach_volleyball')||has('volleyball')&&t.surface==='sand')cats.push('Beachvolleyballplätze');
  if(has('volleyball')&&!cats.includes('Beachvolleyballplätze')&&leisure==='pitch')cats.push('Volleyballplätze');
  if(has('bmx','bicycle_motocross')||leisure==='track'&&t.bicycle==='bmx')cats.push('BMX-Anlagen');
  if(has('calisthenics','street_workout')||t.fitness_station==='calisthenics')cats.push('Calisthenics-Anlagen');
  if(has('soccer','football')&&leisure==='pitch')cats.push('Fußballplätze / Bolzplätze');
  if(leisure==='track'&&has('running','athletics')||t.athletics==='running')cats.push('Laufbahnen');
  if(leisure==='fitness_station'||leisure==='fitness_centre'&&t.outdoor==='yes')cats.push('Outdoor-Fitnessanlagen');
  if(has('parkour')||leisure==='parkour')cats.push('Parkour-Anlagen');
  if(has('skateboard','skateboarding')||leisure==='skate_park')cats.push('Skateparks');
  if(has('table_tennis')||leisure==='table_tennis')cats.push('Tischtennisplatten');
  return categories.filter(c=>cats.includes(c));
 }
 function excluded(t){
  return ['private','no','customers','members','permit'].includes(String(t.access||'').toLowerCase())||['yes','required'].includes(String(t.fee||'').toLowerCase())||t.membership==='required'||!!t.charge&&!['no','0','0 EUR'].includes(t.charge)||t['fee:conditional']&&t['fee:conditional'].startsWith('yes');
 }
 function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
 function normalize(raw,boundaries,subdistricts){
  if(!raw||!raw.geometry||!Array.isArray(raw.categories))return null;
  const point=geo.markerPoint(raw.geometry),district=geo.districtFor(boundaries,point);if(!district)return null;
  if(!['Lindenhof','Neckarau','Rheinau'].includes(district.properties.name))return null;
  const tags=raw.tags&&typeof raw.tags==='object'?raw.tags:{};if(excluded(tags))return null;
  const cats=categories.filter(c=>raw.categories.includes(c));if(!cats.length)return null;
  const sub=geo.districtFor(subdistricts,point);
  return {...raw,id:String(raw.id),name:String(raw.name||cats.join(' / ')),categories:cats,district:district.properties.name,subdistrict:sub?.properties.name||'',lat:point[1],lon:point[0],real:true,
   website:safeUrl(raw.website||tags.website||tags['contact:website']),access:raw.access||'Zugänglichkeit nicht bestätigt',accessConfirmed:raw.accessConfirmed===true,
   positionMethod:raw.positionMethod||(raw.geometry.type==='Point'?'Originaler Quellpunkt':raw.geometry.type==='LineString'?'Punkt auf der originalen Liniengeometrie':'Innenpunkt der originalen Objektfläche')};
 }
 function fromOSM(element,boundaries,subdistricts){
  if(!Number.isInteger(element.version)||element.version<1||!Number.isFinite(Date.parse(element.timestamp)))return null;
  const tags=element.tags||{},cats=classify(tags);if(!cats.length||excluded(tags))return null;
  const geometry=geo.osmGeometry(element);if(!geometry)return null;
  const address=[tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(' ');
  return normalize({id:`osm_${element.type}_${element.id}`,name:tags['name:de']||tags.name||cats.join(' / '),categories:cats,geometry,tags,sourceKind:'osm',sourceUrl:`https://www.openstreetmap.org/${element.type}/${element.id}`,sourceLabel:'OpenStreetMap',sourceTimestamp:element.timestamp||'',sourceVersion:element.version||null,
   address:address+(tags['addr:postcode']?`, ${tags['addr:postcode']} Mannheim`:''),description:tags.description||'',hours:tags.opening_hours||'',
   equipment:[tags.surface&&`Belag: ${tags.surface}`,tags.lit&&`Beleuchtung: ${tags.lit}`,tags.wheelchair&&`Rollstuhlzugang laut OSM: ${tags.wheelchair}`].filter(Boolean).join(' · '),
   info:info.fromOSM(tags,{kind:'osm',label:'OpenStreetMap',url:`https://www.openstreetmap.org/${element.type}/${element.id}`,checkedAt:element.timestamp}),
   access:tags.access==='yes'||tags.access==='public'?'Öffentlicher Zugang laut OSM; vor Ort nicht bestätigt':'Zugänglichkeit nicht bestätigt',accessConfirmed:false},boundaries,subdistricts);
 }
 function dedupe(items){
  const result=[];
  const name=p=>p.name.trim().toLowerCase().replace(/\s*\([^)]*\)/g,'').replace(/\s+/g,' ');
  for(const p of items){
   const duplicate=result.find(q=>q.id===p.id||name(q)===name(p)&&q.categories.some(c=>p.categories.includes(c))&&(q.geometry.type==='Point'&&geo.contains(p.geometry,[q.lon,q.lat])||p.geometry.type==='Point'&&geo.contains(q.geometry,[p.lon,p.lat])||geo.contains(q.geometry,[p.lon,p.lat])&&geo.contains(p.geometry,[q.lon,q.lat])||q.lat===p.lat&&q.lon===p.lon));
   if(duplicate){duplicate.categories=categories.filter(c=>duplicate.categories.includes(c)||p.categories.includes(c));duplicate.info=info.mergeInfo(duplicate.info,p.info);duplicate.alternateIds=[...new Set([...(duplicate.alternateIds||[]),p.id,...(p.alternateIds||[])])];duplicate.extraSources=[...(duplicate.extraSources||[]),{label:p.sourceLabel,url:p.sourceUrl}]}else result.push({...p});
  }return result.sort((a,b)=>a.name.localeCompare(b.name,'de'));
 }
 function bboxQuery(boundaries){
  const bs=(boundaries?.features||[]).map(f=>geo.bounds(f.geometry)).filter(Boolean);if(bs.length!==3)throw Error('Amtliche Bezirksgrenzen fehlen');
  const bbox=[Math.min(...bs.map(b=>b[1])),Math.min(...bs.map(b=>b[0])),Math.max(...bs.map(b=>b[3])),Math.max(...bs.map(b=>b[2]))].join(',');
  // Bounding Box dient nur dem Sammelabruf. Aufnahme ausschließlich nach Polygonprüfung.
  return `[out:json][timeout:25];(nwr[amenity="library"](${bbox});nwr[fitness_station="calisthenics"](${bbox});nwr[leisure="fitness_centre"][outdoor="yes"](${bbox});nwr[leisure~"^(pitch|skate_park|fitness_station|track|table_tennis|parkour)$"](${bbox});nwr[sport~"basketball|volleyball|soccer|football|table_tennis|calisthenics|street_workout|parkour|skateboard|skateboarding|bmx|bicycle_motocross|running|athletics"](${bbox}););out meta geom;`;
 }
 return {categories,classify,excluded,normalize,fromOSM,dedupe,bboxQuery};
});
