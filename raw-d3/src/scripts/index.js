import '../styles/index.scss';
import * as d3 from 'd3';
import journals from './journals';

// read in the data
d3.csv('/data/scilifelab-publications.csv', (d) => ({
  issn: d.ISSN,
  journal: d.Journal,
  year: +d.Published.split('-')[0]
})).then((data) => {
  // filter for wanted journals
  const dataFiltered = data
    .filter((d) => journals.map((j) => j.issn).includes(d.issn));
  
  // nest and summarise
  const dataNested = d3.nest()
    .key((d) => d.year)
    .rollup((values) => journals.map((j) => ({
      [j.issn]: values.filter((d) => d.issn === j.issn).length
    })))
    .entries(dataFiltered)
    .map((d) => Object.assign({year: +d.key}, d.value.reduce((acc, cur) => (Object.assign(acc, cur)))));

  // now create the visual
  createViz(dataNested);
});

// create the viz
function createViz(data) {
  const viz = d3.select('#viz');
  const { width, height } = viz.node().getBoundingClientRect();
  const margin = {
    v: 50,
    h: 50
  };

  // remove old elements
  viz.selectAll('*').remove();

  // stack layout
  const stream = d3.stack()
  .offset(d3.stackOffsetSilhouette)
  .keys(journals.map((j) => j.issn))
  (data);

  // x scale
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data.map((d) => +d.year)))
    .range([margin.h, width - margin.h]);

  // y scale
  const allYValues = stream.map((d) => d.map((d) => [d[0], d[1]])).flat(2);
                      
  const yScale = d3.scaleLinear()
    .domain(d3.extent(allYValues))
    .range([height - margin.v, margin.v]);

  // path generator for the areas
  const stackArea = d3.area()
    .x(d => xScale(d.data.year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))
    .curve(d3.curveCardinal.tension(0));
  
  // create svg
  const svg = viz.append('svg')
    .attr('width', width)
    .attr('height', height);

  // add graph to svg
  svg.selectAll('path')
    .data(stream)
    .join('path')
    .attr('fill', (d) => journals.find((j) => j.issn === d.key).color)
    .attr('fill-opacity', 0.8)
    .attr('d', stackArea);

  // add the x axis
  const xAxis = (g) => g
    .attr('transform', `translate(0,${height - margin.v + 5})`)
    .call(d3.axisBottom(xScale).ticks().tickSizeOuter(0).tickFormat(d3.format('')));

  svg.append('g')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'middle');
}
