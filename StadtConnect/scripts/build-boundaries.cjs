// Einmaliger reproduzierbarer Import: amtliches EPSG:25832 -> GeoJSON WGS84.
const fs=require('node:fs'),proj4=require('./vendor/proj4.cjs');
const geo=require('../geo.js');
const names=['Lindenhof','Neckarau','Rheinau'];
const projection='+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs';
fs.mkdirSync('data',{recursive:true});
function convert(c){return typeof c[0]==='number'?proj4(projection,'EPSG:4326',c):c.map(convert)}
for(const name of ['districts','subdistricts','sport','playground']){
  const raw=JSON.parse(fs.readFileSync(`tests/research/${name}-utm.json`,'utf8'));
  let features=raw.features.filter(f=>name==='districts'?names.includes(f.properties.name):name==='subdistricts'?/^(050|16[123]|17[1234])$/.test(f.properties.id):true).map(f=>({...f,geometry:{...f.geometry,coordinates:convert(f.geometry.coordinates)}}));
  if(name==='districts'&&features.length!==3||name==='subdistricts'&&features.length!==8)throw Error('Amtliche Gebietsauswahl unvollständig; kein neuer Ortsbestand wird gebaut');
  if(['sport','playground'].includes(name)){const districts=JSON.parse(fs.readFileSync('data/districts.geojson'));features=features.filter(f=>geo.districtFor(districts,geo.interiorPoint(f.geometry)))}
  const data={type:'FeatureCollection',source:'Stadt Mannheim',retrievedAt:new Date().toISOString(),license:'dl-de/by-2-0',attribution:'© Stadt Mannheim (2026) / dl-de/by-2-0, www.mannheim.de, Daten bearbeitet (CRS-Umrechnung und Gebietsauswahl)',sourceCRS:'EPSG:25832',features};
  fs.writeFileSync(`data/${name}.geojson`,JSON.stringify(data));
  console.log(name,features.length,features.slice(0,3).map(f=>[f.properties.name,f.geometry.coordinates[0][0][0]]));
}
