console.log(d3);

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
	console.log(d3.quantile(d.map(function(d){ return d.max;}), 0.25));
	console.log(d3.nest(function(d){ return d3.map(d.quartiles);}));
	//Shapes
	var box = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");  
	
	var boxHeight = d3.quantile(d3.map((function(d){ return d.quartiles;})), 0) 
	
	//SCALE
	yScale.domain([(d3.quantile(d.map(function(d){ return d.max;}), 0.001)), 0]);
	xScale.domain(d.map(function(d){ return d.sectionName; }));

	//adding y axis to the left of the chart
	//this should transform based on the margin 
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.right + "," + margin.top + ")")
		.call(yAxis);

	//adding x axis to the bottom of chart
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.right + "," +  (height - margin.bottom) + ")")
		.call(xAxis);

	//TODO: Draw maxium point
	svg.append("g")
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

	//TODO: Draw minimum point
	svg.append("g")
		.attr("transform", "translate("+ margin.left + "," + margin.top +")")
		.selectAll("circle")
		.data(d)
		.enter().append("circle")
		.attr('r', 3)
		.attr('cx', function(d){ return xScale(d.sectionName); })	
		.attr('cy', function(d){ return yScale(d.min);});

	//TODO: Draw Box 
	box.append("g")
		.selectAll("rect")
		.data(d)
		.enter().append("rect")
		.attr("x", function(d){ return xScale(d.sectionName) - 5;})
		.attr("y", function(d){ return yScale(d3);})
		.attr("height", function(d){ return yScale(d.max)/2; }) 
		.attr("width", 10);
		//.attr("y", d3.map(function(d){ return height - margin.top - margin.bottom - yScale(d.average);}));
		//.attr("height", 200)
		//.attr("width", 300);
	//TODO: Draw Average line
	svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")    
		.selectAll("line")
		.data(d)
		.enter().append("rect")
		.attr("x", function(d){ return xScale(d.sectionName) - 5 ;})
		.attr("y", function(d){ return yScale(d.mean);})
		.attr("height", 20) 
		.attr("width", 10);	

});




//     d3.json("./query.json", function(data){
//         console.log(data);
//         console.log(d3);
//         // console.log(data.map(function(d){ return d["sect"]; }));
//         // console.log([0, d3.max(data, function(d) { return d["duration"]; })])
//         xScale.domain(data.map(function(d){ return d["sect"]; }));
//         yScale.domain([0, d3.max(data, function(d) { return d["timestamp"]; })]);

// //adding y axis to the left of the chart
//         svg.append("g")
//             .attr("class", "y axis")
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//             .call(yAxis);

// //adding x axis to the bottom of chart
//         svg.append("g")
//             .attr("class", "x axis")
//             .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
//             .call(xAxis);

//         svg.append("g")
//             //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//             .attr("transform", "translate(90,20)")
//             .selectAll(".box")
//             .data(data)
//             .enter()
//             .append("rect")
//             .attr("x", function(d){ return xScale(d["sect"]); })
//             .attr("y", function(d){ return height - margin.top - margin.bottom - yScale(d["timestamp"]);})
//             .attr("height", 20)
//             .attr("width", 20)

//TODO: this is the current data point that the graph will build off of
//         svg.append("g")
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//             .selectAll(".point")
//             .data(data)
//             .enter()
//             .append("rect")
//             .attr("class", "bar")
//             .attr("x", function(d){ return xScale(d["sect"]); })
//             .attr("y", function(d){ return height - margin.top - margin.bottom - yScale(d["timestamp"]);})
//             .attr("height", 2)
//             .attr("width", xScale.rangeBand);



//});