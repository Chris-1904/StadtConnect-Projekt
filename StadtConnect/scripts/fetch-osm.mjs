// Ein gezielter Sammelabruf, keine Endpunktrundläufe. Ergebnis noch ungefilterte Quelle.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import places from '../place-data.js';
const districts=JSON.parse(await readFile(new URL('../data/districts.geojson',import.meta.url),'utf8'));
const query=places.bboxQuery(districts);
const endpoint=process.argv[2]||'https://overpass.private.coffee/api/interpreter';
const response=await fetch(endpoint,{method:'POST',body:'data='+encodeURIComponent(query),signal:AbortSignal.timeout(55000),headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json','User-Agent':'StadtConnectMannheim/1.0 (local prototype; single-area geographic verification)'}});
const text=await response.text();
console.log(response.status,response.headers.get('content-type'),text.length);
await mkdir(new URL('../tests/research/',import.meta.url),{recursive:true});
await writeFile(new URL('../tests/research/osm-response.txt',import.meta.url),text);
if(!response.ok)throw Error(`Ortsabruf HTTP ${response.status}`);
const data=JSON.parse(text);if(!Array.isArray(data.elements)||data.remark)throw Error('Unvollständige OSM-Antwort');
await writeFile(new URL('../tests/research/osm-source.json',import.meta.url),JSON.stringify(data));
await writeFile(new URL('../data/osm-request.txt',import.meta.url),query);
console.log(data.elements.length,data.osm3s);
