// https://bl.ocks.org/mbostock/3887118
// https://bl.ocks.org/sebg/6f7f1dd55e0c52ce5ee0dac2b2769f4b

let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let dateParser = d3.timeParse("%d-%b-%y");  // 1



let svg =
    d3.select("body")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

let g =
    d3.select("svg")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

let colorScaler = d3.scaleOrdinal(d3.schemeCategory10);

d3.tsv('scatterplotData.tsv', scatterPlotCallback);

function scatterPlotCallback (error, data) {
    if (error) throw error;

    data.forEach(d => {
        d.sepalLength = +d.sepalLength;
        d.sepalWidth = +d.sepalWidth;
    });

    let xScaler =
        d3.scaleLinear()
            .domain(d3.extent(data, d => d.sepalWidth)).nice()  // 4
            .range([0, width]);

    let yScaler =
        d3.scaleLinear()
            .domain(d3.extent(data, d => d.sepalLength)).nice()
            .range([height, 0])                    // 3;

    // let lineMaker =
    //     d3.line()
    //         .x(function(d) { return xScale(d.date); })
    //         .y(function(d) { return yScale(d.close); });


    // generate axes and add to DOM

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScaler))
        .append('text')
            .attr('x', width)
            .attr('y', -6)
            .style('text-anchor', 'end')
            .style("stroke", "black")
            .text('Sepal Width (cm)');

    g.append("g")
        .call(d3.axisLeft(yScaler))
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .style("stroke", "black")
            .text("Sepal Length (cm)");

    // add the dots

    g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", d => xScaler(d.sepalWidth) )
            .attr("cy", d => yScaler(d.sepalLength) )
            .style("fill", d => colorScaler(d.species) );   // 5

    let legendArr =
        g.selectAll('.legend')
            .data(colorScaler.domain())
            .enter()
            .append('g')
            .attr('transform', (d,i) => `translate(0, ${i*20})`);

    legendArr
        .append('rect')
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScaler);

    legendArr.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);

}

// 1 -  "21-Oct-18"
// 2 -  rangeRound outputs whole numbers, to avoid pixel blur
// 3 -  note the coordinate space is inverted on y axis
// 4 -  makes the domain start & end on round values
// 5 -  puts a list of all the species on colorScaler.domain()