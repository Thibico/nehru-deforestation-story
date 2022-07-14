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

function init() { }

function d3Test() {
	d3.selectAll('.story-text');
}

const handleStepEnter = {
	'image_swap': function (info) {
		return function (response) {
			console.trace("Image step entered");
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
			const baseColor = '#828d68';
			const highlightColor = ['#243300', '#B14B45'];

			//map.after('load', () => map.setFilter('elc-1u2udn', filter));
			map.on('load', () => map.setPaintProperty('elc-1u2udn', 'fill-color', baseColor));
			if (map.loaded()) {
				//map.setFilter('elc-1u2udn', helper.generateLayerFilter('CROP', ["rubber"]));
				//map.setPaintProperty('elc-1u2udn', 'fill-color', '#00ff44' );
				//alert(map.getFilter('elc-1u2udn'));
				if (response.index === 0) {
					map.setFilter('elc-1u2udn', helper.generateLayerFilter('TYPE', ["elc"]));
					map.setPaintProperty('elc-1u2udn', 'fill-color', baseColor);
				} else if (response.index === 1) {
					//map.setFilter('elc-1u2udn', helper.generateLayerFilter('TYPE', ['elc'], 'OWNERSHIP', ['khmer']));
					map.setPaintProperty('elc-1u2udn', 'fill-color', ['match', ['get', 'CROP'], ['rubber', 'mrubber'], highlightColor[0], baseColor]);
					
				} else {
					
					map.setPaintProperty('elc-1u2udn', 'fill-color', ['match', ['get', 'OWNERSHIP'], ['khmer'], highlightColor[1], baseColor]);

				}
			}
		}
	}
}

function activateFluxGrid(scrollId, graphicId) {
	const options = {
		cellSize: 30,
		cellPadding: 0,
		rowSize: 48,
		colSize: 30,
		bgColor: '#111111',
		boxColor: '#B92025'
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
	var $container = d3.select(`#${graphicId}`);
	var $svg, $grid;

	function redraw() {
		let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

		$container.selectAll("*").remove();
		$svg = $container.append('svg');
		$grid = $svg.append('g');
		const width = window.innerWidth * 0.9;
		const height = window.innerHeight;
		
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
		
		var numRows, numCols, cellWidth, cellHeight;
		if (isMobile) {
			numRows = options.rowSize/2;
			numCols = options.colSize*2;
		} else {
			numRows = options.rowSize;
			numCols = options.colSize;
		}
		cellWidth = width / numRows;
		cellHeight = height / numCols;
		$grid.selectAll('g')
			.data(d3.range(numCols))
			.enter()
			.append('g')
			.attr('transform', (d,i) => {
				let yOffset = options.cellPadding * (i+1) + cellHeight * i;
				return `translate(0,${yOffset})`
			})
			.selectAll('rect')
			.data(d => d3.range(numRows))
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
			.classed('is-active', true)
			.classed('is-inactive', false);
		
		// Bounding box for comparison
		let boxHeight = 6;
		let boxWidth = 6;
		/*if (isMobile) {
			boxHeight = 3;
			boxWidth = 12;
		}*/

		const boxStroke = 10;
		const boxLocationX = width/2 - boxWidth/2 *cellWidth;
		const boxLocationY = height/2 - boxHeight/2 *cellHeight;
		$svg.append('rect')
			.classed('comparison-box', true)
			.attr('height', cellHeight*boxHeight)
			.attr('width', cellWidth*boxWidth)
			.attr('x', boxLocationX)
			.attr('y', boxLocationY)
			.attr('fill-opacity', 0)
			.attr('stroke-width', boxStroke)
			.attr('stroke', options.boxColor)

		var $annotation = $svg.append('g')
			.classed('.annotation', true);
		var $hectares = $annotation.append('text')
			.classed('section-title', true)
			.classed('annotation__hectares', true)
			.attr('x', boxLocationX)
			.attr('y', boxLocationY + cellHeight*boxHeight + 4*boxStroke)
			.style('fill', '#b92025')
			.style('font-size', '2rem');
		$annotation.append('text')
			.classed('section-title', true)
			.classed('annotation__filler', true)
			.attr('x', boxLocationX)
			.attr('y', boxLocationY + cellHeight*boxHeight + 6*boxStroke)
			.text('hectares lost')
			.style('font-size', '1rem')
			.style('fill', '#b92025')
			.style('visibility', 'hidden');
		var $year = $annotation.append('text')
			.classed('section-title', true)
			.classed('annotation__year', true)
			.attr('x', boxLocationX)
			.attr('y', boxLocationY + cellHeight*boxHeight + 8*boxStroke)
			.style('fill', '#b92025')
			.style('font-size', '1rem');
	}
	redraw();
	//window.addEventListener("resize", redraw);
	const resizeObserver = new ResizeObserver(() => {
		redraw();
	});
	resizeObserver.observe(document.body);

	function changeColor(prob, makeInactive) {
		return function () {
			if (Math.random() < prob) {
				if (makeInactive) {
					d3.select(this)
						.classed('is-active', false)
						.classed('is-inactive', true)
						.transition()
						.attr('fill', 'black')
						.duration(500)
						.attr('fill-opacity', 1.0);
				} else {
					d3.select(this)
						.classed('is-active', true)
						.classed('is-inactive', false)
						.transition()
						.duration(500)
						.attr('fill-opacity', 0);
				}
			}
		}
	}

	var progressToProb = d3.scaleLinear()
		.domain([0,1])
		.range([0,1]);

	const progToYear = d3.scaleQuantize()
		.domain([0,1])
		.range([2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
			2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]);

	const progToHectares = d3.scaleLinear()
		.domain([0,1])
		.range([0, 2500000]);

	const scientificFormat = d3.format('.3s');

    activateStickyOverlay(scrollId, (response)=>{
		if (response.step === 0) {
			$container.select('.annotation')
				.style('visibility', 'hidden');
		
		} else {
			$container.select('.annotation')
				.style('visibility', 'visibile');
		}

	},(response)=>{
		let dataStep = +d3.select(response.element).attr('data-step');
		console.trace(`progress index(${response.index}), progress(${response.progress})`);

		if (dataStep === 1) {
			var $activeCells = $grid.selectAll(".is-active");
			var $inactiveCells = $grid.selectAll(".is-inactive");
			let totalCells = $inactiveCells.size() + $activeCells.size()
			var progToInactive = d3.scaleLinear()
				.domain([0,1])
				.range([0, totalCells]);
			let numInactive = $inactiveCells.size();
			let numShouldInactive = progToInactive(response.progress);

			let cellsToDeactivate = Float64Array.from({length: numShouldInactive - numInactive},
				d3.randomInt(0, $activeCells.size()));
			let cellsToActivate = Float64Array.from({length: numInactive - numShouldInactive},
				d3.randomInt(0, $inactiveCells.size()));
			
			$container.select('.annotation__filler')
				.style('visibility', 'visible');
			let filterFunc;
			if (response.progress < 1.0) {
				filterFunc = (d,i) => cellsToDeactivate.includes(i);
			} else {
				filterFunc = (d,i) => (true);
			}
			if (response.direction === 'down') {
				$activeCells
					.filter(filterFunc)
					.each(changeColor(progressToProb(1.0), true));
			} else if (response.direction === 'up') {
				let upFilterFunc;
				if (response.progress === 0) {
					upFilterFunc = (d,i) => (true);
				} else {
					upFilterFunc = (d,i) => cellsToActivate.includes(i);
				}
				$inactiveCells
					.filter(upFilterFunc)
					.each(changeColor(progressToProb(1.0, false)));
			}

			$container.select('.annotation__hectares')
				.transition()
				.text(`${scientificFormat(progToHectares(response.progress))}`);
			$container.select('.annotation__year')
				.transition()
				.text(`by ${progToYear(response.progress)}`);
		}
	});
   
}

function activateScrollyMapbox(scrollId, mapId) {
	mapboxgl.accessToken = 'pk.eyJ1IjoidGhpYmktbHVtaW4iLCJhIjoiY2wzd25iZGdnMGJhcDNqbW11YjE3dHB3bSJ9.OJAc_-pM0gYlnF95F0RLWw';
	var map = new mapboxgl.Map({
		container: mapId, // container ID
		style: 'mapbox://styles/thibi-lumin/cl3wo5akm000p14mlzku00y1j/draft', // style URL
		center: { lon: 105.05764, lat: 12.48046 },
		zoom: 6.25,
		pitch: 0.00,
		bearing: 0.00,
		attributionControl: false
	});
	map.addControl(new mapboxgl.AttributionControl({
		compact: true,
		position: 'top-left'
	}));
	map.scrollZoom.disable();
	map.on('load', () => {
		map.fitBounds([
			[107.69050, 14.76553], // northeastern corner
			[101.67842, 10.33006] // southwestern corner
		]);
		map.setFilter('elc-1u2udn', helper.generateLayerFilter('TYPE', ["elc"]));
	});
	activateStickyOverlay(scrollId, handleStepEnter.mapbox_scroll(map));

	const resizeObserver = new ResizeObserver(()=>{
		map.fitBounds([
			[107.69050, 14.76553], // northeastern corner
			[101.67842, 10.33006] // southwestern corner
		]);
	});
	resizeObserver.observe(document.body);
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
		var stepHeight = Math.floor(window.innerHeight * 0.75 );
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
		scroller
			.setup({
				parent: document.querySelector(`#${containerId} > .scroll__text`), // our outermost scrollytelling element
				graphic: '.scroll__graphic', // the graphic
				text: '.scroll__text', // the step container
				step: '.scroll__text .step', // the step elements
				progress: true,
				offset: 0.75, // set the trigger to be X way down screen
				debug: false, // display the trigger offset for testing
				root: document
			})
			.onStepEnter(stepEnterFunc)
			.onStepProgress(stepProgressFunc);
			//.onContainerEnter(handleContainerEnter)
			//.onContainerExit(handleContainerExit);
		// setup resize event
		window.addEventListener('resize', handleResize);
	}

	// start it up
	init();
}

export default { init, resize, d3Test, activateStickyOverlay,
	activateFluxGrid, activateScrollyMapbox, handleStepEnter,
	stickyOverlayInfoArr
};
