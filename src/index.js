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
		this.tag = tag;

		fetch("requestpapers.php", {method: "POST",	body: JSON.stringify({"dir": this.url})})
			.then(res=>res.json()).then((res)=>{ //use arrow functions instead of regular functions to preserve scope
			var rootwc = this.createwc(res.options,width,height,null);
			this.start(rootwc);
		})
	}

	cluster(papers,wc){
		return fetch("classify.php", {
			method: "POST",
			body: JSON.stringify({"dir": this.url, "papers": papers})
		}).then(res => res.json())
			.then((data)=>{
				for(let d in data){
					let child = this.createwc(data[d],width,height,wc);
					wc.children.push(child);
					this.start(child);
				}
			})
	}

	createwc(papers,width,height,parent){
		var rootdiv = parent?parent.wcdiv:this.d3.select('#'+this.tag)
		var wcdiv = rootdiv.append("div")
			.style("border-style","dotted")
			.style("margin","5px 5px 5px 5px")
		var div = wcdiv.append("div");
		var bhwc = {
			"width": width,
			"height": height,
			"papers": papers,
			"children": [],
			"parent": parent,
			"wcdiv": wcdiv, //wrapper for self+children
			"div": div, //wrapper for self
			"zooming": false,
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
				this.cluster(papers,bhwc).then(()=>{
					bhwc.div.style("display","none");
					bhwc.zooming=false
				});
			}
		});
		if(!parent){
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
			.style("border-style","ridge")
			.append("g").attr("transform", "translate(" + [width>>1, height>>1] + ")");


		bhwc.div_papers = div.append("div")
		bhwc.div_papers_list = bhwc.div_papers.append("ul")
		
		//chose some papers to display.
		this.listpapers(bhwc,papers)
	
		return bhwc;
	}


	listpapers(bhwc,papers,counts){
		bhwc.div_papers.html("")
		bhwc.div_papers_list = bhwc.div_papers.append("ul")
		
		let span = bhwc.div_papers_list.append("span").attr("id","bhwcendmarker")
		span.append("a").attr("id","bhwcmoremarker").attr("href","").text("show more").on("click",()=>{
			this.d3.event.preventDefault();
			bhwc.show_n(10);
		})
		span.append("text").text("\t");
		span.append("a").attr("id","bhwclessmarker").attr("href","").text("show less").on("click",()=>{
			this.d3.event.preventDefault();
			let j = bhwc.indices.pop();
			for(let i = 0;i < j;i++){
				bhwc.div_papers_nodes.pop().remove();
			}
			if(bhwc.indices.length==1)bhwc.div_papers_list.select("#bhwclessmarker").style("display","none")
		})
		//this.shuffle(bhwc.papers);
		bhwc.index = 0;
		bhwc.div_papers_nodes = [];
		bhwc.indices = [];

		bhwc.show_n = (n)=>{
			let shown = papers.slice(bhwc.index,bhwc.index+n);
			let lindex = bhwc.index

			fetch("requestpapers.php",{method: "POST", body: JSON.stringify({"dir": this.url, "papers": shown, "abstract": this.abstract})})
				.then(res=>res.json())
				.then(res=>{
					for(let i = 0; i < res.papers.length; i++){//in keyword returns a string for iterator???
						let html = res.papers[i]
						if(counts){
							html = "["+ counts[i+lindex] +" hits] " + html 
						}
						let n = bhwc.div_papers_list.insert("li","#bhwcendmarker").html(html)
						bhwc.div_papers_nodes.push(n);
					}
				})

			bhwc.index += shown.length
			bhwc.indices.push(shown.length)
			bhwc.div_papers_list.select("#bhwcmoremarker").style("display",bhwc.index==bhwc.papers.length?"none":"inline-block")
			bhwc.div_papers_list.select("#bhwclessmarker").style("display",bhwc.indices.length==1?"none":"inline-block")
		}

		bhwc.show_n(10);
	}


	shuffle(a) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	start(wc){
		var word = wc.search.node().value || '';
		var papers = wc.parent?"":wc.papers.join(",")
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
				.then(res => res.json())
				.then(res => this.listpapers(wc,res.papers,res.counts));
			this.selected = d.text;
		}else{
			this.listpapers(wc,wc.papers)
			this.selected = '';
		}
	}
}
