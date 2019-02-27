// Define plot boundaries
var margin = {top: 20, right: 20, bottom: 70, left: 90},
    width = 600 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// Define plot scale outputs
var xScale = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]);

// Create plot body
var svg = d3.select('body').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate('+margin.left+','+margin.top+')');

var key = 'c8250a81219eaa7fe21c6c311a75b993';

var drawLine = d3.line()
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return yScale(d[1]); });

// API connect and data pull
function pullData(id) {
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

        // Draw path
        svg.append('path')
            .attr('d', drawLine(data))
            .attr('stroke', 'blue')
            .attr('fill', 'none')
            .attr('stroke-width', 2)

    }

    request.send();
}

pullData('ELEC.GEN.NG-GA-99.M');

// Y-axis
svg.append('g')
   .call(d3.axisLeft(yScale).ticks(5))

// X-axis
svg.append('g')
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(xScale))

svg.append('text')
   .text('Power Generation')
   .attr('class', 'title')
   .attr("text-anchor", "end")
   .attr('x', width/2 + margin.left)