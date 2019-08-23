#!/usr/bin/python3

import numpy as np
import re
from sys import argv
from savenpz import load_npz

X,vocab = load_npz('tfs.npz')
limit = 1000

if len(argv) == 1 or argv[1] == "":#No word specified
    tfs = np.asarray(X.sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        print(f"{vocab[i]}, {tfs[i]}")
else:
    words = []
    word = argv[1].strip().split(" ")
    patterns = [re.compile(w) for w in word]
    words = [[] for w in word]
    for idx,word in enumerate(vocab):
        for i,pattern in enumerate(patterns):
            if pattern.match(word):
                words[i].append(idx)
    papers = []
    for i in range(X.shape[0]):
        if all(any(X[i,x]>0 for x in s) for s in words):
            papers.append(i)
    if papers:
        #papers = np.unique(X[:,words].nonzero()[0])
        tfs = np.asarray(X[papers,:].sum(axis=0)).ravel()
        indices = (-tfs).argsort()[:limit]
        for i in indices:
            print(f"{vocab[i]}, {tfs[i]}")
    else:
        print("Not found,1")
