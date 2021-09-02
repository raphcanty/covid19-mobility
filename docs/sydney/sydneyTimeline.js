// set the dimensions and margins of the graph
let margin = {top: 30, right: 60, bottom: 50, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    tickHeight = 27;

// parse the date / time
let parseTime = d3.timeParse("%Y-%m-%d"),
    formatDate = d3.timeFormat("%d-%b-%y"),
    shortFormatDate = d3.timeFormat("d%d%b%y"),
    longFormatDate = d3.timeFormat("%d %b %Y"),
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

const formatMonth = d3.timeFormat("%b"),
    formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
    return (d3.timeYear(date) < date ? formatMonth : formatYear)(date);
}

// set the ranges
let x = d3.scaleTime().range([0, width]);
let yCases = d3.scaleLinear().range([height, 0]);
let yDeaths = d3.scaleLinear().range([height, 0]);

// define the line
let casesLine = d3.line()
    .x( (d) => x(d.date) )
    .y( (d) => yCases(d.cases) );

let deathsLine = d3.line()
    .x( (d) => x(d.date) )
    .y( (d) => yDeaths(d.deaths) );

let eventData = null;


// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select("#sydneyTimeline").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text").attr("class","title").attr("x",width/2).attr("y",-8).text("Sydney COVID-19 Timeline");

// Set up legend
let legend = svg.append("g").attr("class", "legend");
legend.selectAll("rect")
    .data([0,1,2,3,4,5]).enter().append("rect")
    .attr("class", (d) => "level"+d )
    .attr("x", width-50)
    .attr("y", (d) => (d+1)*20 )
    .attr("width", 40)
    .attr("height", 20)
legend.append("text").attr("class","legend").attr("x",width-10).attr("y",10).text("Sydney restriction stringency");
legend.append("text").attr("class","legend").attr("x",width-55).attr("y",35).text("No restrictions");
legend.append("text").attr("class","legend").attr("x",width-55).attr("y",135).text("Full lockdown");

Promise.all([d3.csv("sydney/sydney_covid_stats.csv"), d3.csv("sydney/sydney_lockdown_level_timeline.csv"), d3.csv("sydney/sydney_covid_events.csv")])
    .then(function (data) {
        data[0].forEach(function (d) {
            //return {date: parseTime(d.date), cases:+d.cases, deaths:+d.deaths};
            d.date = parseTime(d.date);
            d.cases = +d.cases;
            d.deaths = +d.deaths;
        });
        data[1].forEach(function (d) {
            d.dateFrom = parseTime(d.dateFrom);
            d.dateTo = parseTime(d.dateTo);
            d.level = +d.level;
        });
        data[2].forEach(function (d) {
            d.date = parseTime(d.date);
            d.featured = +d.featured;
        });

        eventData = data[2];

        // Scale the range of the data
        x.domain(d3.extent(data[0], (d) => d.date ));
        yCases.domain([0, d3.max(data[0], (d) => d.cases )]);
        yDeaths.domain([0, d3.max(data[0], (d) => d.deaths )]);

        // Add covid lockdown level
        svg.append("g").selectAll("rect")
            .data(data[1])
            .enter().append("rect")
                .attr("class", (d) => "level" + d.level )
                .attr("x", (d) => x(d.dateFrom) )
                .attr("y", height)
                .attr("width", (d) => x(d.dateTo) - x(d.dateFrom) )
                .attr("height", tickHeight);

        // Add lockdown shaded box
        svg.append("g").selectAll("rect")
            .data(data[1].filter( (d) => d.level==5) )
            .enter().append("rect")
            .attr("class", "lockdown")
            .attr("x", (d) => x(d.dateFrom))
            .attr("y", 0)
            .attr("width", (d) => x(d.dateTo) - x(d.dateFrom) )
            .attr("height", height);

        // Add the lines path.
        svg.append("path")
            .data([data[0]])
            .attr("class", "line deaths")
            .attr("d", deathsLine);
        svg.append("path")
            .data([data[0]])
            .attr("class", "line cases")
            .attr("d", casesLine);

        // Add the x Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(tickHeight).tickFormat(multiFormat).tickArguments([d3.timeMonth.every(1)]));

        // Add the y Axes
        svg.append("g")
            .attr("class", "cases axis")
            .call(d3.axisLeft(yCases))
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left)
                .attr("x", -(height / 2))
                .attr("dy", "1em")
                .text("New Covid cases per day");
        svg.append("g")
            .attr("class", "deaths axis")
            .attr("transform", "translate("+width+",0)")
            .call(d3.axisRight(yDeaths).ticks(5))
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(90)")
                .attr("y", -margin.right)
                .attr("x", (height / 2))
                .attr("dy", "1em")
                .text("New Covid deaths per day");

        // Add Lockdown events and selection
        svg.append("g").attr("class","eventCircles").selectAll("circle.event")
            .data(data[2])
            .enter().append("circle")
                .attr("class", (d) => ("event " + shortFormatDate(d.date)) )
                .attr("cx", (d) => x(d.date) )
                .attr("cy", height + (tickHeight/2)) //(i % 2 ? height+11 : height+23) )
                .attr("r", (d) => d.featured ? 5 : 3 )
                .style("fill", "black");

        d3.select("g.eventCircles").append("line").attr("class","selectedEvent").attr("y1", height).attr("y2", height+tickHeight).attr("x1",-100).attr("x2",-100);
        d3.select("g.eventCircles").append("text").attr("class","label").attr("x", -margin.left+28).attr("y", height+tickHeight-9).text("Events");

        // Tooltip - data
        let focus = svg.append("g")
            .style("display", "none");

        // append the x line
        focus.append("line")
            .attr("class", "x")
            .attr("y1", 0)
            .attr("y2", height);

        // append the y lines
        focus.append("line")
            .attr("class", "yCases")
            .attr("x1", width)
            .attr("x2", width);
        focus.append("line")
            .attr("class", "yDeaths")
            .attr("x1", width)
            .attr("x2", width+width);

        // append circles at the intersection
        focus.append("circle")
            .attr("class", "tooltip cases")
            .attr("r", 4);
        focus.append("circle")
            .attr("class", "tooltip deaths")
            .attr("r", 4);

        // place the value at the intersection
        focus.append("text")
            .attr("class", "tooltip back cases")
            .attr("dx", -4)
            .attr("dy", "-.3em");
        focus.append("text")
            .attr("class", "tooltip front cases")
            .attr("dx", -4)
            .attr("dy", "-.3em");
        focus.append("text")
            .attr("class", "tooltip back deaths")
            .attr("dx", 4)
            .attr("dy", "-.3em");
        focus.append("text")
            .attr("class", "tooltip front deaths")
            .attr("dx", 4)
            .attr("dy", "-.3em");

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

        function mousemove() {
            let x0 = x.invert(d3.pointer(event, this)[0]),
                i = bisectDate(data[0], x0, 1),
                d0 = data[0][i - 1],
                d1 = data[0][i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            focus.select("circle.tooltip.cases")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yCases(d.cases) + ")");
            focus.select("circle.tooltip.deaths")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yDeaths(d.deaths) + ")");

            focus.select("text.tooltip.back.cases")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yCases(d.cases) + ")")
                .text(d.cases);
            focus.select("text.tooltip.front.cases")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yCases(d.cases) + ")")
                .text(d.cases);
            focus.select("text.tooltip.back.deaths")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yDeaths(d.deaths) + ")")
                .text(d.deaths);
            focus.select("text.tooltip.front.deaths")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yDeaths(d.deaths) + ")")
                .text(d.deaths);

            focus.select("text.tooltip.back.date")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yCases(d.cases) + ")")
                .text(formatDate(d.date));
            focus.select("text.tooltip.front.date")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    yCases(d.cases) + ")")
                .text(formatDate(d.date));

            focus.select(".x")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    Math.min(yCases(d.cases), yDeaths(d.deaths)) + ")")
                .attr("y2", height - Math.min(yCases(d.cases), yDeaths(d.deaths)) );

            focus.select(".yCases")
                .attr("transform",
                    "translate(" + width * -1 + "," +
                    yCases(d.cases) + ")")
                .attr("x2", width + x(d.date));//width + width);
            focus.select(".yDeaths")
                .attr("transform",
                    "translate(" + width * -1 + "," +
                    yDeaths(d.deaths) + ")")
                .attr("x1", width + x(d.date));//width + width);
        }

    });


function updateEvent(value) {
    let d = eventData[+value]
    d3.select("line.selectedEvent").attr("x1", x(d.date)).attr("x2", x(d.date));
    d3.selectAll("circle.event").style("fill", "black");//.attr("r", (d) => d.featured ? 5 : 3 );
    d3.select("circle.event."+shortFormatDate(d.date)).style("fill", "limegreen");//.attr("r", (d) => d.featured ? 6 : 4 );
    d3.selectAll("circle.selection").style("fill", "white")
    d3.select("#eventDate").text(longFormatDate(d.date));
    d3.select("#eventDesc").text(d.description);
    d3.select("#eventURL").text(d.url).attr("href", d.url);
}