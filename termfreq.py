import numpy as np
import re
from sys import argv,stdout
from savenpz import load_npz

word = argv[1].strip()
path = argv[2]
papers = argv[3]

X,vocab = load_npz(path)
limit = 1000
out = ""
if papers:
    papers = [int(x) for x in argv[3].split(",")]
    X = X[papers,:]


if word == "":#No word specified
    tfs = np.asarray(X.sum(axis=0)).ravel()
    indices = (-tfs).argsort()[:limit]
    for i in indices:
        out += f"{vocab[i]}, {tfs[i]}\n"
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
            out += f"{vocab[i]}, {tfs[i]}\n"
    else:
        out = "Not found,1"

stdout.buffer.write(out.encode("utf-8"))
