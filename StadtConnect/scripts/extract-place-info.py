"""Strukturierter Import offizieller Ortsseiten, ohne externe Python-Pakete.
Nur ausdrücklich unter „Öffnungszeiten“ veröffentlichte Listen werden ausgelesen.
"""
import json, re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

class Node:
    def __init__(self,tag='',attrs=None,parent=None):
        self.tag,self.attrs,self.parent,self.children=tag,dict(attrs or []),parent,[]
    def text(self):
        if self.tag in ['script','style']: return ''
        return re.sub(r'\s+',' ',' '.join(c.text() if isinstance(c,Node) else c for c in self.children)).strip()
    def walk(self):
        yield self
        for c in self.children:
            if isinstance(c,Node): yield from c.walk()

class Tree(HTMLParser):
    def __init__(self,html):
        super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root;self.feed(html)
    def handle_starttag(self,tag,attrs):
        node=Node(tag,attrs,self.current);self.current.children.append(node)
        if tag=='br': node.children.append(' ')
        if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']: self.current=node
    def handle_endtag(self,tag):
        node=self.current
        while node.parent:
            if node.tag==tag: self.current=node.parent;return
            node=node.parent
    def handle_data(self,data): self.current.children.append(data)

def extract(html,place):
    tree=Tree(html);nodes=list(tree.root.walk());url=place.get('website','');district=urlparse(url).path.rstrip('/').split('/')[-1]
    expected=place['name'].split('·')[-1].strip()
    if urlparse(url).hostname!='www.mannheim.de' or not any(n.tag=='h1' and n.text()==expected for n in nodes): raise ValueError('Einrichtungstitel oder offizielle Domain stimmt nicht überein')
    point=re.search(r'[?&]q=(49\.\d+),(8\.\d+)',html)
    if not point or abs(float(point[1])-place['lat'])>0.000001 or abs(float(point[2])-place['lon'])>0.000001: raise ValueError('Offizieller Standort stimmt nicht eindeutig mit dem Ort überein')
    headings=[n for n in nodes if n.tag in ['h2','h3','h4','h5'] and n.text()=='Öffnungszeiten']
    rows=[]
    if len(headings)==1:
        heading=headings[0];siblings=heading.parent.children;index=siblings.index(heading)
        for node in siblings[index+1:]:
            if isinstance(node,str):
                if node.strip(): break
                continue
            if node.tag=='ul':
                rows=[n.text() for n in node.children if isinstance(n,Node) and n.tag=='li'];break
            if node.tag!='p' or node.text(): break
    # Nur eindeutig bezeichnete, studienrelevante Merkmale aus dem eigentlichen Seiteninhalt.
    body=next((n for n in nodes if 'node__body' in n.attrs.get('class','').split()),None)
    text=body.text() if body else ''
    amenities=[]
    count=re.search(r'\b(\d+)\s+Internet-Arbeitsplätze',text)
    if count: amenities.append(count[1]+' Internet-Arbeitsplätze')
    if re.search(r'Tische und Stühle fürs Lesen und Lernen',text): amenities.append('Lese- und Lernplätze')
    if re.search(r'offenes W[-‑]?LAN',text,re.I): amenities.append('WLAN')
    if re.search(r'Zugang zur Zweigstelle ist ebenerdig',text): amenities.append('Ebenerdiger Eingang')
    if re.search(r'über einen Fahrstuhl erreichbar',text): amenities.append('Aufzug')
    return {'placeId':place['id'],'sourceUrl':url,'sourceLabel':'Offizielle Bibliotheksseite','hoursRows':rows,'amenities':amenities,'identityChecked':True,'point':[place['lon'],place['lat']]}

def main():
    catalog=json.loads(Path('data/catalog.json').read_text(encoding='utf8'))
    result=[];problems=[]
    for place in catalog['items']:
        if place.get('sourceKind')!='mannheim-library': continue
        district=urlparse(place['website']).path.rstrip('/').split('/')[-1]
        try: result.append(extract(Path('tests/research',f'library-{district}.html').read_text(encoding='utf8'),place))
        except (ValueError,OSError) as e: problems.append({'placeId':place['id'],'problem':str(e)})
    Path('data/place-info-extracted.json').write_text(json.dumps({'items':result,'problems':problems},ensure_ascii=False,indent=2),encoding='utf8')
    print(f'Offizielle Ortsseiten: {len(result)} eindeutig zugeordnet, {len(problems)} ungeklärt.')

if __name__=='__main__': main()
