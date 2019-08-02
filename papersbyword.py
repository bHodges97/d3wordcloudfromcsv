#!/usr/bin/python3

import numpy as np
import scipy.sparse as sp
from sys import argv

X = sp.load_npz('tfs.npz')
vocab = np.load('vocab.npy', allow_pickle=True).item()
inverse = {v:k for k,v in vocab.items()}
limit = 1000
if len(argv) == 1 or argv[1] == "":#No word specified
    tfs = np.asarray(X.sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        print(f"{inverse[i]}, {tfs[i]}")
elif argv[1] in vocab:
    word = argv[1].replace("\'","")
    idx = vocab[word]
    papers = X[...,idx].nonzero()[0]
    tfs = np.asarray(X[papers,:].sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        print(f"{inverse[i]}, {tfs[i]}")
else:
    print("not found, 1")
