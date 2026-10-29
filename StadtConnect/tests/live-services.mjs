// Optionaler Live-Test. Protokolliert ausschließlich Dienststatus, keine Anbieter-Schlüssel.
import {readFile,writeFile} from 'node:fs/promises';
import places from '../place-data.js';
const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
const query=places.bboxQuery(JSON.parse(await readFile(new URL('../data/districts.geojson',import.meta.url),'utf8')));
const endpoints=['https://overpass.private.coffee/api/interpreter'];
const report={date:new Date().toISOString(),overpass:[],tiles:null};
for(const endpoint of endpoints){
  try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','User-Agent':'StadtConnectMannheim/1.0 (manual service verification)'},body:'data='+encodeURIComponent(query),signal:AbortSignal.timeout(15000)});
    let data;try{data=await response.json()}catch{}
    const item={host:new URL(endpoint).hostname,status:response.status,type:response.headers.get('content-type'),elements:data?.elements?.length||0};report.overpass.push(item);console.log(item);
    if(response.ok&&data?.elements?.length){await writeFile(new URL('live-osm.json',import.meta.url),JSON.stringify(data));break}
  }catch(e){const item={host:new URL(endpoint).hostname,error:e.name};report.overpass.push(item);console.log(item)}
}
try{
  const template=source.match(/L\.tileLayer\('([^']+)'/)[1];
  const z=13,lat=49.458,lon=8.467,x=Math.floor((lon+180)/360*2**z),y=Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*2**z);
  const response=await fetch(template.replace('{z}',z).replace('{x}',x).replace('{y}',y),{signal:AbortSignal.timeout(15000)});
  report.tiles={host:new URL(template).hostname,status:response.status,type:response.headers.get('content-type'),bytes:(await response.arrayBuffer()).byteLength};console.log(report.tiles);
}catch(e){report.tiles={error:e.name};console.log(report.tiles)}
await writeFile(new URL('live-result.json',import.meta.url),JSON.stringify(report,null,2));
