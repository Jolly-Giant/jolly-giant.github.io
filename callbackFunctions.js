// Contains the callback functions

changeP1 = function(){
	// Oh my, I was called back!
	// Should update all plots because states are important!
	var abv=d3.select("select").property('value').split('-')[0];
	clearPlot('1');
	pullStateData(abv);
};

pullStateData = function(state){

	// This will pull the state data and do things with it!
	var emissionsPromise = d3.json('api/data/'+state+'.json')
	emissionsPromise.then(function(data){

		// Convert JSON objects to arrays
        Object.entries(data).forEach(entry => {
            key = entry[0]
            data[key] = Object.values(data[key])
        });

		// Adjust scales based on min/max of data
		mainVars.xScale.domain([d3.min(data.DateTime, function(d) { return d;}),
                       d3.max(data.DateTime, function(d) { return d;})]);
        mainVars.yScale.domain([0, detYMax(data)]);

        drawPlot1(data, state);
        emission_sum(state);
	})
};

drawPlot1 = function(data, state){
    var drawLine = d3.line()
    .x(function(d) {return mainVars.xScale(d[0]);})
    .y(function(d) {return mainVars.yScale(d[1])});

    var plot1 = d3.select('#plot-loc1').select('svg').select('g');

	Object.entries(data).forEach( src => {
		// Do not plot datetime or total generation
        if (src[0] !== 'DateTime' && src[0] !== 'All') {

            var plot_data = plotHelper(data, src[0]);
            // Draw path
       		linepath=plot1.append('path')
                .attr('d', drawLine(plot_data))
    	    	.attr('stroke',function(d){return mainVars.colorScale(src[0]);})
    			.attr('fill', 'none')
    			.attr('stroke-width', 2)
    			.attr("transform", "translate("+20+",0)")
        };
    });

	// Add animation to plot
	var curtain = plot1.append('rect')
		.attr('x', -1 * (mainVars.width))
		.attr('y', -1 * mainVars.height)
		.attr('height', mainVars.height-110)
		.attr('width', (mainVars.width-10))
		.attr('class', 'curtain')
		.attr('transform', 'rotate(180)')
		.style('fill', '#ffffff')
							
    curtain.transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr('x', -2 *(mainVars.width+10))

	// Add details
	plot1.append('text')
			.text('Power Generation Sources: '+state)
			.attr('class', 'title')
			.attr('x', 0)
			.attr('y', 30)

		plot1.append('g')
		.attr("transform", "translate("+20+",0)")
    	.call(d3.axisLeft(mainVars.yScale)
        	.ticks(5))

	plot1.append("text")
		.attr("transform","translate(" + 0 + " ," +(250) + ")")
		.attr("dx","-270")
		.attr("dy","-30")  
		.style("text-anchor", "middle")          
		.attr("transform","rotate(-90)")
		.style("font-size", "14px")
		.text("Average Annual Power Generation (GWh)")

	plot1.append('g')
		.attr("transform", "translate("+20+"," + (mainVars.height-50) + ")")
      	.call(d3.axisBottom(mainVars.xScale))

	plot1.append("text")
		.attr("transform","translate(" + (mainVars.width/2) + " ," +(mainVars.height-20) + ")")
		.style("font-size", "14px")
		.text("Year")

 	var legData = powerGenColors(data)            

	legend = plot1.selectAll(".legend")
				.data(legData.source)
	 		  	.enter().append("g")
			  	.attr("class", "legend")
			  	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
      	   	.attr("cx",mainVars.width)
     	   	.attr("cy",20)
    	   	.attr("r", 5)
      	   	.style("fill", function(d,i) {return legData.color[i]; });

 		legend.append("text")
		  	.attr("x", mainVars.width - 20)
		  	.attr("y", 19)
	  	  	.attr("dy", ".40em")
		  	.style("text-anchor", "end")
		  	.style("font-size","12px")
		  	.text(function(d) { return d; });
};

detYMax = function(data) {
	var maxVal = 0;
	Object.keys(data).forEach(function(element) {
		if (element !== 'DateTime' && element !== 'All') {
			var val = d3.max(data[element], function(d) {return d;})
			if (val > maxVal) {maxVal = val}
		}
	});
	return maxVal;
};

plotHelper =function(d, tag) {

    var temp_data = [];

    d.DateTime.forEach(function(dTime) {
        temp_data.push([dTime, d[tag][d.DateTime.indexOf(dTime)]])
    });

    return temp_data;
};

clearPlot = function(plotNum) {
	// Clears all children on the plot
	var plot = d3.select('#plot-loc'+plotNum).select('svg').select('g');
	while (plot._groups[0][0].firstChild) {
		plot._groups[0][0].removeChild(plot._groups[0][0].firstChild);
	}
}

function powerGenColors(dataset) {
	var maxGen = {};
	var top5Source = [];
	var top5Val = [0];
	// Find the max of each power source
	Object.keys(dataset).forEach(function(element) {
		if (element !== 'DateTime' && element !== 'All') {
			maxGen[element] = d3.max(dataset[element], function(d) {return d;})
		}
	});
	
	// Finds the top 5 power sources
	Object.keys(maxGen).forEach(function(element) {
		maxGenSource = d3.max(dataset[element], function(d) {return d;})
		// Check each previous gen val
		for (i = 0; i <= top5Val.length && i < 5; i++) {
			if (top5Val.length === 0) {
				top5Val = [maxGenSource];
				top5Source = [element];
				break;
			} else if (maxGenSource > top5Val[i]) {
				top5Val.splice(i, 0, maxGenSource);
				top5Source.splice(i, 0, element);
				break;
			}
		}
	});
	var colorMap = []
	
	top5Source.slice(0, 5).forEach(function(source) {
		colorMap.push(mainVars.colorScale(source))
	});
	
	return {'source': top5Source.slice(0, 5), 'color': colorMap};
};

function emission_sum(state) {

	var tempPromise = d3.json('api/data/'+state+'_sum.json')

	tempPromise.then(function(data){
		emission_calc = Math.round((parseFloat(data.total_emissions[0])*1000000*1000000)/(parseFloat(data.total_power_gen[0])*1000000));

		d3.select('#plot-loc1').select('svg').select('g').append('text')
            .text('Effective Emissions: '+emission_calc+' gCO2/kwhr')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 60);
    })
}

changeYear1 = function(){
	var yr=d3.select(this).property('value');

	while(d3.select('#cars-dropdown1').selectAll('Select')._groups[0].length > 1) {
		d3.select('#cars-dropdown1').selectAll('Select')._groups[0][1].remove()
	}

	if (yr !== undefined) {
		mainVars.dbm1=d3.nest()
			   .key(function(d){return d.make.toString();})
			   .map(mainVars.dby1.get(yr));

		var selectmke1 = d3.select("#cars-dropdown1")
			.append("select")
	  		.style("max-width", "120px")
	  	 	.on('change', changeMake1);

		selectmke1.selectAll('option')
	  	    .data(mainVars.dbm1.keys())
	  	    .enter()
	  	    .append('option')
	  	    .text(function (d) { return d; });
    };
};

changeMake1 = function(){
	var mke=d3.select(this).property('value');
  
	while(d3.select('#cars-dropdown1').selectAll('Select')._groups[0].length > 2) {
		d3.select('#cars-dropdown1').selectAll('Select')._groups[0][2].remove()
	}

  	if (mke !== undefined) {
		mainVars.dmo1=d3.nest()
			.key(function(d){return d.model.toString();})
			   .map(mainVars.dbm1.get(mke.toString()));

		var selectmdl1 = d3.select("#cars-dropdown1")
			.append("select")
	  		.style("max-width", "120px")
	  	 	.on('change', changeModel1);

		selectmdl1.selectAll('option')
	  	    .data(mainVars.dmo1.keys())
	  	    .enter()
	  	    .append('option')
	  	    .text(function (d) { return d; });
    };
}

changeModel1 = function(){
	var mdl=d3.select(this).property('value');
}