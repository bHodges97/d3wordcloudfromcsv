#!/usr/bin/python3

import numpy as np
import scipy.sparse as sp
import csv
from sys import argv

X = sp.load_npz('tfs.npz')
vocab = np.load('vocab.npy', allow_pickle=True).item()
inverse = {v:k for k,v in vocab.items()}
limit = 20

if len(argv) == 1 or argv[1] not in vocab:
    exit()

word = vocab[argv[1]]
s  = X[:,word].toarray().ravel().argsort(axis=0)[:limit]
papers = X[s,word].nonzero()[0]

with open("papers.csv","r",encoding='utf-8') as f:
    reader = csv.reader(f)
    print("<ul>",end="")
    for paper,html,_ in reader:
        paper = int(paper)
        if paper in papers:
            print(f"<li>[{X[paper,word]} hits] {html}</li>",end="")
    print("<ul>",end="")
