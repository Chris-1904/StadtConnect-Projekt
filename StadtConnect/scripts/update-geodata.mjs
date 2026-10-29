/* Optionaler Wartungsablauf; zum App-Start nicht erforderlich. Keine API-Rundläufe. */
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
await mkdir(new URL('../tests/research/',import.meta.url),{recursive:true});
for(const [name,map] of Object.entries({districts:'bez_grenze',subdistricts:'stadtteil_grenze',sport:'sportflaechen_public',playground:'spielplatz_poly'})){
 const url=`https://www.gis-mannheim.de/mannheim/mod_ogc/wfs_getmap.php?mapfile=${map}&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=${map}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);
 const xml=await response.text();if(!xml.includes('<gml:featureMember>')||!xml.includes('EPSG:25832'))throw Error(`${name}: Unerwartete Geometrieantwort`);
 await writeFile(new URL(`../tests/research/${name}-wgs84.gml`,import.meta.url),xml);console.log('Amtliche Quelle geladen:',name);
}
const infoSources=[];
for(const district of ['neckarau','rheinau']){
 const url=`https://www.mannheim.de/de/bildung-staerken/stadtbibliothek/adressen-und-oeffnungszeiten/zweigstellen-in-den-stadtteilen/${district}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`Bibliothek ${district}: HTTP ${response.status}`);const html=await response.text();
 if(!/[?&]q=(49\.\d+),(8\.\d+)/.test(html))throw Error('Offizieller Bibliotheksstandort fehlt');
 await writeFile(new URL(`../tests/research/library-${district}.html`,import.meta.url),html);console.log('Bibliotheksquelle geladen:',district);
 infoSources.push({url,checkedAt:new Date().toISOString(),ok:true});
}
await writeFile(new URL('../data/place-info-fetch.json',import.meta.url),JSON.stringify({sources:infoSources},null,2));
// Dateinamen -wgs84 sind historische Abrufbezeichnungen. Das tatsächliche CRS wird geprüft und umgerechnet.
execFileSync(process.env.STADTCONNECT_PYTHON||'python',['scripts/gml-to-json.py'],{cwd:root,stdio:'inherit',windowsHide:true});
execFileSync(process.execPath,['scripts/build-boundaries.cjs'],{cwd:root,stdio:'inherit',windowsHide:true});
execFileSync(process.env.STADTCONNECT_PYTHON||'python',['scripts/extract-place-info.py'],{cwd:root,stdio:'inherit',windowsHide:true});
execFileSync(process.execPath,['scripts/build-place-info.cjs'],{cwd:root,stdio:'inherit',windowsHide:true});
console.log('Öffnungszeiten und belegte Ausstattung automatisch aus Ortsseiten übernommen; Quellenkonflikte und data/corrections.json vor Veröffentlichung prüfen.');
execFileSync(process.execPath,['scripts/build-catalog.cjs'],{cwd:root,stdio:'inherit',windowsHide:true});
