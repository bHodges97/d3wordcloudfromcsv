from sys import stdout,argv
from classifier import Classifier
import numpy as np
import json

if len(argv) != 3:
    exit()

a = Classifier()
a.load(argv[1])
papers = argv[2][1:-1].split(",")
papers = None if len(papers) == 1 else list(map(int,papers))
classes,count = a.classify(papers)
classed = {c:np.where(classes==c)[0].tolist() for c in range(count)}
print(json.dumps(classed,separators=(',', ':')))




