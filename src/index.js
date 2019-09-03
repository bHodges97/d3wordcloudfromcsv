module.exports = bh_wordcloud = class{
	constructor(url="", tag="wordcloud", count=10, abstract=false, width=600, height=600, stopwords=[]){
		require("d3-transition")
		this.d3 = require("d3-selection");
		//this.colors = require("d3-scale-chromatic").schemeCategory10; //for more color schemes: https://github.com/d3/d3-scale-chromatic
		this.colors = ["#1f77b4","#ff7f0e", "#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]
		this.cloud = require("d3-cloud");
		this.random = require("seedrandom")(0); //if not seeding use random=Math.random
		this.url = url;
		this.count = count;
		this.abstract = abstract;
		this.width = width;
		this.height = height;
		this.stopwords = stopwords;

		this.div_wordcloud = this.d3.select("#"+tag);
		fetch("requestpapers.php", {method: "POST",	body: JSON.stringify({"dir": this.url})})
			.then(res=>res.json()).then((res)=>{
			var rootwc = this.createwc(res.options,width,height,this.div_wordcloud,true);
			this.start(rootwc);
		})
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
		var wcdiv = rootdiv.append("div")
			.style("border-style","dotted")
			.style("margin","5px 5px 5px 5px")
		var div = wcdiv.append("div");
		var bhwc = {
			"width": width,
			"height": height,
			"papers": papers,
			"children": [],
			"wcdiv": wcdiv, //wrapper for self+children
			"div": div, //wrapper for self
			"zooming": false,
			"root": root,
		};
		bhwc.search = div.append("input")
			.attr("placeholder","Search for word...")
			.on("keyup", () => {
				if(this.d3.event.key === "Enter") bh_wc.start(bhwc);
				this.d3.event.preventDefault(); 
		});
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
				this.cluster(papers,bhwc,wcdiv).then(()=>{
					bhwc.div.style("display","none");
					bhwc.zooming=false
				});
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


		bhwc.div_papers = div.append("div")
			.html("hello world");
		//chose some papers to display.
		var req = papers;
		if(papers.length > 5){
			req = [];
			bhwc.more_papers = papers.slice();
			for(let i = 0; i < 5; i++){
				let index = this.randrange(bhwc.more_papers.length)
				req.push(bhwc.more_papers.splice(index,1)[0]);
			}
		}
		fetch("requestpapers.php",{method: "POST", body: JSON.stringify({"dir": this.url, "papers": req, "abstract": this.abstract})})
			.then(res=>res.json())
			.then(res=>{
				bhwc.div_papers_default = "<ul>";
				res.papers.forEach(d=>{bhwc.div_papers_default+="<li>"+d+"</li>"})
				bhwc.div_papers_default += "<br><li><a href=#>show more</a></li></ul>";
				bhwc.div_papers.html(bhwc.div_papers_default);
			})

		return bhwc;
	}
	randrange(max){
		return this.random.int32() % max
	}

	start(wc){
		var word = wc.search.node().value || '';
		var papers = wc.root?"":wc.papers.join(",")
		fetch("termfreq.php?word=\'" + word + "\'&dir=" + this.url + "&papers=" + papers)
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
		var wordcloud = this.cloud()
			.size([wc.width,wc.height])
			.random(this.random)
			.words(words)
			.padding(5)
			.rotate( () =>  ~~(this.random() * 2) * 90)
			.font("Impact")
			.fontSize( d =>  d.size)
			.on("end",words=>this.draw(words,wc));
		wordcloud.start();
		return wordcloud;
	}

	//render
	draw(words,wc) {
		var vis = wc.svg.selectAll("text").data(words,d=>d.text);
		var dur = 500;

		vis.exit().remove()

		var n = vis.enter().append("text");
		n.attr("text-anchor", "middle")
			.style("font-size", "1px")
			.text(function(d){return d.text})
			.on("click",(d,i)=>this.show_related(d,i,wc));

		wc.svg.selectAll("text").transition().duration(dur)
			.style("font-family", function(d){return d.font})
			.style("font-size", d=>d.size+"px")
			.style("fill", (d,i) => this.colors[i % this.colors.length])
			.attr("transform", d =>"translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
	}

	show_related(d,i,wc){
		if(this.selected != d.text){
			fetch('wordassoc.php?word=\''+d.text + "\'&dir=" + this.url + "&count=" + this.count + "&abstract=" + this.abstract)
				.then(responce => responce.text())
				.then(text=> wc.div_papers.html(text));
			this.selected = d.text;
		}else{
			wc.div_papers.html(wc.div_papers_default);
			this.selected = '';
		}
	}
}
