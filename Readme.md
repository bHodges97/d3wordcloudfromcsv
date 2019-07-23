# Creates wordcloud from word frequency list

### CSV headers
[python script for generating the csv files](https://github.com/bHodges97/pdf-from-site)
#### papers.csv
id, HTML
#### freq_data.csv
word, count
### related_papers.csv
word, JSON of {paper_id: count, ...}

### Build
For a local new installation of npm:
```
$ cd src
$ npm install
$ ./node_modules/browserify/bin/cmd.js index.js > bundle.js
```
