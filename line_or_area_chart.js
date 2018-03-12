// https://bl.ocks.org/mbostock/3883245

let margin = {top: 20, right: 20, bottom: 80, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let dateParser = d3.timeParse("%d-%b-%y");  // 1

let svg = d3.select("body")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

let g = d3.select("svg")
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);



d3.tsv('line_or_area_chartData.tsv', lineCallback);

function lineCallback (error, data) {
    if (error) throw error;

    data.forEach(d => {
        d.date = dateParser(d.date);
        d.close = +d.close;
    })

    let xScale =
        d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .rangeRound([0, width])                     // 2

    let yScale =
        d3.scaleLinear()
            .domain(d3.extent(data, d => d.close))
            // .domain([0, d3.max(data, d=> d.close)])
            // .domain([0, d3.max(data, d => Math.max(d.close, d.open))]) // 2.5
            .rangeRound([height, 0])                    // 2, 3

    const xAxis = d3.axisBottom(xScale)
        // .ticks(20)
        // .tickSize(25)
        .ticks(d3.timeMonth.every(1))  // 4
    // .tickFormat(d3.timeFormat("%Y-%m-%d"))   // 5

    const yAxis = d3.axisLeft(yScale)
                            // .tickSize(25);

    let lineMaker =
        d3.line()
            .x(d => xScale(d.date))
            .y(function(d) { return yScale(d.close); })
            // .curve(d3.curveBasis)                          // 6

    const area = d3.area()
        .x(d => xScale(d.date))
        .y0(height)
        .y1(function(d) { return yScale(d.close); });

    // generate axes and add to DOM

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            // .style("font", "14px times")     // default is 10px sans-serif
            // .attr("textLength", "150")
            // .attr("lengthAdjust", "spacing")
            // .attr("lengthAdjust", "spacingAndGlyphs")
            .style("text-anchor", "end")
            .attr('transform','rotate(-65)')    // increase bottom margin to compensate


    g.append("g")
        .call(yAxis)
        // .style("stroke-dasharray", ("3, 3")) // alt "3, 10, 1, 20"
        .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            // .style("writing-mode", "tb")
            // .style("glyph-orientation-vertical", 0)
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            // .attr("textLength", "150")
            // .attr("lengthAdjust", "spacing")    // alt "spacingAndGlyphs")
            .text("Price ($)");

    // add the area

    g.append("path")
        .datum(data)
        .style("fill", "lightgreen")
        .style("fill-opacity", ".5")
        .attr("d", area);

    // Add grid lines

    // const make_x_gridlines = () => (
    //     d3.axisBottom(xScale)
    //         .ticks(45)
    // )
    //
    // const make_y_gridlines = () => (
    //     d3.axisLeft(yScale)
    //         .ticks(10)
    // )
    //
    // g.append("g")
    //     .attr("class", "grid")
    //     .attr("transform", `translate(0, ${height})`)
    //     .call(make_x_gridlines()
    //         .tickSize(-height)
    //         .tickFormat("")             // suppress label
    //     )
    //
    // g.append("g")
    //     .attr("class", "grid")
    //     .call(make_y_gridlines()
    //         .tickSize(-width)
    //         .tickFormat("")             // suppress label
    //     )

    // add the line

    g.append("path")
        .datum(data)
            .style("fill", "none")
            .style("stroke", "steelblue")
            // .style("stroke-opacity", ".5")
            // .style("opacity", ".5")
            .style("stroke-linejoin", "round") // alt 'miter' (default), 'bevel'
            .style("stroke-linecap", "round") // alt 'butt', 'square'
            .style("stroke-width", 1.5)
            // .style("stroke-dasharray", ("3, 3"))
            .attr("d", lineMaker);

    //////////////////// label the endpoint of a line /////////////////////
    //
    // svg.append("text")
    //     .attr("transform", "translate("+(width+53)+","+yScale(data[data.length-1].close)+")")
    //     .attr("transform", `translate(${width+53},${yScale(data[data.length-1].close)})`)
    //     .attr("dy", ".35em")
    //     .attr("text-anchor", "start")
    //     .style("fill", "red")
    //     .text("Open");

}

// 1 -  converts "21-Oct-18" into a Date object
// 2 -  rangeRound outputs whole numbers, to avoid pixel blur
// 2.5 - chooses the highest value if you are charting two lines
// 3 -  note the coordinate space is inverted on y axis
// 4 -  timeMillisecond, timeSecond, timeMinute, timeHour
//      timeDay, timeWeek (aka timeSunday), timeTuesday etc
//      timeMonth, TimeYear
// 5 -  %a - abbreviated weekday name.
//      %A - full weekday name.
//      %b - abbreviated month name.
//      %B - full month name.
//      %c - date and time, as “%a %b %e %H:%M:%S %Y”.
//      %d - zero-padded day of the month as a decimal number [01,31].
//      %e - space-padded day of the month as a decimal number [ 1,31].
//      %H - hour (24-hour clock) as a decimal number [00,23].
//      %I - hour (12-hour clock) as a decimal number [01,12].
//      %j - day of the year as a decimal number [001,366].
//      %m - month as a decimal number [01,12].
//      %M - minute as a decimal number [00,59].
//      %p - either AM or PM.
//      %S - second as a decimal number [00,61].
//      %U - week number of the year (Sunday as the first day of the week) as a decimal number [00,53].
//      %w - weekday as a decimal number [0(Sunday),6].
//      %W - week number of the year (Monday as the first day of the week) as a decimal number [00,53].
//      %x - date, as “%m/%d/%y”.
//      %X - time, as “%H:%M:%S”.
//      %y - year without century as a decimal number [00,99].
//      %Y - year with century as a decimal number.
//      %Z - time zone offset, such as “-0700”.
//      There is also a literal “%” character that can be presented by using double % signs.
// 6 -  https://github.com/d3/d3-shape/blob/master/README.md#curve
//      visual examples at https://leanpub.com/d3-t-and-t-v4/read
//      curveLinear – Normal line (jagged).
//      curveLinearClosed - A normal line (jagged) families of curves available with the start and the end closed in a loop.
//      curveStep - a stepping graph alternating between vert and horiz segments. The y values change at the mid point of the adjacent x values
//      curveStepBefore - y values change before the x value.
//      curveStepAfter - y values change after the x value.
//      curveBasis - a B-spline, with control point duplication on the ends (that’s the one above).
//      curveBasisOpen - an open B-spline; may not intersect the start or end.
//      curveBasisClosed - a closed B-spline, with start and end closed in a loop.
//      curveBundle - equivalent to basis, except a separate tension parameter is used to straighten the spline. This could be really cool with varying tension.
//      curveCardinal - a Cardinal spline, with control point duplication on the ends. It looks slightly more ‘jagged’ than basis.
//      curveCardinalOpen - an open Cardinal spline; may not intersect the start or end, but will intersect other control points. So kind of shorter than ‘cardinal’.
//      curveCardinalClosed - a closed Cardinal spline, looped back on itself.
//      curveMonotoneX - cubic interpolation that makes the graph only slightly smoother.
//      curveCatmullRom - a cubic Catmull–Rom spline
//      curveCatmullRomClosed - a closed cubic Catmull–Rom spline
//      curveCatmullRomOpen - an open cubic Catmull–Rom spline