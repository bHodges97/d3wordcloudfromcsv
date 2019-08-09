#!/usr/bin/python3

import numpy as np
import scipy.sparse as sp
import re
from sys import argv

X = sp.load_npz('tfs.npz')
vocab = np.load('vocab.npz', allow_pickle=True)['arr_0'].item()
inverse = {v:k for k,v in vocab.items()}
limit = 1000
if len(argv) == 1 or argv[1] == "":#No word specified
    tfs = np.asarray(X.sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        print(f"{inverse[i]}, {tfs[i]}")
else:
    words = []
    word = argv[1].strip()
    pattern = re.compile(word)
    for k,v in vocab.items():
        if pattern.match(k):
            words.append(v)
    if words:
        papers = np.unique(X[:,words].nonzero()[0])
        tfs = np.asarray(X[papers,:].sum(axis=0)).ravel()
        indices = (-tfs).argsort()[:limit]
        for i in indices:
            print(f"{inverse[i]}, {tfs[i]}")
    else:
        print("Not found,1")
