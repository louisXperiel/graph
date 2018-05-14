var url = "https://backend-dot-xperiel-web.appspot.com/debug/messagePipelineTiming?experienceId=2p25c5nyQQwusHtHZnU3vI"

// set the dimensions and margins of the graph
var margin = {top: 10, right: 0, bottom: 30, left: 30},
	padding = 0.33,
	totalWidth = 1860,
	totalHeight = 500
	dataWidth = totalWidth - margin.left - margin.right,
	dataHeight = totalHeight - margin.top - margin.bottom;

// Scale of X and Y contain domain and range of the data.
// Range is related to the size of the data on the graph and 
// domain is the scope in which the data will exist
var yScale = d3.scaleTime()
	.range([0, dataHeight]);

var xScale = d3.scalePoint()
	.range([0, dataWidth])
	//.round(true)
	.padding([padding]);

var tickScale = d3.scaleLinear();

// Generate x and y axis, y will represent miliseconds and x will represent
// sectionNames of the server backend. The axis is shaped by the corresponding scale variable.
var yAxis = d3.axisLeft(yScale)
	.tickSizeInner([10])
	.tickFormat(d3.timeFormat("%Q"));

var xAxis = d3.axisBottom(xScale);

// Create the base svg chart which the graph shapes will inherit from and transform when consuming 
// the formated json data. 
var svg = d3.select("body").append("svg")
	.attr("height", totalHeight)
	.attr("width", totalWidth);

// Grab the json and generate the shapes here
d3.json("./blob.json").then(function(data){
	var sections = data.sectionStats;
	const maxQuartile = Math.ceil(sections.reduce((currentMax,  section) => 
		Math.max(currentMax, ...section.quartiles, section.mean), 0));
	const offsetTranslation = "translate(" + margin.left + "," + margin.top +")";

	yScale.domain([maxQuartile, 0]);
	xScale.domain(sections.map((section) => section.sectionName))
	tickScale
		.range([0, yScale(0) - yScale(1)])
		.domain([0, yScale(0) - yScale(1)]);
	
	//Shapes
	//SCALE
	//adding y axis to the left of the chart
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", offsetTranslation)
		.call(yAxis);

	//adding x axis to the bottom of chart
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.left + "," +  (margin.top + dataHeight) + ")")
		.call(xAxis);

	//Draw Average line
	var line = d3.line()
		.x(d => { return xScale(d.sectionName) })
		.y(d => { return yScale(d.mean) })
		.curve(d3.curveMonotoneX);

	svg
		.append("path")
		.attr("transform", offsetTranslation)
		.datum(sections)
		.attr("d", line)
		.style("fill", "none")
		.style("stroke", "#B3E5FC")
		.style("stroke-width", 2);

	// Draw max-to-min line
	var range = svg.append("g")
		.attr("transform", offsetTranslation)
		.selectAll("rect")
		.data(sections)
		.enter().append("rect")
		.attr('x', section => xScale(section.sectionName) - 1)
		.attr('y', section => yScale(section.max))
		.attr('width', 2)
		.attr('height', section => Math.abs(yScale(section.max) - yScale(section.min)))
		.style("fill", "#bbb")
		.style("stroke", "none");

	// Add top-bottom quartile range boxes
	var box = svg.append("g")
		.attr("transform", offsetTranslation)
		.selectAll("rect")
		.data(sections)
		.enter().append('rect')
		.attr('x', section => xScale(section.sectionName) - 15)
		.attr('y', section => yScale(section.quartiles[2]))
		.attr('width', 30)
		.attr('height', section => Math.abs(yScale(section.quartiles[2]) - yScale(section.quartiles[0])))
		.style("fill", "#f6f6f6")
		.style("stroke", "#666");

	// Draw median marker
	var median = svg.append("g")
		.attr("transform", offsetTranslation)
		.selectAll("rect")
		.data(sections)
		.enter().append("rect")
		.attr('x', section => xScale(section.sectionName) - 18)
		.attr('y', section => yScale(section.quartiles[1]) - 2)
		.attr('width', 36)
		.attr('height', 4)
		.style("fill", "#ccc")
		.style("stroke", "#444");
		
	// Add max, min, and mean points
	var max = svg.append("g")
		.attr("transform", offsetTranslation)
		.selectAll("circle")
		.data(sections)
		.enter().append("circle")
		.attr('r', 3)
		.attr('cx', function(section){ return xScale(section.sectionName); })	
		.attr('cy', function(section){ return yScale(section.max);})
		.style("fill", "#fff");

	var min = svg.append('g')
		.attr("transform", offsetTranslation)
		.selectAll("circle")
		.data(sections)
		.enter().append("circle")
		.attr('r', 3)
		.attr('cx', function(section){ return xScale(section.sectionName); })	
		.attr('cy', function(section){ return yScale(section.min);})
		.style("fill", "#fff");
	
	var mean = svg.append('g')
		.attr("transform", offsetTranslation)
		.selectAll("circle")
		.data(sections)
		.enter().append("circle")
		.attr('r', 3)
		.attr('cx', function(section){ return xScale(section.sectionName); })	
		.attr('cy', function(section){ return yScale(section.mean);})
		.style("fill", "#0091EA");

	// var line = svg.append("g")
	// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")    
	// 	.selectAll("line")
	// 	.data(d)
	// 	.enter().append("line")

	// line.attr("x1", function(d){ return xScale(d.sectionName) + 15 ;})
	// 	.attr("y1", function(d){ return yScale(d.mean);})
	// 	.attr("x2", function(d){ return xScale(d.sectionName) - 15 ;})
	// 	.attr("y2", function(d){ return yScale(d.mean);});

		
// 	//Draw Box
// 	// upper fence = max
// 	// max ovservation = highest quartile?
// 	// https://www.researchgate.net/figure/Diagram-of-boxplot-components-including-mean-median-1st-and-3rd-quartiles-outliers-and_fig4_321962400
// // 	// 3rd quartile 75%
// 	box = svg.append("g")
// 		.attr("transform", "translate(" + margin.left + "," + margin.top +")")
// 		.selectAll("rect")
// 		.data(d)
	
// 	box.enter().append("rect")
// 		.attr("x", function(d) { 
// 			console.log(d.sectionName, xScale(d.sectionName) - 15);
// 			return xScale(d.sectionName) - 15;
// 		})
// 		.attr("y", function(d) { 
// 			console.log(d.quartiles[2], yScale(d.quartiles[2])); 
// 			return yScale(d.quartiles[2]);
// 		})
// 		.attr("width", function(d) {
// 			console.log("width", d.sectionName, 30);
// 			return 30;
// 		})
// 		.attr("height", function(d) {
// 			const diff = d.quartiles[2] - d.quartiles[0];
// 			const scaled = yScale(diff);
// 			console.log("height", d.sectionName, diff, scaled);
// 			return  d3.scaleLinear()(diff);
// 		})
		// .attr("height", function(d){ console.log("Height", tickScale(d.quartiles[2])); return tickScale(d.quartiles[2]) });
		// .call(boxpoints(d));
// 	// function boxpoints(y, b){
// 		// var boxY = [],
// 		// boxHeight = [];
// 		// console.log(d)
// 		// d.forEach(function(d){
// 		// 	return boxY.push(d.quartiles[1]);
// 		// });
// 		// console.log(boxY)
// 	// 	return box.attr("y", function(boxY){ return yScale(boxY);});
// 	// };
// 	// 	d.forEach(function(d){ 
// 	// 	//console.log(yScale(d.quartiles[1]));
// 	// 	console.log(d.quartiles[1]);
// 	// 	console.log(d.quartiles[2]);
// 	// 		return box.attr("y", yScale(d.quartiles[1]));
// 	//	});
// 	// box.attr("x", function(d){ return xScale(d.sectionName);})
// 	// 	d.forEach(function(quartileArray){
// 	// 		return box.attr(
// 	// 			"y", (function(d){ return yScale(quartileArray.quartiles, .75););})
// 	// 		);
// 	// 	});
// 	// 	d.forEach(function(quartileArray){
// 	// 		//console.log(yScale(d3.quantile(quartileArray.quartiles, 0.25)) - margin.bottom);
// 	// 		console.log(d3.quantile(quartileArray.quartiles, 0.75))
// 	// 		return box.attr("height", yScale(d3.quantile(quartileArray.quartiles, 0.25)) - margin.bottom ) 
// 	// 		// 	"height", (function(d){ return yScale(
// 	// 		// 		d3.quantile(quartileArray.quartiles, 0.25) - margin.bottom
// 	// 		// 	);})
// 	// 		// );
// 	// 	});
	

});

