var d3 = require("d3"),
    cloud = require("d3-cloud");


fetch('freq_data.csv')
  .then(response => response.text())
  .then((data) => {
	  arr = data.split("\n");
	  words = []
	  for (var i = 0; i < arr.length-1; i++) {
		  var splitted = arr[i].split(",").map(d => d.substring(1, d.length-1))
		  var word = splitted[0]
		  var count = parseInt(splitted[1])
		  if(count > 10 && word.length > 2)
		  words.push({text:word,size:Math.round(count/2)})
	  }

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
      .text(function(d) { return d.text; });
}

})
