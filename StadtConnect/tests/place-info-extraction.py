import importlib.util, unittest, json
from pathlib import Path
spec=importlib.util.spec_from_file_location('extract',Path('scripts/extract-place-info.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
data=json.loads(Path('data/catalog.json').read_text(encoding='utf8'))
neckarau=next(p for p in data['items'] if p['id']=='ma_library_neckarau')
rheinau=next(p for p in data['items'] if p['id']=='ma_library_rheinau')
html=Path('tests/research/library-neckarau.html').read_text(encoding='utf8')

class Extraction(unittest.TestCase):
 def test_real_library_hours(self):
  result=module.extract(html,neckarau)
  self.assertEqual(len(result['hoursRows']),3)
  self.assertIn('17.30',result['hoursRows'][0])
 def test_wrong_branch_rejected(self):
  with self.assertRaises(ValueError): module.extract(html,rheinau)
 def test_moved_point_requires_review(self):
  with self.assertRaises(ValueError): module.extract(html,{**neckarau,'lat':neckarau['lat']+.01})
 def test_no_event_times_instead_of_opening_hours(self):
  changed=html.replace('<strong>Öffnungszeiten</strong>','<strong>Informationen</strong>')
  self.assertEqual(module.extract(changed,neckarau)['hoursRows'],[])
 def test_ambiguous_heading_rejected(self):
  changed=html.replace('</body>','<h4>Öffnungszeiten</h4><ul><li>Montag | 1 bis 2 Uhr</li></ul></body>')
  self.assertEqual(module.extract(changed,neckarau)['hoursRows'],[])
 def test_verified_equipment_only(self):
  result=module.extract(html,neckarau)
  self.assertIn('2 Internet-Arbeitsplätze',result['amenities'])
  self.assertFalse(any('Gruppenraum' in text for text in result['amenities']))

if __name__=='__main__': unittest.main()
