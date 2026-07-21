import os
from html.parser import HTMLParser

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.dup_ids = set()
        self.html_count = 0

    def handle_starttag(self, tag, attrs):
        if tag == 'html':
            self.html_count += 1
        for k,v in attrs:
            if k == 'id':
                if v in self.ids:
                    self.dup_ids.add(v)
                else:
                    self.ids.add(v)


def check_file(path):
    p = MyParser()
    with open(path, 'r', encoding='utf-8') as f:
        data = f.read()
    p.feed(data)
    problems = []
    if p.html_count != 1:
        problems.append(f'HTML count: {p.html_count}')
    if p.dup_ids:
        problems.append('Duplicate ids: ' + ','.join(p.dup_ids))
    return problems

root = 'fleet-v2'
html_files = [os.path.join(root,f) for f in os.listdir(root) if f.endswith('.html')]
all_ok = True
for hf in sorted(html_files):
    probs = check_file(hf)
    if probs:
        print(hf + ' -> ' + '; '.join(probs))
        all_ok = False
if all_ok:
    print('Checks passed for %d html files' % len(html_files))
