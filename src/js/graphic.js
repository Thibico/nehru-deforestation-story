/* global d3 */
import scrollama from 'scrollama';

const data = require('../assets/data/content.json');
const stickyOverlayInfoArr = data.sections
	.map( (d) => (d.content))
	.reduce((prev, curr) => prev.concat(curr))
	.filter((d) => (d.type === 'sticky_overlay'));

function resize() { }

function init() {
	console.log('Make something!');
}

function d3Test() {
	d3.selectAll('.story-text');
	console.log('happy!');
}

function activateFluxGrid(containerId) {
	const options = {
		height: 400,
		width: 912,
		cellSize: 30,
		cellPadding: 0,
		rowSize: 30,
		colSize: 12,
		bgColor: '#111111'
	};
	const cellSize = Math.floor(options.width / (options.rowSize + options.cellPadding));
	var $container = d3.select(`#${containerId}`);
	var $svg = $container.append('svg');
	var $grid = $svg.append('g');
	const width = (cellSize + options.cellPadding) * options.rowSize;
	const height = (cellSize + options.cellPadding) * options.colSize;

	$svg.attr('width', `${width}px`)
	    .attr('height', `${height}px`)
		.style('display', 'block')
		.style('background-color', options.bgColor)
		.style('background-image', 'url("assets/images/aerial_forest.jpg")')
		.style('margin', 'auto');

    
		$grid.selectAll('g')
		.data(d3.range(options.colSize))
		.enter()
		.append('g')
		.attr('transform', (d,i) => {
			let yOffset = options.cellPadding * (i+1) + cellSize * i;
			return `translate(0,${yOffset})`
		})
		.selectAll('rect')
		.data(d => d3.range(options.rowSize))
		.enter()
        .append('rect')
		.attr('width', cellSize)
		.attr('height', cellSize)
		.attr('transform', (d, i) => {
			let xOffset = options.cellPadding * (i+1) + cellSize * i;
			return `translate(${xOffset},0)`
		})
		.attr('fill', options.bgColor)
		.attr('fill-opacity', 0)
		.classed('cell', true)
		.classed('is-active', true);

	$svg.append('rect')
		.classed('comparison-box', true)
		.attr('height', cellSize*3)
		.attr('width', cellSize*3)
		.attr('x', width/2 - 1.5*cellSize)
		.attr('y', height/2 - 1.5*cellSize)
		.attr('fill-opacity', 0)
		.attr('stroke-width', 3)
		.attr('stroke', 'yellow');

	

	var $activeCells;
	$grid.selectAll('.cell').on('click', () => {
		$activeCells = $grid.selectAll(".is-active");
		$activeCells.each(changeColor(0.2));
	});


	function changeColor(prob) {
		return function () {
			if (Math.random() < prob) {
				d3.select(this)
					.classed('is-active', false)
					.transition()
					.duration(500)
					.attr('fill', options.bgColor)
					.attr('fill-opacity', 1);

			}
		}
	}
   
}

function activateStickyOverlay(containerId) {


	// using d3 for convenience, and storing a selected elements
	var $container = d3.select(`#${containerId}`);
	var $graphic = $container.select('.scroll__graphic');
	var $chart = $graphic.select('.chart');
	var $text = $container.select('.scroll__text');
	var $step = $text.selectAll('.step');
	var $images = $chart.selectAll('img');
    
	// Get the scrolly info from ArchieML JSON
	const stickyOverlayInfo = stickyOverlayInfoArr
	.filter( (d) => (d.value.scroll_id === containerId))[0].value;
	console.log("stickyOverlayInfo", stickyOverlayInfo);

	// initialize the scrollama
	var scroller = scrollama();
	console.log(content.sections);

	// resize function to set dimensions on load and on page resize
	function handleResize() {
		// 1. update height of step elements for breathing room between steps
		var stepHeight = Math.floor(window.innerHeight * 1.0);
		$step.style('height', stepHeight + 'px');

		// 2. update height of graphic element
		var bodyWidth = d3.select('body').node().offsetWidth;

		$graphic
			.style('height', window.innerHeight + 'px');

		// 3. update width of chart by subtracting from text width
		var chartMargin = 32;
		var textWidth = $text.node().offsetWidth;
		var chartWidth = $graphic.node().offsetWidth - textWidth - chartMargin;
		// make the height 1/2 of viewport
		var chartHeight = Math.floor(window.innerHeight / 2);

		$chart
			.style('width', chartWidth + 'px')
			.style('height', chartHeight + 'px');

		// 4. tell scrollama to update new element dimensions
		scroller.resize();
	}

	// scrollama event handlers
	function handleStepEnter(response) {
		// response = { element, direction, index }

		// fade in current step
		$step.classed('is-active', function (d, i) {
			return i === response.index;
		})

		// update graphic based on step here
		var stepData = +d3.select(response.element).attr('data-step');
	
		$chart.select('p').text(stepData);
		stickyOverlayInfo.images.forEach((d,i,arr) => {
			const t = d3.transition()
				.duration(250)
				.ease(d3.easeLinear);

			const stepCutoffs = arr.map(d => +d.step)
				.reduce((prev,curr) => {
					if (prev.length > 0) {
						prev[prev.length -1].push(curr);
					}
					prev.push([curr]);
					return prev;
				}, Array());

			//console.log(stepCutoffs, stepData, i);
	
		   
			
			if (
					(
						stepData >= stepCutoffs[i][0] &&
						stepData <= stepCutoffs[i][stepCutoffs[i].length -1]
					)
				) {
				$images
					.filter((d,imgIdx) => {
						console.log("inside", i, imgIdx);
						return i === imgIdx;
					})
					.transition(t)
					.style('opacity', '1');
				$images
					.filter((d,imgIdx) => (i !== imgIdx))
					.transition(t)
					.style('opacity', '0');
			}
		});
		
	}

	function showFirstImage() {
		$images.filter((d,i) => (i === 0))
			.style('opacity', 1);
	}

	// kick-off code to run once on load
	function init() {
		// 1. call a resize on load to update width/height/position of elements
		handleResize();
		showFirstImage();

		// 2. setup the scrollama instance
		// 3. bind scrollama event handlers (this can be chained like below)
		scroller
			.setup({
				container: '#scroll', // our outermost scrollytelling element
				graphic: '.scroll__graphic', // the graphic
				text: '.scroll__text', // the step container
				step: '.scroll__text .step', // the step elements
				offset: 0.75, // set the trigger to be X way down screen
				debug: false, // display the trigger offset for testing
			})
			.onStepEnter(handleStepEnter);
			//.onContainerEnter(handleContainerEnter)
			//.onContainerExit(handleContainerExit);

		// setup resize event
		window.addEventListener('resize', handleResize);
	}

	// start it up
	init();
}

export default { init, resize, d3Test, activateStickyOverlay, activateFluxGrid };
