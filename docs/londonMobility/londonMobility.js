// set the dimensions and margins of the graph
let margin = {top: 30, right: 5, bottom: 50, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    tickHeight = 27;

let DURATION = 1000;

let DATASETS = ["TfL_Bike", "google_parks", "google_residential", "google_grocery_pharmacy", "apple_driving",
     "apple_walking", "apple_transit", "citymapper", "google_workplaces", "google_retail_recreation", "google_transit",
    "tomtom", "TfL_Bus", "TfL_Tube", "waze"];

// parse the date / time
let parseTime = d3.timeParse("%Y-%m-%d"),
    formatDate = d3.timeFormat("%d-%b-%y"),
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

const formatMonth = d3.timeFormat("%b"),
    formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
    return (d3.timeYear(date) < date ? formatMonth : formatYear)(date);
}

// set the ranges
let x = d3.scaleTime().range([0, width]);
let y = d3.scaleLinear().range([height, 0]);

// define the lines
let lines = {};
DATASETS.forEach(function (ds) {
    lines[ds] = d3.line()
        .defined( (d) => !isNaN(d[ds]) )
        .x( (d) => x(d.date) )
        .y( (d) => isNaN(d[ds]) ? 100 : y(d[ds]) )
})

let visible = new Set();
for (let i=0; i<DATASETS.length; i++) {
    visible.add(i);
}
let mobilityData = null;
let lockdownData = null;
let dataExtents = null;
let timeExtents = null;

function calcExtent(extents) {
    // Only considers visible elements
    let e = extents.filter((d, i) => visible.has(i))
    return [d3.min(e, (d) => d[0] ),
        d3.max(e, (d) => d[1] )]
}

function render() {
    y.domain(calcExtent(dataExtents));
    x.domain(calcExtent(timeExtents));

    svg.select("g .y.axis").transition().duration(DURATION).call(d3.axisLeft(y).tickFormat( (d) => d+'%'));
    svg.select("g .x.axis").transition().duration(DURATION).call(d3.axisBottom(x).tickSize(tickHeight).tickFormat(multiFormat).tickArguments([d3.timeMonth.every(1)]));

    // transition to new axes
    //let datasets = DATASETS.filter((d, i) => visible.has(i));
    for (let ds of DATASETS) {
        svg.select("#line_"+ds).transition().duration(DURATION).attr("d", lines[ds]);
    }
    // Updates zero line
    svg.select("#line_zero").transition().duration(DURATION)
        .attr("y1", y(100))
        .attr("y2", y(100));

    // Updates covid lockdown level
    svg.select("g").selectAll("rect.level").transition().duration(DURATION)
        .attr("x", (d) => x(d.dateFrom) )
        .attr("y", height)
        .attr("width", (d) => x(d.dateTo) - x(d.dateFrom) )
        .attr("height", tickHeight);

    svg.selectAll("rect.lockdown").transition().duration(DURATION)
        .attr("x", (d) => x(d.dateFrom))
        .attr("y", 0)
        .attr("width", (d) => x(d.dateTo) - x(d.dateFrom) )
        .attr("height", height);
}

function tickbox(inValue) {
    let checkBox = document.getElementById(inValue);
    let di = DATASETS.indexOf(inValue);
    if (checkBox.checked === false && visible.has(di)) {
        visible.delete(di);
        svg.select("#line_"+inValue).style("display", "none");
    } else if (checkBox.checked === true && !visible.has(di)) {
        visible.add(di);
        svg.select("#line_"+inValue).style("display", "inline");
    }
    render();
}

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select("#mobilityGraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text").attr("class","title").attr("x",width/2).attr("y",-8).text("London Mobility change");

Promise.all([d3.csv("londonMobility/all_london.csv"), d3.csv("londonMobility/london_lockdown_level.csv")]).then(function (data) {
    data[0].forEach(function (d) {
        //return {date: parseTime(d.date), cases:+d.cases, deaths:+d.deaths};
        d.date = parseTime(d.date);
        for (let ds of DATASETS) {
            d[ds] = parseFloat(d[ds]);
        }
    });
    data[1].forEach(function (d) {
        d.dateFrom = parseTime(d.dateFrom);
        d.dateTo = parseTime(d.dateTo);
        d.level = +d.level;
    });

    // Saves data for outside access
    mobilityData = data[0];
    lockdownData = data[1];

    // Scale the range of the data
    dataExtents = DATASETS.map(function(ds) {
        return d3.extent(data[0], (d) => d[ds]);
    });
    timeExtents = DATASETS.map(function (ds) {
        return d3.extent(data[0].filter((d) => !isNaN(d[ds])), (d) => d.date)
    });

    y.domain(calcExtent(dataExtents));
    x.domain(calcExtent(timeExtents));

    // Add covid lockdown level
    svg.append("g").selectAll("rect")
        .data(data[1])
        .enter().append("rect")
        .attr("class", (d) => "level l" + d.level )
        .attr("x", (d) => x(d.dateFrom) )
        .attr("y", height)
        .attr("width", (d) => x(d.dateTo) - x(d.dateFrom) )
        .attr("height", tickHeight);

    // Add lockdown shaded box
    // noinspection EqualityComparisonWithCoercionJS
    svg.append("g").selectAll("rect")
        .data(data[1].filter( (d) => d.level==5) )
        .enter().append("rect")
        .attr("class", "lockdown")
        .attr("x", (d) => x(d.dateFrom))
        .attr("y", 0)
        .attr("width", (d) => x(d.dateTo) - x(d.dateFrom) )
        .attr("height", height);

    svg.append("line")
        .attr("class", "line zero")
        .attr("id", "line_zero")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(100))
        .attr("y2", y(100));

    // Add the lines path.
    for (let ds of DATASETS) {
        svg.append("path")
            .data( [data[0]] )
            .attr("class", "line "+ds)
            .attr("id", "line_"+ds)
            .attr("d", lines[ds]);
    }

    // Add the x Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(tickHeight).tickFormat(multiFormat).tickArguments([d3.timeMonth.every(1)]));

    // Add the y Axes
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).tickFormat( (d) => d+'%') )
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -(height / 4))
        .attr("dy", "1em")
        .text("Percentage of pre-covid demand");

    // Add label
    svg.append("text")
        .attr("class", "label")
        .attr("x",-margin.left)
        .attr("y",height+11)
        .text("Restriction")
    svg.append("text")
        .attr("class", "label")
        .attr("x",-margin.left+2)
        .attr("y",height+11)
        .attr("dy", "0.9em")
        .text("stringency")

    // Tooltip - data
    let focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .attr("y1", 0)
        .attr("y2", height);

    // place the date at the intersection
    focus.append("text")
        .attr("class", "tooltip back date")
        .attr("dx", -4)
        .attr("dy", "-1.5em");
    focus.append("text")
        .attr("class", "tooltip front date")
        .attr("dx", -4)
        .attr("dy", "-1.5em");

    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);
});

function mousemove() {
    let x0 = x.invert(d3.pointer(event, this)[0]),
        y0 = y.invert(d3.pointer(event, this)[1]),
        i = bisectDate(mobilityData, x0, 1),
        d0 = mobilityData[i - 1],
        d1 = mobilityData[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    let focus = svg.select("g.focus");

    focus.select("text.tooltip.back.date")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            (y(y0)+10) + ")")
        .text(formatDate(d.date));
    focus.select("text.tooltip.front.date")
        .attr("transform",
            "translate(" + x(d.date) + "," +
            (y(y0)+10) + ")")
        .text(formatDate(d.date));
    focus.select(".x")
        .attr("x1", x(d.date))
        .attr("x2", x(d.date))

    for (let ds of DATASETS) {
        if (isNaN(d[ds])) {
            d3.select("#" + ds + "_fig").text("")
        } else {
            d3.select("#" + ds + "_fig").text((Math.round(d[ds]*100)/100)+"%")
        }
    }
}