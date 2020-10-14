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

  

}
