import numpy as np
import re
import json
from sys import argv,stdout
from savenpz import load_npz

word = argv[1].strip()
path = argv[2]

X,vocab = load_npz(path)
limit = 250
papers = []
counts = []

if len(argv) == 4:
    paperlist = [int(x) for x in argv[3].split(",")]
else:
    paperlist = list(range(X.shape[0]))

if word == "":#No word specified
    X = X[paperlist,:]
    tfs = np.asarray(X.sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    out = {vocab[i]:int(tfs[i]) for i in indices}
    papers = paperlist
else:
    words = []
    word = argv[1].strip().split(" ")
    patterns = [re.compile(w) for w in word]
    words = [[] for w in word]
    for idx,word in enumerate(vocab):
        for i,pattern in enumerate(patterns):
            if pattern.match(word):
                words[i].append(idx)
    for i in paperlist:
        if all(any(X[i,x]>0 for x in s) for s in words):
            papers.append(i)
            counts.append(sum(np.sum(X[i,s]).item() for s in words))
    if papers:
        tfs = np.asarray(X[papers,:].sum(axis=0)).ravel()
        indices = (-tfs).argsort()[:limit]
        out = {vocab[i]:int(tfs[i]) for i in indices}
    else:
        out = {"not found":1}

if counts:
    counts,papers = zip(*sorted(zip(counts,papers),reverse=True))
    out = {"data":out,"papers": papers, "counts": counts}
else:
    out = {"data":out,"papers": papers}


stdout.buffer.write(json.dumps(out ,separators=(',', ':')).encode("utf-8"))

