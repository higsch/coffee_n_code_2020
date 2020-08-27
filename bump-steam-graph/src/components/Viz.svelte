<script>
  import * as d3 from 'd3';
  import journals from './journals';

  import Legend from './Legend.svelte';

  let viz, tooltip;

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
    const { width, height } = viz.getBoundingClientRect();
    const margin = {
      v: 50,
      h: 50
    };

    const d3Tooltip = d3.select(tooltip);
    d3Tooltip.style('opacity', 0);

    // remove old elements
    d3.select(viz).selectAll('*').remove();

    // x scale
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data.map((d) => +d.year)))
      .range([margin.h, width - margin.h]);

    // console.log(journalRanks)

    // stack layout
    const steam = d3.stack()
      .offset(d3.stackOffsetSilhouette)
      .keys(journals.map((j) => j.issn))
      (data);

    // calculate ranks and ranges based on years
    const ranks = data.map((d, yearIndex) => {
      const { year, ...vals } = d;
      const num = Object.values(vals).map((d, i) => ({issn: Object.keys(vals)[i], num: d}));
      const sortedNum = [...num].sort((a, b) => a.num - b.num);
      const ranks = sortedNum.map((d, i) => ({
        ...d,
        year,
        rank: i,
        coords: steam.find((s) => s.key === d.issn)[yearIndex]
      }));
      return({
        range: d3.extent(ranks.map((r) => r.coords).flat()),
        values: ranks
      });
    });

    // recalculate coordinates based on ranks and ranges
    ranks.forEach((d) => {
      const { range, values } = d;
      const rankRange = d3.range(values.length);
      rankRange.forEach((r, i) => {
        const point = values.find((v) => v.rank === r);
        const previousEndCoord = i > 0 ? values[i - 1].bumpCoords[1] : range[0];
        const bumpCoords = [previousEndCoord, previousEndCoord + point.num];
        point.bumpCoords = bumpCoords;
      });
    });

    const updatedSteam = [...steam];
    updatedSteam.forEach((d) => {
      let { key, index, ...coords } = d;
      const updated = ranks.map((d) => d.values).flat().filter((d) => d.issn === key);
      Object.values(coords).forEach((d) => {
        const updatedCoords = updated.find((c) => c.year === d.data.year);
        d[0] = updatedCoords.bumpCoords[0];
        d[1] = updatedCoords.bumpCoords[1];
      });
    });

    // y scale
    const allYValues = updatedSteam.map((d) => d.map((d) => [d[0], d[1]])).flat(2);
                        
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
    const svg = d3.select(viz).append('svg')
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('path')
      .data(updatedSteam)
      .join('path')
      .attr('fill', (d) => journals.find((j) => j.issn === d.key).color)
      .attr('fill-opacity', 0.8)
      .attr('d', stackArea)
      .on('mousemove', function (d) {
        d3.select(this).transition()
          .duration(100)
          .style('fill-opacity', 1);
        d3Tooltip.transition()
          .duration(100)
          .style('opacity', 0.9);
        d3Tooltip
          .html(journals.find((j) => j.issn === d.key).name)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function (d) {
        d3.select(this).transition()
          .duration(100)
          .style('fill-opacity', 0.8);
        d3Tooltip.transition()
          .duration(100)
          .style('opacity', 0);
        });;

    // add the x axis
    const xAxis = (g) => g
      .attr('transform', `translate(0,${height - margin.v + 5})`)
      .call(d3.axisBottom(xScale).ticks().tickSizeOuter(0).tickFormat(d3.format('')))

    svg.append('g')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle');
  }
</script>

<div class="tooltip" bind:this={tooltip}></div>
<div id="viz" bind:this={viz}></div>
<Legend {journals} />

<style>
  #viz {
    width: 100%;
    height: 50%;
    margin: 1rem 0;
  }

  .tooltip {
    position: absolute;
    text-align: center;
    /* width: 60px; */
    /* height: 28px; */
    padding: 0.3rem;
    font: 12px sans-serif;
    background: silver;
    border: 0px;
    border-radius: 2px;
    pointer-events: none;
  }
</style>
