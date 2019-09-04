#!/usr/bin/python3
import numpy as np
import csv
import json
from sys import argv,stdout
from savenpz import load_npz


word = argv[1]
path = argv[2]
limit = int(argv[3])
abstract = argv[4].lower() == "true"

X,vocab = load_npz(path+'tfs.npz')
vocab = vocab.tolist()

if word not in vocab:
    print("{Error: 'not found'}")
    exit()
idx = vocab.index(word)
column = X[:,idx].toarray().ravel()
limit = min(limit,np.count_nonzero(column))
papers = (-column).argsort()[:limit] #sort and trim

out = {"papers": papers.tolist(), "counts": column[papers].tolist()}

stdout.buffer.write(json.dumps(out,separators=(',', ':')).encode('utf-8'))
