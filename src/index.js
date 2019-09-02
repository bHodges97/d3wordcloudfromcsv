module.exports = bh_wordcloud = class{
	constructor(url="", tag="wordcloud", count=10, abstract=false, width=600, height=600, stopwords=[]){
		require("d3-transition")
		this.d3 = require("d3-selection");
		this.colors = require("d3-scale-chromatic").schemeCategory10; //for more color schemes: https://github.com/d3/d3-scale-chromatic
		this.cloud = require("d3-cloud");
		this.random = require("seedrandom")(0); //if not seeding use random=Math.random
		this.url = url;
		this.count = count;
		this.abstract = abstract;
		this.width = width;
		this.height = height;
		this.stopwords = stopwords;
		this.wordclouds = [];

		this.div_wordcloud = this.d3.select("#"+tag);
		this.cluster([])
			.then((data)=>{
				for(var d in data){
					this.createwc(data[d],width,height)
					this.start(this.wordclouds[d])
				}
			})
	}

	createwc(papers,width,height){
		var bhwc = {"width": width, "height": height};
		bhwc.svg = this.div_wordcloud.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g").attr("transform", "translate(" + [width>>1, height>>1] + ")");

		bhwc.search = this.div_wordcloud.append("input");
		bhwc.search.attr("placeholder","Search for word...");
		bhwc.search.on("keyup", () => {
			if(this.d3.event.key === "Enter") bh_wc.start(bhwc);
			this.d3.event.preventDefault(); 
		});
		bhwc.div_papers = this.div_wordcloud.append("div");
		bhwc.papers = papers;
		this.wordclouds.push(bhwc)
	}

	cluster(papers){
		return fetch("classify.php", {
			method: "POST",
			body: JSON.stringify({"dir": this.url, "papers": papers})
		}).then(res => res.json());
	}

	start(wc){
		var word = wc.search.value || '';
		console.log(word);
		fetch("termfreq.php?word=\'" + word + "\'&dir=" + this.url + "&papers=" + wc.papers.join(","))
			.then(response => response.text())
			.then(text => this.load_data(text))
			.then(data => this.show_wordcloud(wc,data))
	}

	load_data(data){//TODO: change php side to write array directly?
		var arr = data.split("\n");
		var words = [];
		var first = arr[0].split(",");
		var max_count = parseInt(first[1]);
		//assume average word is length 5
		var max_size = (this.width * 0.30) * (5 / first[0].length);
		for (var i = 0; i < arr.length-1; i++) {
			var splitted = arr[i].split(",");
			var word = splitted[0]
			var count = parseInt(splitted[1]);
			if(!this.stopwords.includes(word) ){
				var scaled = count * (this.width/8) / max_count;
				if(scaled > 0)words.push({text:word,size:scaled});
				else break;
			}
		}
		return words
	}

	show_wordcloud(wc, words){
		//Draw Word
		var random = this.random;
		var wordcloud = this.cloud()
			.size([wc.width,wc.height])
			.random(this.random)
			.words(words)
			.padding(5)
			.rotate( () =>  ~~(this.random() * 2) * 90)
			.font("Impact")
			.fontSize( d =>  d.size)
			.on("end",(words,e)=>this.draw(words,e,wc));
		wordcloud.start();
		return wordcloud;
	}

	draw(words,e,wc) {
		var vis = wc.svg.selectAll("text").data(words,d=>d.text);
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
			.on("click",(d,i)=>this.show_related(d,i,wc.div_papers));

		wc.svg.selectAll("text").transition().duration(dur)
			.style("font-family", function(d){return d.font})
			.style("font-size", d=>d.size+"px")
			.style("fill", (d,i) => this.colors[i % this.colors.length])
			.attr("transform", d =>"translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
	}

	show_related(d,i,div){
		fetch('wordassoc.php?word=\''+d.text + "\'&dir=" + this.url + "&count=" + this.count + "&abstract=" + this.abstract)
			.then(responce => responce.text())
			.then(text=>div.html(text));
	}
}
