const fs=require('node:fs'),crypto=require('node:crypto'),geo=require('../geo.js'),places=require('../place-data.js'),placeInfo=require('../place-info.js');
const read=name=>JSON.parse(fs.readFileSync(`data/${name}.geojson`,'utf8'));
const boundaries=read('districts'),subdistricts=read('subdistricts'),items=[],excluded=[];
const corrections=JSON.parse(fs.readFileSync('data/corrections.json','utf8'));
const wfs=(map)=>`https://www.gis-mannheim.de/mannheim/mod_ogc/wfs_getmap.php?mapfile=${map}&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=${map}`;
for(const f of read('playground').features){
 const p=f.properties,cats=[];
 if(p.kickplatz==='true')cats.push('Fußballplätze / Bolzplätze');if(p.basketball==='true')cats.push('Basketballplätze');if(p.skateranlage==='true')cats.push('Skateparks');if(p.bmxanlage==='true')cats.push('BMX-Anlagen');
 if(/Calisthenics/i.test(p.name))cats.push('Calisthenics-Anlagen');
 let displayName=p.name.trim();const rules=corrections.rules.filter(r=>r.featureIds.includes(p.gid));
 for(const rule of rules){for(const c of rule.removeCategories||[]){let i;while((i=cats.indexOf(c))>=0)cats.splice(i,1)}cats.push(...(rule.addCategories||[]));if(rule.displayName)displayName=rule.displayName}
 if(!cats.length)continue;
 const entry=places.normalize({id:`ma_playground_${p.gid}`,name:displayName,categories:cats,geometry:f.geometry,sourceKind:'mannheim-wfs',sourceLabel:'Stadt Mannheim · Freizeitflächen',sourceUrl:wfs('spielplatz_poly'),sourceFeatureId:f.id,sourceRetrievedAt:boundaries.retrievedAt,
  reviewNotes:rules.map(r=>r.reason).join(' '),extraSources:rules.length?[{label:'Stadt Mannheim · bestätigte Verlegung/Eröffnung',url:corrections.source}]:[],
  address:'',access:'Zugänglichkeit nicht bestätigt',positionMethod:'Innenpunkt der amtlichen Freizeitfläche; einzelne Sportgeräte nicht separat vermessen',equipment:'Sportausstattung gemäß amtlichem Freizeitflächenkataster'},boundaries,subdistricts);
 if(entry)items.push(entry);
}
for(const f of read('sport').features){
 const p=f.properties,point=geo.interiorPoint(f.geometry);if(!geo.districtFor(boundaries,point))continue;
 const cats=Object.entries({basketball:'Basketballplätze',fussball:'Fußballplätze / Bolzplätze',bolzplatz:'Fußballplätze / Bolzplätze',laufbahn:'Laufbahnen',tischten_:'Tischtennisplatten',skater:'Skateparks',beachvolly:'Beachvolleyballplätze'}).filter(([key])=>p[key]==='x').map(([,cat])=>cat);
 if(!cats.length)continue;
 // Vereins-/Schulgelände wird konservativ nicht als frei nutzbares Angebot importiert.
 if(!/^Stadt Mannheim, (SA |Jugendtreff )/.test(p.name)){excluded.push({id:f.id,name:p.name,reason:'Vereins-/Schulgelände oder öffentlicher Zugang nicht ausreichend belegt'});continue}
 const parent=items.find(i=>geo.contains(i.geometry,point));
 if(parent){parent.categories=[...new Set([...parent.categories,...cats])];parent.extraSources=[...(parent.extraSources||[]),{label:'Stadt Mannheim · Sportflächen',url:wfs('sportflaechen_public'),featureId:f.id}];continue}
 const entry=places.normalize({id:`ma_sport_${p.gid}`,name:p.name.replace('Stadt Mannheim, SA ','Sportanlage ').trim(),categories:[...new Set(cats)],geometry:f.geometry,sourceKind:'mannheim-wfs',sourceLabel:'Stadt Mannheim · Sportflächen',sourceUrl:wfs('sportflaechen_public'),sourceFeatureId:f.id,sourceRetrievedAt:boundaries.retrievedAt,address:p.adresse||'',equipment:[p.bemerk,p.belag].filter(Boolean).join(' · '),info:{amenities:p.belag?['Belag: '+p.belag]:[]},access:'Zugänglichkeit nicht bestätigt'},boundaries,subdistricts);if(entry)items.push(entry);
}
for(const name of ['neckarau','rheinau']){
 const html=fs.readFileSync(`tests/research/library-${name}.html`,'utf8'),match=html.match(/[?&]q=(49\.\d+),(8\.\d+)/);if(!match)throw Error('Offizieller Bibliothekspunkt fehlt');
 const url=`https://www.mannheim.de/de/bildung-staerken/stadtbibliothek/adressen-und-oeffnungszeiten/zweigstellen-in-den-stadtteilen/${name}`;
 const entry=places.normalize({id:`ma_library_${name}`,name:`Stadtbibliothek · Zweigstelle ${name==='neckarau'?'Neckarau':'Rheinau'}`,categories:['Bibliotheken'],geometry:{type:'Point',coordinates:[+match[2],+match[1]]},sourceKind:'mannheim-library',sourceLabel:'Stadtbibliothek Mannheim',sourceUrl:url,website:url,sourceRetrievedAt:boundaries.retrievedAt,positionMethod:'Unveränderter Standortpunkt der offiziellen Bibliotheksseite; Eingang nicht separat vermessen',
  address:name==='neckarau'?'Heinrich-Heine-Straße 2, 68199 Mannheim':'Kronenburgstraße 45–55, 68219 Mannheim',
  hours:'',
  rooms:name==='rheinau'?'Lese- und Lerntische auf der Empore laut offizieller Seite; keine verlässlich belegte Gruppenraumkapazität.':'Zwei Internet-Arbeitsplätze laut offizieller Seite; Lern- und Gruppenraumkapazität nicht bestätigt.',access:'Bibliotheksstandort offiziell bestätigt. Aktuelle Nutzungsbedingungen und Feiertagsöffnungszeiten bitte über die Bibliothek prüfen.',accessConfirmed:false},boundaries,subdistricts);if(!entry)throw Error('Bibliothek außerhalb des amtlichen Gebiets');items.push(entry);
}
const osmPath='tests/research/osm-source.json';
if(fs.existsSync(osmPath)){const source=JSON.parse(fs.readFileSync(osmPath));if(source.remark||!Array.isArray(source.elements))throw Error('Unvollständige OSM-Quelle');for(const e of source.elements){const p=places.fromOSM(e,boundaries,subdistricts);if(p)items.push(p)}}
const enrichment=fs.existsSync('data/place-info.json')?JSON.parse(fs.readFileSync('data/place-info.json','utf8')).items:{};
const catalog=places.dedupe(items).map(p=>{const extra=enrichment[p.id];return {...p,info:placeInfo.mergeInfo(p.info,extra?.identityChecked&&extra.source?.url===p.sourceUrl?extra:{})}});
const data={schemaVersion:1,boundaryVersion:crypto.createHash('sha256').update(JSON.stringify(boundaries.features)).digest('hex'),retrievedAt:boundaries.retrievedAt,boundaries,subdistricts,items:catalog,osmLiveConfirmed:fs.existsSync(osmPath),limitations:[fs.existsSync(osmPath)?'OSM-Sammelabruf zusätzlich vorhanden; keine Vollständigkeitsbehauptung.':'OSM-Live-Abfrage nicht erfolgreich; amtlicher lokaler Ersatzbestand, keine Vollständigkeitsbehauptung.','Freizeitflächenpunkte liegen innerhalb der amtlichen Anlage; einzelne Geräte sind nicht separat vermessen.'],attribution:boundaries.attribution};
fs.writeFileSync('data/catalog.json',JSON.stringify(data));fs.writeFileSync('data/catalog.js','/* Generierter lokaler Quellenbestand, siehe data/QUELLEN.md. */\nglobalThis.STADT_DATA='+JSON.stringify(data)+';\n');
const counts=Object.fromEntries(['Lindenhof','Neckarau','Rheinau'].map(d=>[d,Object.fromEntries(places.categories.map(c=>[c,catalog.filter(p=>p.district===d&&p.categories.includes(c)).length]))]));
fs.writeFileSync('data/coverage.json',JSON.stringify({total:catalog.length,districts:Object.fromEntries(Object.keys(counts).map(d=>[d,catalog.filter(p=>p.district===d).length])),categories:counts,excluded},null,2));console.log('Orte',catalog.length,JSON.stringify(counts));
