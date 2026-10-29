"""Wartung: amtliches GML 2 verlustfrei auslesen, keine Bezirke zeichnen."""
import json
import xml.etree.ElementTree as ET
from pathlib import Path

NS={'g':'http://www.opengis.net/gml','m':'http://mapserver.gis.umn.edu/mapserver'}
for name in ['districts','subdistricts','sport','playground']:
    root=ET.parse(Path('tests/research')/(name+'-wgs84.gml')).getroot()
    features=[]
    for member in root.findall('g:featureMember',NS):
        obj=list(member)[0]
        geom=obj.find('m:msGeometry',NS)
        if geom is None: continue
        polygons=[]
        for poly in geom.findall('.//g:Polygon',NS):
            if poly.attrib.get('srsName','EPSG:25832')!='EPSG:25832': raise ValueError('Unerwartetes CRS')
            rings=[]
            for ring in poly.findall('g:outerBoundaryIs/g:LinearRing/g:coordinates',NS)+poly.findall('g:innerBoundaryIs/g:LinearRing/g:coordinates',NS):
                rings.append([[float(v) for v in coord.split(',')[:2]] for coord in ring.text.split()])
            polygons.append(rings)
        if not polygons: continue
        props={x.tag.split('}')[-1]:x.text or '' for x in obj if x.tag.startswith('{'+NS['m']+'}') and len(x)==0}
        features.append({'type':'Feature','id':obj.attrib.get('fid'),'properties':props,'geometry':{'type':'MultiPolygon','coordinates':polygons}})
    Path('tests/research',name+'-utm.json').write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False),encoding='utf8')
    print(name,len(features))
