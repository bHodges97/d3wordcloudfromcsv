module.exports = bh_wordcloud = class{
	constructor(url, tag, width, height){
		this.d3_select = require("d3-selection").select;
		this.cloud = require("d3-cloud");
		this.papers = {};
		this.url = url;
		this.tag = "#" + tag;
		this.width = width;
		this.height = height;
	}

	start(){
		fetch(this.url + '/freq_data.csv')
			//.then(response => response.text())
			//.then(text => this.load_papers(text))
			.then(response => response.text())
			.then(text => this.load_data(text))
			.then(data => this.show_wordcloud(data))
	}

	load_papers(data){
		var arr = data.split("\n");
		for (var i = 0; i < arr.length-1; i++) {
			var splitted = arr[i].split(",")
			var html = splitted.slice(1).join(",");
			html = html.substring(1,html.length-2);
			//html = html.replace(/""/g,'\"'); not needed?
			this.papers[splitted[0]] = html
		}
		return fetch(this.url + '/freq_data.csv')
	}

	load_data(data){
		var arr = data.split("\n");
		var words = [];
	    var size_divisor = 200/parseInt(arr[0].split(",")[1]); //
		for (var i = 0; i < arr.length-1; i++) {
			var splitted = arr[i].split(",");
			var word = splitted[0]//.substring(1,splitted[0].length-1);//remove quotes
			var count = parseInt(splitted[1]);
			var related = splitted.slice(2).join(",");
			var related_papers = related.substring(1,related.length-1);//remove "{}"
			if(count > 10 && word.length > 2){
				words.push({text:word,size:Math.ceil(count*size_divisor),related: related_papers});
			}
		}
		return words
	}

	show_wordcloud(words){
		//Draw Wordcloud
		this.layout = this.cloud()
			.size([this.width, this.height])
			.words(words)
			.padding(5)
			.rotate(function() { return ~~(Math.random() * 2) * 90; })
			.font("Impact")
			.fontSize(function(d) { return d.size; })
			.on("end",words=>this.draw(words));

		this.layout.start();
	}

	draw(words) {
		var layout = this.layout
		this.d3_select(this.tag).append("svg")
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
		 .on("click",(d,i)=>this.show_related(d,i));
	}

	show_related(d,i){
		this.d3_select(this.tag).select('ul').remove();
		fetch('wordassoc.php?word='+d.text)
		  .then(responce => responce.text())
		  .then(text=>this.d3_select(this.tag).append('ul').html(text));
	}
}
