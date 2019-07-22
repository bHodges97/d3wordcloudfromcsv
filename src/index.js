var d3 = require("d3");
var cloud = require("d3-cloud");

var papers = {}

fetch('papers.csv')
	.then(response => response.text())
	.then(load_papers)
	.then(response => response.text())
	.then(load_data)

function load_papers(data){
	arr = data.split("\n");
	for (var i = 0; i < arr.length-1; i++) {
		var splitted = arr[i].split(",")
		var html = splitted.slice(1).join(",");
		html = html.substring(1,html.length-2);
		//html = html.replace(/""/g,'\"'); not needed?
		papers[splitted[0]] = html
	}
	return fetch('freq_data.csv')
}

function load_data(data){
	arr = data.split("\n");
	words = [];
	for (var i = 0; i < arr.length-1; i++) {
		var splitted = arr[i].split(",");
		var word = splitted[0].substring(1,splitted[0].length-1);//remove quotes
		var count = parseInt(splitted[1]);
		var related = splitted.slice(2).join(",");
		related_papers = related.substring(2,related.length-2);//remove "{}"
		if(count > 10 && word.length > 2){
			words.push({text:word,size:Math.ceil(count/50),related: related_papers});
		}
	}
	//Draw Wordcloud
	var layout = cloud()
		.size([1000, 800])
		.words(words)
		.padding(5)
		.rotate(function() { return ~~(Math.random() * 2) * 90; })
		.font("Impact")
		.fontSize(function(d) { return d.size; })
		.on("end", draw);
	layout.start();




	function draw(words) {
	  d3.select("body").append("svg")
		  .attr("width", layout.size()[0])
		  .attr("height", layout.size()[1])
		.append("g")
		  .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
		.selectAll("text")
		  .data(words)
		.enter().append("text")
		  .style("font-size", function(d) { return d.size + "px"; })
		  .style("font-family", "Impact")
		  .attr("text-anchor", "middle")
		  .attr("transform", function(d) {
			return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		  })
		  .text(function(d) { return d.text; })
		 .on("click",show_related);
	}
}

function show_related(d,i){
	var data = []
	var pairs = d.related.split(", ")
	for (var i = 0;i < pairs.length - 1; i++) {
		kv = pairs[i].split(": ");
		var start = "count: "+kv[1]+"<br>"
		data.push(start+papers[kv[0]]);
	}
	d3.select('body').select('ul').remove();
	var ul = d3.select('body').append('ul');
	ul.selectAll('li')
	.data(data)
	.enter()
	.append('li')
	.html(String);
}
