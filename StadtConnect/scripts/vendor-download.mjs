// Wartungshilfe: dieselben Bibliotheksversionen wie im ursprünglichen Prototyp.
// Nicht zum Starten der App erforderlich.
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../assets/vendor/',import.meta.url);
const files={
  'leaflet/leaflet.js':'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'leaflet/leaflet.css':'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'leaflet/images/layers.png':'https://unpkg.com/leaflet@1.9.4/dist/images/layers.png',
  'leaflet/images/layers-2x.png':'https://unpkg.com/leaflet@1.9.4/dist/images/layers-2x.png',
  'leaflet/images/marker-icon.png':'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'leaflet/images/marker-icon-2x.png':'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'leaflet/images/marker-shadow.png':'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  'leaflet/LICENSE':'https://unpkg.com/leaflet@1.9.4/LICENSE',
  'markercluster/leaflet.markercluster.js':'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  'markercluster/MarkerCluster.css':'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'markercluster/MarkerCluster.Default.css':'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'markercluster/LICENSE':'https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/MIT-LICENCE.txt'
};
for(const [name,url] of Object.entries(files)){
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);
  const target=new URL(name,root);
  await mkdir(fileURLToPath(new URL('.',target)),{recursive:true});
  await writeFile(target,Buffer.from(await response.arrayBuffer()));
  console.log(name);
}
