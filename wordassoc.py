#!/usr/bin/python3
import numpy as np
import scipy.sparse as sp
import csv
from sys import argv

X = sp.load_npz('tfs.npz')
vocab = np.load('vocab.npy', allow_pickle=True).item()
limit = 20

if len(argv) != 5 or argv[1] not in vocab:
    exit()

word = vocab[argv[1]]
directory = argv[2]
limit = int(argv[3])
abstract = argv[4].lower() == "true"


column = X[:,word].toarray().ravel()
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
