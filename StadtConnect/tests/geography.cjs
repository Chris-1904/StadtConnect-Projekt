const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const geo=require('../geo.js'),places=require('../place-data.js'),proj4=require('../scripts/vendor/proj4.cjs');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json'))),checks=[];
function check(name,value){assert.ok(value,name);checks.push(name);console.log('OK',name)}
check('Drei vollständige amtliche Bezirksobjekte 05/16/17',data.boundaries.features.map(f=>f.properties.id).sort().join(',')==='05,16,17');
check('Alle acht offiziellen Stadtteile im Zielgebiet',data.subdistricts.features.map(f=>f.properties.id).sort().join(',')==='050,161,162,163,171,172,173,174');
for(const f of data.subdistricts.features){const p=geo.interiorPoint(f.geometry),expected=f.properties.id==='050'?'Lindenhof':f.properties.id.startsWith('16')?'Neckarau':'Rheinau';check(`Stadtteil ${f.properties.name}: Polygonzuordnung ${expected}`,geo.districtFor(data.boundaries,p)?.properties.name===expected)}
for(const [name,p] of [['Ludwigshafen',[8.442,49.478]],['Innenstadt',[8.466,49.489]],['Neuhermsheim',[8.509,49.472]],['außerhalb südlich Rheinau',[8.54,49.397]]])check(`${name} wird ausgeschlossen`,geo.districtFor(data.boundaries,p)===null);
check('Alle 25 lokalen Orte haben echte Quellreferenz und gültige Bezirksgeometrie',data.items.length===25&&data.items.every(p=>p.sourceUrl.startsWith('https://')&&p.sourceKind.startsWith('mannheim-')&&geo.districtFor(data.boundaries,[p.lon,p.lat])?.properties.name===p.district));
check('Flächenmarker liegen innerhalb ihrer tatsächlichen Quellfläche',data.items.filter(p=>p.geometry.type!=='Point').every(p=>geo.contains(p.geometry,[p.lon,p.lat])));
check('Keine doppelten IDs oder versehentlich identischen Markerpositionen',new Set(data.items.map(p=>p.id)).size===data.items.length&&new Set(data.items.map(p=>`${p.lat},${p.lon}`)).size===data.items.length);
check('Veralteter Skate-Eintrag Pfalzplatz korrigiert, Schnickenloch mit offizieller Quelle ergänzt',data.items.filter(p=>p.name==='Pfalzplatz').every(p=>!p.categories.includes('Skateparks'))&&data.items.some(p=>/Schnickenloch/.test(p.name)&&p.categories.includes('Skateparks')&&p.extraSources.some(s=>s.url.includes('eingeweiht'))));
for(const name of ['neckarau','rheinau']){const source=fs.readFileSync(path.join(root,`tests/research/library-${name}.html`),'utf8'),point=source.match(/[?&]q=(49\.\d+),(8\.\d+)/),p=data.items.find(p=>p.id===`ma_library_${name}`);check(`Bibliothek ${name}: unveränderte Koordinate aus offizieller Standortseite`,p.lat===+point[1]&&p.lon===+point[2])}
const original=JSON.parse(fs.readFileSync(path.join(root,'tests/research/districts-utm.json'))),projection='+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs';
let maxError=0,vertices=0;
for(const f of data.boundaries.features){const old=original.features.find(o=>o.id===f.id);assert.equal(JSON.stringify(old.geometry.coordinates.map(p=>p.map(r=>r.length))),JSON.stringify(f.geometry.coordinates.map(p=>p.map(r=>r.length))));f.geometry.coordinates.forEach((poly,i)=>poly.forEach((ring,j)=>ring.forEach((point,k)=>{const inverse=proj4('EPSG:4326',projection,point),raw=old.geometry.coordinates[i][j][k];maxError=Math.max(maxError,Math.hypot(inverse[0]-raw[0],inverse[1]-raw[1]));vertices++})));}
check(`${vertices} Grenzstützpunkte vollständig, CRS-Rundlauf unter 0,001 m`,maxError<.001);
const polygon={type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[4,4],[6,4],[6,6],[4,6],[4,4]]]};
check('Innenring und seine Randlinie sind ausgeschlossen',!geo.contains(polygon,[5,5])&&!geo.contains(polygon,[4,5])&&geo.contains(polygon,[2,5]));
check('Innenpunkt landet nicht im Loch',geo.contains(polygon,geo.interiorPoint(polygon)));
const multi={type:'MultiPolygon',coordinates:[polygon.coordinates,[[[20,20],[21,20],[21,21],[20,21],[20,20]]]]};check('MultiPolygon berücksichtigt beide Teile und Zwischenraum',geo.contains(multi,[20.5,20.5])&&geo.contains(multi,[2,2])&&!geo.contains(multi,[15,15]));
const duplicateBase={id:'node_a',name:'Gleicher Ort',categories:['Basketballplätze'],lat:2,lon:2,geometry:{type:'Point',coordinates:[2,2]}};
check('Doppeltes Punkt-/Flächenobjekt wird zusammengeführt',places.dedupe([duplicateBase,{...duplicateBase,id:'way_b',geometry:polygon}]).length===1);
check('Unterschiedliche Anlagen werden nicht wegen ähnlicher Namen verschoben oder zusammengelegt',places.dedupe([duplicateBase,{...duplicateBase,id:'node_b',lat:3,lon:3,geometry:{type:'Point',coordinates:[3,3]}}]).length===2);
check('Offene oder fehlende OSM-Flächengeometrie erzeugt keinen geschätzten Marker',geo.osmGeometry({type:'way',center:{lat:49.45,lon:8.48}})===null);
const relation={type:'relation',tags:{type:'multipolygon'},members:[{type:'way',role:'outer',geometry:[{lon:0,lat:0},{lon:10,lat:0},{lon:10,lat:10}]},{type:'way',role:'outer',geometry:[{lon:0,lat:0},{lon:0,lat:10},{lon:10,lat:10}]},{type:'way',role:'inner',geometry:[{lon:4,lat:4},{lon:6,lat:4},{lon:6,lat:6},{lon:4,lat:6},{lon:4,lat:4}]}]};
const assembled=geo.osmGeometry(relation);check('OSM-Relation: umgekehrte Teilwege und Innenring korrekt verbunden',assembled&&geo.contains(assembled,[2,2])&&!geo.contains(assembled,[5,5]));
check('Ungültige Ringsegmente werden abgelehnt',geo.osmGeometry({...relation,members:relation.members.slice(0,1)})===null);
const foreign={type:'node',id:1,version:1,timestamp:'2026-10-28T10:00:00Z',lat:49.478,lon:8.442,tags:{leisure:'pitch',sport:'basketball','addr:suburb':'Neckarau'}};check('Irreführendes OSM-Bezirkslabel überstimmt die Geometrie nicht',places.fromOSM(foreign,data.boundaries,data.subdistricts)===null);
const report={date:new Date().toISOString(),passed:checks.length,checks,sourceVertices:vertices,maxProjectionRoundtripErrorMetres:maxError,realLocalPlaces:data.items.length};
fs.writeFileSync(path.join(root,'tests/geography-result.json'),JSON.stringify(report,null,2));
console.log('Bestanden:',checks.length);
