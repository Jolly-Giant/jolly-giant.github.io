// Main script for plotting
// moduleauthor: Michael Karsten

// Defines main plotting variables
var mainVars = {
	margin : {top: 5, right: 30, bottom: 5, left: 40, padding: 15},
    colorScale : d3.scaleOrdinal(d3.schemeCategory10)
};

mainVars.width = 460 - mainVars.margin.left - mainVars.margin.right;
mainVars.height = 500 - mainVars.margin.top - mainVars.margin.bottom;
mainVars.xScale = d3.scaleTime().range([0, mainVars.width-10]);
mainVars.yScale = d3.scaleLinear().range([mainVars.height-50, 120]);
mainVars.xBar = d3.scaleLinear().range([0, mainVars.width-10]);
mainVars.yBar = d3.scaleLinear().range([mainVars.height-50, 100]);

/**
 * Initializes the first plot and its dropdown
 * @constructor
 */
initializePlot1 = function() {
	var stateList=["AL-Alabama","AK-Alaska","AZ-Arizona","AR-Arkansas","CA-California","CO-Colorado","CT-Connecticut","DE-Delaware","FL-Florida","GA-Georgia",
		"HI-Hawaii","ID-Idaho","IL-Illinois","IN-Indiana","IA-Iowa","KS-Kansas","KY-Kentucky","LA-Louisiana","ME-Maine","MD-Maryland",
		"MA-Massachusetts","MI-Michigan","MN-Minnesota","MS-Mississippi","MO-Missouri","MT-Montana","NE-Nebraska","NV-Nevada","NH-New Hampshire","NJ-New Jersey",
		"NM-New Mexico","NY-New York","NC-North Carolina","ND-North Dakota","OH-Ohio","OK-Oklahoma","OR-Oregon","PA-Pennsylvania","RI-Rhode Island","SC-South Carolina",
		"SD-South Dakota","TN-Tennessee","TX-Texas","UT-Utah","VT-Vermont","VA-Virginia","WA-Washington","WV-West Virginia","WI-Wisconsin","WY-Wyoming", "USA-US Total"];

	// Adjust ColorScale
	mainVars.colorScale.domain(['Coal','Natural Gas','Nuclear','Biomass','Wind','All Solar','Geothermal','Petroleum Liquids','Petroleum Coke','Hydro'])

	// First, add a dropdown
	var selectp1 =d3.select("#state-dropdown")
		.append("select")
    	.on('change',changeP1);

	var optionsp1 = selectp1.selectAll('option')
		.data(stateList)
		.enter()
		.append('option')
		.text(function (d) { return d; });

    // Create Plot
	var plot1 = d3.select('#plot-loc1').append('svg')
		.attr('width', mainVars.width + mainVars.margin.left + mainVars.margin.right)
		.attr('height', mainVars.height + mainVars.margin.top + mainVars.margin.bottom)
		.append('g')
		.attr('transform', 'translate('+mainVars.margin.left+','+mainVars.margin.top+')');

	pullStateData('AL');
}

/**
 * Initializes the second plot and its group of dropdowns
 * @constructor
 */
initializePlot2 = function() {

	var tempPromise = d3.csv('api/data/vehicle.csv');

	// Initialize plot2 drowpdown data
	tempPromise.then(function(data){
		mainVars.dby1=d3.nest()
			.key(function(d){return d.year;})
			.map(data);

		var selectyr1 = d3.select("#cars-dropdown1")
    		.append("select")
    		.on('change', changeYear1);

		selectyr1.selectAll('option')
			.data(mainVars.dby1.keys())
			.enter()
			.append('option')
			.text(function (d) { return d; });
    });

	d3.select('#plot-loc2').append('svg')
    	.attr('width', mainVars.width + mainVars.margin.left + mainVars.margin.right+90)
    	.attr('height', mainVars.height + mainVars.margin.top + mainVars.margin.bottom)
    	.append('g')
    	.attr('transform', 'translate('+mainVars.margin.left+','+mainVars.margin.top+')');
}

/**
 * Initializes the third plot
 * @constructor
 */
initializePlot3 = function() {
	var xScale3 = d3.scaleLinear().range([0, mainVars.width]);
    var yScale3 = d3.scaleLinear().range([mainVars.height-100, 0]);
}

// Calls functions to generate plots
initializePlot1();
initializePlot2();
initializePlot3();