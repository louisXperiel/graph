var url = "https://backend-dot-xperiel-web.appspot.com/debug/messagePipelineTiming?experienceId=2p25c5nyQQwusHtHZnU3vI"

// set the dimensions and margins of the graph
var margin = {top: 20, right: 50, bottom: 50, left: 50},
    width = 2500 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// Scale of X and Y contain domain and range of the data.
// Range is related to the size of the data on the graph and 
// domain is the scope in which the data will exist
var yScale = d3.scaleTime()
	.range([0,height - margin.top - margin.left]);

var xScale = d3.scalePoint()
	.range([1, width - margin.right - margin.left])	
	//.range([0, width - margin.right - margin.left])
	//.round(true)
	.padding([margin.right]);

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
	.attr("height", height + margin.top + margin.bottom)
	.attr("width", width + margin.left + margin.right);

// Grab the json and generate the shapes here
d3.json("./blob.json").then(function(data){
	var d = data.sectionStats;
	var quartileArray = [];
	d.forEach(function(d){
		return quartileArray.push(d.quartiles[2]);
	});
	//Shapes
	//SCALE
	//yScale.domain([d3.max(d.map(function(d){ return d.max;})), 0]);
	yScale.domain([d3.max(quartileArray), 0]);
	xScale.domain(d.map(function(d){ return d.sectionName; }));
	tickScale.range([0, yScale(0) - yScale(1)])
		.domain([yScale(0) - yScale(1) , 0]);
	console.log("tickScale", tickScale(0))
	//adding y axis to the left of the chart
	//this should transform based on the margin 
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.right + "," + margin.top + ")")
		.call(yAxis);
	
	svg.append("g")
		.selectAll("text")
		.enter().append("text")             
		.attr("transform",
			  "translate(" + margin.right + " ," + 
							 margin.top + 20 + ")")
		.style("text-anchor", "middle")
		.text("Date");

	//adding x axis to the bottom of chart
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.right + "," +  (height - margin.bottom) + ")")
		.call(xAxis);

	// //TODO: Draw maxium point
	min = svg.append("g")
		.attr("transform", "translate("+ margin.left + "," + margin.top +")")
		.selectAll("circle")
		.data(d)
		.enter().append("circle")
		.attr('r', 3)
		.attr('cx', function(d){ return xScale(d.sectionName); })	
		.attr('cy', function(d){ return yScale(d.max);})
		.enter().append("text")
		.attr("x", 100)
		.attr("y", 3)
		.text("stuff");

	// //TODO: Draw minimum point
	max = svg.append("g")
		.attr("transform", "translate("+ margin.left + "," + margin.top +")")
		.selectAll("circle")
		.data(d)
		.enter().append("circle")
		.attr('r', 3)
		.attr('cx', function(d){ return xScale(d.sectionName); })	
		.attr('cy', function(d){ return yScale(d.min);});

	//Draw Box
	// https://www.researchgate.net/figure/Diagram-of-boxplot-components-including-mean-median-1st-and-3rd-quartiles-outliers-and_fig4_321962400
	box = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top +")")
		.selectAll("rect")
		.data(d)
	
	box.enter().append("rect")
		.attr("x", function(d){ return xScale(d.sectionName) - 15;})
		.attr("y", function(d){ console.log("Y point", d.quartiles[2]); return yScale(d.quartiles[2]);})
		.attr("width", 30)
		.attr("height", function(d){ console.log("Height", tickScale(d.quartiles[2])); return tickScale(d.quartiles[2]) });

	//TODO: Draw Average line
	line = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")    
		.selectAll("line")
		.data(d)
		.enter().append("line")

	line.attr("x1", function(d){ return xScale(d.sectionName) + 15 ;})
		.attr("y1", function(d){ return yScale(d.mean);})
		.attr("x2", function(d){ return xScale(d.sectionName) - 15 ;})
		.attr("y2", function(d){ return yScale(d.mean);});	

});

