from sys import stdout,argv
import json
import csv

papers = None
if len(argv) == 3 :
    abstract = argv[2].lower() == 'true'
    papers = list(map(argv[3][1:-1].split(",")))

with open(argv[1],"r", encoding='utf-8') as f:
    reader = csv.reader(f)
    if papers:
        out = [''] * len(papers)
        for paper,html,_ in reader:
            paper = int(paper)
            if paper in papers:
                out[papers.index(paper)] = html
    else:
        out = {"options": list(range(sum(1 for _ in reader)))}
        stdout.buffer.write(json.dumps(out,separators=(',', ':')).encode('utf-8'))
        exit()

if not abstract:
    pattern = "<strong>Abstract"
    out = [x[:x.index(pattern)] if pattern in x else x for x in out]

stdout.buffer.write(json.dumps({"papers":out},separators=(',', ':')).encode('utf-8'))




