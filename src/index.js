module.exports = bh_wordcloud = class{
	constructor(url, tag, width, height){
		require("d3-transition")
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
			.then(data => this.show_wordcloud(data,this.width,this.height))
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

	show_wordcloud(words,width,height){
		//Draw Wordcloud
		var random = this.random
		var max_count = this.max_count
		var max_size = this.max_size
		var wordcloud = this.cloud()
			.size([width,height])
			.random(random)
			.words(words)
			.padding(5)
			.rotate(function() { return ~~(random() * 2) * 90; })
			.font("Impact")
			.fontSize(function(d) { return Math.ceil(max_size*(d.size/max_count)); })
			.on("end",(words,e)=>this.draw(words,e));
		this.svg = this.div_wordcloud.append("svg")
			.attr("width", width)
		 	.attr("height", height)
			.append("g").attr("transform", "translate(" + [width>>1, height>>1] + ")");
		this.div_papers = this.div_wordcloud.append("div");

		wordcloud.start();
		return wordcloud;
	}

	draw(words,e) {
		var n = this.svg.selectAll("text").data(words, d=>d.text).enter().append("text");
		var dur = 1000;

		n.attr("text-anchor", "middle")
			.style("font-family", d => d.font)
			.style("fill", (d,i) => this.colors[i % this.colors.length])
			.style("font-size", "1px")
			.text(d => d.text)
			.on("click",(d,i)=>this.show_related(d,i));

    	n.transition().duration(dur)
			.style("font-size", d=>d.size+"px")
			.attr("transform", d =>"translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
		
		n.exit().transition().duration(dur)
			.style("font-size","1px")
			.remove();
		
	}

	show_related(d,i){
		fetch('wordassoc.php?word='+d.text)
		  .then(responce => responce.text())
		  .then(text=>this.div_papers.html(text));
	}
}
