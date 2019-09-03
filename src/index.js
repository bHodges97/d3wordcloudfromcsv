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

		this.div_wordcloud = this.d3.select("#"+tag);
		var rootwc = this.createwc([],width,height,this.div_wordcloud,true);
		this.start(rootwc);
		//this.nluster([],this.div_wordcloud,true);

	}

	cluster(papers,wc,div){
		return fetch("classify.php", {
			method: "POST",
			body: JSON.stringify({"dir": this.url, "papers": papers})
		}).then(res => res.json())
			.then((data)=>{
				for(let d in data){
					let child = this.createwc(data[d],width,height,div);
					wc.children.push(child);
					child.parent = wc;
					this.start(child);
				}
			})
	}

	createwc(papers,width,height,rootdiv,root = false){
		var bhwc = {"width": width, "height": height};
		var wcdiv = rootdiv.append("div")
			.style("border-style","dotted")
			.style("margin","5px 5px 5px 5px")
		var div = wcdiv.append("div");
		bhwc.children = []
		bhwc.wcdiv = wcdiv,bhwc.div = div;

		bhwc.search = div.append("input")
			.attr("placeholder","Search for word...")
			.on("keyup", () => {
				if(this.d3.event.key === "Enter") bh_wc.start(bhwc);
				this.d3.event.preventDefault(); 
		});div.append("p").text(papers);
		
		bhwc.zooming = false;
		bhwc.zoom = div.append("button")
			.text("cluster")
			.on("click",()=>{
			if(bhwc.zooming){
				return;
			}else if(bhwc.children.length){
				bhwc.children.forEach((d)=>{
					d.wcdiv.style("display","block")
				})
				bhwc.div.style("display","none");
			}else{
				bhwc.zooming=true;
				this.cluster(papers,bhwc,wcdiv,).then(()=>{bhwc.div.style("display","none");bhwc.zooming=false});
			}
		});
		if(!root){
			bhwc.back = div.append("button");
			bhwc.back.text("Back");
			bhwc.back.on("click",()=>{
				bhwc.parent.children.forEach((d)=>{
					d.wcdiv.style("display","none")
					bhwc.parent.div.style("display","block");
				})
			});
		}

		bhwc.svg = div.append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g").attr("transform", "translate(" + [width>>1, height>>1] + ")");


		bhwc.div_papers = div.append("div");
		bhwc.papers = papers;
		return bhwc;
	}

	start(wc){
		var word = wc.search.node().value || '';
		fetch("termfreq.php?word=\'" + word + "\'&dir=" + this.url + "&papers=" + wc.papers.join(","))
			.then(response => response.json())
			.then(text => this.load_data(text))
			.then(data => this.show_wordcloud(wc,data))
	}

	load_data(data){
		var words = [];
		var first = Object.keys(data)[0];
		var max_count = data[first];
		var multiplier = this.width / 8 / max_count;

		for (let word in data){
			if(!this.stopwords.includes(word) ){
				let scaled = Math.floor(data[word] * multiplier);
				if(scaled > 2)
					words.push({text:word,size:scaled});
				else 
					break;
			}
		}
		return words
	}
	
	//layout
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

	//render
	draw(words,e,wc) {
		var vis = wc.svg.selectAll("text").data(words,d=>d.text);
		var dur = 500;

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
		if(this.selected != d.text){
			fetch('wordassoc.php?word=\''+d.text + "\'&dir=" + this.url + "&count=" + this.count + "&abstract=" + this.abstract)
				.then(responce => responce.text())
				.then(text=>div.html(text));
			this.selected = d.text;
		}else{
			div.html("");
			this.selected = '';
		}
	}
}
