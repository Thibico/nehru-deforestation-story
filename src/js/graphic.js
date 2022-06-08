/* global d3 */
import scrollama from 'scrollama';
import mapboxgl from 'mapbox-gl';
import helper from './helper';

const data = require('../assets/data/content.json');
const stickyOverlayInfoArr = data.sections
	.map( (d) => (d.content))
	.reduce((prev, curr) => prev.concat(curr))
	.filter((d) => (d.type === 'sticky_overlay' || d.type === 'scrolly_mapbox'));

function resize() { }

function init() {
	console.log('Make something!');
}

function d3Test() {
	d3.selectAll('.story-text');
	console.log('happy!');
}

const handleStepEnter = {
	'image_swap': function (info) {
		return function (response) {
			console.log("ENTERED IMAGE FUNC");
			// response = { element, direction, index }
			var $step = d3.select(`#${info.scroll_id}`)
				.select('.scroll__text')
				.selectAll('.step');
			var $images = d3.select(`#${info.scroll_id}`)
				.select('.scroll__graphic')
				.select('.chart')
				.selectAll('img');
				
			// fade in current step
			$step.classed('is-active', function (d, i) {
				return i === response.index;
			})
		
			// update graphic based on step here
			var stepData = +d3.select(response.element).attr('data-step');
		
			info.images.forEach((d,i,arr) => {
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
		
				
				if (
						(
							stepData >= stepCutoffs[i][0] &&
							stepData <= stepCutoffs[i][stepCutoffs[i].length -1]
						)
					) {
					$images
						.filter((d,imgIdx) => {
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
	},

	'mapbox_scroll': function (map) {
		return function (response) {
			console.log("ENTERED MAP FUNC");
			//map.after('load', () => map.setFilter('elc-1u2udn', filter));
			if (map.loaded()) {
				map.setFilter('elc-1u2udn', helper.generateLayerFilter('CROP', ["rubber"]));
				map.setPaintProperty('elc-1u2udn', 'fill-color', '#fefefe' );
			}
		}
	}
}

function activateFluxGrid(scrollId, graphicId) {
	const options = {
		height: 400,
		width: 800,
		cellSize: 30,
		cellPadding: 0,
		rowSize: 24,
		colSize: 15,
		bgColor: '#111111'
	};
	/*d3.select(`#${scrollId}`)
		.select('.scroll__graphic')
		.style('background-color', 'yellow');
	d3.select(`#${scrollId}`)
		.select('.scroll__text')
		.selectAll('.step')
		.selectAll('p')
		.style('background-color', 'rgb(255,255,255,0)')
		.style('color', 'rgb(0,0,0,0)');*/
	const cellSize = Math.ceil(window.innerWidth*0.8 / (options.rowSize + options.cellPadding));

	var $container = d3.select(`#${graphicId}`);
	var $svg = $container.append('svg');
	var $grid = $svg.append('g');
	const width = window.innerWidth;
	const height = window.innerHeight;
	const cellWidth = width / options.rowSize;
	const cellHeight = height / options.colSize;
	//const width = (cellSize + options.cellPadding) * options.rowSize;
	//const height = (cellSize + options.cellPadding) * options.colSize;
	$svg.attr('transform', `translate(${0},${(window.innerHeight - height)/2})`);

	$svg.attr('width', `${width}px`)
	    .attr('height', `${height}px`)
		.style('display', 'block')
		//.style('background-color', options.bgColor)
		// TODO: remove hard-coded background image and replace with dynamic src from content.json
		.style('background-image', 'url("assets/images/aerial_forest.jpg")')
		.style('background-position', 'center')
		.style('background-size', 'cover')
		.style('margin', 'auto');

    
	$grid.selectAll('g')
		.data(d3.range(options.colSize))
		.enter()
		.append('g')
		.attr('transform', (d,i) => {
			let yOffset = options.cellPadding * (i+1) + cellHeight * i;
			return `translate(0,${yOffset})`
		})
		.selectAll('rect')
		.data(d => d3.range(options.rowSize))
		.enter()
        .append('rect')
		.attr('width', cellWidth+1)
		.attr('height', cellHeight+1)
		.attr('transform', (d, i) => {
			let xOffset = options.cellPadding * (i+1) + cellWidth * i;
			return `translate(${xOffset},0)`
		})
		.attr('fill', options.bgColor)
		.attr('fill-opacity', 0)
		.classed('cell', true)
		.classed('is-active', true);

	$svg.append('rect')
		.classed('comparison-box', true)
		.attr('height', cellHeight*3)
		.attr('width', cellWidth*3)
		.attr('x', width/2 - 1.5*cellWidth)
		.attr('y', height/2 - 1.5*cellHeight)
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
					.attr('fill-opacity', 1.0);

			}
		}
	}

	var progressToProb = d3.scaleLinear()
		.domain([0,0.75])
		.range([0,0.2]);

    activateStickyOverlay(scrollId, ()=>(true), (response)=>{
		let dataStep = +d3.select(response.element).attr('data-step');
		if (dataStep === 1) {
			$activeCells = $grid.selectAll(".is-active");
			$activeCells.each(changeColor(progressToProb(response.progress)));
		}
	});
   
}

function activateScrollyMapbox(scrollId, mapId) {
	mapboxgl.accessToken = 'pk.eyJ1IjoidGhpYmktbHVtaW4iLCJhIjoiY2wzd25iZGdnMGJhcDNqbW11YjE3dHB3bSJ9.OJAc_-pM0gYlnF95F0RLWw';
	var map = new mapboxgl.Map({
		container: mapId, // container ID
		style: 'mapbox://styles/thibi-lumin/cl3wo5akm000p14mlzku00y1j/draft', // style URL
		center: { lon: 105.05764, lat: 12.48046 },
		zoom: 6.82,
		pitch: 0.00,
		bearing: 0.00
	});
	map.scrollZoom.disable();
	map.on('load', () => {
		console.log('map layer style', map.getLayer('elc-1u2udn'));
	});
	activateStickyOverlay(scrollId, handleStepEnter.mapbox_scroll(map));
}

function activateStickyOverlay(containerId, stepEnterFunc, stepProgressFunc=()=>(true)) {
	// using d3 for convenience, and storing a selected elements
	var $container = d3.select(`#${containerId}`);
	var $graphic = $container.select('.scroll__graphic');
	var $chart = $graphic.select('.chart');
	var $text = $container.select('.scroll__text');
	var $step = $text.selectAll('.step');
	var $images = $chart.selectAll('img');

	// initialize the scrollama
	var scroller = new scrollama();

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
	// HANDLESTEPENTER

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
		console.log("Set up a scroller at container", containerId, "with func", stepEnterFunc);
		scroller
			.setup({
				parent: document.querySelector(`#${containerId} > .scroll__text`), // our outermost scrollytelling element
				graphic: '.scroll__graphic', // the graphic
				text: '.scroll__text', // the step container
				step: '.scroll__text .step', // the step elements
				progress: true,
				offset: 0.75, // set the trigger to be X way down screen
				debug: false, // display the trigger offset for testing
			})
			.onStepEnter(stepEnterFunc)
			.onStepProgress(stepProgressFunc);
			//.onContainerEnter(handleContainerEnter)
			//.onContainerExit(handleContainerExit);
		// setup resize event
		console.log("scroller", scroller);
		window.addEventListener('resize', handleResize);
	}

	// start it up
	init();
}

export default { init, resize, d3Test, activateStickyOverlay,
	activateFluxGrid, activateScrollyMapbox, handleStepEnter,
	stickyOverlayInfoArr
};
