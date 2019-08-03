#!/usr/bin/python3
import numpy as np
import scipy.sparse as sp
import csv
from sys import argv

X = sp.load_npz('tfs.npz')
vocab = np.load('vocab.npy', allow_pickle=True).item()
limit = 20

if len(argv) == 1 or argv[1] not in vocab:
    exit()

word = vocab[argv[1]]
column = X[:,word].nonzero()[0]
papers = (-column).argsort()[:limit]

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
    print(f"<li>[{count} hits] {html}</li>",end="")
print("</ul>",end="")
