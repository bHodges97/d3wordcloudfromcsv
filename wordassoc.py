#!/usr/bin/python3
import numpy as np
import csv
from sys import argv
from savenpz import load_npz

X,vocab = load_npz('tfs.npz')
vocab = vocab.tolist()

if len(argv) != 5 or argv[1] not in vocab:
    exit()

word = argv[1].strip()
word_idx = vocab.index(word)
directory = argv[2]
limit = int(argv[3])
abstract = argv[4].lower() == "true"

column = X[:,word_idx].toarray().ravel()
papers = (-column).argsort()[:limit] #sort and trim

htmldict = dict()
with open("papers.csv","r", encoding='utf-8') as f:
    reader = csv.reader(f)
    for paper,html,_ in reader:
        paper = int(paper)
        if paper in papers:
            htmldict[paper] = html

print("<ul>",end="")
for paper in papers:
    count = column[paper]
    html = htmldict[paper]
    if not abstract and ">Abstract<" in html:
        i = html.index("<strong>Abstract")
        html = html[:i]
    print(f"<li>[{count} hits] {html}</li>",end="")
print("</ul>",end="")
