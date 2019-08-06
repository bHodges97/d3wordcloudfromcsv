# Creates wordcloud from word frequency list
Produced as part of an internship under [Julian Kunkel](https://hps.vi4io.org/about/people/start#julian_kunkel)

### Required files
[python script for generating the data files](https://github.com/bHodges97/pdf-from-site)


#### papers.csv
id, HTML

#### ~~freq_data.csv~~
~~word, count~~

#### related_papers.csv
word, JSON of {paper_id: count, ...}

#### vocab.npy
numpy pickled word,id dict

#### tfs.npz
scipy csr matrix shaped(paper,word)

### Build
For a local new installation of npm:
```
$ cd src
$ npm install
$ ./node_modules/browserify/bin/cmd.js index.js > bundle.js
```
