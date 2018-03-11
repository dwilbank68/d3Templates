// https://bl.ocks.org/seemantk/ec245e1f4e824e685982dd5d3fbb2fcc

let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("body")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

let g = d3.select("svg")
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

// let dateParser = d3.timeParse("%d-%b-%y");      // "21-Oct-18"
let dateParser = d3.timeParse("%d-%m-%Y");      // "21-09-2018"

// d3.tsv('barchartData.tsv', barCallback);
d3.csv('histogramData.csv', barCallback);

function barCallback (error, data) {
    if (error) throw error;

    /////////// process data for histogram //////////
    //
    data.forEach(function(d) {
        d.date = dateParser(d.dtg);
        d.value = +d.value;
    });

    /////////// process data for barchart ///////////
    //
    // data.forEach(d => {
    //     d.frequency = +d.frequency;
    // })

    ///////////////// xScale for bar chart (one val per bar) ///////////////////
    //
    // let xScale =
    //     d3.scaleBand()
    //         .domain(data.map(d => d.letter))
    //         .rangeRound([0, width], .1)                     // 2
    //         .padding(0.1)
    //         // .paddingInner(0.1)

    ///////////// xScale for histogram (range of values per bar) //////////////
    //
    let xScale =
        d3.scaleTime()
            .domain([new Date(2010, 6, 3), new Date(2012, 0, 1)])
            .rangeRound([0, width]);


    /////////////// yScale for bar chart ////////////////
    //
    // let yScale =
    //     d3.scaleLinear()
    //         .domain([0, d3.max(data, d => d.frequency)])
    //         .range([height, 0])                    // 3
    //

    ///////// histogram, bins and yScale for histogram //////////
    //
    const histogram =
        d3.histogram()
            .value( d => d.date)
            .domain(xScale.domain())
            .thresholds(xScale.ticks(d3.timeMonth));    // 3.5

    let bins = histogram(data);

    let yScale =
        d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([height, 0])                    // 3
    //
    ////////////////////////////////////////////////////////////

    // generate axes and add to DOM

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
        // .ticks(10, "%");

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    g.append("g")
        .call(yAxis)
        .append('text')
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("stroke", "black")
            .text("Frequency");

    //////////////// add the bars ///////////////
    //
    // g.selectAll("rect")
    //     .data(data)
    //     .enter()
    //     .append('rect')
    //         .attr("fill", "steelblue")
    //         .attr("x", d => xScale(d.letter))
    //         .attr("width", xScale.bandwidth())
    //         .attr("y", d => yScale(d.frequency))
    //         .attr("height", d => height - yScale(d.frequency));

    ///////////// add the histogram bars /////////
    //
    g.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr('fill', 'red')
            .attr("x", 1)
            .attr("transform", function(d) {
                return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
            .attr("width", function(d) { return d3.max([0, xScale(d.x1) - xScale(d.x0) - 1]); })
            .attr("height", d => height - yScale(d.length));
}


// 2 -  rangeRound outputs whole numbers, to avoid pixel blur
// 3 -  note the coordinate space is inverted on y axis
// 3.5 -    timeWeek, timeDay, timeYear