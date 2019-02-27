// Define plot boundaries
var margin = {top: 5, right: 5, bottom: 20, left: 15, padding: 15},
    width = 420 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// Define plot scale outputs
var xScale = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]),
    xBar = d3.scaleLinear().range([0+margin.padding, width-margin.padding]),
    yBar = d3.scaleLinear().range([height, 0]);

// Create electricity plot body
var plot1 = d3.select('#plot-loc').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate('+margin.left+','+margin.top+')');

// Create bar plot of emissions
var plot2 = d3.select('#plot-loc').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate('+margin.left+','+margin.top+')');

var key = 'c8250a81219eaa7fe21c6c311a75b993',
    state = 'GA';

var drawLine = d3.line()
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return yScale(d[1]); });

function barTransform(src) {
    if (src === 'EV') {
        return xBar(1);
    } else {
        return xBar(2);
    };
};

// API connect and data pull
function pullData(id) {
    //TODO: Dummy emissions data
    var emissionsData = [{type: 'EV', emissions: 5}, {type: 'Gas', emissions: 7}];


    // Create API connection request
    var request = new XMLHttpRequest();

    request.open('GET', 'http://api.eia.gov/series/?api_key='+key+'&series_id='+id, true);

    request.onload = function() {
        var response_data = JSON.parse(this.response);
        var data = response_data.series[0]['data'];

        data.forEach(function(d) {
            d[0] = new Date(year=d[0].slice(0,4), monthIndex=d[0].slice(-2))
            d[1] = +d[1]
        })

        // Adjust scale domain based on max data
        xScale.domain([d3.min(data, function(d) { return d[0];}), d3.max(data, function(d) { return d[0];})]);
        yScale.domain([d3.min(data, function(d) { return d[1];}), d3.max(data, function(d) { return d[1];})]);
        xBar.domain([0, 3]);
        yBar.domain([d3.max(emissionsData, function(d) { return d.emissions;})+2, 0])


        // Draw path
        plot1.append('path')
            .attr('d', drawLine(data))
            .attr('stroke', 'blue')
            .attr('fill', 'none')
            .attr('stroke-width', 2)

        // Draw bars
        plot2.selectAll('bar')
             .data(emissionsData)
             .enter().append('rect')
             .style('fill', 'blue')
             .attr('x', function(d) {return barTransform(d.type);})
             .attr('height', function(d) {return yBar(d.emissions);})
             .attr('y', function(d) {return height-yBar(d.emissions)})
             .attr('width', 50)

    }

    request.send();
}

pullData('ELEC.GEN.NG-'+state+'-99.M');

// Y-axis
plot1.append('g')
     .call(d3.axisLeft(yScale)
             .ticks(5))

plot2.append('g')
     .call(d3.axisLeft(yBar))

// X-axis
plot1.append('g')
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(xScale)
             .ticks(d3.timeMonth.every(1)))

plot2.append('g')
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(xBar).ticks(0))

// Add title
plot1.append('text')
     .text('Power Generation Sources: '+state)
     .attr('class', 'title')
     .attr("text-anchor", "middle")
     .attr('x', width/2 + margin.left)
     .attr('y', 10)

plot2.append('text')
     .text('Total CO2 Emissions: '+state)
     .attr('class', 'title')
     .attr("text-anchor", "middle")
     .attr('x', width/2 + margin.left)
     .attr('y', 10)

// Add Labels
plot2.append('text')
     .text('EV')
     .attr('x', 138+25)
     .attr('y', yBar(0)+margin.bottom)
     .attr('text-anchor', 'middle')
plot2.append('text')
     .text('Gas')
     .attr('x', 261+25)
     .attr('y', yBar(0)+margin.bottom)
     .attr('text-anchor', 'middle')
