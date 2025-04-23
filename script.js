const educationUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const width = 960;
const height = 600;

const svg = d3.select('#choropleth');
const tooltip = d3.select('#tooltip');

Promise.all([
  d3.json(countyUrl),
  d3.json(educationUrl)
]).then(([us, education]) => {
  const counties = topojson.feature(us, us.objects.counties).features;
  const path = d3.geoPath();

  const colorScale = d3.scaleThreshold()
    .domain([10, 20, 30, 40, 50, 60, 70, 80])
    .range(d3.schemeBlues[9]);

  const educationMap = new Map(education.map(d => [d.fips, d]));

  svg.selectAll("path")
    .data(counties)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", d => {
      const result = educationMap.get(d.id);
      return result ? colorScale(result.bachelorsOrHigher) : "#ccc";
    })
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const result = educationMap.get(d.id);
      return result ? result.bachelorsOrHigher : 0;
    })
    .on("mouseover", (event, d) => {
      const county = educationMap.get(d.id);
      tooltip
        .style("opacity", 1)
        .html(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`)
        .attr("data-education", county.bachelorsOrHigher)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Legend
  const legendWidth = 300;
  const legendHeight = 10;
  const legendThresholds = colorScale.thresholds();
  const legendX = d3.scaleLinear()
    .domain([d3.min(legendThresholds), d3.max(legendThresholds)])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendX)
    .tickSize(13)
    .tickValues(legendThresholds)
    .tickFormat(d => d + "%");

  const legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width / 2 - legendWidth / 2}, ${height - 40})`);

  legend.selectAll("rect")
    .data(legendThresholds)
    .enter()
    .append("rect")
    .attr("x", d => legendX(d))
    .attr("y", 0)
    .attr("width", (d, i) => {
      const next = legendThresholds[i + 1] || legendX.domain()[1];
      return legendX(next) - legendX(d);
    })
    .attr("height", legendHeight)
    .attr("fill", d => colorScale(d));

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis)
    .select(".domain")
    .remove();
});
