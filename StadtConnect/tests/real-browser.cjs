/* Visuelle Prüfung mit echten amtlichen Orten, amtlichen Grenzen und echten CARTO-Kacheln.
   Lokale Dateirouten umgehen nur die isolierte Loopback-Umgebung, keine Dienste-Zugriffsprüfung. */
const {chromium}=require(process.env.STADTCONNECT_PLAYWRIGHT||'playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),origin='http://stadtconnect.test',data=require('../data/catalog.json');
(async()=>{const browser=await chromium.launch({executablePath:process.env.STADTCONNECT_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const errors=[],tiles=new Map(),failedTiles=[];
 try{const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());
   if(url.hostname==='stadtconnect.test'){const file=path.resolve(root,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)));if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});try{return route.fulfill({body:await fs.readFile(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'text/plain'})}catch{return route.fulfill({status:404,body:''})}}
   if(url.hostname==='basemaps.cartocdn.com'){try{if(!tiles.has(url.href))tiles.set(url.href,(async()=>{const r=await fetch(url.href,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return Buffer.from(await r.arrayBuffer())})());return route.fulfill({body:await tiles.get(url.href),contentType:'image/png'})}catch(e){failedTiles.push({tile:url.pathname,error:e.name});return route.fulfill({status:503,body:''})}}
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.locator('.place-row').first().waitFor();await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.place-row').count(),data.items.length);assert.equal(await page.evaluate(()=>markerIndex.size),data.items.length);
  assert(await page.evaluate(()=>LOCAL_DATA.boundaries.features.every(f=>f.geometry.coordinates.flat(2).every(p=>leafletMap.getBounds().contains([p[1],p[0]])))),'Desktop: Grenzen vollständig sichtbar');
  await page.screenshot({path:path.join(root,'tests/screenshots/karte-reale-daten-desktop.png'),fullPage:true});
  await page.locator('[data-filter=place-district]').selectOption('Rheinau');assert.equal(await page.locator('.place-row').count(),data.items.filter(p=>p.district==='Rheinau').length);
  await page.locator('[data-action=toggle-category][data-category="Basketballplätze"]').click();assert.equal(await page.locator('.place-row').count(),data.items.filter(p=>p.district==='Rheinau'&&p.categories.includes('Basketballplätze')).length);
  await page.locator('.place-row').first().locator('[data-action=focus-place]').click();await page.locator('.leaflet-popup').waitFor();
  await page.locator('[data-action=reset-place-filters]').first().click();await page.setViewportSize({width:375,height:850});await page.waitForTimeout(400);await page.waitForLoadState('networkidle');
  await page.waitForFunction(()=>{const layers=[];leafletMap.eachLayer(l=>{if(l instanceof L.TileLayer)layers.push(l)});return layers.length&&layers.every(l=>!l.isLoading())&&[...document.querySelectorAll('.leaflet-tile')].some(img=>img.complete&&img.naturalWidth>0)});
  assert(await page.evaluate(()=>LOCAL_DATA.boundaries.features.every(f=>f.geometry.coordinates.flat(2).every(p=>leafletMap.getBounds().contains([p[1],p[0]])))),'Mobil: Grenzen vollständig sichtbar');
  await page.evaluate(()=>{document.getElementById('discoverFilters').open=false;window.scrollTo(0,0)});
  await page.screenshot({path:path.join(root,'tests/screenshots/karte-reale-daten-mobil.png'),fullPage:true});
  assert.equal(errors.length,0);assert.equal(failedTiles.length,0);
  const report={date:new Date().toISOString(),realPlaces:data.items.length,loadedRealTiles:tiles.size,failedTiles,errors,browserSource:'Amtliche lokale Orts-/Grenzgeometrien; unveränderte CARTO-Kacheln über begrenzte Node-Abrufe; lokale Testadresse über Dateirouten'};
  await fs.writeFile(path.join(root,'tests/real-browser-result.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
