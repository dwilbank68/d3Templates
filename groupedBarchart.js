https://bl.ocks.org/mbostock/3887051

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


d3.tsv('barchartData.tsv', barCallback);

function barCallback (error, data) {
    if (error) throw error;

    data.forEach(d => {
        d.frequency = +d.frequency;
    })

    let xScale =
        d3.scaleBand()
            .domain(data.map(d => d.letter))
            .rangeRound([0, width], .1)                     // 2
            .paddingInner(0.1)

    let yScale =
        d3.scaleLinear()
            .domain([0, d3.max(data, d => d.frequency)])
            .range([height, 0])                    // 3

    // generate axes and add to DOM

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
                    .ticks(10, "%");

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

    // add the bars

    g.selectAll(".bar")
        .data(data)
        .enter()
        .append('rect')
            .attr("fill", "steelblue")
            .attr("x", d => xScale(d.letter))
            .attr("width", xScale.bandwidth())
            .attr("y", d => yScale(d.frequency))
            .attr("height", d => height - yScale(d.frequency));
}

// 1 -  "21-Oct-18"
// 2 -  rangeRound outputs whole numbers, to avoid pixel blur
// 3 -  note the coordinate space is inverted on y axis