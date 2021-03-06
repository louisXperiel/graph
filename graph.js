var url = "https://backend-dot-xperiel-web.appspot.com/debug/messagePipelineTiming?experienceId=2p25c5nyQQwusHtHZnU3vI"

// set the dimensions and margins of the graph
var margin = {top: 20, right: 50, bottom: 50, left: 50},
	padding = 0.33,
	totalWidth = 1960,
	totalHeight = 500
	dataWidth = totalWidth - margin.left - margin.right,
	dataHeight = totalHeight - margin.top - margin.bottom;

// Scale of X and Y contain domain and range of the data.
// Range is related to the size of the data on the graph and 
// domain is the scope in which the data will exist
var yScale = d3.scaleTime()
	.range([0, dataHeight]);
	xScale = d3.scalePoint()
	.range([0, dataWidth])
	//.round(true)
	.padding([padding]);

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
	const maxQuartile = sections.reduce((currentMax,  section) => {
		return Math.max(currentMax, ...section.quartiles);
	}, 0);
	const offsetTranslation = "translate(" + margin.left + "," + margin.top + ")";

	yScale.domain([maxQuartile, 0]);
	xScale.domain(sections.map((section) => section.sectionName))
	
	//Shapes
	//SCALE
	//adding y axis to the left of the chart
	svg.append("g")
		.attr("class", "y axis")
		.attr("opacity", "0.8")
		.attr("transform", offsetTranslation)
		.call(yAxis);

	svg.append('text')
		.attr("transform", offsetTranslation)	
		.text("Milliseconds")
		.attr("x", 0)
		.attr("y", 0)
		.attr("transform", "rotate(90)")
		.attr("fill", "#000");

	//adding x axis to the bottom of chart
	svg.append("g")
		.attr("class", "x axis")
		.attr("opacity", "0.7")
		.attr("transform", "translate("+ margin.left + "," + (margin.top + dataHeight)+ ")")
		.call(xAxis)
		.selectAll(".axis text")
		.attr("transform", function(d) { return "rotate(-5)";});

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
		.style("fill", "#ccc")
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
		.style("fill", "#fff")
		.on("mouseover", onHover);

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
		.style("fill", "#ccc");
		
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
	
	svg.append('g')
		.attr("transform", offsetTranslation)	
		.selectAll("text")
		.data(sections)
		.enter().append("text")
		.text(function(section){ return Math.abs(section.mean);})
		.attr("x", function(section){ return xScale(section.sectionName) + 20; })
		.attr("y", function(section){ return yScale(section.mean);})
		.attr("dy", ".35em")
		.attr("fill", "#000")
		;
	
	svg.append('g')
		.attr("transform", offsetTranslation)	
		.selectAll("text")
		.data(sections)
		.enter().append("text")
		.text(function(section){ return "Min "+Math.abs(section.min);})
		.attr("x", function(section){ return xScale(section.sectionName) + 20; })
		.attr("y", function(section){ return yScale(section.min);})
		.attr("dy", ".35em")
		.attr("fill", "#000")
		;

// Second Cohorts graph
	// New SVG for secondary graph
	svg = d3.select("body").append("svg")
	.attr("height", 200)
	.attr("width", totalWidth);	
	// Variables
	var yScaleBG = d3.scaleTime()
		.range([0, 100])
		.domain([maxQuartile, 0]);
	
	var xScaleBG = d3.scalePoint()
		.range([0, dataWidth])
		.padding([padding]);	
		
	var yAxisBG = d3.axisLeft(yScaleBG)
		.tickSizeInner([10])
		.tickFormat(d3.timeFormat("%Q"));
	
	var xAxisBG = d3.axisBottom(xScaleBG);

	svg.append("g")
	.attr("class", "y axis")
	.attr("transform", offsetTranslation)
	.call(yAxisBG);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.left + "," + (margin.top + 100)+ ")")
		.call(xAxisBG)
		.selectAll(".axis text");
		
	function onHover(){
		console.log(sections[0].cohorts)
		xScaleBG.domain([sections[0].cohorts, 0]);
		var bar = svg.append("g")
			.attr("transform", offsetTranslation)
			.selectAll("rect")
			.data(sections)
			.enter().append("rect")
			.attr('x', section => xScale(section.sectionName) - 18)
			.attr('y', section => yScale(section.quartiles[1]) - 2)
			.attr('width', 36)
			.attr('height', 4)
			.style("fill", "#ccc");
		sections.forEach(sections => {
			console.log(this);
		});

	}
	// sections.forEach(sections => {
	// 	console.log(this)
	// });
	
});
