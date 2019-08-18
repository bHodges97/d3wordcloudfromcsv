#!/usr/bin/python3

import numpy as np
from sys import argv
from savenpz import load_npz

X,vocab = load_npz('tfs.npz')
limit = 1000
if len(argv) == 1 or argv[1] == "":#No word specified
    tfs = np.asarray(X.sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        print(f"{vocab[i]}, {tfs[i]}")
elif argv[1] in vocab:
    idx = vocab[argv[1]]
    papers = X[...,idx].nonzero()[0]
    tfs = np.asarray(X[papers,:].sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        print(f"{vocab[i]}, {tfs[i]}")
else:
    print("not found, 1")
