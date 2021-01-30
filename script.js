// defining variables that will never change using const, 
// and varibles later on that might change defined as "let"
const margin = {t: 50, r:50, b: 50, l: 50};
const size = {w: 800, h: 800};
const svg = d3.select('svg');

svg.attr('width', size.w)
    .attr('height', size.h);
    
//  load the data at the beginning -- need to load two files
// d3.json('data/maps/world.geo.json')
// d3.json('data/life-expectancy.json')

Promise.all([
    d3.json('data/maps/world.geo.json'),
    d3.json('data/life-expectancy.json')
]).then(function (datasets){
    console.log(datasets);
    const mapData = datasets[0];
    const lifeExpData = datasets[1];

    let mapG = svg.append('g').classed('map',true);
    drawMap(mapG, mapData, lifeExpData);  //  load map data

});


// draw the regions of the map
function drawMap(mapG, mapData, lifeExpData){
    //  this function below is like a scale -- will translate 
    // every scale function has a domain and a range -- need to specify range, while domain is intrinstically defined
    let projection = d3.geoMercator() 
        .fitSize([size.w, size.h], mapData);  // range

    let path = d3.geoPath(projection);

    let pathSel = mapG.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('id', function(d){ return d.properties.brk_a3;})
        .attr('d', function(d) {
            return path(d);  // always pass d attribute for paths b/c that's the SVG standard
        });

    // make the color scale
    let extent = d3.extent(lifeExpData, d=> d.lifeExpectancy);
    let colorScale = d3.scaleSequential()
        .domain(extent)
        .interpolator(d3.interpolateYlGnBu);

    // selecting the geographic data here with d
    pathSel.style('fill', function (d){
        let countryCode = d.properties.brk_a3;
        // filter is an array function so it will return elements that meet condition -- here we are matching the names in both sets, brk_a3 and countryCode
        let country = lifeExpData.filter(ele => ele.countryCode === countryCode);
        console.log(country); // country has an array of objects

        if (country.length > 0) {
            country = country[0];
            return colorScale(country.lifeExpectancy);
        }
        return "#aaa";
    })

}

// color the regions
function choroplethizeMap(paths, lifeExpData){


}

// ------- GENERAL NOTES -------
// arrow functions replace writing normal functions
// d => d.properties.brk_a3
// but it you don't only have the return statement this doesn't work the same
// any inline function can name the input whatever you want, but he often uses "d"