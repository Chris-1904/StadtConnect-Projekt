'use strict';
/* StadtConnect Mannheim – studentischer Demo-Prototyp. Kein Backend, keine echte Authentifizierung. */
const STORAGE_KEY='stadtconnect_students_v3';
const LEGACY_KEY='stadtconnect_demo_v1';
const LEGACY_ARCHIVE_KEY='stadtconnect_legacy_backup_v1';
const OSM_KEY='stadtconnect_osm_study_v3';
const OLD_OSM_KEY='stadtconnect_osm_places_v2';
const CATEGORIES=[
  'Basketballplätze','Beachvolleyballplätze','Bibliotheken','BMX-Anlagen','Calisthenics-Anlagen',
  'Fußballplätze / Bolzplätze','Laufbahnen','Outdoor-Fitnessanlagen','Parkour-Anlagen',
  'Skateparks','Tischtennisplatten','Volleyballplätze'
];
const DISTRICTS=['Alle','Lindenhof','Neckarau','Almenhof','Niederfeld'];
const SPORT_CATEGORIES=CATEGORIES.filter(c=>c!=='Bibliotheken');
const BOUNDS={Lindenhof:[49.464,49.488,8.435,8.478],Almenhof:[49.451,49.468,8.459,8.489],Niederfeld:[49.440,49.458,8.434,8.468],Neckarau:[49.421,49.458,8.465,8.516]};
// Kontur-Icons: einheitliche SVG-Strichstärke, ohne zusätzliche Icon-Bibliothek.
const PATHS={
  map:'<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><path d="M9 3v15M15 6v15"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.8-5.4A8.5 8.5 0 1 1 21 11.5Z"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',back:'<path d="M19 12H5m6 6-6-6 6-6"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-2l1 2M19 15a8 8 0 0 1-14 2l-1-2"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>', check:'<path d="m5 12 5 5L20 7"/>',
  alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  edit:'<path d="m4 20 4-.8L20 7a2 2 0 0 0-3-3L5 16 4 20Z"/>',
  filter:'<path d="M3 5h18L14 13v6l-4 2v-8L3 5Z"/>',
  book:'<path d="M12 6a9 9 0 0 0-9-2v15a9 9 0 0 1 9 2V6ZM12 6a9 9 0 0 1 9-2v15a9 9 0 0 0-9 2V6Z"/>',
  basketball:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18M5 5c5 4 9 10 14 14"/>',
  volleyball:'<circle cx="12" cy="12" r="9"/><path d="M12 3c4 2 5 6 4 9m-4-9c-3 3-3 7-3 10m-6-1c5-2 9-1 12 3m5-8c-4 2-8 5-9 13m-5-2c4-3 9-5 15-5"/>',
  bike:'<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="m5.5 17 5-10 4 10H5.5m5-10h5l3 10M9 7H7"/>',
  strength:'<path d="M3 10v4m4-7v10m10-10v10m4-7v4M7 12h10M1 8v8m22-8v8"/>',
  football:'<circle cx="12" cy="12" r="9"/><path d="m12 8 4 3-1.5 5h-5L8 11l4-3Zm-4 3-4-1m12 1 4-1m-10.5 6-1 4m6-4 1 4"/>',
  run:'<circle cx="15.5" cy="4.5" r="2"/><path d="m12 9 3 3 4 1M12 9l-4 4-4 1m8-5-1 6-5 5m5-5 5 2 2 4"/>',
  parkour:'<circle cx="15" cy="4" r="2"/><path d="M5 20h6v-4h6v-4h4M12 8l4 3 4-1M12 8 8 14l4 2"/>',
  skate:'<path d="m3 13 15 2a3 3 0 0 0 3-3v-1M3 13c0 4 5 5 8 5h9"/><circle cx="7" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>',
  paddle:'<rect x="5" y="3" width="10" height="14" rx="5"/><path d="M10 17v5M15 8l6 0"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  logout:'<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 16l4-4-4-4m4 4H9"/>',
  report:'<path d="M5 21V4m0 0c4-3 10 3 15 0v11c-5 3-11-3-15 0"/>',
  save:'<path d="M4 3h14l3 3v15H3V3h1Zm2 0v7h11V3M7 21v-8h10v8"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'
};
const CATEGORY_ICONS={'Basketballplätze':'basketball','Beachvolleyballplätze':'volleyball','Bibliotheken':'book','BMX-Anlagen':'bike','Calisthenics-Anlagen':'strength','Fußballplätze / Bolzplätze':'football','Laufbahnen':'run','Outdoor-Fitnessanlagen':'strength','Parkour-Anlagen':'parkour','Skateparks':'skate','Tischtennisplatten':'paddle','Volleyballplätze':'volleyball'};
const icon=(name,extra='')=>`<svg class="svg-icon ${extra}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name]||PATHS.info}</svg>`;
const catIcon=(category)=>icon(CATEGORY_ICONS[category]||'location');
const escapeHtml=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=(s)=>escapeHtml(s);
const dateYMD=(dt)=>`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
const nextDay=(n,h=18)=>{let x=new Date();x.setDate(x.getDate()+n);x.setHours(h,0,0,0);return dateYMD(x)};
const futureSaturday=()=>{let d=new Date();d.setDate(d.getDate()+((6-d.getDay()+7)%7||7));return dateYMD(d)};
const minutesOf=(day,t)=>new Date(`${day}T${t||'12:00'}`).getTime();
const ageOf=(s)=>{if(!s||!/^\d{4}-\d\d-\d\d$/.test(s))return NaN;let d=new Date(`${s}T12:00:00`);if(isNaN(+d))return NaN;let today=new Date(),n=today.getFullYear()-d.getFullYear();if(today.getMonth()<d.getMonth()||(today.getMonth()===d.getMonth()&&today.getDate()<d.getDate()))n--;return n};
const describeTime=(o)=>new Date(`${o.date}T${o.time}`).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const toTime=(n)=>new Date(n).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
const isFuture=o=>minutesOf(o.date,o.time)>Date.now();
const sorted=(arr)=>[...arr].sort((a,b)=>minutesOf(a.date,a.time)-minutesOf(b.date,b.time));
const randomId=(prefix)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
function demoPlaces(){return [
  {id:'demo_sport1',name:'Beispiel-Basketballplatz Neckarau',categories:['Basketballplätze'],district:'Neckarau',real:false,location:'Fiktiver Treffpunkt, genauer Ort nicht festgelegt',access:'Nur Beispieldaten. Kein realer Standort bestätigt.'},
  {id:'demo_library1',name:'Beispiel-Lernort Lindenhof',categories:['Bibliotheken'],district:'Lindenhof',real:false,location:'Fiktiver Bibliothekstreffpunkt, genauer Ort nicht festgelegt',access:'Nur Beispieldaten. Kein Lernplatz reserviert.'},
  {id:'demo_sport2',name:'Beispiel-Calisthenics-Anlage Almenhof',categories:['Calisthenics-Anlagen'],district:'Almenhof',real:false,location:'Fiktiver Treffpunkt, genauer Ort nicht festgelegt',access:'Nur Beispieldaten. Kein realer Standort bestätigt.'},
  {id:'demo_sport3',name:'Beispiel-Tischtennisplatz Niederfeld',categories:['Tischtennisplatten'],district:'Niederfeld',real:false,location:'Fiktiver Treffpunkt, genauer Ort nicht festgelegt',access:'Nur Beispieldaten. Kein realer Standort bestätigt.'},
  {id:'demo_sport4',name:'Beispiel-Bolzplatz Neckarau',categories:['Fußballplätze / Bolzplätze'],district:'Neckarau',real:false,location:'Fiktiver Treffpunkt, genauer Ort nicht festgelegt',access:'Nur Beispieldaten. Kein realer Standort bestätigt.'},
  {id:'demo_sport5',name:'Beispiel-Skatefläche Lindenhof',categories:['Skateparks'],district:'Lindenhof',real:false,location:'Fiktiver Treffpunkt, genauer Ort nicht festgelegt',access:'Nur Beispieldaten. Kein realer Standort bestätigt.'}
]}
const DEMO_PLACES=demoPlaces();
function seed(){let users=[
  {id:'max',name:'Max',dob:'2003-04-15',email:'max@example.test',university:'Technische Hochschule Mannheim',course:'Cyber Security',district:'Neckarau',gender:'Keine Angabe',interests:'Basketball, Fitness, Programmieren',bio:'Lust auf Basketball nach der Vorlesung.',avatar:'user',visibility:{age:true,district:true,university:true,course:true,interests:true,gender:false,bio:true}},
  {id:'mia',name:'Mia',dob:'2004-01-15',email:'mia@example.test',university:'Universität Mannheim',course:'Informatik',district:'Lindenhof',gender:'Keine Angabe',interests:'Lernen, Programmieren, Volleyball',bio:'Gemeinsam lernen macht mehr Spaß.',avatar:'book',visibility:{age:true,district:true,university:true,course:true,interests:true,gender:false,bio:true}},
  {id:'jonas',name:'Jonas',dob:'2002-05-18',email:'jonas@example.test',university:'Technische Hochschule Mannheim',course:'Maschinenbau',district:'Almenhof',gender:'Keine Angabe',interests:'Calisthenics, Fußball',bio:'Bin bei jeder Sporteinheit dabei.',avatar:'strength',visibility:{age:true,district:true,university:true,course:true,interests:true,gender:false,bio:true}},
  {id:'lea',name:'Lea',dob:'2003-02-24',email:'lea@example.test',university:'Universität Mannheim',course:'BWL',district:'Niederfeld',gender:'Keine Angabe',interests:'Tischtennis, Lerngruppen',bio:'Suche motivierte Lernpartner.',avatar:'user',visibility:{age:true,district:true,university:true,course:true,interests:true,gender:false,bio:true}}
];return {version:3,users,activeUserId:'max',groups:[
  {id:'g1',name:'Basketball nach der Vorlesung',description:'Regelmäßige lockere Basketballrunden für Studierende. Alle Leistungsniveaus willkommen.',focus:'Basketball',district:'Neckarau',members:['mia','jonas'],owner:'mia'},
  {id:'g2',name:'Calisthenics Mannheim',description:'Gemeinsam draußen trainieren, Techniken üben und motivieren.',focus:'Calisthenics',district:'Almenhof',members:['jonas','lea'],owner:'jonas'},
  {id:'g3',name:'Gemeinsam durch die Klausurenphase',description:'Lerntermine vor Prüfungen und gegenseitige Unterstützung.',focus:'Lerngruppe',district:'Lindenhof',members:['mia','lea'],owner:'mia'},
  {id:'g4',name:'Programmier-Lerngruppe',description:'Übungsaufgaben bearbeiten, Konzepte verstehen und Ideen austauschen.',focus:'Programmieren',district:'Lindenhof',members:['mia','max'],owner:'mia'}
],activities:[
  {id:'a1',type:'sport',title:'Basketball nach der Vorlesung',description:'Lockere Runde 3-gegen-3. Anfänger sind willkommen.',hostId:'mia',placeId:'demo_sport1',category:'Basketballplätze',date:nextDay(2,17),time:'17:00',endTime:'18:30',max:8,attendees:['mia','jonas'],ageMin:18,ageMax:null,groupId:'g1',level:'Offen für alle',equipment:'Sportschuhe und nach Möglichkeit einen Ball',topic:'',goal:'',meetingPoint:'Treffpunkt vor dem Spiel gemeinsam abstimmen',status:'active'},
  {id:'a2',type:'lernen',title:'Programmieren: Übungsaufgaben bearbeiten',description:'Gemeinsam Aufgaben lösen und Fragen für die nächste Übung klären.',hostId:'mia',placeId:'demo_library1',category:'Bibliotheken',date:nextDay(3,15),time:'15:00',endTime:'17:00',max:6,attendees:['mia','lea'],ageMin:18,ageMax:null,groupId:'g4',level:'',equipment:'',topic:'Programmieren',goal:'Algorithmen verstehen und Übungsblatt gemeinsam lösen',meetingPoint:'Genauer Treffpunkt wird im Chat abgesprochen',status:'active'},
  {id:'a3',type:'sport',title:'Calisthenics gemeinsam trainieren',description:'Training mit eigenem Körpergewicht und kurzen Pausen zum Austauschen.',hostId:'jonas',placeId:'demo_sport2',category:'Calisthenics-Anlagen',date:nextDay(4,16),time:'16:00',endTime:'17:30',max:8,attendees:['jonas','lea'],ageMin:18,ageMax:null,groupId:'g2',level:'Offen für alle',equipment:'Wasserflasche und Handtuch',topic:'',goal:'',meetingPoint:'Genaue Anlage vorab im Chat klären',status:'active'},
  {id:'a4',type:'sport',title:'Tischtennis nach der Vorlesung',description:'Ein paar Matches ohne Turnierstress.',hostId:'lea',placeId:'demo_sport3',category:'Tischtennisplatten',date:nextDay(5,18),time:'18:00',endTime:'19:00',max:4,attendees:['lea'],ageMin:18,ageMax:null,groupId:null,level:'Offen für alle',equipment:'Eigener Schläger, wenn vorhanden',topic:'',goal:'',meetingPoint:'Genauer Tisch vorab abstimmen',status:'active'}
],messages:{'a:a1':[{from:'mia',text:'Ich freue mich auf unsere Runde!',at:'16:20'}],'g:g1':[{from:'jonas',text:'Wer ist diese Woche dabei?',at:'11:05'}],'g:g4':[{from:'max',text:'Kann jemand das Übungsblatt mitbringen?',at:'14:15'}]},reports:[]}}
function storageGet(key){try{return localStorage.getItem(key)}catch{return null}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
let migrationNote='';
function loadDB(){try{let raw=JSON.parse(storageGet(STORAGE_KEY)||'null');if(raw&&raw.version===3&&Array.isArray(raw.users)&&Array.isArray(raw.activities))return raw}catch{}
  let fresh=seed();let legacy=storageGet(LEGACY_KEY);if(legacy&&!storageGet(LEGACY_ARCHIVE_KEY)){
    storageSet(LEGACY_ARCHIVE_KEY,legacy);
    migrationNote='Ältere Demodaten wurden als Sicherung archiviert. Nicht mehr zum Studienkonzept passende Angebote erscheinen nicht in der neuen Version.';
    // Individuell angelegte Inhalte bleiben in der Sicherung; kompatible Aktivitäten werden kontrolliert übernommen.
    try{const old=JSON.parse(legacy);if(old.user?.name&&old.user.name!=='Max'&&ageOf(old.user.dob)>=18){fresh.users.push({...fresh.users[0],...old.user,id:'legacy_user',university:'Hochschule (Selbstauskunft fehlt)',course:'',interests:'',visibility:fresh.users[0].visibility});fresh.activeUserId='legacy_user'}
      for(const oldGroup of old.groups||[]){if(['g1','g2','g3'].includes(oldGroup.id)||!oldGroup.name||!/sport|basketball|fußball|volleyball|lern|stud|mathe|programmier|fitness|training|informatik|klausur/i.test(oldGroup.name+' '+oldGroup.description))continue;fresh.groups.push({id:randomId('migrated_group'),name:oldGroup.name,description:oldGroup.description||'Übernommene Gruppe',focus:oldGroup.interests||'Sport oder Lernen',district:DISTRICTS.includes(oldGroup.district)?oldGroup.district:'Neckarau',members:[fresh.activeUserId],owner:fresh.activeUserId})}
      const oldDemoIds=['a1','a2','a3','a4'];for(const entry of old.activities||[]){if(oldDemoIds.includes(entry.id)||!entry.title)continue;let legacyLoc=(old.places||[]).find(p=>p.id===entry.placeId);let cat=entry.category||legacyLoc?.category||({p1:'Basketballplätze',p4:'Fußballplätze / Bolzplätze',p5:'Skateparks'}[entry.placeId]);if(!CATEGORIES.includes(cat)){continue}let place=DEMO_PLACES.find(d=>d.categories.includes(cat));if(!place)continue;fresh.activities.push({id:randomId('migrated'),type:cat==='Bibliotheken'?'lernen':'sport',title:entry.title,description:entry.description||'Aus vorheriger Demo übernommen',hostId:fresh.activeUserId,placeId:place.id,category:cat,date:entry.date||nextDay(2),time:entry.time||'18:00',endTime:'',max:Math.max(1,Number(entry.max)||8),attendees:[fresh.activeUserId],ageMin:18,ageMax:null,groupId:null,level:'Offen für alle',equipment:'',topic:'',goal:'',meetingPoint:'Bitte nach der Migration Treffpunkt prüfen',status:entry.status==='cancelled'?'cancelled':'active'})}
    }catch(e){console.warn('Migration: Legacy-Daten archiviert, Übernahme teilweise nicht möglich',e)}
  }
  storageSet(STORAGE_KEY,JSON.stringify(fresh));return fresh;
}
let db=loadDB();
let ui={page:'Entdecken',detail:null,modal:null,modalData:null,selectedPlace:null,chat:null,placeQuery:'',district:'Alle',selectedCats:new Set(),activityQuery:'',actDistrict:'Alle',actCategory:'Alle',actDate:'',actSpots:false,actMine:false,groupQuery:'',mobileMode:'map',sortGroups:'all'};
let realPlaces=[];let osmLoading=false;let osmError='';let osmFetchedAt=0;
let leafletMap=null,markerLayer=null,tileErrorCount=0,markerIndex=new Map();
const user=()=>db.users.find(x=>x.id===db.activeUserId)||null;
const me=()=>db.activeUserId;
const userById=id=>db.users.find(x=>x.id===id);
const username=id=>userById(id)?.name||'Demo-Profil';
const groupById=id=>db.groups.find(x=>x.id===id);
const activityById=id=>db.activities.find(x=>x.id===id);
const placeById=id=>realPlaces.find(x=>x.id===id)||DEMO_PLACES.find(x=>x.id===id);
const placesAll=()=>[...realPlaces,...DEMO_PLACES];
const spaces=o=>Math.max(0,o.max-o.attendees.length);
const activityCategory=o=>CATEGORIES.includes(o.category)?o.category:placeById(o.placeId)?.categories?.[0]||'Bibliotheken';
const persist=()=>{if(!storageSet(STORAGE_KEY,JSON.stringify(db)))announce('Speichern im Browser ist nicht möglich. Änderungen bleiben nur bis zum Neuladen.')};
function announce(message){let e=document.getElementById('announcer');if(e)e.textContent=message;const old=document.querySelector('.toast');old?.remove();let toast=document.createElement('div');toast.className='toast';toast.textContent=message;document.body.appendChild(toast);setTimeout(()=>toast.remove(),3500)}
const anyMatch=(s,q)=>String(s||'').toLocaleLowerCase('de').includes(q.trim().toLocaleLowerCase('de'));
const isSafeUrl=(url)=>{try{let parsed=new URL(url);return ['https:','http:'].includes(parsed.protocol)?parsed.href:null}catch{return null}};
const linkTo=(url,label)=>{let safe=isSafeUrl(url);return safe?`<a href="${attr(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`:''};
function districtOf(lat,lon,tags={}){
  let named=String(tags['addr:suburb']||tags['is_in:suburb']||'').toLocaleLowerCase('de');
  for(const d of DISTRICTS.slice(1)){if(named.includes(d.toLocaleLowerCase('de')))return d}
  let matches=Object.entries(BOUNDS).filter(([,b])=>lat>=b[0]&&lat<=b[1]&&lon>=b[2]&&lon<=b[3]);
  if(!matches.length)return null;
  return matches.reduce((best,cur)=>{
    let distance=(b)=>((lat-(b[0]+b[1])/2)*1.6)**2+(lon-(b[2]+b[3])/2)**2;
    return distance(cur[1])<distance(best[1])?cur:best
  })[0];
}
function classifyOSM(t){
  const sport=String(t.sport||'').toLowerCase(),leisure=t.leisure||'',amenity=t.amenity||'',cats=[];
  const add=(cat)=>{if(!cats.includes(cat))cats.push(cat)};
  const has=(s)=>sport.split(/[;,]/).some(v=>v.trim()===s)||sport.includes(s);
  if(amenity==='library')add('Bibliotheken');
  if(has('basketball')&&(leisure==='pitch'||leisure==='sports_centre'||t['sport:use']==='basketball'))add('Basketballplätze');
  if((has('beachvolleyball')||has('beach_volleyball')||((has('volleyball')&&t.surface==='sand')))&&(leisure==='pitch'||leisure==='sports_centre'))add('Beachvolleyballplätze');
  if(has('volleyball')&&leisure==='pitch'&&!cats.includes('Beachvolleyballplätze'))add('Volleyballplätze');
  if((has('soccer')||has('football'))&&leisure==='pitch')add('Fußballplätze / Bolzplätze');
  if((has('bmx')||has('bicycle_motocross'))||(leisure==='track'&&t.bicycle==='bmx'))add('BMX-Anlagen');
  if(has('calisthenics')||has('street_workout')||t.fitness_station==='calisthenics')add('Calisthenics-Anlagen');
  if(leisure==='fitness_station'||(leisure==='fitness_centre'&&t.outdoor==='yes'))add('Outdoor-Fitnessanlagen');
  if((leisure==='track'&&(has('running')||t.sport==='athletics'))||t.athletics==='running')add('Laufbahnen');
  if(has('parkour')||leisure==='parkour')add('Parkour-Anlagen');
  if(leisure==='skate_park'||has('skateboard'))add('Skateparks');
  if(has('table_tennis')||leisure==='table_tennis')add('Tischtennisplatten');
  return cats.filter(c=>CATEGORIES.includes(c));
}
function isExcluded(t){let access=String(t.access||'').toLowerCase(),fee=String(t.fee||'').toLowerCase();return ['private','no','customers','members','permit'].includes(access)||fee==='yes'||t.membership==='required'}
function cleanOSM(raw){
  const id=String(raw.id||'');const lat=Number(raw.lat),lon=Number(raw.lon),tags=raw.tags||{};
  if(!/^osm_(node|way|relation)_\d+$/.test(id)||!Number.isFinite(lat)||!Number.isFinite(lon)||isExcluded(tags))return null;
  let categories=(Array.isArray(raw.categories)?raw.categories:[raw.category]).filter(c=>CATEGORIES.includes(c));
  categories=[...new Set(categories)];let district=districtOf(lat,lon,tags)||raw.district;
  if(!categories.length||!DISTRICTS.slice(1).includes(district))return null;
  return {id,name:String(raw.name||categories[0]),categories,district,lat,lon,real:true,location:String(raw.location||`${lat.toFixed(5)}, ${lon.toFixed(5)}`),
    description:!String(raw.description||raw.desc||'').match(/^In OpenStreetMap als /i)?String(raw.description||raw.desc||''):'',
    tags,access:String(raw.access||'Zugänglichkeit und Nutzungsbedingungen nicht unabhängig geprüft.'),
    address:String(raw.address||''),hours:String(raw.hours||tags.opening_hours||''),website:isSafeUrl(raw.website||tags.website||tags['contact:website']||'')||'',
    rooms:String(raw.rooms||''),coordinatesVerified:true};
}
function transformOSM(elements){let items=new Map();for(const element of elements){const tags=element.tags||{},lat=element.lat??element.center?.lat,lon=element.lon??element.center?.lon;
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||isExcluded(tags))continue;
    let district=districtOf(lat,lon,tags);if(!district)continue;
    let categories=classifyOSM(tags);if(!categories.length)continue;
    let id=`osm_${element.type}_${element.id}`;
    let address=[tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(' ');
    let place=cleanOSM({id,name:tags['name:de']||tags.name||categories[0],lat,lon,district,categories,
      location:`${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      description:tags.description||'',address:address+(tags['addr:postcode']?`, ${tags['addr:postcode']} Mannheim`:''),
      hours:tags.opening_hours||'',website:tags.website||tags['contact:website']||'',tags});
    if(!place)continue;
    if(items.has(id)){const prev=items.get(id);prev.categories=[...new Set([...prev.categories,...place.categories])]}else items.set(id,place);
  }
  return [...items.values()].sort((a,b)=>a.name.localeCompare(b.name,'de'));
}
function restoreOSMCache(){
  try{let cache=JSON.parse(storageGet(OSM_KEY)||'null');if(cache&&Array.isArray(cache.items)){
      realPlaces=cache.items.map(cleanOSM).filter(Boolean);osmFetchedAt=Number(cache.at)||0;return;
    }}catch{}
  try{let old=JSON.parse(storageGet(OLD_OSM_KEY)||'null');if(old?.items?.length){
      realPlaces=old.items.map(cleanOSM).filter(Boolean);osmFetchedAt=Number(old.at)||0;
      if(realPlaces.length)storageSet(OSM_KEY,JSON.stringify({items:realPlaces,at:osmFetchedAt}));
    }}catch{}
}
restoreOSMCache();
const OVERPASS_ENDPOINTS=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter','https://overpass.nchc.org.tw/api/interpreter'];
const OSM_QUERY=`[out:json][timeout:25];(
 nwr[amenity="library"](49.420,8.430,49.490,8.520);
 nwr[leisure~"^(pitch|skate_park|fitness_station|track|table_tennis|parkour)$"](49.420,8.430,49.490,8.520);
 nwr[sport~"basketball|volleyball|soccer|football|table_tennis|calisthenics|street_workout|parkour|skateboard|bmx|running"](49.420,8.430,49.490,8.520);
);out center tags;`;
async function loadOSM(manual=false){
  if(osmLoading)return;
  // A good cache is sufficient for normal navigation; manual refresh stays available.
  if(!manual&&realPlaces.length&&Date.now()-osmFetchedAt<24*60*60*1000)return;
  osmLoading=true;osmError='';updateOSMStatus();let latestError=null;
  for(const endpoint of OVERPASS_ENDPOINTS){let controller=new AbortController();let timeout=setTimeout(()=>controller.abort(),13000);
    try{
      let response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(OSM_QUERY),signal:controller.signal});
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      let data=await response.json();if(!Array.isArray(data.elements))throw Error('Ungültiges Datenformat');
      let next=transformOSM(data.elements);if(!next.length)throw Error('Keine passenden OSM-Einträge');
      realPlaces=next;osmFetchedAt=Date.now();storageSet(OSM_KEY,JSON.stringify({items:realPlaces,at:osmFetchedAt}));osmError='';latestError=null;break;
    }catch(e){latestError=e;console.warn('Overpass-Endpunkt:',new URL(endpoint).hostname,e.message)}finally{clearTimeout(timeout)}
  }
  if(latestError)osmError=`Live-Ortsdaten gerade nicht erreichbar (${latestError.name==='AbortError'?'Zeitüberschreitung':latestError.message}). ${realPlaces.length?'Gespeicherte Orte bleiben sichtbar.':'Bitte später erneut versuchen.'}`;
  osmLoading=false;
  if(ui.page==='Entdecken'&&!ui.detail&&!ui.modal)render();
  else {updateOSMStatus();if(ui.page==='Entdecken'&&!ui.detail)updatePlaceFilters();if(ui.modal==='activity')updateActivityPlaceOptions()}
}
function filteredPlaces(){let q=ui.placeQuery;return realPlaces.filter(p=>
  (ui.district==='Alle'||p.district===ui.district)&&(!ui.selectedCats.size||p.categories.some(c=>ui.selectedCats.has(c)))&&
  anyMatch(`${p.name} ${p.categories.join(' ')} ${p.address} ${p.district}`,q));
}
function visibleActivities(){return sorted(db.activities.filter(a=>a.status==='active'&&isFuture(a)&&
  (ui.actDistrict==='Alle'||placeById(a.placeId)?.district===ui.actDistrict)&&
  (ui.actCategory==='Alle'||activityCategory(a)===ui.actCategory)&&
  (!ui.actDate||a.date===ui.actDate)&&(!ui.actSpots||spaces(a)>0)&&
  (!ui.actMine||a.attendees.includes(me())||a.hostId===me())&&
  anyMatch(`${a.title} ${a.description} ${a.topic} ${username(a.hostId)}`,ui.activityQuery)));
}
function activitiesAt(placeId){return sorted(db.activities.filter(a=>a.placeId===placeId&&a.status==='active'&&isFuture(a)))}
function activityIsJoined(a){return !!a.attendees.includes(me())}
function ownedGroups(){return db.groups.filter(g=>g.members.includes(me()))}
function mountMap(){
  let el=document.getElementById('leafletMap');if(!el)return;
  if(!window.L){document.getElementById('mapFailure').textContent='Die Kartenbibliothek Leaflet konnte nicht geladen werden. Internetverbindung prüfen.';document.getElementById('mapFailure').classList.remove('hidden');return}
  if(leafletMap){leafletMap.remove();leafletMap=null}
  leafletMap=L.map(el,{scrollWheelZoom:false,zoomControl:true}).setView([49.458,8.467],13);
  tileErrorCount=0;
  // Bestehende funktionsfähige CARTO-Voyager-Key-Konfiguration aus dem Ausgangsprojekt.
  const tileLayer=L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4n84_1_961c1e4fcce55d37c610ea5a',{
    subdomains:'abcd',maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap-Mitwirkende</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
  });
  tileLayer.on('tileerror',()=>{tileErrorCount++;if(tileErrorCount>=4){let issue=document.getElementById('mapFailure');if(issue){issue.textContent='Kartenbilder konnten nicht vollständig geladen werden. Kartenanbieter oder Netzwerk prüfen.';issue.classList.remove('hidden')}}});
  tileLayer.addTo(leafletMap);
  markerLayer=typeof L.markerClusterGroup==='function'?L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:42,spiderfyOnMaxZoom:true}):L.layerGroup();
  markerLayer.addTo(leafletMap);
  updateMapMarkers(false);
  setTimeout(()=>leafletMap?.invalidateSize(),90);
}
function updateMapMarkers(fit=true){
  if(!leafletMap||!markerLayer)return;
  markerLayer.clearLayers();markerIndex.clear();let pts=filteredPlaces();
  for(const p of pts){let c=p.categories[0];const markerIcon=L.divIcon({className:'',html:`<div class="osm-pin ${ui.selectedPlace===p.id?'selected':''}">${catIcon(c)}</div>`,iconSize:[34,34],iconAnchor:[17,17]});
    const marker=L.marker([p.lat,p.lon],{icon:markerIcon,title:p.name});
    const popup=`<div><strong>${escapeHtml(p.name)}</strong><p>${escapeHtml(p.district)} · ${escapeHtml(p.categories.join(', '))}</p><button class="btn sm" type="button" data-action="details-place" data-id="${attr(p.id)}">Ortsdetails ansehen</button></div>`;
    marker.bindPopup(popup);marker.on('click',()=>{ui.selectedPlace=p.id;highlightPlaceList();highlightMapMarker()});markerLayer.addLayer(marker);markerIndex.set(p.id,marker);
  }
  if(fit){if(pts.length&&ui.district!=='Alle'){
      let b=L.latLngBounds(pts.map(p=>[p.lat,p.lon]));leafletMap.fitBounds(b.pad(.12),{maxZoom:15});
    }else if(ui.district!=='Alle'){let d=BOUNDS[ui.district];if(d)leafletMap.fitBounds([[d[0],d[2]],[d[1],d[3]]]);
    }else if(pts.length&&ui.selectedCats.size){let b=L.latLngBounds(pts.map(p=>[p.lat,p.lon]));leafletMap.fitBounds(b.pad(.12),{maxZoom:14});}
    else leafletMap.setView([49.458,8.467],13);
  }
}
function highlightPlaceList(){for(const el of document.querySelectorAll('[data-place-card]'))el.classList.toggle('selected',el.dataset.placeCard===ui.selectedPlace)}
function highlightMapMarker(){for(const [id,m] of markerIndex){m.getElement()?.querySelector('.osm-pin')?.classList.toggle('selected',id===ui.selectedPlace)}}
function focusPlaceOnMap(id){const p=placeById(id);if(!p?.real)return;ui.selectedPlace=id;highlightPlaceList();highlightMapMarker();let marker=markerIndex.get(id);
  if(marker&&leafletMap){let go=()=>{leafletMap.setView([p.lat,p.lon],Math.max(15,leafletMap.getZoom()));marker.openPopup()};
    if(typeof markerLayer.zoomToShowLayer==='function')markerLayer.zoomToShowLayer(marker,go);else go();
  }
}
function updateOSMStatus(){let el=document.getElementById('osmStatus');if(el){el.textContent=osmLoading?'OSM-Orte werden geladen …':osmError||`${realPlaces.length} OSM-Orte im Zwischenspeicher ${osmFetchedAt?'· Stand '+new Date(osmFetchedAt).toLocaleDateString('de-DE'):''}`;
    el.setAttribute('aria-busy',String(osmLoading));}
}
function btn(action,label,cls='btn',data={}){return `<button type="button" class="${cls}" data-action="${attr(action)}" ${Object.entries(data).map(([k,v])=>`data-${attr(k)}="${attr(v)}"`).join(' ')}>${label}</button>`}
function pill(text,cls=''){return `<span class="pill ${cls}">${text}</span>`}
function options(items,current){return items.map(it=>`<option value="${attr(it)}" ${it===current?'selected':''}>${escapeHtml(it)}</option>`).join('')}
function badgeCategory(cat){return pill(`${catIcon(cat)} ${escapeHtml(cat)}`,'gray')}
function header(){const navItems=[['Entdecken','map'],['Aktivitäten','calendar'],['Gruppen','users'],['Chats','message'],['Mein Profil','user']];return `<div class="demo-banner"><span class="demo-dot" aria-hidden="true"></span><strong>StadtConnect Demo</strong><span class="demo-separator">·</span> Für Studierende ab 18 <span class="demo-separator">·</span> Profile, Chats und Aktivitäten werden lokal simuliert</div>
  <header class="top"><div class="shell top-inner"><button class="brand" type="button" data-action="navigate" data-page="Entdecken" aria-label="StadtConnect Mannheim – zu Entdecken"><span class="brand-mark">${icon('location','big')}</span><span>stadt<span class="brand-highlight">connect</span><span class="brand-city"> <small>Mannheim</small></span></span></button>
  <nav class="nav" aria-label="Hauptnavigation">${navItems.map(([page,symbol])=>`<button type="button" data-action="navigate" data-page="${page}" class="${ui.page===page?'active':''}" ${ui.page===page?'aria-current="page"':''}>${icon(symbol)}<span>${page}</span></button>`).join('')}</nav>
  <div class="top-actions">${btn('new-activity',`${icon('plus')}<span>Aktivität erstellen</span>`,'btn orange primary-cta')}</div></div></header>`}
function hero(title,sub){
  const page=ui.page;
  const settings={
    'Entdecken':{theme:'discover',symbol:'map',accent:'Sport & Lernorte',stats:[['4','Stadtteile'],['12','Ortskategorien']],float:'Entdecke Mannheim'},
    'Aktivitäten':{theme:'activities',symbol:'basketball',accent:'Gemeinsam aktiv',stats:[[String(db.activities.filter(o=>o.status==='active'&&isFuture(o)).length),'Kommende Treffen'],['2','Arten von Treffen']],float:'Mach mit!'},
    'Gruppen':{theme:'groups',symbol:'users',accent:'Deine Community',stats:[[String(db.groups.length),'Studentische Gruppen'],[String(db.groups.filter(g=>g.members.includes(me())).length),'Meine Mitgliedschaften']],float:'Zusammen mehr'},
    'Chats':{theme:'chats',symbol:'message',accent:'Im Austausch',stats:[[String(db.activities.filter(o=>o.status==='active'&&o.attendees.includes(me())).length+db.groups.filter(o=>o.members.includes(me())).length),'Freigeschaltete Chats'],['Lokal','Demomodus']],float:'Bleib verbunden'},
    'Mein Profil':{theme:'profile',symbol:'user',accent:'Dein StadtConnect',stats:[[String(db.activities.filter(o=>o.hostId===me()).length),'Meine Treffen'],[String(ownedGroups().length),'Meine Gruppen']],float:'Dein Profil'}
  };
  let setting=settings[page]||settings.Entdecken;
  return `<section class="hero hero--${setting.theme}" aria-label="${attr(page)}"><div class="hero-copy"><div class="hero-eyebrow"><span class="hero-eyebrow-icon">${icon(setting.symbol)}</span>${escapeHtml(setting.accent)} <span class="hero-eyebrow-line"></span> MANNHEIM</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(sub)}</p><div class="hero-stats">${setting.stats.map(([v,caption])=>`<span class="hero-stat"><strong>${escapeHtml(v)}</strong><span>${escapeHtml(caption)}</span></span>`).join('')}</div></div>
  <div class="hero-scene" aria-hidden="true"><div class="hero-scene-ring"></div><div class="hero-scene-main">${icon(setting.symbol)}</div><div class="hero-scene-float hero-scene-float--one">${icon(page==='Entdecken'?'basketball':page==='Aktivitäten'?'calendar':'book')}</div><div class="hero-scene-float hero-scene-float--two">${icon(page==='Entdecken'?'book':page==='Aktivitäten'?'users':'message')}</div><div class="hero-scene-caption">${escapeHtml(setting.float)} ${icon('arrow')}</div></div></section>`;
}
function mapView(){return `<section class="maparea ${ui.mobileMode==='list'?'mobile-off':''}" aria-label="Karte"><div class="card map-card"><div class="sectionrow"><h2>${icon('map','big')} Karte entdecken</h2>${pill('Live-Karte','orange')}</div>
  <div class="map-wrap"><div id="leafletMap" role="application" aria-label="Interaktive Karte für Lindenhof, Neckarau, Almenhof und Niederfeld"></div><div id="mapFailure" class="map-failure hidden" role="alert"></div></div>
  <div class="map-status"><span id="osmStatus" class="small muted" role="status" aria-live="polite"></span>${btn('reload-osm',`${icon('refresh')} Orte neu laden`,'btn secondary sm')}</div>
  <p class="small muted">OSM-Karteneinträge sind nicht automatisch frei zugänglich. Angaben zur Nutzbarkeit bitte vor Ort prüfen. Stadtteile derzeit näherungsweise zugeordnet.</p></div></section>`}
function displayPlaceLabels(o){return (o.categories||[]).map(c=>badgeCategory(c)).join('')}
function placeCard(o){const count=activitiesAt(o.id).length;return `<article class="place-row ${ui.selectedPlace===o.id?'selected':''}" data-place-card="${attr(o.id)}" tabindex="0" aria-label="${attr(o.name)} auf der Karte zeigen">
  <div class="head"><div class="place-title"><span class="place-icon">${catIcon(o.categories[0])}</span><span class="place-name">${escapeHtml(o.name)}</span></div>${pill(escapeHtml(o.district),'district-pill')}</div>
  <div class="meta">${displayPlaceLabels(o)}</div>
  ${o.address?`<p class="place-address">${icon('location')} ${escapeHtml(o.address)}</p>`:''}
  <p class="place-activity-note">${icon(count?'calendar':'info')} ${count?`${count} ${count===1?'geplantes Treffen':'geplante Treffen'} an diesem Ort`:'Hier ist noch kein Treffen geplant'}</p>
  <div class="place-actions">${btn('focus-place',`${icon('map')} Auf Karte zeigen`,'btn secondary sm',{id:o.id})}${btn('details-place',`Details ${icon('arrow')}`,'btn ghost sm',{id:o.id})}</div></article>`}
function discoverResults(){const found=filteredPlaces();return `<section class="listarea ${ui.mobileMode==='map'?'mobile-off':''}" aria-label="Ergebnisliste"><div class="sectionrow"><h2>Gefundene Orte</h2><span class="counter">${found.length} ${found.length===1?'Ergebnis':'Ergebnisse'}</span></div>
  <div class="place-list" id="placesList">${found.length?found.slice(0,160).map(placeCard).join(''):`<div class="empty"><h3>${osmLoading?'Orte werden geladen …':'Keine passenden Orte gefunden'}</h3><p>${osmError&&!realPlaces.length?escapeHtml(osmError):'Probiere einen anderen Stadtteil oder setze die Filter zurück.'}</p>${btn('reset-place-filters','Filter zurücksetzen','btn secondary sm')}</div>`}</div>
  ${found.length>160?'<p class="small muted">Zeigt die ersten 160 Treffer. Verwende die Suche für weitere Orte.</p>':''}</section>`}
function discoverPreview(){let upcoming=sorted(db.activities.filter(a=>a.status==='active'&&isFuture(a)&&
  (ui.district==='Alle'||placeById(a.placeId)?.district===ui.district))).slice(0,3);
  return `<section class="preview-section"><div class="sectionrow section-heading"><div><div class="section-caption">UPCOMING / DEMO-TREFFEN</div><h2>Nächste Aktivitäten</h2><p class="small muted">Beispieltreffen für Sport und gemeinsames Lernen, nach Termin sortiert</p></div>${btn('navigate',`Alle Aktivitäten ${icon('arrow')}`,'btn secondary sm',{page:'Aktivitäten'})}</div><div class="activity-grid">${upcoming.map(activityCard).join('')||'<div class="empty">Zurzeit keine kommenden Demo-Aktivitäten in diesem Stadtteil.</div>'}</div></section>`}
function discover(){if(ui.detail)return placeDetail(ui.detail);
  return hero('Sportpartner und Lerngruppen finden','Entdecke Sportflächen und Bibliotheken in Lindenhof, Neckarau, Almenhof und Niederfeld.')+
  `<div class="filters discover-search-panel"><label class="field">Ort suchen<input id="placeSearch" data-filter="place-query" type="search" placeholder="z. B. Basketball, Bibliothek …" value="${attr(ui.placeQuery)}" autocomplete="off"></label>
  <label class="field">Stadtteil<select data-filter="place-district">${options(DISTRICTS,ui.district)}</select></label></div>
  <div class="filter-toolbar discover-filters-header"><strong>Ortskategorien <span class="small muted">(Mehrfachauswahl)</span></strong>${btn('reset-place-filters',`${icon('refresh')} Filter zurücksetzen`,'btn ghost sm')}</div>
  <div class="category-grid" id="categoryGrid" role="group" aria-label="Ortskategorien filtern">${CATEGORIES.map(c=>`<button type="button" class="category-chip" data-action="toggle-category" data-category="${attr(c)}" aria-pressed="${ui.selectedCats.has(c)}">${catIcon(c)} ${escapeHtml(c)}</button>`).join('')}</div>
  <div class="mobile-toggle" aria-label="Karte oder Liste">${btn('mobile-mode',`${icon('map')} Karte`,ui.mobileMode==='map'?'btn':'btn secondary',{mode:'map'})}${btn('mobile-mode',`${icon('list')} Liste`,ui.mobileMode==='list'?'btn':'btn secondary',{mode:'list'})}</div>
  <div class="discover-grid"><div id="mapArea">${mapView()}</div><div id="discoverResults">${discoverResults()}</div></div>${discoverPreview()}`;
}
function updatePlaceFilters(){if(ui.page!=='Entdecken'||ui.detail)return;
  let target=document.getElementById('discoverResults');if(target)target.innerHTML=discoverResults();
  for(const item of document.querySelectorAll('.category-chip'))item.setAttribute('aria-pressed',String(ui.selectedCats.has(item.dataset.category)));
  updateMapMarkers();let section=document.querySelector('.preview-section');if(section)section.outerHTML=discoverPreview();
}
function back(page){return btn('navigate',`${icon('back')} Zurück zu ${page}`,'btn ghost back-link',{page})}
function placeDetail(id){const p=placeById(id);if(!p)return `<div class="empty">Dieser Ort ist nicht mehr verfügbar. ${btn('navigate','Zurück zur Karte','btn secondary',{page:'Entdecken'})}</div>`;
  const library=p.categories.includes('Bibliotheken'),acts=activitiesAt(p.id);
  return `<div class="detail">${back('Entdecken')}<div class="card"><div class="detail-head"><div><div class="eyebrow">${p.real?'OpenStreetMap-Ort':'Fiktiver Demo-Ort'}</div><h1>${catIcon(p.categories[0])} ${escapeHtml(p.name)}</h1><div class="card-chips">${displayPlaceLabels(p)}${pill(escapeHtml(p.district))}</div></div>${pill(p.real?'OSM':'Demo','orange')}</div>
  ${p.description?`<p>${escapeHtml(p.description)}</p>`:''}
  <div class="detail-rows"><div><div class="section-caption">Lage</div><p>${escapeHtml(p.address||p.location||'Nicht hinterlegt')}</p><p class="small muted">Stadtteil: ${escapeHtml(p.district)} ${p.real?'(Zuordnung ggf. näherungsweise)':''}</p></div>
  <div><div class="section-caption">Zugang & Nutzung</div><p class="small">${escapeHtml(p.access||'Nicht geprüft')}</p></div></div>
  ${library?`<h3>Informationen zum Lernort</h3><div class="detail-rows"><div><strong>Öffnungszeiten</strong><p>${escapeHtml(p.hours||'Nicht hinterlegt / bitte offiziell prüfen')}</p></div><div><strong>Arbeitsplätze & Gruppenräume</strong><p>${escapeHtml(p.rooms||'Keine verlässlichen Angaben hinterlegt')}</p></div><div><strong>Zugangsvoraussetzungen</strong><p>${escapeHtml(p.tags?.access||'Nicht verlässlich bekannt')}</p></div><div><strong>Website laut OSM (nicht unabhängig geprüft)</strong><p>${p.website?linkTo(p.website,'Website öffnen'):'Nicht hinterlegt'}</p></div></div>`:''}
  <p class="notice">${icon('alert')} ${p.real?'Eine OSM-Erfassung bestätigt keine öffentliche oder kostenlose Nutzung. Öffnungszeiten und Bedingungen vorab prüfen.':'Dieser Beispielort ist fiktiv und erscheint nicht als realer Marker auf der Karte.'}</p>
  <div class="action-row" style="margin-top:18px">${btn('new-activity',`${icon('plus')} Hier ${library?'Lerntreffen':'Sporttreffen'} erstellen`,'btn orange',{place:p.id})}
  ${p.real?linkTo(`https://www.openstreetmap.org/${p.id.replace(/^osm_/,'').replace('_','/')}`,'OSM-Eintrag ansehen'):''}</div>
  <div class="divider"></div><h2>Geplante Aktivitäten an diesem Ort</h2><div class="cards-two">${acts.map(activityCard).join('')||'<div class="empty">Noch keine Aktivitäten an diesem Ort. Du kannst die erste organisieren.</div>'}</div></div></div>`;
}
function activityCard(o){const place=placeById(o.placeId),status=o.status==='cancelled'?'Abgesagt':!isFuture(o)?'Vergangen':spaces(o)===0?'Ausgebucht':`${spaces(o)} Plätze frei`,joined=activityIsJoined(o),learning=o.type==='lernen';
  const date=new Date(`${o.date}T${o.time||'12:00'}`),month=date.toLocaleDateString('de-DE',{month:'short'}),day=date.getDate();
  return `<article class="activity-card ${learning?'is-learning':'is-sport'}"><div class="activity-art"><div class="activity-art-pattern" aria-hidden="true"></div><span class="activity-art-icon" aria-hidden="true">${icon(learning?'book':CATEGORY_ICONS[activityCategory(o)]||'basketball')}</span><span class="activity-kind">${icon(learning?'book':'basketball')} ${learning?'Lerntreffen':'Sporttreffen'}</span><span class="activity-date"><strong>${day}</strong><span>${escapeHtml(month)}</span></span></div>
  <div class="activity-inner"><div class="sectionrow activity-status-row"><span class="pill ${spaces(o)===0?'red':'gray'}">${escapeHtml(status)}</span>${joined?pill(`${icon('check')} Du bist dabei`,'joined-status'):''}</div>
  <h3>${escapeHtml(o.title)}</h3><div class="card-meta activity-major-meta"><span>${icon('clock')} ${escapeHtml(describeTime(o))}</span><span>${icon('location')} ${escapeHtml(place?.district||'Nicht zugeordnet')}</span></div>
  <p class="small muted activity-place">${icon('map')} ${escapeHtml(place?.name||'Ort nicht verfügbar')}</p><div class="card-meta activity-minor-meta"><span>${icon('users')} ${o.attendees.length}/${o.max} Teilnehmende</span><span>${icon('user')} ${escapeHtml(username(o.hostId))}</span></div>
  <div class="foot">${pill(o.hostId===me()?'Von dir organisiert':joined?'Teilnahme bestätigt':'Offenes Treffen','white')}${btn('details-activity',`Details ${icon('arrow')}`,'btn secondary sm',{id:o.id})}</div></div></article>`;
}
function activityFiltersUI(){return `<div class="card activity-filter-card"><div class="filters filters-activities">
  <label class="field">Aktivität suchen<input id="activitySearch" data-filter="activity-query" value="${attr(ui.activityQuery)}" placeholder="Sportart, Thema oder Host" type="search"></label>
  <label class="field">Stadtteil<select data-filter="activity-district">${options(DISTRICTS,ui.actDistrict)}</select></label>
  <label class="field">Kategorie<select data-filter="activity-category">${options(['Alle',...CATEGORIES],ui.actCategory)}</select></label>
  <label class="field">Datum<input data-filter="activity-date" type="date" value="${attr(ui.actDate)}"></label></div>
  <div class="filter-toolbar"><label class="check-row"><input type="checkbox" data-filter="activity-spots" ${ui.actSpots?'checked':''}> Nur freie Plätze</label>
  <label class="check-row"><input type="checkbox" data-filter="activity-mine" ${ui.actMine?'checked':''}> Meine Treffen und Teilnahmen</label>
  ${btn('reset-activity-filters','Filter zurücksetzen','btn ghost sm')}</div></div>`}
function activityResults(){const list=visibleActivities();return `<div class="sectionrow section-heading" style="margin:20px 0 12px"><h2>Kommende Aktivitäten</h2><span class="small muted">${list.length} Ergebnisse · Nächster Termin zuerst</span></div><div class="cards-two activity-results-grid">${list.map(activityCard).join('')||`<div class="empty"><h3>Keine passenden Aktivitäten</h3><p>Ändere die Suche oder den Filter.</p>${btn('reset-activity-filters','Filter zurücksetzen','btn secondary sm')}</div>`}</div>`}
function activities(){if(ui.detail)return activityDetail(ui.detail);return hero('Zusammen Sport treiben und lernen','Finde deine nächste Basketballrunde oder ein gemeinsames Lerntreffen.')+activityFiltersUI()+`<div id="activityResults">${activityResults()}</div>`}
function activityDetail(id){const o=activityById(id);if(!o)return `<div class="empty">Dieses Treffen existiert nicht mehr.</div>`;
  const place=placeById(o.placeId),mine=activityIsJoined(o),owner=o.hostId===me(),cancelled=o.status==='cancelled',library=o.type==='lernen';
  return `<div class="detail">${back('Aktivitäten')}<div class="card"><div class="detail-head"><div><div class="card-chips">${pill(library?`${icon('book')} Lerntreffen`:`${catIcon(activityCategory(o))} Sporttreffen`,'orange')}${badgeCategory(activityCategory(o))}</div><h1>${escapeHtml(o.title)}</h1><p>${escapeHtml(o.description)}</p></div>${pill(cancelled?'Abgesagt':spaces(o)===0?'Ausgebucht':`${spaces(o)} Plätze frei`,cancelled?'red':'')}</div>
  <div class="detail-rows"><div><div class="section-caption">Termin & Ort</div><p>${icon('calendar')} ${escapeHtml(describeTime(o))}${o.endTime?' – '+escapeHtml(o.endTime)+' Uhr':''}</p><p>${icon('location')} ${escapeHtml(place?.name||'Ort fehlt')} · ${escapeHtml(place?.district||'')}</p><p class="small muted">Treffpunkt: ${escapeHtml(o.meetingPoint||'Noch nicht konkretisiert')}</p></div>
  <div><div class="section-caption">Teilnahme</div><p>${icon('users')} ${o.attendees.length}/${o.max} Teilnehmende</p><p>${icon('user')} Host: ${escapeHtml(username(o.hostId))}</p><p class="small muted">Gewünschte Zielgruppe: ${o.ageMax?`${o.ageMin}–${o.ageMax} Jahre`:'Alle Studierenden ab 18'}</p></div></div>
  ${library?`<h3>Lernziel</h3><p><strong>Modul / Lernthema:</strong> ${escapeHtml(o.topic||'Nicht angegeben')}</p><p><strong>Ziel:</strong> ${escapeHtml(o.goal||'Nicht angegeben')}</p>`:
  `<h3>Training / Spiel</h3><p><strong>Niveau:</strong> ${escapeHtml(o.level||'Offen für alle')}</p>${o.equipment?`<p><strong>Mitbringen:</strong> ${escapeHtml(o.equipment)}</p>`:''}`}
  ${o.groupId&&groupById(o.groupId)?`<p><strong>Zugehörige Gruppe:</strong> <button class="btn ghost sm" data-action="details-group" data-id="${attr(o.groupId)}">${escapeHtml(groupById(o.groupId).name)} ${icon('arrow')}</button></p>`:''}
  <p class="notice">${icon('alert')} ${library?'Die Teilnahme reserviert keinen Arbeitsplatz oder Gruppenraum.':'Dieses Treffen reserviert die öffentliche Sportfläche nicht.'}</p>
  ${place&&!place.real?'<p class="small muted">Der angegebene Ort ist ein ausdrücklich fiktiver Demo-Treffpunkt. Vor einem echten Treffen einen geeigneten realen Ort festlegen.</p>':''}
  <div class="action-row" style="margin-top:19px">${owner&&!cancelled&&isFuture(o)?`${btn('edit-activity',`${icon('edit')} Bearbeiten`,'btn secondary',{id:o.id})}${btn('cancel-activity','Treffen absagen','btn danger',{id:o.id})}`:owner?pill(cancelled?'Dieses Treffen ist abgesagt':'Dieses Treffen liegt in der Vergangenheit','gray'):
  btn('toggle-activity',mine?`${icon('x')} Teilnahme zurückziehen`:`${icon('plus')} Beitreten`,mine?'btn secondary':'btn orange',{id:o.id})}
  ${btn('report',`${icon('report')} Melden`,'btn ghost',{kind:'Aktivität',id:o.id})}</div>
  ${!owner&&!mine&&!cancelled&&spaces(o)===0?'<p class="error" role="status">Ausgebucht. Momentan sind keine Plätze mehr frei.</p>':''}
  <div class="divider"></div><h2>Aktivitätschat</h2>${mine&&!cancelled?chat('a',o.id):`<div class="empty">${icon('message')} Der Chat ist nur für Teilnehmende dieses Treffens zugänglich.</div>`}
  </div></div>`;
}
function groupCard(o){let mine=o.members.includes(me()),future=sorted(db.activities.filter(a=>a.groupId===o.id&&a.status==='active'&&isFuture(a)));
  return `<article class="group-card"><div class="group-art"><span class="group-art-icon">${icon(/lernen|programmier|klausur|studier/i.test(o.focus+' '+o.name)?'book':'users')}</span><span class="group-art-caption">STADTCONNECT COMMUNITY</span><span class="group-members">${icon('users')} ${o.members.length} Mitglieder</span></div><div class="group-inner"><div class="card-chips">${pill(escapeHtml(o.focus||'Community'),'group-focus')}${mine?pill(`${icon('check')} Mitglied`,'joined-status'):''}</div><h3>${escapeHtml(o.name)}</h3><p>${escapeHtml(o.description)}</p><div class="card-meta"><span>${icon('location')} ${escapeHtml(o.district)}</span><span>${icon('calendar')} ${future.length} kommende Treffen</span></div><div class="foot action-row">${btn('details-group',`Gruppe ansehen ${icon('arrow')}`,'btn secondary sm',{id:o.id})}</div></div></article>`}
function groups(){if(ui.detail)return groupDetail(ui.detail);const shown=db.groups.filter(o=>anyMatch(`${o.name} ${o.description} ${o.focus} ${o.district}`,ui.groupQuery));return hero('Finde deine Community','Dauerhafte Sport- und Lerngruppen für die Zeit zwischen Vorlesungen und Prüfungen.')+
  `<div class="filter-toolbar group-filter-toolbar"><label class="field" style="flex:1;max-width:560px">Gruppen suchen<input type="search" id="groupSearch" data-filter="group-query" value="${attr(ui.groupQuery)}" placeholder="z. B. Basketball oder Programmieren"></label>${btn('new-group',`${icon('plus')} Gruppe erstellen`,'btn secondary')}</div><div id="groupResults"><div class="cards-two group-results-grid">${shown.map(groupCard).join('')||'<div class="empty">Keine passenden Gruppen gefunden.</div>'}</div></div>`}
function groupDetail(id){const o=groupById(id);if(!o)return '<div class="empty">Gruppe nicht gefunden.</div>';const joined=o.members.includes(me()),acts=sorted(db.activities.filter(a=>a.groupId===id&&a.status==='active'&&isFuture(a)));
  return `<div class="detail">${back('Gruppen')}<div class="card"><div class="eyebrow">Dauerhafte Gemeinschaft</div><h1>${icon('users','big')} ${escapeHtml(o.name)}</h1><p>${escapeHtml(o.description)}</p><div class="card-chips">${pill(escapeHtml(o.district))}${pill(escapeHtml(o.focus),'gray')}${pill(`${o.members.length} Mitglieder`,'gray')}</div>
  <div class="section-caption">Mitglieder</div><div class="member-pills">${o.members.map(id=>`<span>${icon('user')} ${escapeHtml(username(id))}</span>`).join('')}</div>
  <div class="action-row" style="margin:17px 0">${btn('toggle-group',joined?'Gruppe verlassen':`${icon('plus')} Gruppe beitreten`,joined?'btn secondary':'btn orange',{id})}
  ${joined?btn('new-activity',`${icon('plus')} Treffen in Gruppe planen`,'btn secondary',{group:id}):''}</div>
  <div class="divider"></div><h2>Kommende Gruppenaktivitäten</h2><div class="cards-two">${acts.map(activityCard).join('')||'<div class="empty">Noch keine Aktivitäten geplant.</div>'}</div>
  <div class="divider"></div><h2>Gruppenchat</h2>${joined?chat('g',id):'<div class="empty">Nur Gruppenmitglieder können den Chat lesen und Nachrichten schreiben.</div>'}</div></div>`;
}
function chat(type,id){const key=`${type}:${id}`,messages=db.messages[key]||[];return `<div class="chat-window" id="chatWindow" aria-label="Nachrichtenverlauf" aria-live="polite">${messages.map((m,i)=>`<div class="bubble ${m.from===me()?'mine':''}"><header><strong>${escapeHtml(username(m.from))}</strong><span>${escapeHtml(m.at)} <button type="button" data-action="report" data-kind="Nachricht" data-id="${attr(`${key}:${i}`)}">Melden</button></span></header><div>${escapeHtml(m.text)}</div></div>`).join('')||'<p class="small muted">Noch keine Nachrichten. Starte die Unterhaltung.</p>'}</div>
  <form data-form="send-chat" data-key="${attr(key)}" class="chat-compose"><input class="textinput" name="message" maxlength="600" required placeholder="Nachricht schreiben …" aria-label="Nachricht schreiben"><button class="btn" type="submit">Senden ${icon('arrow')}</button></form>
  <p class="small muted">Nur in diesem Browser gespeicherte Demo-Nachrichten – keine echte Kommunikation mit anderen Geräten.</p>`}
function chats(){let items=[...db.activities.filter(o=>o.status==='active'&&o.attendees.includes(me())).map(o=>({key:'a:'+o.id,name:o.title,type:'Treffen'})),...db.groups.filter(o=>o.members.includes(me())).map(o=>({key:'g:'+o.id,name:o.name,type:'Gruppe'}))];
  if(ui.chat&&!items.some(o=>o.key===ui.chat))ui.chat=null;
  return hero('Deine Chats','Tausche dich in deinen Sport- und Lerntreffen oder dauerhaft in deiner Gruppe aus.')+
  `<div class="chat-layout"><section class="chat-list-panel"><h2>Deine Unterhaltungen</h2>${items.map(o=>`<button type="button" class="chat-link ${ui.chat===o.key?'active':''}" data-action="open-chat" data-key="${attr(o.key)}"><strong>${icon(o.type==='Treffen'?'calendar':'users')} ${escapeHtml(o.name)}</strong><div class="small muted">${escapeHtml(o.type)} · Chat öffnen</div></button>`).join('')||`<div class="empty"><h3>Noch keine Chats</h3><p>Trete einem Treffen oder einer Gruppe bei, um einen Chat freizuschalten.</p>${btn('navigate','Aktivitäten entdecken','btn secondary sm',{page:'Aktivitäten'})}</div>`}</section>
  <section class="card"><h2>${ui.chat?escapeHtml(items.find(o=>o.key===ui.chat)?.name||'Chat'):'Unterhaltung auswählen'}</h2>${ui.chat?chat(...ui.chat.split(':')):'<div class="empty">Wähle links einen Chat aus.</div>'}</section></div>`;
}
function profile(){if(!user())return hero('Demo-Anmeldung','Wähle ein Demo-Profil aus. Es werden keine echten Zugangsdaten verwendet.')+`<div class="detail"><div class="card">${btn('login','Demo-Profil wählen','btn orange')}</div></div>`;
  let u=user(),own=sorted(db.activities.filter(a=>a.hostId===me())),part=sorted(db.activities.filter(a=>a.attendees.includes(me())&&a.hostId!==me()));
  return hero('Mein Profil','Deine Studieninformationen, Aktivitäten und Gruppen an einem Ort.')+
  `<div class="profile-grid"><section class="card"><div class="profile-header"><div class="profile-avatar">${icon(u.avatar||'user')}</div><div><div class="eyebrow">Studentisches Demo-Profil</div><h2>${escapeHtml(u.name)}</h2><p class="small muted">${escapeHtml(u.university||'Hochschule nicht angegeben')}</p></div></div>
  <div class="divider"></div><div class="section-caption">Öffentlich sichtbar</div><p>${escapeHtml(u.name)}${u.visibility?.age?', '+ageOf(u.dob)+' Jahre':''}${u.visibility?.district?', '+escapeHtml(u.district):''}</p>
  ${u.visibility?.university?`<p><strong>Hochschule:</strong> ${escapeHtml(u.university||'Nicht angegeben')}</p>`:''}
  ${u.visibility?.course&&u.course?`<p><strong>Studiengang:</strong> ${escapeHtml(u.course)}</p>`:''}
  ${u.visibility?.interests&&u.interests?`<p><strong>Interessen:</strong> ${escapeHtml(u.interests)}</p>`:''}
  ${u.visibility?.gender&&u.gender!=='Keine Angabe'?`<p><strong>Geschlecht:</strong> ${escapeHtml(u.gender)}</p>`:''}
  ${u.visibility?.bio&&u.bio?`<p>${escapeHtml(u.bio)}</p>`:''}
  <p class="small muted">E-Mail und vollständiges Geburtsdatum sind nicht öffentlich. Die Studierendeneigenschaft ist eine Selbstauskunft, keine Verifizierung.</p>
  <div class="action-row">${btn('edit-profile',`${icon('edit')} Profil bearbeiten`,'btn secondary')}${btn('logout',`${icon('logout')} Abmelden`,'btn ghost')}</div></section>
  <section class="card"><h2>Demo-Konto</h2><p class="muted">Wechsle für die Vorführung zwischen Max, Mia, Jonas und Lea oder registriere ein weiteres fiktives Profil.</p>${btn('login',`${icon('users')} Profil wechseln`,'btn secondary')} ${btn('reset-demo',`${icon('refresh')} Demo zurücksetzen`,'btn ghost')}
  <div class="divider"></div><h3>Meine Gruppen</h3>${ownedGroups().map(g=>`<div class="list-line"><span>${escapeHtml(g.name)}</span>${btn('details-group','Ansehen','btn ghost sm',{id:g.id})}</div>`).join('')||'<p class="muted">Noch keine Gruppen.</p>'}</section></div>
  <div class="preview-section"><h2>Von mir erstellte Aktivitäten</h2><div class="cards-two">${own.map(activityCard).join('')||'<div class="empty">Noch keine eigenen Treffen.</div>'}</div></div>
  <div class="preview-section"><h2>Meine Teilnahmen</h2><div class="cards-two">${part.map(activityCard).join('')||'<div class="empty">Noch keine Teilnahmen.</div>'}</div></div>
  ${storageGet(LEGACY_ARCHIVE_KEY)?`<div class="archive notice info"><strong>Ältere Demo-Daten sind gesichert.</strong> Nicht passende frühere Angebote sind nicht mehr Teil des neuen Konzepts. ${btn('export-legacy','Alte Daten als JSON sichern','btn secondary sm')}</div>`:''}`;
}
function render(){
  if(leafletMap){leafletMap.remove();leafletMap=null;markerLayer=null;markerIndex.clear()}
  let content=ui.page==='Entdecken'?discover():ui.page==='Aktivitäten'?activities():ui.page==='Gruppen'?groups():ui.page==='Chats'?chats():profile();
  document.getElementById('app').innerHTML=header()+`<main class="shell page-${ui.page==='Entdecken'?'discover':ui.page==='Aktivitäten'?'activities':ui.page==='Gruppen'?'groups':ui.page==='Chats'?'chats':'profile'}" id="main">${migrationNote?`<p class="notice info">${escapeHtml(migrationNote)} ${btn('export-legacy','Sicherung herunterladen','btn secondary sm')}</p>`:''}${content}
  <footer class="footer">StadtConnect Mannheim · Studienprojekt · Leaflet & OpenStreetMap-Daten / CARTO · Keine Reservierung · Keine echten Konten</footer></main>`;
  if(ui.page==='Entdecken'&&!ui.detail){mountMap();updateOSMStatus()}
  if(ui.modal)showModal();
}
function navigate(page,detail=null){ui.page=page;ui.detail=detail;ui.chat=null;closeModal(false);render();window.scrollTo({top:0,behavior:'instant'})}
function field(name,label,value='',extra='',span=''){return `<label class="field ${span}" data-field="${name}">${escapeHtml(label)}${extra.startsWith('textarea')?`<textarea name="${attr(name)}" ${extra.replace(/^textarea/,'')} >${escapeHtml(value)}</textarea>`:`<input name="${attr(name)}" value="${attr(value)}" ${extra}>`}<span class="error hidden" data-error="${name}" role="alert"></span></label>`}
function selectField(name,label,items,current='',span=''){return `<label class="field ${span}" data-field="${name}">${escapeHtml(label)}<select name="${attr(name)}">${options(items,current)}</select><span class="error hidden" data-error="${name}" role="alert"></span></label>`}
function fieldErrorsReset(form){form.querySelectorAll('.field.invalid').forEach(x=>x.classList.remove('invalid'));form.querySelectorAll('[data-error]').forEach(x=>{x.classList.add('hidden');x.textContent=''})}
function fieldError(form,name,message){let field=form.querySelector(`[data-field="${CSS.escape(name)}"]`),error=field?.querySelector('[data-error]');field?.classList.add('invalid');if(error){error.textContent=message;error.classList.remove('hidden')}else announce(message)}
function modalActivity(){const info=ui.modalData||{},old=info.id?activityById(info.id):null;
  const specified=info.place?placeById(info.place):null,type=old?.type||(specified?.categories.includes('Bibliotheken')?'lernen':'sport');
  const category=old?.category||specified?.categories[0]||(type==='lernen'?'Bibliotheken':'Basketballplätze');
  const placeId=old?.placeId||specified?.id||'';
  const date=old?.date||futureSaturday(),time=old?.time||'18:00';
  let customAge=!!old&&(old.ageMin!==18||old.ageMax!==null);
  return `<h2>${old?'Aktivität bearbeiten':'Aktivität erstellen'}</h2><p class="muted">Plane ein Sporttreffen oder eine Lernsession. Demo-Daten werden nur in diesem Browser gespeichert.</p>
  <form data-form="activity" id="activityForm" novalidate><div class="form-grid">
  ${selectField('type','Art des Treffens *',['Sporttreffen','Lerntreffen'],type==='lernen'?'Lerntreffen':'Sporttreffen')}
  ${selectField('category','Kategorie / Sportart *',type==='lernen'?['Bibliotheken']:SPORT_CATEGORIES,category)}
  ${field('title','Titel *',old?.title||'','required maxlength="90" placeholder="z. B. Basketball nach der Vorlesung"','span-2')}
  ${field('description','Beschreibung *',old?.description||'','textarea required maxlength="800" placeholder="Was habt ihr vor?"','span-2')}
  <label class="field span-2" data-field="placeId">Ort *<select name="placeId" required id="activityPlaceSelect">${placeOptions(category,placeId)}</select><small>Reale OSM-Orte und ausdrücklich fiktive Demo-Orte sind gekennzeichnet.</small><span class="error hidden" data-error="placeId" role="alert"></span></label>
  ${field('date','Datum *',date,`type="date" required min="${dateYMD(new Date())}"`)}
  ${field('time','Beginn *',time,'type="time" required')}
  ${field('endTime','Ende (optional)',old?.endTime||'','type="time"')}
  ${field('max','Maximale Teilnehmende *',old?.max||8,'type="number" required min="1" max="200"')}
  ${field('meetingPoint','Genauer Treffpunkt *',old?.meetingPoint||'','required maxlength="180" placeholder="z. B. vor dem Eingang"','span-2')}
  <label class="field span-2">Zugehörige Gruppe (optional)<select name="groupId"><option value="">Keine Gruppe</option>${ownedGroups().map(g=>`<option value="${attr(g.id)}" ${g.id===(old?.groupId||info.group)?'selected':''}>${escapeHtml(g.name)}</option>`).join('')}</select></label>
  </div>
  <div id="sportFields" class="fieldset ${type==='lernen'?'hidden':''}"><h3>Zum Sporttreffen</h3><div class="form-grid">${selectField('level','Niveau (optional)',['Offen für alle','Anfänger','Fortgeschritten'],old?.level||'Offen für alle')}
  ${field('equipment','Ausrüstung (optional)',old?.equipment||'','maxlength="180" placeholder="z. B. Ball, Trinkflasche"')}</div></div>
  <div id="studyFields" class="fieldset ${type==='sport'?'hidden':''}"><h3>Zum Lerntreffen</h3><div class="form-grid">${field('topic','Lernthema / Modul *',old?.topic||'','maxlength="100" placeholder="z. B. Mathematik"')}
  ${field('goal','Lernziel *',old?.goal||'','maxlength="250" placeholder="Was möchtet ihr erreichen?"')}</div></div>
  <fieldset class="fieldset"><legend>Gewünschte Altersgruppe</legend><label class="check-row"><input name="customAge" type="checkbox" ${customAge?'checked':''}> Altersbereich festlegen (optional)</label><p class="small muted">Standard: alle Studierenden ab 18. Keine automatische Zugangsbeschränkung.</p>
  <div class="inline-fields ${customAge?'':'hidden'}" id="ageFields">${field('ageMin','Mindestalter',old?.ageMin||18,'type="number" min="18" max="120"')}${field('ageMax','Höchstalter',old?.ageMax??35,'type="number" min="18" max="120"')}</div></fieldset>
  <p class="notice">${type==='lernen'?'Die Teilnahme reserviert keinen Arbeitsplatz oder Gruppenraum.':'Dieses Treffen reserviert die öffentliche Sportfläche nicht.'}</p>
  <div class="form-footer"><button class="btn" type="submit">${icon('save')} ${old?'Änderungen speichern':'Aktivität veröffentlichen'}</button>${btn('close-modal','Abbrechen','btn secondary')}</div></form>`;
}
function placeOptions(category,selected){let match=placesAll().filter(p=>p.categories.includes(category));
  match.sort((a,b)=>Number(b.real)-Number(a.real)||a.name.localeCompare(b.name,'de'));
  return `<option value="">Ort auswählen</option>`+match.map(p=>`<option value="${attr(p.id)}" ${p.id===selected?'selected':''}>${p.real?'OSM':'DEMO'} · ${escapeHtml(p.name)} (${escapeHtml(p.district)})</option>`).join('');
}
function modalGroup(){return `<h2>Neue Gruppe erstellen</h2><p class="muted">Eine Gruppe ist eine dauerhafte Community – Aktivitäten darin haben eigene Termine.</p><form data-form="group" id="groupForm" novalidate><div class="form-grid">
  ${field('name','Gruppenname *','','required maxlength="80" placeholder="z. B. Volleyball nach dem Seminar"','span-2')}
  ${field('description','Beschreibung *','','textarea required maxlength="700" placeholder="Was macht ihr in eurer Gruppe?"','span-2')}
  ${field('focus','Schwerpunkt *','','required maxlength="100" placeholder="z. B. Volleyball oder Informatik"')}
  ${selectField('district','Bevorzugter Stadtteil',DISTRICTS.slice(1),user()?.district||'Neckarau')}
  </div><div class="form-footer"><button class="btn" type="submit">${icon('plus')} Gruppe erstellen</button>${btn('close-modal','Abbrechen','btn secondary')}</div></form>`}
function modalProfile(){let u=user();return `<h2>Profil bearbeiten</h2><p class="muted">Die Hochschule wird als Selbstauskunft angezeigt. Ein Studierendenstatus wird nicht überprüft.</p><form data-form="profile" id="profileForm" novalidate><div class="form-grid">
  ${field('name','Benutzername *',u.name,'required maxlength="50"')}
  ${field('email','E-Mail (nur Demo, nicht öffentlich) *',u.email,'type="email" required')}
  ${field('dob','Geburtsdatum *',u.dob,'type="date" required')}
  ${selectField('district','Bevorzugter Stadtteil',DISTRICTS.slice(1),u.district)}
  ${field('university','Hochschule *',u.university,'required maxlength="120"')}
  ${field('course','Studiengang (optional)',u.course||'','maxlength="100"')}
  ${field('interests','Sport- und Lerninteressen',u.interests||'','maxlength="220"','span-2')}
  ${selectField('gender','Geschlecht (freiwillig)',['Keine Angabe','Weiblich','Männlich','Divers','Selbstbezeichnung'],u.gender||'Keine Angabe')}
  ${selectField('avatar','Profilbild-Symbol (optional)',['user','book','basketball','strength'],u.avatar||'user')}
  ${field('bio','Kurzbeschreibung (optional)',u.bio||'','textarea maxlength="300"','span-2')}
  </div><fieldset class="fieldset"><legend>Öffentliche Sichtbarkeit</legend><div class="form-grid">${[
    ['age','Alter anzeigen (nicht Geburtsdatum)'],['district','Stadtteil anzeigen'],['university','Hochschule anzeigen'],['course','Studiengang anzeigen'],['interests','Interessen anzeigen'],['gender','Geschlecht anzeigen'],['bio','Kurzbeschreibung anzeigen']
  ].map(([key,label])=>`<label class="check-row"><input type="checkbox" name="vis_${key}" ${u.visibility?.[key]?'checked':''}> ${label}</label>`).join('')}</div></fieldset>
  <p class="small muted">E-Mail und vollständiges Geburtsdatum werden grundsätzlich nicht öffentlich gezeigt.</p>
  <div class="form-footer"><button class="btn" type="submit">${icon('save')} Speichern</button>${btn('close-modal','Abbrechen','btn secondary')}</div></form>`}
function modalLogin(){return `<h2>Demo-Anmeldung</h2><p class="notice info">Alle Profile sind fiktiv und lokal gespeichert. Hier findet keine echte Anmeldung statt.</p>
  <div class="cards-two">${db.users.map(u=>`<button type="button" class="chat-link" data-action="switch-user" data-id="${attr(u.id)}"><strong>${icon('user')} ${escapeHtml(u.name)}</strong><div class="small muted">${escapeHtml(u.university||'Demo-Hochschule')} · ${escapeHtml(u.district)}</div></button>`).join('')}</div>
  <div class="divider"></div>${btn('register',`${icon('plus')} Neues Demo-Profil erstellen`,'btn orange')}`}
function modalRegister(){return `<h2>Demo-Registrierung</h2><p class="notice">Nur fiktive Angaben eingeben. Keine echten Zugangsdaten verwenden. Das Testpasswort wird nicht gespeichert.</p><form data-form="register" id="registerForm" novalidate><div class="form-grid">
  ${field('name','Benutzername *','','required maxlength="50"')}
  ${field('email','Demo-E-Mail *','','type="email" required placeholder="name@example.test"')}
  ${field('password','Fiktives Testpasswort *','','type="password" minlength="8" required autocomplete="off" placeholder="Nicht dein echtes Passwort"')}
  ${field('dob','Geburtsdatum *','','type="date" required')}
  ${field('university','Hochschule (Selbstauskunft) *','','required placeholder="z. B. Hochschule Mannheim"')}
  ${field('course','Studiengang (optional)','','maxlength="100"')}
  ${selectField('district','Stadtteil',DISTRICTS.slice(1),'Neckarau')}
  ${selectField('gender','Geschlecht (freiwillig)',['Keine Angabe','Weiblich','Männlich','Divers','Selbstbezeichnung'],'Keine Angabe')}
  ${field('interests','Sport- und Lerninteressen','','maxlength="220"','span-2')}
  </div><p class="small muted">Der Studierendenstatus wird nicht verifiziert. Registrierung nur für Personen ab 18.</p><div class="form-footer"><button class="btn" type="submit">Demo-Registrierung abschließen</button>${btn('close-modal','Abbrechen','btn secondary')}</div></form>`}
function modalReport(){return `<h2>Inhalt melden</h2><p class="muted">Diese Meldung wird nur als Demo-Eintrag lokal gespeichert; sie wird nicht an Moderatoren gesendet.</p><form data-form="report" novalidate><label class="field" data-field="reason">Warum möchtest du den Inhalt melden? *<textarea name="reason" required maxlength="400" placeholder="Kurze Begründung"></textarea><span data-error="reason" class="error hidden" role="alert"></span></label><div class="form-footer"><button class="btn" type="submit">Meldung speichern</button>${btn('close-modal','Abbrechen','btn secondary')}</div></form>`}
function showModal(){if(!ui.modal)return;document.querySelector('.modal-backdrop')?.remove();let templates={activity:modalActivity,group:modalGroup,profile:modalProfile,login:modalLogin,register:modalRegister,report:modalReport};
  const contents=templates[ui.modal]?.()||'';
  let backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal-dialog" role="dialog" aria-modal="true" aria-label="${ui.modal==='activity'?'Treffen bearbeiten oder erstellen':'StadtConnect Formular'}"><div class="sectionrow"><span class="eyebrow">StadtConnect Mannheim</span>${btn('close-modal',`${icon('x')} Schließen`,'btn ghost sm modal-close')}</div>${contents}</section>`;
  backdrop.addEventListener('click',ev=>{if(ev.target===backdrop)closeModal()});document.body.appendChild(backdrop);
  document.body.style.overflow='hidden';requestAnimationFrame(()=>backdrop.querySelector('input,select,button')?.focus());
}
function openModal(mode,info={}){ui.modal=mode;ui.modalData=info;ui.focusReturn=document.activeElement;showModal()}
function closeModal(restore=true){document.querySelector('.modal-backdrop')?.remove();document.body.style.overflow='';ui.modal=null;ui.modalData=null;if(restore&&ui.focusReturn?.isConnected)ui.focusReturn.focus()}
function updateActivityForm(){let form=document.getElementById('activityForm');if(!form)return;let type=form.elements.type.value==='Lerntreffen'?'lernen':'sport';
  let cats=type==='lernen'?['Bibliotheken']:SPORT_CATEGORIES;
  let category=form.elements.category,chosen=category.value;category.innerHTML=options(cats,cats.includes(chosen)?chosen:cats[0]);
  form.querySelector('#sportFields').classList.toggle('hidden',type==='lernen');form.querySelector('#studyFields').classList.toggle('hidden',type==='sport');
  updateActivityPlaceOptions();form.querySelector('.notice').textContent=type==='lernen'?'Die Teilnahme reserviert keinen Arbeitsplatz oder Gruppenraum.':'Dieses Treffen reserviert die öffentliche Sportfläche nicht.';
}
function updateActivityPlaceOptions(){let form=document.getElementById('activityForm');if(!form)return;let select=form.elements.placeId,old=select.value;select.innerHTML=placeOptions(form.elements.category.value,old);
  if(!placesAll().find(p=>p.id===old&&p.categories.includes(form.elements.category.value)))select.value='';
}
function setAgeFields(){let form=document.getElementById('activityForm');form?.querySelector('#ageFields')?.classList.toggle('hidden',!form.elements.customAge.checked)}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function requireFields(form,fields){let invalid=false;for(const [key,label] of fields){let input=form.elements[key],v=String(input?.value||'').trim();if(!v){fieldError(form,key,`${label} ist erforderlich.`);invalid=true}}return invalid}
function validateAge(form,key='dob'){const val=form.elements[key]?.value,age=ageOf(val);if(!Number.isFinite(age)||age<18||age>120){fieldError(form,key,'StadtConnect ist nur für Studierende ab 18 Jahren. Bitte ein gültiges Geburtsdatum eingeben.');return false}return true}
function submitActivity(form){fieldErrorsReset(form);let f=formData(form);let type=f.type==='Lerntreffen'?'lernen':'sport';let invalid=requireFields(form,[['title','Titel'],['description','Beschreibung'],['placeId','Ort'],['date','Datum'],['time','Beginn'],['max','Teilnehmerzahl'],['meetingPoint','Treffpunkt']]);
  let selectedPlace=placeById(f.placeId),category=f.category;
  if(!selectedPlace||!selectedPlace.categories.includes(category)){fieldError(form,'placeId','Bitte einen Ort passend zur Kategorie auswählen.');invalid=true}
  if(!CATEGORIES.includes(category)||(type==='lernen')!==(category==='Bibliotheken')){fieldError(form,'category','Bitte eine gültige Kategorie wählen.');invalid=true}
  if(type==='lernen')invalid=requireFields(form,[['topic','Lernthema'],['goal','Lernziel']])||invalid;
  let max=Number(f.max);if(!Number.isInteger(max)||max<1||max>200){fieldError(form,'max','Bitte 1 bis 200 Plätze eingeben.');invalid=true}
  const old=ui.modalData?.id?activityById(ui.modalData.id):null;
  if(old&&old.hostId!==me()){announce('Nur der Host darf bearbeiten.');return}
  if(old&&max<old.attendees.length){fieldError(form,'max',`Es sind bereits ${old.attendees.length} Personen angemeldet.`);invalid=true}
  let start=minutesOf(f.date,f.time),end=f.endTime?minutesOf(f.date,f.endTime):null;
  if(!Number.isFinite(start)||start<=Date.now()){fieldError(form,'date','Bitte einen Termin in der Zukunft wählen.');invalid=true}
  if(end!==null&&(!Number.isFinite(end)||end<=start)){fieldError(form,'endTime','Das Ende muss nach dem Beginn liegen.');invalid=true}
  let ageMin=18,ageMax=null;if(form.elements.customAge.checked){ageMin=Number(f.ageMin);ageMax=Number(f.ageMax);
    if(!Number.isInteger(ageMin)||ageMin<18||ageMin>120){fieldError(form,'ageMin','Mindestalter muss zwischen 18 und 120 liegen.');invalid=true}
    if(!Number.isInteger(ageMax)||ageMax<ageMin||ageMax>120){fieldError(form,'ageMax','Höchstalter muss mindestens dem Mindestalter entsprechen (max. 120).');invalid=true}
  }
  if(invalid){form.querySelector('.field.invalid input,.field.invalid select,.field.invalid textarea')?.focus();return}
  let group=db.groups.find(g=>g.id===f.groupId&&g.members.includes(me()));
  let item={id:old?.id||randomId('activity'),type,title:f.title.trim(),description:f.description.trim(),hostId:me(),placeId:f.placeId,category,date:f.date,time:f.time,endTime:f.endTime||'',max,
    attendees:old?.attendees||[me()],ageMin,ageMax,groupId:group?.id||null,
    level:type==='sport'?f.level:'',equipment:type==='sport'?f.equipment.trim():'',topic:type==='lernen'?f.topic.trim():'',goal:type==='lernen'?f.goal.trim():'',meetingPoint:f.meetingPoint.trim(),status:'active'};
  if(old)Object.assign(old,item);else db.activities.push(item);
  persist();closeModal(false);navigate('Aktivitäten',item.id);announce(old?'Treffen aktualisiert.':'Treffen veröffentlicht.');
}
function submitGroup(form){fieldErrorsReset(form);let f=formData(form);if(requireFields(form,[['name','Gruppenname'],['description','Beschreibung'],['focus','Schwerpunkt']]))return;
  let g={id:randomId('group'),name:f.name.trim(),description:f.description.trim(),focus:f.focus.trim(),district:f.district,members:[me()],owner:me()};db.groups.push(g);persist();closeModal(false);navigate('Gruppen',g.id);announce('Gruppe erstellt.')}
function submitProfile(form){fieldErrorsReset(form);let f=formData(form),invalid=requireFields(form,[['name','Benutzername'],['email','E-Mail'],['university','Hochschule']]);invalid=!validateAge(form)||invalid;
  if(!form.elements.email.validity.valid){fieldError(form,'email','Bitte eine gültige E-Mail-Adresse eingeben.');invalid=true}if(invalid)return;
  let u=user();Object.assign(u,{name:f.name.trim(),email:f.email.trim(),dob:f.dob,university:f.university.trim(),course:f.course.trim(),district:f.district,gender:f.gender,avatar:PATHS[f.avatar]?f.avatar:'user',interests:f.interests.trim(),bio:f.bio.trim(),visibility:Object.fromEntries(['age','district','university','course','interests','gender','bio'].map(k=>[k,form.elements[`vis_${k}`].checked]))});
  persist();closeModal(false);render();announce('Profil gespeichert.')}
function submitRegister(form){fieldErrorsReset(form);let f=formData(form),invalid=requireFields(form,[['name','Name'],['email','E-Mail'],['password','Testpasswort'],['university','Hochschule']]);invalid=!validateAge(form)||invalid;
  if(!form.elements.email.validity.valid){fieldError(form,'email','Bitte eine gültige E-Mail-Adresse eingeben.');invalid=true}
  if(f.password.length<8){fieldError(form,'password','Das fiktive Passwort muss mindestens 8 Zeichen enthalten.');invalid=true}if(invalid)return;
  let id=randomId('student'),u={id,name:f.name.trim(),email:f.email.trim(),dob:f.dob,university:f.university.trim(),course:f.course.trim(),district:f.district,gender:f.gender,interests:f.interests.trim(),bio:'',avatar:'user',visibility:{age:true,district:true,university:true,course:true,interests:true,gender:false,bio:false}};
  // Das eingegebene Demo-Passwort wird bewusst weder gespeichert noch übertragen.
  db.users.push(u);db.activeUserId=id;persist();closeModal(false);navigate('Mein Profil');announce('Demo-Profil erstellt. Kein Passwort gespeichert.')}
function submitChat(form){const key=form.dataset.key,[type,id]=key.split(':'),allowed=user()&&(type==='a'?activityById(id)?.attendees.includes(me())&&activityById(id)?.status==='active':groupById(id)?.members.includes(me()));
  if(!allowed){announce('Nur Teilnehmende beziehungsweise Mitglieder dürfen schreiben.');return}
  let message=form.elements.message.value.trim();if(!message){announce('Bitte eine Nachricht eingeben.');return}
  db.messages[key]??=[];db.messages[key].push({from:me(),text:message,at:toTime(Date.now())});persist();render();let w=document.getElementById('chatWindow');if(w)w.scrollTop=w.scrollHeight;announce('Nachricht lokal gespeichert.')}
function submitReport(form){fieldErrorsReset(form);let reason=form.elements.reason.value.trim();if(!reason){fieldError(form,'reason','Bitte einen Grund angeben.');return}
  db.reports.push({type:ui.modalData.kind,id:ui.modalData.id,reason,at:new Date().toISOString()});persist();closeModal();announce('Meldung gespeichert (nur in dieser Demo).')}
function resetDemo(){if(!confirm('Alle Änderungen dieser Studierenden-Demo (inklusive Chats und Teilnahmen) zurücksetzen? Die archivierten früheren Daten bleiben als Sicherung erhalten.'))return;
  db=seed();ui={page:'Entdecken',detail:null,modal:null,modalData:null,selectedPlace:null,chat:null,placeQuery:'',district:'Alle',selectedCats:new Set(),activityQuery:'',actDistrict:'Alle',actCategory:'Alle',actDate:'',actSpots:false,actMine:false,groupQuery:'',mobileMode:'map',sortGroups:'all'};
  migrationNote='';persist();closeModal(false);render();announce('Demodaten zurückgesetzt.')}
function saveBackup(){let legacy=storageGet(LEGACY_ARCHIVE_KEY);if(!legacy){announce('Keine älteren Daten gefunden.');return}let blob=new Blob([legacy],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='stadtconnect-alte-demodaten.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function requireDemoLogin(){if(user())return false;openModal('login');announce('Bitte zuerst ein Demo-Profil auswählen.');return true}
function performAction(action,data){
  switch(action){
    case 'navigate':navigate(data.page);break;
    case 'details-place':navigate('Entdecken',data.id);break;
    case 'details-activity':navigate('Aktivitäten',data.id);break;
    case 'details-group':navigate('Gruppen',data.id);break;
    case 'focus-place':focusPlaceOnMap(data.id);break;
    case 'reload-osm':loadOSM(true);break;
    case 'toggle-category':ui.selectedCats.has(data.category)?ui.selectedCats.delete(data.category):ui.selectedCats.add(data.category);updatePlaceFilters();break;
    case 'reset-place-filters':ui.placeQuery='';ui.district='Alle';ui.selectedCats.clear();if(document.getElementById('placeSearch'))document.getElementById('placeSearch').value='';let pSelect=document.querySelector('[data-filter="place-district"]');if(pSelect)pSelect.value='Alle';updatePlaceFilters();break;
    case 'mobile-mode':ui.mobileMode=data.mode;for(const el of document.querySelectorAll('.maparea,.listarea'))el.classList.toggle('mobile-off',(el.classList.contains('maparea')?data.mode==='list':data.mode==='map'));
      document.querySelectorAll('[data-action="mobile-mode"]').forEach(b=>b.className=b.dataset.mode===data.mode?'btn':'btn secondary');if(data.mode==='map')setTimeout(()=>leafletMap?.invalidateSize(),50);break;
    case 'reset-activity-filters':ui.activityQuery='';ui.actDistrict='Alle';ui.actCategory='Alle';ui.actDate='';ui.actSpots=false;ui.actMine=false;render();break;
    case 'new-activity':if(!requireDemoLogin())openModal('activity',{place:data.place,group:data.group});break;
    case 'edit-activity':if(!requireDemoLogin())openModal('activity',{id:data.id});break;
    case 'new-group':if(!requireDemoLogin())openModal('group');break;
    case 'edit-profile':if(!requireDemoLogin())openModal('profile');break;
    case 'close-modal':closeModal();break;
    case 'login':openModal('login');break;
    case 'register':openModal('register');break;
    case 'logout':db.activeUserId=null;persist();navigate('Mein Profil');announce('Vom Demo-Profil abgemeldet.');break;
    case 'switch-user':if(db.users.some(u=>u.id===data.id)){db.activeUserId=data.id;persist();navigate('Mein Profil');announce('Demo-Profil gewechselt.')}break;
    case 'toggle-activity':{
      if(requireDemoLogin())break;let a=activityById(data.id);if(!a||a.status!=='active'||!isFuture(a)){announce('Dieses Treffen ist nicht mehr offen.');break}
      const pos=a.attendees.indexOf(me());if(pos>=0){a.attendees.splice(pos,1);announce('Teilnahme zurückgezogen.')}else if(spaces(a)===0){announce('Diese Aktivität ist ausgebucht.');break}else{a.attendees.push(me());announce('Du nimmst teil. Der Aktivitätschat ist nun freigeschaltet.')}
      persist();render();break;
    }
    case 'cancel-activity':{let a=activityById(data.id);if(!a||a.hostId!==me()){announce('Nur Hosts können ein Treffen absagen.');break}
      if(confirm('Dieses Treffen wirklich absagen? Teilnehmende können anschließend nicht mehr chatten.')){a.status='cancelled';persist();render();announce('Treffen abgesagt.')}break}
    case 'toggle-group':{if(requireDemoLogin())break;let g=groupById(data.id);if(!g)break;let i=g.members.indexOf(me());if(i>=0){g.members.splice(i,1);announce('Gruppe verlassen. Der Gruppenchat ist nun gesperrt.')}else{g.members.push(me());announce('Gruppe beigetreten. Der Gruppenchat ist freigeschaltet.')}persist();render();break}
    case 'open-chat':ui.chat=data.key;render();break;
    case 'report':openModal('report',{kind:data.kind,id:data.id});break;
    case 'reset-demo':resetDemo();break;
    case 'export-legacy':saveBackup();break;
    default:break;
  }
}
document.addEventListener('click',ev=>{
  const button=ev.target.closest('[data-action]');if(!button)return;
  ev.preventDefault();performAction(button.dataset.action,button.dataset);
});
document.addEventListener('input',ev=>{
  const target=ev.target;
  switch(target.dataset.filter){
    case 'place-query':ui.placeQuery=target.value;updatePlaceFilters();break;
    case 'activity-query':ui.activityQuery=target.value;let a=document.getElementById('activityResults');if(a)a.innerHTML=activityResults();break;
    case 'group-query':ui.groupQuery=target.value;let g=document.getElementById('groupResults');if(g)g.innerHTML=`<div class="cards-two group-results-grid">${db.groups.filter(o=>anyMatch(`${o.name} ${o.description} ${o.focus} ${o.district}`,ui.groupQuery)).map(groupCard).join('')||'<div class="empty">Keine passenden Gruppen gefunden.</div>'}</div>`;break;
  }
});
document.addEventListener('change',ev=>{
  let t=ev.target;
  switch(t.dataset.filter){
    case 'place-district':ui.district=t.value;updatePlaceFilters();break;
    case 'activity-district':ui.actDistrict=t.value;break;
    case 'activity-category':ui.actCategory=t.value;break;
    case 'activity-date':ui.actDate=t.value;break;
    case 'activity-spots':ui.actSpots=t.checked;break;
    case 'activity-mine':ui.actMine=t.checked;break;
  }
  if(t.dataset.filter?.startsWith('activity-')){let box=document.getElementById('activityResults');if(box)box.innerHTML=activityResults()}
  let form=t.closest('#activityForm');if(form){
    if(t.name==='type')updateActivityForm();
    if(t.name==='category')updateActivityPlaceOptions();
    if(t.name==='customAge')setAgeFields();
  }
});
document.addEventListener('submit',ev=>{
  const form=ev.target;if(!form.dataset.form)return;ev.preventDefault();
  const handlers={activity:submitActivity,group:submitGroup,profile:submitProfile,register:submitRegister,'send-chat':submitChat,report:submitReport};
  try{handlers[form.dataset.form]?.(form)}catch(e){console.error('Formularfehler:',e);announce('Die Aktion konnte nicht abgeschlossen werden. Bitte überprüfe die Eingaben.')}
});
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&ui.modal){ev.preventDefault();closeModal();return}
  if(ui.modal&&ev.key==='Tab'){
    let dialog=document.querySelector('.modal-dialog'),focusables=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(x=>x.getClientRects().length);
    if(focusables.length){let first=focusables[0],last=focusables.at(-1);if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}}
    return;
  }
  if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('[data-place-card]')&&ev.target===document.activeElement){ev.preventDefault();focusPlaceOnMap(ev.target.dataset.placeCard)}
});
// Zusatzaktion für das kontrollierte Zurücksetzen der Demo-Daten ist im Profil sichtbar.
render();
if(realPlaces.length){updateOSMStatus()}
loadOSM(false);
