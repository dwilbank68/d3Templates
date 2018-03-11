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


d3.tsv('barchartNegData.tsv', barNegCallback);

function barNegCallback (error, data) {
    if (error) throw error;

    data.forEach(d => {
        d.value = +d.value;
    })
    //
    let values = data.map(d => d.value);
    let x0 = Math.max(-d3.min(values), d3.max(values));         // 0

    let xScale =
        d3.scaleLinear()
            // .domain([-x0, x0])                              // 0
            .domain(d3.extent(data, d => d.value)).nice()
            .range([0, width])                              // 3
window.xScale = xScale;
    let yScale =
        d3.scaleBand()
            .domain(data.map(d => d.name))
            .rangeRound([0, height], .2)                     // 2

    // generate axes and add to DOM

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
    //


    // add the bars

    g.selectAll(".bar")
        .data(data)
        .enter()
        .append('rect')
            .attr("fill", d => d.value < 0 ? "steelblue" : "red")
            .attr("x", d => xScale(Math.min(0, d.value)))
            .attr("y", d => yScale(d.name))
            .attr("height", yScale.bandwidth() - 5)
            .attr("width", d => Math.abs(xScale(d.value) - xScale(0)))

    g.append("g")
        .attr("transform", `translate(${xScale(0)}, 0)`)
        .call(yAxis)

}

// 0 -  use if you want the zero axis to be centered
// 1 -  "21-Oct-18"
// 2 -  rangeRound outputs whole numbers, to avoid pixel blur
// 3 -  note the coordinate space is inverted on y axis