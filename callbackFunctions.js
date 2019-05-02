// Contains the callback functions

changeP1 = function(){
	// Oh my, I was called back!
	// Should update all plots because states are important!
	mainVars.id = d3.select("select").property('value').split('-')[0];
	clearPlot('1');
	pullStateData(mainVars.id);
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

clearEmissions = function(index){
	mainVars.car[index] = '';
	mainVars.emissionsData[index] = 0;
  	mainVars.emissionsLabel[index] = '';
  	mainVars.fuelType[index] = '';
}

changeYear = function(){
	// Select the year, and determine which dropdown was called back
	var yr = d3.select(this).property('value');
	var selectName = d3.select(this.parentNode).property('id');
	var selectNum = selectName[selectName.length-1];

	while(d3.select('#cars-dropdown'+selectNum).selectAll('Select')._groups[0].length > 1) {
		d3.select('#cars-dropdown'+selectNum).selectAll('Select')._groups[0][1].remove()
	}

	if (yr !== undefined) {
		mainVars.dbm1=d3.nest()
			   .key(function(d){return d.make.toString();})
			   .map(mainVars.dby1.get(yr));

		var selectmke1 = d3.select("#cars-dropdown"+selectNum)
			.append("select")
	  		.style("max-width", "120px")
	  	 	.on('click', changeMake);

		selectmke1.selectAll('option')
	  	    .data(mainVars.dbm1.keys())
	  	    .enter()
	  	    .append('option')
	  	    .text(function (d) { return d; });

	  	// Clear emissions data
	  	clearEmissions(selectNum-1);
    };
};

changeMake = function(){
	// Select the make, and determine which dropdown was called back
	var mke=d3.select(this).property('value');
	var selectName = d3.select(this.parentNode).property('id');
	var selectNum = selectName[selectName.length-1];
  
  	// Clear old dropdowns
	while(d3.select('#cars-dropdown'+selectNum).selectAll('Select')._groups[0].length > 2) {
		d3.select('#cars-dropdown'+selectNum).selectAll('Select')._groups[0][2].remove()
	}

  	if (mke !== undefined) {
  		// get current dbm1
  		var yr = d3.select('#cars-dropdown'+selectNum).select('select').property('value');
  		mainVars.dbm1=d3.nest()
			   .key(function(d){return d.make.toString();})
			   .map(mainVars.dby1.get(yr));

		mainVars.dmo1=d3.nest()
			.key(function(d){return d.model.toString();})
			   .map(mainVars.dbm1.get(mke.toString()));

		var selectmdl1 = d3.select("#cars-dropdown"+selectNum)
			.append("select")
	  		.style("max-width", "120px")
	  	 	.on('click', changeModel);

		selectmdl1.selectAll('option')
	  	    .data(mainVars.dmo1.keys())
	  	    .enter()
	  	    .append('option')
	  	    .text(function (d) { return d; });

  	    clearEmissions(selectNum-1);
    };
}

changeModel = function(){
	var mdl = d3.select(this).property('value');
	var selectName = d3.select(this.parentNode).property('id');
	var selectNum = selectName[selectName.length-1];

	if (mdl !== undefined){
		// Get current year and make, and adjust options
		var yr = d3.select(d3.select('#cars-dropdown'+selectNum).selectAll('select')._groups[0][0]).property('value')
		var mke = d3.select(d3.select('#cars-dropdown'+selectNum).selectAll('select')._groups[0][1]).property('value')

		dbe=d3.nest()
  	   .key(function(d){if(parseInt(d.co2TailpipeAGpm)==0){
  	   			return parseFloat(d.co2TailpipeGpm);}
			else {
				return (parseFloat(d.co2TailpipeGpm)+parseFloat(d.co2TailpipeAGpm)/2);}})
  	   .map(mainVars.dmo1.get(mdl.toString()));

		dbf=d3.nest()
			.key(function(d){
				if(d.fuelType1=='Electricity'){
					mainVars.fuelType[selectNum-1] = 'electric';
					return parseFloat(d.combE);}
		  		else if(d.fuelType2=='Electricity'){
		  			mainVars.fuelType[selectNum-1] = 'hybrid';
		  			uf=parseFloat(d.combinedUF);
		  			return parseFloat(d.combE);
		  		}else {
		  			mainVars.fuelType[selectNum-1] = 'gas';
		  		}
		  		})
			.map(mainVars.dmo1.get(mdl.toString()));

		mainVars.car[selectNum-1] = mdl;
		clearPlot('2');
		vehEmissionCalc();
	};
}

vehEmissionCalc = function(changeType) {
	var text = d3.select('#plot-loc1').select('svg').select('g').selectAll('text')._groups[0];
	var elecEmissions = parseFloat(text[text.length-1].firstChild.data.split(' ')[2]);

	// Helper function
	addMainVars = function(index, em){
		mainVars.emissionsData.splice(index,1,em);
		mainVars.emissionsLabel.splice(index,1,mainVars.car[i].toString());
	}

	if (changeType === 'state'){
		for (i=0; i<3; i++){
			if(mainVars.fuelType[i]==='electric'){
				em=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em=em*elecEmissions;
				addMainVars(i, em);
			};
		};
	}else{
		for (i=0; i<3; i++){
			if(mainVars.fuelType[i]==='electric'){
				em=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em=em*elecEmissions;
				addMainVars(i, em);
			}else if(mainVars.fuelType[i]==='hybrid'){
				em=(d3.mean(dbf.keys(),function(d){return d;}))/100;
				em=em*elecEmissions*uf;
				em=em+(d3.mean(dbe.keys(),function(d){return d;})*(1-uf));
				addMainVars(i, em);
			}else if(mainVars.fuelType[i]==='') {
				// Do nothing
			}else{
				em=d3.mean(dbe.keys());
				addMainVars(i, em);
			};
		};
	}

	drawPlot2();
}

drawPlot2 = function(){
	mainVars.xBar.domain([0,4])	
	mainVars.yBar.domain([0,d3.max(mainVars.emissionsData)+50]);

	var plot2 = d3.select('#plot-loc2').select('svg').select('g');

	var drawBars = plot2.selectAll('bar')
        .data(mainVars.emissionsData)
        .enter().append('rect')
        .attr('x', function(d,i) {return mainVars.xBar(i+1);})
		.attr('width', 50)
        .attr('y', function(d) {return mainVars.yBar(0)})
    	.attr('height', function(d) {return 0})
    	.style('opacity',.7)
        .style('fill',function(d,i){if(mainVars.fuelType[i]=='gas'){
        		return 'grey';}
			else if(mainVars.fuelType[i]=='electric') {
				return 'green';}
			else{return 'blue';}
		})
    	.on("mouseenter", function(actual,i){
    		d3.select(this)
    		.style('opacity',1.0)
    		.attr("width",60)
    	})
    	.on("mouseleave",function(actual,i){
    		d3.select(this)
        	.style('opacity',.7)
    		.attr("width",50)
    	});

    // Transition lines from 0 to height
    drawBars.transition()
    	.delay(function (d, i) { return i*50; })
   	    .ease(d3.easeLinear)
   	    .duration(350)
   	    .attr('y', function(d) {return mainVars.yBar(d)})
    	.attr('height', function(d) {return mainVars.yBar(0) - mainVars.yBar(d)})

    plot2.append('g')
    	.attr("transform", "translate("+20+",0)")
        .call(d3.axisLeft(mainVars.yBar))
                
    plot2.append('g')
        .attr("transform", "translate("+20+"," + (mainVars.height-50) + ")")
        .call(d3.axisBottom(mainVars.xBar).ticks(0))

    plot2.append('g')
		.selectAll('text')
		.data(mainVars.emissionsLabel).enter()
		.append('text')
		.attr('x', function(d,i){return mainVars.xBar(i+1)+25;})
     	.attr('y', function(d){return mainVars.yBar(0)+25;})
		.text(function(d){return d;})
		.attr('fill','black')
		.style("font-size", "12px")
		.attr('text-anchor','middle');

    plot2.append("text")
		.attr("transform","translate(" + 0 + " ," +(250) + ")")
		.attr("dx","-250")
    	.attr("dy","-20")
	  	.style("text-anchor", "middle")
	  	.attr("transform","rotate(-90)")
	  	.style("font-size", "14px")
	  	.text("CO2 Emissions (grams/mile)");

	// Add clip cars to plot
  	for(i=0;i<3;i++){
		plot2.append('svg:image')
			.attr('xlink:href','./images/'+mainVars.fuelType[i]+'.png')
			.attr('x',mainVars.xBar(i+1))
			.attr('y',mainVars.yBar(mainVars.emissionsData[i])-50)
			.attr("width",50)
			.attr("height",50);
    }
};