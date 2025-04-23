const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const width = 900;
const height = 600;
const padding = 60;

const svg = d3.select('#scatterplot');
const tooltip = d3.select("#tooltip");

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('Data loaded:', data);
    // We'll continue from here with scales, axes, and plotting

    const parseTime = d3.timeParse("%M:%S");

    data.forEach(d => {
      d.Time = parseTime(d.Time);
      d.Year = new Date(d.Year, 0); // Year only (Month = 0)
    });

    // Define scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Year))
      .range([padding, width - padding]);

    const yScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Time))
      .range([padding, height - padding]); // Reversed: smaller times are "higher" on screen

    // Create x-axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y"));

// Create y-axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.timeFormat("%M:%S"));

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    svg.append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.Year))
      .attr("cy", d => yScale(d.Time))
      .attr("r", 6)
      .attr("fill", d => d.Doping ? "#d62728" : "#1f77b4")
      .attr("data-xvalue", d => d.Year.toISOString())
      .attr("data-yvalue", d => d.Time.toISOString())
      .on("mouseover", (event, d) => {
    tooltip
      .style("opacity", 1)
      .html(`
        <strong>${d.Name}</strong>: ${d.Nationality}<br/>
        Year: ${d.Year.getFullYear()}, Time: ${d3.timeFormat("%M:%S")(d.Time)}<br/>
        ${d.Doping ? d.Doping : ""}
      `)
      .attr("data-year", d.Year.getFullYear())
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.style("opacity", 0);
  });

  // Legend
const legend = svg.append("g")
.attr("id", "legend")
.attr("transform", `translate(${width - 200}, ${height / 2 - 40})`);

const legendData = [
{ color: "#d62728", text: "Riders with doping allegations" },
{ color: "#1f77b4", text: "No doping allegations" }
];

legend.selectAll("rect")
.data(legendData)
.enter()
.append("rect")
.attr("x", 0)
.attr("y", (d, i) => i * 25)
.attr("width", 20)
.attr("height", 20)
.attr("fill", d => d.color);

legend.selectAll("text")
.data(legendData)
.enter()
.append("text")
.attr("x", 30)
.attr("y", (d, i) => i * 25 + 15)
.text(d => d.text);
  });