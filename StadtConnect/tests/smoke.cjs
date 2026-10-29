/* Browser-Regression: echte Leaflet-/Cluster-Bibliotheken, isolierter Browser,
   ausschließlich künstliche Ortsdaten und Kartenbilder. Kein Nutzerprofil wird verändert. */
const {chromium}=require(process.env.STADTCONNECT_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const geo=require('../geo.js');
const baseline=JSON.parse(require('node:fs').readFileSync(path.join(root,'data/catalog.json'),'utf8'));
const sample=baseline.items.find(p=>p.district==='Neckarau'&&p.categories.includes('Basketballplätze'));
const expectedTotal=baseline.items.length+181;
const origin='http://stadtconnect.test';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const places=Array.from({length:180},(_,i)=>({type:'node',id:900000+i,lat:sample.lat+(i%12)*.0001,lon:sample.lon+Math.floor(i/12)*.0001,tags:{name:`Testplatz ${String(i+1).padStart(3,'0')}${i%5===0?' – Basketball und gemeinsame Bewegung nach der Vorlesung':''}`,leisure:'pitch',sport:i===0?'basketball;volleyball':'basketball','addr:suburb':'Neckarau','addr:street':'Teststraße','addr:housenumber':String(i+1)}}));
places.push({type:'node',id:910000,lat:49.45889,lon:8.4856,tags:{name:'Testbibliothek Neckarau',amenity:'library','addr:suburb':'Lindenhof'}});
places.push({type:'node',id:920000,lat:49.44,lon:8.48,tags:{name:'Ausgeschlossene Privatanlage',leisure:'pitch',sport:'basketball',access:'private'}});
places.push({type:'node',id:920001,lat:49.44,lon:8.48,tags:{name:'Kostenpflichtiger Testplatz',leisure:'pitch',sport:'basketball',fee:'yes'}});
places.push({type:'node',id:920002,lat:51,lon:9,tags:{name:'Außerhalb des Startgebiets',leisure:'pitch',sport:'basketball','addr:suburb':'Neckarau'}});
for(const element of places){element.version=1;element.timestamp='2026-10-28T10:00:00Z'}
const results=[],errors=[],consoleErrors=[];
const check=(name,value)=>{assert.ok(value,name);results.push(name);console.log('OK',name)};
let overpassCalls=0,failOverpass=false;
async function setup(context){
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='stadtconnect.test'){
      const relative=decodeURIComponent(url.pathname==='/'?'index.html':url.pathname.slice(1));
      const file=path.resolve(root,relative);
      if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
      try{const body=await fs.readFile(file);const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'}[path.extname(file)]||'application/octet-stream';return route.fulfill({body,contentType:type})}catch{return route.fulfill({status:404,body:''})}
    }
    if(url.pathname.endsWith('/interpreter')){overpassCalls++;if(failOverpass)return route.fulfill({status:503,body:'Testausfall'});return route.fulfill({contentType:'application/json',body:JSON.stringify({elements:places})})}
    if(url.hostname==='basemaps.cartocdn.com')return route.fulfill({contentType:'image/png',body:png});
    return route.abort();
  });
}
async function nav(page,name){await page.locator('.nav').getByRole('button',{name,exact:true}).click()}
async function click(page,action,extra=''){await page.locator(`[data-action="${action}"]${extra}`).first().click()}
async function fill(page,name,value,form='#activityForm'){await page.locator(`${form} [name="${name}"]`).fill(value)}
async function switchUser(page,id){await nav(page,'Mein Profil');await click(page,'login');await click(page,'switch-user',`[data-id="${id}"]`)}
async function submit(page,form){await page.locator(`${form} button[type=submit]`).click()}
const nextDate=()=>{const d=new Date();d.setDate(d.getDate()+10);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
async function createActivity(page,title,type='Sporttreffen'){
  await click(page,'new-activity');
  if(type==='Lerntreffen')await page.locator('#activityForm [name=type]').selectOption(type);
  await fill(page,'title',title);await fill(page,'description','Gemeinsam üben. <img src=x onerror="window.xss=true">');
  await page.locator('#activityForm [name=placeId]').selectOption(type==='Lerntreffen'?'osm_node_910000':'osm_node_900000');
  await fill(page,'date',nextDate());await fill(page,'time','17:00');await fill(page,'endTime','18:00');await fill(page,'max','2');await fill(page,'meetingPoint','Am Eingang');
  if(type==='Lerntreffen'){await fill(page,'topic','Mathematik');await fill(page,'goal','Übungsblatt gemeinsam lösen')}
  await submit(page,'#activityForm');await page.locator('.detail h1').filter({hasText:title}).waitFor();
  return page.evaluate(()=>ui.detail);
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.STADTCONNECT_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Europe/Berlin',reducedMotion:'reduce'});await setup(context);
  const page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  await page.goto(origin);await page.locator('.place-row').first().waitFor();
  check('Lokaler realer Quellenbestand startet ohne Live-Abfrage',await page.locator('.place-row').count()===baseline.items.length&&overpassCalls===0);
  await page.screenshot({path:path.join(root,'tests/screenshots/entdecken-desktop.png'),fullPage:true});
  await click(page,'reload-osm');await page.waitForFunction(()=>!osmLoading);
  check('Lokale Orte plus 181 Testorte; private/kostenpflichtige/fremde Orte ausgeschlossen',await page.locator('.place-row').count()===expectedTotal);
  check('Mehrfachkategorie erzeugt keinen doppelten Ort',await page.evaluate(()=>markerIndex.size===LOCAL_DATA.items.length+181&&filteredPlaces().find(p=>p.id==='osm_node_900000').categories.length===2));
  check('Vollständige scrollbare Ortskarten bei vielen Ergebnissen',await page.evaluate(()=>{const list=document.getElementById('placesList');return list.scrollHeight>list.clientHeight&&[...list.children].every(el=>el.clientHeight>=175&&el.scrollHeight<=el.clientHeight+2)}));
  await page.locator('#placeSearch').fill('Testplatz');const calls=overpassCalls;await page.evaluate(()=>window.originalMap=leafletMap);
  await page.locator('[data-filter=place-district]').selectOption('Neckarau');await click(page,'toggle-category','[data-category="Basketballplätze"]');
  check('Basketball Neckarau: Liste und Marker gemeinsam gefiltert',await page.locator('.place-row').count()===180&&await page.evaluate(()=>markerIndex.size===180));
  check('Filter lösen keine Datenabfrage aus und erhalten die Karte',overpassCalls===calls&&await page.evaluate(()=>window.originalMap===leafletMap));
  await page.locator('.place-row').last().locator('[data-action=focus-place]').click();
  await page.waitForTimeout(800);
  if(!await page.locator('.leaflet-popup').count()){console.log('Markerdiagnose',await page.evaluate(()=>({selected:ui.selectedPlace,zoom:leafletMap.getZoom(),center:leafletMap.getCenter(),layers:markerLayer.getLayers().length,errors:document.querySelector('.toast')?.textContent})));await page.screenshot({path:path.join(root,'tests/screenshots/marker-diagnose.png'),fullPage:true})}
  await page.locator('.leaflet-popup').waitFor();
  check('Listenwahl öffnet Marker und markiert Ortskarte',await page.locator('.place-row.selected').count()===1&&await page.locator('.osm-pin.selected').count()===1);
  await page.locator('.osm-pin.selected').click();check('Markerwahl bleibt mit der Liste synchron',await page.locator('.place-row.selected').count()===1);
  await page.locator('#placeSearch').fill('nichtvorhanden');check('Leere Suche mit Rücksetz-Aktion',await page.locator('.place-row').count()===0&&await page.locator('.empty').filter({hasText:'Keine passenden Orte'}).count()===1);
  await click(page,'reset-place-filters');
  await click(page,'details-place','[data-id="osm_node_910000"]');check('Bibliotheksdetails enthalten ehrliche unbekannte Angaben',(await page.locator('.place-detail').innerText()).includes('Nicht bekannt'));
  const activityId=await createActivity(page,'Regression Basketball');
  check('Sporttreffen erstellt, Host zählt mit und Treffpunkt gespeichert',await page.evaluate(id=>{const a=activityById(id);return a.attendees.length===1&&a.hostId==='max'&&db.places.some(p=>p.id===a.placeId)},activityId));
  check('Nutzereingaben werden als Text ausgegeben',!await page.evaluate(()=>window.xss)&&await page.locator('.detail img').count()===0);
  await click(page,'edit-activity');await fill(page,'title','Regression Basketball bearbeitet');await fill(page,'max','0');await submit(page,'#activityForm');
  check('Teilnehmergrenzen werden am Feld validiert',await page.locator('[data-error=max]').isVisible());
  await fill(page,'max','2');await fill(page,'date','2020-01-01');await submit(page,'#activityForm');check('Vergangene Termine werden abgewiesen',await page.locator('[data-error=date]').isVisible());
  await fill(page,'date',nextDate());await fill(page,'endTime','16:00');await submit(page,'#activityForm');check('Ende vor Beginn wird abgewiesen',await page.locator('[data-error=endTime]').isVisible());
  await fill(page,'endTime','18:00');await submit(page,'#activityForm');
  await switchUser(page,'mia');await nav(page,'Aktivitäten');await click(page,'details-activity',`[data-id="${activityId}"]`);
  check('Nichtteilnehmende sehen den Aktivitätschat nicht',await page.locator('[data-form=send-chat]').count()===0);
  await click(page,'toggle-activity');check('Beitritt aktualisiert Teilnehmerzahl und Status',await page.evaluate(id=>activityById(id).attendees.length===2&&spaces(activityById(id))===0,activityId));
  await fill(page,'message','Testnachricht <svg onload="window.xss=true">','#main');await submit(page,'[data-form=send-chat]');
  check('Nachricht erscheint genau einmal, sicher und mit erhaltenem Eingabefokus',await page.locator('.bubble').filter({hasText:'Testnachricht'}).count()===1&&!await page.evaluate(()=>window.xss)&&await page.locator('[name=message]').evaluate(el=>el===document.activeElement));
  await nav(page,'Aktivitäten');check('Übersicht zeigt Ausgebucht und Teilnahme',await page.locator('.activity-card').filter({hasText:'Regression Basketball bearbeitet'}).innerText().then(t=>t.includes('Ausgebucht')&&t.includes('Du bist dabei')));
  await switchUser(page,'jonas');await nav(page,'Aktivitäten');await click(page,'details-activity',`[data-id="${activityId}"]`);check('Ausgebuchte Aktivität hat keinen funktionslosen Beitreten-Button',await page.locator('[data-action=toggle-activity]').count()===0);
  await switchUser(page,'mia');await nav(page,'Aktivitäten');await click(page,'details-activity',`[data-id="${activityId}"]`);await click(page,'toggle-activity');
  check('Rückzug gibt Platz frei und sperrt den Chat',await page.locator('[data-form=send-chat]').count()===0&&await page.evaluate(id=>spaces(activityById(id))===1&&!canChat('a',id),activityId));
  check('Chatdarstellung prüft Berechtigungen selbst',await page.evaluate(id=>!chat('a',id).includes('Testnachricht'),activityId));
  await switchUser(page,'max');const studyId=await createActivity(page,'Regression Lerntreffen','Lerntreffen');
  check('Lerntreffen mit Modul, Lernziel und Reservierungshinweis',(await page.locator('main').innerText()).includes('Die Teilnahme reserviert keinen Arbeitsplatz oder Gruppenraum.')&&await page.evaluate(id=>activityById(id).topic==='Mathematik',studyId));
  await nav(page,'Gruppen');await click(page,'new-group');await fill(page,'name','Regression Lerngruppe','#groupForm');await fill(page,'description','Gemeinsam studieren','#groupForm');await fill(page,'focus','Mathematik','#groupForm');await submit(page,'#groupForm');const groupId=await page.evaluate(()=>ui.detail);
  check('Gruppe erstellt und Gruppenchat verfügbar',await page.locator('[data-form=send-chat]').count()===1);
  await click(page,'toggle-group');check('Gruppenaustritt sperrt Chat',await page.locator('[data-form=send-chat]').count()===0&&await page.evaluate(id=>!canChat('g',id),groupId));
  await switchUser(page,'mia');await nav(page,'Gruppen');await click(page,'details-group',`[data-id="${groupId}"]`);check('Nichtmitglied sieht keine Gruppennachrichten',await page.locator('[data-form=send-chat]').count()===0);await click(page,'toggle-group');
  await fill(page,'message','Gruppennachricht','#main');await submit(page,'[data-form=send-chat]');check('Gruppenbeitritt und Nachricht funktionieren',await page.locator('.bubble').filter({hasText:'Gruppennachricht'}).count()===1);
  await nav(page,'Chats');check('Chats zeigen zugehörige Gruppe',await page.locator('.chat-link').filter({hasText:'Regression Lerngruppe'}).count()===1);await click(page,'open-chat',`[data-key="g:${groupId}"]`);
  await nav(page,'Mein Profil');await click(page,'edit-profile');await fill(page,'bio','Profiländerung für Regression','#profileForm');await submit(page,'#profileForm');await page.reload();await nav(page,'Mein Profil');check('Profil, Aktivitäten, Gruppen und Chats überleben Neuladen',await page.evaluate(({activityId,groupId})=>user().bio==='Profiländerung für Regression'&&!!activityById(activityId)&&!!groupById(groupId)&&db.messages[`g:${groupId}`].length===1,{activityId,groupId}));
  await click(page,'edit-profile');await page.keyboard.press('Escape');check('Escape schließt Dialog und stellt Fokus wieder her',await page.locator('.modal-dialog').count()===0&&await page.locator('[data-action=edit-profile]').evaluate(el=>el===document.activeElement));
  await click(page,'login');await click(page,'register');check('Demo-Registrierung fragt kein Passwort ab',await page.locator('input[type=password]').count()===0);
  await fill(page,'name','Teststudent','#registerForm');await fill(page,'email','student@example.test','#registerForm');await fill(page,'university','Testhochschule','#registerForm');await fill(page,'dob','2012-01-01','#registerForm');await submit(page,'#registerForm');check('Unter 18 wird mit Feldfehler abgewiesen',await page.locator('[data-error=dob]').isVisible());await fill(page,'dob','2002-01-01','#registerForm');await submit(page,'#registerForm');check('Volljähriges Demo-Profil ohne gespeichertes Passwort',await page.evaluate(()=>user().name==='Teststudent'&&!('password' in user())));
  for(const width of [320,375,430,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const name of ['Entdecken','Aktivitäten','Gruppen','Chats','Mein Profil']){
      await nav(page,name);
      check(`${name}: kein horizontaler Überlauf bei ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      check(`${name}: ein Haupt-CTA bei ${width}px`,await page.locator('button').filter({hasText:/^Aktivität erstellen$/}).count()===1);
    }
  }
  await page.setViewportSize({width:375,height:850});await nav(page,'Entdecken');await click(page,'mobile-mode','[data-mode=list]');
  check('Mobil: Liste scrollbar, Karte ausgeblendet',await page.locator('.place-list').evaluate(el=>el.scrollHeight>el.clientHeight)&&!await page.locator('.maparea').isVisible());
  await page.locator('.place-row').first().locator('[data-action=focus-place]').click();check('Mobil: Auf Karte zeigen wechselt in Kartenansicht',await page.locator('.maparea').isVisible()&&!await page.locator('.listarea').isVisible());
  await click(page,'mobile-mode','[data-mode=list]');await page.evaluate(()=>{document.querySelector('.toast')?.remove();window.scrollTo(0,0)});await page.screenshot({path:path.join(root,'tests/screenshots/entdecken-mobil.png'),fullPage:true});
  await nav(page,'Aktivitäten');await page.screenshot({path:path.join(root,'tests/screenshots/aktivitaeten-mobil.png'),fullPage:true});
  await click(page,'new-activity');await page.locator('.modal-dialog button').last().focus();await page.keyboard.press('Tab');check('Dialog hält Tastaturfokus innerhalb',await page.locator('.modal-dialog button').first().evaluate(el=>el===document.activeElement));await page.keyboard.press('Escape');
  await page.setViewportSize({width:1440,height:1000});for(const name of ['Aktivitäten','Gruppen','Chats','Mein Profil']){await nav(page,name);await page.screenshot({path:path.join(root,`tests/screenshots/${name==='Aktivitäten'?'aktivitaeten':name==='Mein Profil'?'profil':name.toLowerCase()}-desktop.png`),fullPage:true})}
  await switchUser(page,'max');await nav(page,'Aktivitäten');await click(page,'details-activity',`[data-id="${activityId}"]`);page.once('dialog',d=>d.accept());await click(page,'cancel-activity');check('Absage setzt Status und sperrt Chat',await page.evaluate(id=>activityById(id).status==='cancelled'&&!canChat('a',id),activityId));
  check('Keine Konsolenfehler in den regulären Abläufen',consoleErrors.length===0);
  failOverpass=true;await nav(page,'Entdecken');await page.evaluate(()=>osmRetryAt=0);await click(page,'reload-osm');await page.waitForFunction(()=>!osmLoading);
  check('Fehlgeschlagenes Update erhält Cache und ermöglicht manuellen Neustart',await page.locator('.place-row').count()===expectedTotal&&(await page.locator('#osmStatus').innerText()).includes('lokale geprüfte Bestand bleibt sichtbar')&&await page.locator('[data-action=reload-osm]').isEnabled());
  const broken=await browser.newContext();await setup(broken);await broken.addInitScript(()=>localStorage.setItem('stadtconnect_students_v3','{kaputt'));const brokenPage=await broken.newPage();brokenPage.on('pageerror',e=>errors.push(e.message));await brokenPage.goto(origin);check('Beschädigte Speicherung bleibt als Original-Sicherung erhalten',await brokenPage.evaluate(()=>localStorage.getItem('stadtconnect_recovery_v3')==='{kaputt')&&await brokenPage.locator('.notice').filter({hasText:'Sicherung wurde aufbewahrt'}).count()===1);
  await broken.close();
  const blocked=await browser.newContext();await setup(blocked);await blocked.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Test: Speicher voll','QuotaExceededError')}});const blockedPage=await blocked.newPage();blockedPage.on('pageerror',e=>errors.push(e.message));await blockedPage.goto(origin);check('Speicherausfall wird dauerhaft sichtbar',await blockedPage.locator('#storageStatus').isVisible());await blocked.close();
  const noData=await browser.newContext();await setup(noData);const emptyPage=await noData.newPage();emptyPage.on('pageerror',e=>errors.push(e.message));await emptyPage.goto(origin);await click(emptyPage,'reload-osm');await emptyPage.waitForFunction(()=>!osmLoading);check('Ortsdaten-Ausfall ohne Cache erhält den lokalen realen Bestand',await emptyPage.locator('.place-row').count()===baseline.items.length&&(await emptyPage.locator('#osmStatus').innerText()).includes('nicht erreichbar'));await noData.close();
  failOverpass=false;
  const mobile=await browser.newContext({viewport:{width:375,height:850},reducedMotion:'reduce'});await setup(mobile);const mobilePage=await mobile.newPage();mobilePage.on('pageerror',e=>errors.push(e.message));await mobilePage.goto(origin);await mobilePage.locator('.place-row').first().waitFor({state:'attached'});
  check('Mobil: Filter sind beim ersten Start kompakt zugeklappt',!await mobilePage.locator('#discoverFilters').evaluate(el=>el.open));
  await click(mobilePage,'mobile-mode','[data-mode=list]');await mobilePage.evaluate(()=>window.scrollTo(0,0));await mobilePage.screenshot({path:path.join(root,'tests/screenshots/entdecken-mobil.png'),fullPage:true});
  for(const width of [320,768,1440]){await mobilePage.setViewportSize({width,height:900});for(const action of ['new-activity','new-group','edit-profile']){
    if(action==='new-group')await nav(mobilePage,'Gruppen');if(action==='edit-profile')await nav(mobilePage,'Mein Profil');await click(mobilePage,action);
    check(`${action}: Formular ohne Überlauf bei ${width}px`,await mobilePage.locator('.modal-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await mobilePage.keyboard.press('Escape');
  }}
  await nav(mobilePage,'Mein Profil');await click(mobilePage,'logout');await click(mobilePage,'new-activity');check('Abgemeldet fordert Erstellen eine Demo-Anmeldung',await mobilePage.locator('.modal-dialog').innerText().then(t=>t.includes('Demo-Anmeldung')));await mobile.close();
  const animation=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});await setup(animation);const animationPage=await animation.newPage();animationPage.on('pageerror',e=>errors.push(e.message));await animationPage.goto(origin);await animationPage.locator('.place-row').first().waitFor();await click(animationPage,'reload-osm');await animationPage.waitForFunction(()=>!osmLoading);await animationPage.locator('.place-row').nth(180).waitFor();await animationPage.locator('.place-row').last().locator('[data-action=focus-place]').click();await animationPage.locator('.leaflet-popup').waitFor();check('Geclusterter Marker öffnet auch mit regulärer Animation',await animationPage.locator('.place-row.selected').count()===1);
  check('Leaflet-Quellenangabe bleibt korrekt dimensioniert',await animationPage.locator('.leaflet-control-attribution').evaluate(el=>el.clientHeight<50&&el.clientWidth<el.closest('.map-wrap').clientWidth));await animation.close();
  await nav(page,'Mein Profil');await click(page,'login');await click(page,'switch-user','[data-id=max]');
  await nav(page,'Gruppen');await click(page,'details-group',`[data-id="${groupId}"]`);await click(page,'report');await fill(page,'reason','Testmeldung für Regression','[data-form=report]');await submit(page,'[data-form=report]');check('Gruppenmeldung wird genau einmal lokal gespeichert',await page.evaluate(()=>db.reports.filter(r=>r.reason==='Testmeldung für Regression').length===1));
  await nav(page,'Mein Profil');const downloadPromise=page.waitForEvent('download');await click(page,'export-data');const download=await downloadPromise;check('Demo-Sicherung kann heruntergeladen werden',download.suggestedFilename()==='stadtconnect-demo-sicherung.json');
  const migrated=await browser.newContext();await setup(migrated);await migrated.addInitScript(()=>localStorage.setItem('stadtconnect_demo_v1',JSON.stringify({user:{name:'Alte Demo',dob:'2000-01-01'},groups:[],activities:[]})));const migratedPage=await migrated.newPage();migratedPage.on('pageerror',e=>errors.push(e.message));await migratedPage.goto(origin);check('Alte Demodaten werden unverändert gesichert und Profil übernommen',await migratedPage.evaluate(()=>JSON.parse(localStorage.getItem('stadtconnect_legacy_backup_v1')).user.name==='Alte Demo'&&user().name==='Alte Demo'));await migrated.close();
  const archive=await browser.newContext();await setup(archive);const data=await page.evaluate(()=>{const copy=JSON.parse(JSON.stringify(db));copy.activities.push({id:'unsupported',title:'Altes fremdes Angebot',category:'Ausgeschlossene Kategorie'});return copy});await archive.addInitScript(value=>localStorage.setItem('stadtconnect_students_v3',JSON.stringify(value)),data);const archivePage=await archive.newPage();archivePage.on('pageerror',e=>errors.push(e.message));await archivePage.goto(origin);check('Unzulässige alte Kategorie wird erhalten und aus aktiven Ansichten entfernt',await archivePage.evaluate(()=>!activityById('unsupported')&&db.archivedActivities.some(a=>a.id==='unsupported')&&!!localStorage.getItem('stadtconnect_recovery_v3')));await archive.close();
  if(errors.length)console.error('Laufzeitdiagnose:',JSON.stringify(errors));
  check('Keine JavaScript-Laufzeitfehler in allen Browserfällen',errors.length===0);
  await fs.writeFile(path.join(root,'tests/result.json'),JSON.stringify({date:new Date().toISOString(),passed:results.length,checks:results,errors,expectedResourceErrorsDuringFailureSimulation:consoleErrors,mode:'Echter amtlicher lokaler Quellenbestand; zusätzliche künstliche OSM-Orte nur für Last-/Live-Tests; künstliche Kacheln'},null,2));
  console.log(`Bestanden: ${results.length} Prüfungen`);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
