import 'ol/ol.css';
import {Map, View} from 'ol';
import OSM from 'ol/source/OSM';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';
import {defaults as defaultControls} from 'ol/control';
import {fromLonLat, toLonLat} from 'ol/proj';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import Draw from 'ol/interaction/Draw';
import {Icon, Stroke, Style} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';

// import TileJSON from 'ol/source/TileJSON';
// import { set } from 'ol/transform';
// import Feature from 'ol/Feature';
// import Point from 'ol/geom/Point';
// import {Icon, Style} from 'ol/style';
// import VectorSource from 'ol/source/Vector';


  const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
  });

  // The selector for changing the map projection
  const projectionSelect = document.getElementById('projection');
    projectionSelect.addEventListener('change', function (event) {
    mousePositionControl.setProjection(event.target.value);
  });

  // The selector for changing the precision of the projection
  const precisionInput = document.getElementById('precision');
    precisionInput.addEventListener('change', function (event) {
    const format = createStringXY(event.target.valueAsNumber);
    mousePositionControl.setCoordinateFormat(format);
  });



// Creating the Map object. Settings on the View define defaults for viewing the map as a 2D object
const map = new Map({
    controls: defaultControls().extend([mousePositionControl]),
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: fromLonLat([-70.74, 41.82]),
        zoom: 7
    })
});



// Converts a string containing x,y coordinates to a 2 element array of floats/integers
function convertStringCoordstoArr(stringCoords){
  return stringCoords.split(',').map( coord => parseInt(coord))
}

// This function creates an <li> saving the coordinates of the position that the user clicked
function setMarker(coordString){
  // This part adds the coords to the visible list
  const markerList = document.querySelector(".marker__list")
  console.log(markerList)
  const newMarker = document.createElement('li')
  newMarker.textContent = coordString
  markerList.appendChild(newMarker)
  const coords = convertStringCoordstoArr(coordString)
 
}

// This is where things happen after the DOM is finished loading
document.addEventListener("DOMContentLoaded", ()=>{
  let customMousePosition = document.getElementsByClassName('custom-mouse-position')
  const map = document.getElementById('map')

  document.addEventListener("click",  (e) => {
    console.log(customMousePosition[0].textContent)
    return setMarker(customMousePosition[0].textContent)
  } )
  
});

// Popup showing the position the user clicked
const popup = new Overlay({
  element: document.getElementById('popup'),
});
map.addOverlay(popup);

// This is the event handler for when the user clicks the map
map.on('click', function (evt) {
  console.log("the map has been clicked")
  // This part adds the line drawing
  
  const coordinate = evt.coordinate;
  // This part causes a popup to appear listing the coordinates of the spot the user clicked
  const element = popup.element;
  const hdms = toStringHDMS(toLonLat(coordinate));
  $(element).popover('dispose');
  popup.setPosition(coordinate);
  $(element).popover({
    container: element,
    placement: 'top',
    animation: false,
    html: true,
    content: '<p>The location you clicked was:</p><code>' + hdms + '</code>',
  });
  $(element).popover('show');

});
  // This is where the line drawing will happen
  
  // This is a function to style the line between point
const lineStyleFunction = (feature) => {
  var geometry = feature.getGeometry();
  var styles = [
    // linestring
    new Style({
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
    }) ];

  geometry.forEachSegment(function (start, end) {
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var rotation = Math.atan2(dy, dx);
    // arrows
    styles.push(
      new Style({
        geometry: new Point(end),
        image: new Icon({
          src: 'data/arrow.png',
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation,
        }),
      })
    );
  });

  return styles;
};
// New raster for the line
const lineRaster = new TileLayer({
  source: new OSM(),
});
// new source for the line
const lineSource = new VectorSource();
// new vector fo the line
const lineVector = new VectorLayer({
  source: lineSource,
  style: lineStyleFunction,
});

// This the interactive element that gets added to the map
const lineDrawInteraction = new Draw({
    source: lineSource,
    type: 'LineString',
  })
  map.addInteraction(lineDrawInteraction);

// This will be a function to stop drawing the line

const mapElement = document.querySelector('#map')

document.addEventListener('keyup',(e)=>{
  e.preventDefault()
  if(e.key=="Enter"){
    map.removeInteraction(lineDrawInteraction)
    
    // sending the route and point information to the backend server
    // fetch(url,{
    //   method:'POST',
    //   mode: 'cors',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accepts': 'application/json'
    //   },
    //   body: JSON.stringify(data)
    // }).then(response => response.json())
    // .then(data => console.log(data))
  }
  
})


// This is extra code I tried to use to make new markers using Icons. might be easier to do this with Ovelays instead

// const newMarkerFeature = new Feature({
//   geometry: new Point([0,0]),
//   name: "Test Marker"
// })
// const markerStyle =  new Style({
//   image: new Icon({
//     anchor: [0.5, 46],
//     anchorXUnits: 'fraction',
//     anchorYUnits: 'pixels',
//     src: 'data/icon.png',
//   })
// })

// newMarkerFeature.setStyle(markerStyle)

// const vectorSource = new VectorSource({
//   features: [newMarkerFeature],
// })

// const vectorLayer = new VectorLayer({
//   source: vectorSource,
// });

// const rasterLayer = new TileLayer({
//   source: new TileJSON({
//     url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json?secure=1',
//     crossOrigin: '',
//   }),
// });