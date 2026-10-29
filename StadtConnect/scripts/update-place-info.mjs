/* Kontrollierte Aktualisierung bereits bekannter Ortsseiten; keine neue API, keine Schlüssel. */
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8')),sources=[];
for(const place of data.items.filter(p=>p.sourceKind==='mannheim-library')){
 const url=new URL(place.website);if(url.hostname!=='www.mannheim.de'||!url.pathname.startsWith('/de/bildung-staerken/stadtbibliothek/'))throw Error('Keine freigegebene offizielle Ortsseite');
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`Ortsseite HTTP ${response.status}; bisherige Informationen bleiben erhalten`);
 const html=await response.text(),name=url.pathname.split('/').filter(Boolean).at(-1);
 await writeFile(new URL(`../tests/research/library-${name}.html`,import.meta.url),html);
 sources.push({url:url.href,checkedAt:new Date().toISOString(),ok:true});console.log('Offizielle Ortsseite geladen:',name);
}
await writeFile(new URL('../data/place-info-fetch.json',import.meta.url),JSON.stringify({sources},null,2));
execFileSync(process.env.STADTCONNECT_PYTHON||'python',['scripts/extract-place-info.py'],{cwd:root,stdio:'inherit',windowsHide:true});
execFileSync(process.execPath,['scripts/build-place-info.cjs'],{cwd:root,stdio:'inherit',windowsHide:true});
execFileSync(process.execPath,['scripts/build-catalog.cjs'],{cwd:root,stdio:'inherit',windowsHide:true});
