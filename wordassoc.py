#!/usr/bin/python3
import numpy as np
import csv
from sys import argv,stdout
from savenpz import load_npz


word = argv[1]
path = argv[2]
limit = int(argv[3])
abstract = argv[4].lower() == "true"

X,vocab = load_npz(path+'tfs.npz')
vocab = vocab.tolist()

if word not in vocab:
    print("<p>not found</p>")
    exit()
idx = vocab.index(word)
column = X[:,idx].toarray().ravel()
papers = (-column).argsort()[:limit] #sort and trim

htmldict = dict()
with open(path+"papers.csv","r", encoding='utf-8') as f:
    reader = csv.reader(f)
    for paper,html,_ in reader:
        paper = int(paper)
        if paper in papers:
            htmldict[paper] = html

out = ""
for paper in papers:
    if not X[paper,idx]:
        break
    count = column[paper]
    html = htmldict[paper]
    if not abstract and ">Abstract<" in html:
        i = html.index("<strong>Abstract")
        html = html[:i]
    out  += f"<li>[{count} hits] {html}</li>"
out += "</ul>"
stdout.buffer.write(out.encode("utf-8"))
