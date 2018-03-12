// flat from csv - https://bl.ocks.org/d3noob/1dbf3d4abe0ab53f8c4c6bd24192bb6b

// let margin = {top: 40, right: 30, bottom: 50, left: 30}, // for vertical tree
let margin = {top: 20, right: 90, bottom: 30, left: 90}, // for horizontal tree
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("body")
    .append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

let g = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let treemap =
    d3.tree()
    // .size([width, height]);     // for vertical tree
        .size([height, width]);     // for horizontal tree

// d3.json("treeData.json", treeCallback)
d3.csv("treeData_flat.csv", treeCallback)

// function treeCallback(error, treeData) {
function treeCallback(error, flatData) {
    if (error) throw error;

    //////////// if using flat csv data /////////////////////
    flatData.forEach(d => {
        if (d.parent == "null") d.parent = null;
    });

    var treeData = d3.stratify()
        .id(d => d.name)
        .parentId(d => d.parent)
        (flatData);

    treeData.each(function(d) {
        d.name = d.id;
    });
    //////////////////////////////////////////////////////////

    let nodes = d3.hierarchy(treeData);
    // defaults to d3.hierarchy(treeData, d => d.children);
    // now every node contains the following:
    //   .data - the data associated with the node (node.data.name)
    //   .depth - a representation of the depth or number of hops from the initial ‘root’ node.
    //   .height - the greatest distance from any descendant leaf nodes
    //   .parent - the parent node, or null if it’s the root node
    //   .children - child nodes or undefined for any leaf nodes

    nodes = treemap(nodes);

    let link =
        g.selectAll(".link")
            .data( nodes.descendants().slice(1) )           // 1
            .enter()
            .append("path")
            .style('fill', 'none')
            .style('stroke', 'black')
            // .style("stroke", d => d.data.level)
            .style('stroke-width', '2px')
            .attr("d", d => (
                // curved link lines - vertical tree
                // `M${d.x}, ${d.y}
                //  C${d.x}, ${(d.y + d.parent.y) / 2}
                //   ${d.parent.x}, ${(d.y + d.parent.y) / 2}
                //   ${d.parent.x}, ${d.parent.y}`

                // straight link lines - vertical tree
                // `M${d.x}, ${d.y}
                // L${d.parent.x}, ${d.parent.y}`

                // curved link lines - horizontal tree
                `M${d.y}, ${d.x}
                 C${(d.y + d.parent.y) / 2}, ${d.x}
                  ${(d.y + d.parent.y) / 2}, ${d.parent.x}
                  ${d.parent.y}, ${d.parent.x}`

                // straight link lines - horizontal tree
                // `M${d.y}, ${d.x}
                // L${d.parent.y}, ${d.parent.x}`
            ));

    var node =
        g.selectAll(".node")
            .data(nodes.descendants())
            .enter()
            .append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf") )
            // .attr("transform", d => `translate(${d.x}, ${d.y})`)    // vertical tree
            .attr("transform", d => `translate(${d.y}, ${d.x})`)    // horizontal tree

// DRAW NODES - circles
node.append("circle")
    .attr("r", 10)
    // .attr("r", d => d.data.value)
    .style('fill', 'white')
    // .style("fill", d => d.data.level)
    .style('stroke', 'steelblue')
    // .style("stroke", d => d.data.type)
    .style('stroke-width', '3px')

// DRAW NODES - to use symbols instead of circles
// node.append("path")
//     .style("stroke", d => d.data.type)
//     .style("fill", d => d.data.level)
//     .attr("d", d3.symbol()
//         .size(d => d.data.value * 30)
//         .type(d => {
//             if (d.data.value >= 9) return d3.symbolCross;
//             if (d.data.value <= 9) return d3.symbolDiamond;
//         })
//     );

// DRAW NODES - use images instead of circles
//     node.append("image")
//         .attr("xlink:href", d => d.data.icon)
//         .attr("x", "-12px")
//         .attr("y", "-12px")
//         .attr("width", "24px")
//         .attr("height", "24px");

    node.append("text")
        .attr("dy", ".35em")
        // .attr("y", d => d.children ? -20 : 20 )     // for vertical tree - see note 4
        .attr("x", d => d.children ? -18 : 18 )     // for horizontal tree - see note 4
        // .attr("x", d => d.children ? (d.data.value + 8) * -1 : d.data.value + 8 )   // 4.5
        // .style("text-anchor", "middle")     // for vertical tree
        .style("text-anchor", d => d.children? "end" : "start")     // for horizontal tree
        .style("font", "12px sans-serif")
        .style("text-shadow", "0 5px 0 #fff, 0 -5px 0 #fff, 5px 0 0 #fff, -5px 0 0 #fff")   // 5
        .text(function(d) { return d.data.name; });

}




// 1 -  to omit the root, otherwise code would try to draw line from root to its parent, and fail
// 2 -  rangeRound outputs whole numbers, to avoid pixel blur
// 2.5 - chooses the highest value if you are charting two lines
// 3 -  note the coordinate space is inverted on y axis
// 4 -  if the node has no children, move label accordingly
// 4.5 - if radius of circle depends on 'value', moves text according to 'value' as well
// 5 -  so that text stands out above link lines
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