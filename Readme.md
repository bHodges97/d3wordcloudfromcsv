# Creates wordcloud from word frequency list

### CSV headers
#### papers.csv
id, HTML
#### freq_data.csv
term, count, {paper_id: count, ...}

### Build
In src/ folder:
```
$ npm install
$ browserify index.js -o bundle.js
```
