const fs=require('node:fs'),info=require('../place-info.js');
const extracted=JSON.parse(fs.readFileSync('data/place-info-extracted.json','utf8'));
const fetched=fs.existsSync('data/place-info-fetch.json')?JSON.parse(fs.readFileSync('data/place-info-fetch.json','utf8')):{sources:[]};
const output={version:1,items:{},problems:[...extracted.problems]};
for(const item of extracted.items){
 const record=fetched.sources.find(s=>s.url===item.sourceUrl&&s.ok),checkedAt=record?.checkedAt;
 const source={kind:'official',label:item.sourceLabel,url:item.sourceUrl,checkedAt};
 const candidate=info.parseOfficial(item.hoursRows,source);
 if(!candidate)output.problems.push({placeId:item.placeId,problem:'Öffnungszeiten fehlen oder lassen sich nicht eindeutig auswerten.'});
 output.items[item.placeId]={openingHours:info.resolveHours(candidate?[candidate]:[]),amenities:item.amenities,access:{status:'unknown',detail:''},source,identityChecked:item.identityChecked};
}
fs.writeFileSync('data/place-info.json',JSON.stringify(output,null,2));
console.log('Orte mit automatisch bestätigten Öffnungszeiten:',Object.values(output.items).filter(p=>p.openingHours.status==='confirmed').length);
