module.exports = bh_wordcloud = class{
	constructor(url="", tag="wordcloud", count=10, abstract=false, width=600, height=600, stopwords=[]){
		require("d3-transition")
		this.d3_select = require("d3-selection").select;
		this.colors = require("d3-scale-chromatic").schemeCategory10; //for more color schemes: https://github.com/d3/d3-scale-chromatic
		this.cloud = require("d3-cloud");
		this.random = require("seedrandom")(0); //if not seeding use random=Math.random
		this.url = url;
		this.div_wordcloud = this.d3_select("#"+tag);
		this.width = width;
		this.height = height;
		var search  = this.div_wordcloud.append("input");
		this.svg = this.div_wordcloud.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g").attr("transform", "translate(" + [width>>1, height>>1] + ")");
		search.attr("id","bhwcInput").attr("placeholder","Search for word...");
		search = document.querySelector("#bhwcInput");
		search.addEventListener("keyup", event => {
			if(event.key === "Enter") bh_wc.start(search.value);
			event.preventDefault(); // No need to `return false;`.
		});

		this.div_papers = this.div_wordcloud.append("div");
		this.background = this.svg.append("g");
		this.count = count;
		this.abstract = abstract;
		this.stopwords = stopwords;

	}

	start(word){
		fetch("termfreq.php?word=\'" + word + "\'&dir=" + this.url)
			.then(response => response.text())
			.then(text => this.load_data(text))
			.then(data => this.show_wordcloud(data,this.width,this.height))
	}

	load_data(data){
		var arr = data.split("\n");
		var words = [];
		var first = arr[0].split(",");
		var max_count = parseInt(first[1]);
		//assume average word is length 5
		var max_size = (this.width * 0.30) * (5 / first[0].length);
		for (var i = 0; i < arr.length-1; i++) {
			var splitted = arr[i].split(",");
			var word = splitted[0]//.substring(1,splitted[0].length-1);//remove quotes
			var count = parseInt(splitted[1]);
			if(word.length > 2 && !this.stopwords.includes(word) ){
				var scaled = count * (this.width/8) / max_count;
				if(scaled > 0)words.push({text:word,size:scaled});
				else break;
			}
		}
		return words
	}

	show_wordcloud(words,width,height){
		//Draw Word
		var random = this.random;
		var wordcloud = this.cloud()
			.size([width,height])
			.random(this.random)
			.words(words)
			.padding(5)
			.rotate( () =>  ~~(this.random() * 2) * 90)
			.font("Impact")
			.fontSize( d =>  d.size)
			.on("end",(words,e)=>this.draw(words,e));

		wordcloud.start();
		return wordcloud;
	}

	draw(words,e) {
		var vis = this.svg.selectAll("text").data(words,d=>d.text);
		var dur = 1000;

		/*vis.exit().transition(dur)
		  .style('fill-opacity', 1e-6)
			.style("font-size",function(){return "1px"})
			*/
		vis.exit().remove()

		var n = vis.enter().append("text");
		n.attr("text-anchor", "middle")
			.style("font-size", "1px")
			.text(function(d){return d.text})
			.on("click",(d,i)=>this.show_related(d,i));

		this.svg.selectAll("text").transition().duration(dur)
			.style("font-family", function(d){return d.font})
			.style("font-size", d=>d.size+"px")
			.style("fill", (d,i) => this.colors[i % this.colors.length])
			.attr("transform", d =>"translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
	}

	show_related(d,i){
		fetch('wordassoc.php?word=\''+d.text + "\'&dir=" + this.url + "&count=" + this.count + "&abstract=" + this.abstract)
			.then(responce => responce.text())
			.then(text=>this.div_papers.html(text));
	}
}
