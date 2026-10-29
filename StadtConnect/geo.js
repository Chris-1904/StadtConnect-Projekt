/* Gemeinsame, abhängigkeitfreie Geometrieprüfung für Browser, Import und Tests.
   GeoJSON verwendet immer [Längengrad, Breitengrad]. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StadtGeo=api})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const finitePoint=p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1]);
  function ringPosition(p,ring){
    if(!finitePoint(p)||!Array.isArray(ring)||ring.length<4||!ring.every(finitePoint))return -1;
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[j],b=ring[i],dx=b[0]-a[0],dy=b[1]-a[1],cross=(p[0]-a[0])*dy-(p[1]-a[1])*dx;
      // Numerische Toleranz, kein räumlicher Puffer und keine Radiusprüfung.
      if(Math.abs(cross)<=1e-12&&p[0]>=Math.min(a[0],b[0])-1e-12&&p[0]<=Math.max(a[0],b[0])+1e-12&&p[1]>=Math.min(a[1],b[1])-1e-12&&p[1]<=Math.max(a[1],b[1])+1e-12)return 0;
      if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside?1:-1;
  }
  function inPolygon(p,rings){return Array.isArray(rings)&&rings.length>0&&ringPosition(p,rings[0])>=0&&!rings.slice(1).some(r=>ringPosition(p,r)>=0)}
  function contains(geometry,p){
    if(!geometry||!finitePoint(p))return false;
    if(geometry.type==='Polygon')return inPolygon(p,geometry.coordinates);
    if(geometry.type==='MultiPolygon')return geometry.coordinates.some(poly=>inPolygon(p,poly));
    return false;
  }
  function bounds(geometry){
    const result=[Infinity,Infinity,-Infinity,-Infinity];
    function visit(c){if(finitePoint(c)){result[0]=Math.min(result[0],c[0]);result[1]=Math.min(result[1],c[1]);result[2]=Math.max(result[2],c[0]);result[3]=Math.max(result[3],c[1])}else if(Array.isArray(c))c.forEach(visit)}
    visit(geometry?.coordinates);return result.every(Number.isFinite)?result:null;
  }
  function ringArea(ring){let sum=0;for(let i=0,j=ring.length-1;i<ring.length;j=i++)sum+=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1];return sum/2}
  function interiorPoint(geometry){
    const polys=geometry?.type==='MultiPolygon'?geometry.coordinates:geometry?.type==='Polygon'?[geometry.coordinates]:[];
    const poly=[...polys].sort((a,b)=>Math.abs(ringArea(b[0]))-Math.abs(ringArea(a[0])))[0];if(!poly)return null;
    const ring=poly[0];let x=0,y=0,weight=0;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){const w=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1];weight+=w;x+=(ring[j][0]+ring[i][0])*w;y+=(ring[j][1]+ring[i][1])*w}
    const centroid=[x/(3*weight),y/(3*weight)];if(finitePoint(centroid)&&inPolygon(centroid,poly))return centroid;
    // Bei konkaven Flächen/Innenringen: Mittelpunkt eines belegten Scanline-Segments.
    const levels=[...new Set(poly.flat().map(p=>p[1]))].sort((a,b)=>a-b);let best=null,width=0;
    for(let i=1;i<levels.length;i++){
      const lat=(levels[i-1]+levels[i])/2,crossings=[];
      for(const r of poly)for(let k=0,j=r.length-1;k<r.length;j=k++){const a=r[j],b=r[k];if((a[1]>lat)!==(b[1]>lat))crossings.push(a[0]+(lat-a[1])*(b[0]-a[0])/(b[1]-a[1]))}
      crossings.sort((a,b)=>a-b);
      for(let k=1;k<crossings.length;k++){const p=[(crossings[k-1]+crossings[k])/2,lat],w=crossings[k]-crossings[k-1];if(w>width&&inPolygon(p,poly)){best=p;width=w}}
    }
    return best;
  }
  function lineMidpoint(points){
    if(!Array.isArray(points)||points.length<2||!points.every(finitePoint))return null;
    const lengths=points.slice(1).map((p,i)=>Math.hypot((p[0]-points[i][0])*Math.cos(p[1]*Math.PI/180),p[1]-points[i][1]));
    let left=lengths.reduce((a,b)=>a+b,0)/2;
    for(let i=0;i<lengths.length;i++){if(left<=lengths[i]){const ratio=lengths[i]?left/lengths[i]:0;return points[i].map((v,j)=>v+(points[i+1][j]-v)*ratio)}left-=lengths[i]}return points.at(-1);
  }
  function joinRings(parts){
    const remaining=parts.map(p=>p.slice()),rings=[];
    const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
    while(remaining.length){let line=remaining.shift();let changed=true;while(changed&&!same(line[0],line.at(-1))){changed=false;for(let i=0;i<remaining.length;i++){const p=remaining[i];if(same(line.at(-1),p[0]))line.push(...p.slice(1));else if(same(line.at(-1),p.at(-1)))line.push(...p.slice().reverse().slice(1));else if(same(line[0],p.at(-1)))line.unshift(...p.slice(0,-1));else if(same(line[0],p[0]))line.unshift(...p.slice().reverse().slice(0,-1));else continue;remaining.splice(i,1);changed=true;break}}
      if(line.length<4||!same(line[0],line.at(-1)))return null;rings.push(line);
    }return rings;
  }
  function osmGeometry(element){
    if(element.type==='node'&&Number.isFinite(element.lon)&&Number.isFinite(element.lat))return {type:'Point',coordinates:[element.lon,element.lat]};
    const coords=g=>Array.isArray(g)&&g.every(p=>p&&Number.isFinite(p.lon)&&Number.isFinite(p.lat))?g.map(p=>[p.lon,p.lat]):[];
    if(element.type==='way'){const p=coords(element.geometry);if(p.length<2)return null;return p.length>=4&&p[0][0]===p.at(-1)[0]&&p[0][1]===p.at(-1)[1]?{type:'Polygon',coordinates:[p]}:{type:'LineString',coordinates:p}}
    if(element.type==='relation'&&element.tags?.type==='multipolygon'){
      const members=(element.members||[]).filter(m=>m.type==='way');
      const outer=joinRings(members.filter(m=>!m.role||m.role==='outer').map(m=>coords(m.geometry))),inner=joinRings(members.filter(m=>m.role==='inner').map(m=>coords(m.geometry)));
      if(!outer?.length||inner===null)return null;
      const polygons=outer.map(r=>[r]);
      for(const hole of inner){const poly=polygons.find(p=>ringPosition(hole[0],p[0])>=0);if(!poly)return null;poly.push(hole)}return {type:'MultiPolygon',coordinates:polygons};
    }return null;
  }
  function markerPoint(geometry){return geometry?.type==='Point'&&finitePoint(geometry.coordinates)?geometry.coordinates:geometry?.type==='LineString'?lineMidpoint(geometry.coordinates):interiorPoint(geometry)}
  function districtFor(collection,p){const matches=(collection?.features||[]).filter(f=>contains(f.geometry,p));return matches.length===1?matches[0]:null}
  return {finitePoint,ringPosition,contains,bounds,interiorPoint,lineMidpoint,osmGeometry,markerPoint,districtFor};
});
