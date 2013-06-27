
toxicity = {}

toxicity.calc = function(xmldoc) {
	var filenodes = $(xmldoc).find("file");
	return $.map(filenodes, toxicity.calcfile);
}

toxicity.calcfile = function(fnode, fidx) {
		var path = $(fnode).attr("name").replace(/\\/g, "/");
		var result = {
			_name: path.split("/").slice(-1)[0], 
			_path: path,
			total: 0
		};
		$(fnode).children().each(function(eidx, enode) {
			var check = $(enode).attr("source").split(".").slice(-1)[0].replace(/Check$/, "")
			var matches = $(enode).attr("message").replace(/,/g, "").match(/(\d+)/g)
			var score = matches ? (matches[0] / matches [1]) : 1;
			result[check] = (result[check] || 0) + score
			result.total += score;
		});
		return result.total ? result : null;
};

toxicity.draw = function(data) {
	var CHEIGHT = 600;
	var BWIDTH = 6;
	var BGAP = 3;
	var LEFTSPACE = 40;

	data.sort(function(da, db) { return db.total - da.total })

	d3.selectAll("svg").remove();
	var chart = d3.select("body").append("svg")
		.attr("class", "chart")
		.attr("width", LEFTSPACE + (BWIDTH + BGAP) * data.length)
		.attr("height", CHEIGHT + 5); /* to accomodate bottom label */

	var xscale = d3.scale.linear()
		.domain([0, data.length])
		.rangeRound([LEFTSPACE, (BWIDTH + BGAP) * data.length + LEFTSPACE])

	var yscale = d3.scale.linear()
		.domain([0, d3.max(data, function(d) { return d.total })])
		.rangeRound([CHEIGHT, 1]);

	var yaxis = d3.svg.axis()
		.scale(yscale)
		.orient("left")
		.ticks(10);

	chart.selectAll("line")
		.data(yscale.ticks(10))
		.enter().append("line")
		.attr("x1", function(td) { return xscale(0) })
		.attr("x2", function(td) { return xscale(data.length) })
		.attr("y1", yscale)
		.attr("y2", yscale)
		.style("stroke", "#ccc");

	chart.selectAll("rect")
		.data(data)
		.enter().append("rect")
		.attr("x", function(d, i) { return xscale(i) })
		.attr("y", function(d) { return yscale(d.total) })
		.attr("height", function(d) { return CHEIGHT - yscale(d.total) })
		.attr("width", BWIDTH)
		.attr("shape-rendering", "crispEdges")
		.style("fill", function(d) { return "hsl(200, 80%, 20%)" })
		.call(tooltip());
				
	chart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + LEFTSPACE + ", 0)")
		.call(yaxis);
}


tooltip = function(a) {

	var accessor = arguments.length ? a : undefined;

	function tooltip(selection) {
		selection
			.on("mouseover", function(d) {
				if (accessor) {
					d = accessor(d);
				}
			 	var div = d3.select("body").selectAll("div.tooltip");
				if (div.empty()) {
				 	div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
				}
			  div.html("");
				div.append("h2").text(d._name);
				div.append("p").attr("class", "filename").text(d._path.split("/").slice(0, -1).join("/"));
				for (var p in d) {
				  if (d.hasOwnProperty(p) && (p.indexOf("_") != 0)) {
						div.append("p").text(p + ": " + Math.round(d[p] * 10) / 10);
				  }
				}
				var ttx = d3.event.pageX;
				var tty = d3.event.pageY - $("div.tooltip").height() - 15;
				var hclip = (ttx + $("div.tooltip").width()) - ($(window).width() + $(window).scrollLeft())
				if (hclip > 0) {
					ttx -= hclip
				}
				div.style("left", Math.max(ttx - 20, $(window).scrollLeft() + 5) + "px")     
					 .style("top", Math.max(tty, $(window).scrollTop() + 5) + "px");
				div.transition().duration(100).style("opacity", 0.95);
			})
			.on("mouseout", function(d) {       
				div = d3.select("body").select("div.tooltip")
				div.transition().duration(250).style("opacity", 0);
			});
	}

	return tooltip;
};



