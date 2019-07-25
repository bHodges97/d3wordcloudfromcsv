module.exports = bh_wordcloud = class{
	constructor(url, tag, width, height){
		this.d3_select = require("d3-selection").select;
		this.colors = require("d3-scale-chromatic").schemeCategory10; //for more color schemes: https://github.com/d3/d3-scale-chromatic
		this.cloud = require("d3-cloud");
		this.random = require("seedrandom")(0); //if not seeding use random=Math.random
		this.url = url;
		this.div_wordcloud = this.d3_select("#"+tag);
		this.width = width;
		this.height = height;
		this.max_size = 130; //adjust this for biggest word
	}

	start(){
		fetch(this.url + '/freq_data.csv')
			.then(response => response.text())
			.then(text => this.load_data(text))
			.then(data => this.show_wordcloud(data))
	}

	load_data(data){
		var arr = data.split("\n");
		var words = [];
	    this.max_count = parseInt(arr[0].split(",")[1]);
		for (var i = 0; i < arr.length-1; i++) {
			var splitted = arr[i].split(",");
			var word = splitted[0]//.substring(1,splitted[0].length-1);//remove quotes
			var count = parseInt(splitted[1]);
			if(count > 10 && word.length > 2){
				words.push({text:word,size:count});
			}
		}
		return words
	}

	show_wordcloud(words){
		//Draw Wordcloud
		var random = this.random
		var max_count = this.max_count
		var max_size = this.max_size
		this.layout = this.cloud()
			.size([this.width, this.height])
			.random(random)
			.words(words)
			.padding(5)
			.rotate(function() { return ~~(random() * 2) * 90; })
			.font("Impact")
			.fontSize(function(d) { return Math.ceil(max_size*(d.size/max_count)); })
			.on("end",words=>this.draw(words));

		this.layout.start();
	}

	draw(words) {
		var layout = this.layout;
		var colors = this.colors;
		this.div_wordcloud.append("svg")
		  .attr("width", layout.size()[0])
		  .attr("height", layout.size()[1])
		.append("g")
		  .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
		.selectAll("text")
		  .data(words)
		.enter().append("text")
		  .style("font-size", function(d) { return d.size + "px"; })
		  .attr("fill", (d,i) => colors[i%colors.length])
		  .style("font-family", "Impact")
		  .attr("text-anchor", "middle")
		  .attr("transform", function(d) {
			return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		  })
		  .text(function(d) { return d.text; })
		 .on("click",(d,i)=>this.show_related(d,i));
		this.div_papers = this.div_wordcloud.append("div");
	}

	show_related(d,i){
		fetch('wordassoc.php?word='+d.text)
		  .then(responce => responce.text())
		  .then(text=>this.div_papers.html(text));
	}
}
