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
		cellSize: 10,
		cellPadding: 1,
		firstColor: 'limegreen',
		secondColor: 'darkslategray'
	};
	var $container = d3.select(`#${containerId}`);
	var $svg = $container.append('svg');
	var $grid = $svg.append('g');
	console.log(options);
    console.log(`${options.width}px`);
	$svg.attr('width', `${options.width}px`)
		.attr('height', `${options.height}px`)
		.style('background-color', '#eeeeee')
		.style('display', 'block')
		.style('margin', 'auto');
    
	var $prevCell = $grid.append('rect')
	    .classed('cell', true)
		.classed('is-active', true)
		.attr('x', options.cellPadding)
		.attr('y', options.cellPadding)
		.attr('width', options.cellSize)
		.attr('height', options.cellSize)
		.attr('fill', options.firstColor);

    for (
		let i=options.cellPadding;
		i < options.width;
		i = i + options.cellPadding + options.cellSize
	)
	 {
		var $currCell = $prevCell.clone()
			.attr('x', `${i}`);
		$prevCell = $currCell;
	}

	var $firstRow = $grid.selectAll('.cell');
    
	for (
		let i=options.cellPadding+options.cellSize; 
		i < options.height - options.cellSize;
		i = i + options.cellPadding + options.cellSize
	) {
		$firstRow.clone()
		.attr('transform', `translate(0,${i})`);
	}

	function changeColor(prob) {
		return function () {
			var color = '';
			if (Math.random() < prob) {
				color = options.secondColor;
				d3.select(this)
					.classed('is-active', false)
					.transition()
					.duration(500)
					.attr('fill', color);
			}
		}
	}
    var $activeCells;
	$grid.selectAll('.cell').on('click', () => {
		$activeCells = $grid.selectAll(".is-active");
		$activeCells.each(changeColor(0.2));
	});

	console.log('num cells', $grid.selectAll('.cell').size());

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
		stickyOverlayInfo.images.forEach((d,i) => {
			const t = d3.transition()
				.duration(250)
				.ease(d3.easeLinear);
		   
			
			if (stepData === +d.step) {
				$images
					.filter((d,imgIdx) => (i === imgIdx))
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
