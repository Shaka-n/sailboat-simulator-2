import 'ol/ol.css';
import {Map, View} from 'ol';
import OSM from 'ol/source/OSM';
import MousePosition from 'ol/control/MousePosition';
import {add, createStringXY} from 'ol/coordinate';
import {defaults as defaultControls} from 'ol/control';
import {fromLonLat, toLonLat} from 'ol/proj';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import Draw from 'ol/interaction/Draw';
import {Icon, Stroke, Style} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';

const ROUTES_ENDPOINT = 'http://localhost:3000/routes'
const current_user_id = 1
const headers = { "Content-Type":"application/json"}

// The following functions track to coordinates of the mouse cursor within the map
// *******************************************************************************

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

// This is where the map and interactive layers are initialized
// ************************************************************

const raster = new TileLayer({
    source: new OSM(),
  });
const source = new VectorSource({wrapX: false});

var vector = new VectorLayer({
  source: source,
  style: lineStyleFunction
});

// Creating the Map object. Settings on the View define defaults for viewing the map as a 2D object
const map = new Map({
    controls: defaultControls().extend([mousePositionControl]),
    target: 'map',
    layers: [
        raster,
        vector
    ],
    view: new View({
        center: fromLonLat([-70.74, 41.82]),
        zoom: 8
    })
});


// This the interactive line element that gets added to the map
// ************************************************************
let draw
function addlineDrawInteraction(){
  draw = new Draw({
    source: source,
    type: 'LineString',
  })
  map.addInteraction(draw);
}
addlineDrawInteraction()



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
  newMarker.classList.add('coordinate')
  newMarker.textContent = coordString
  markerList.appendChild(newMarker)
  const coords = convertStringCoordstoArr(coordString)
 
}

// This is where things happen after the DOM is finished loading
document.addEventListener("DOMContentLoaded", ()=>{
  const customMousePosition = document.getElementsByClassName('custom-mouse-position')
  document.addEventListener("click",  (e) => {
    console.log()
    if(e.target.tagName == "CANVAS"){
      console.log(customMousePosition[0].textContent)
      return setMarker(customMousePosition[0].textContent)
    }
  })
  
});

// This will be a function to send the coordinates to the backend
// **************************************************************

document.addEventListener('keyup',(e)=>{
  e.preventDefault()
  
  if(e.key=="Enter"){
    const markerList = document.getElementsByClassName('coordinate')
    const markerElements = Array.from(markerList)
    const coordinates = markerElements.map( li => li.innerHTML.split(','))
    console.log("coordinates", coordinates)
    const coordinatesInt = coordinates.map(coords => coords.map(coord => parseFloat(coord)))
   map.getInteractions().forEach((interaction) => {
     if(interaction instanceof Draw){
       console.log("This is a drawing")
       interaction.finishDrawing()
     }
   })
   const routeName = document.querySelector(".route-name__field").value
    console.log("current_user_id", current_user_id)
    console.log("coordinates", coordinatesInt)
    console.log(routeName)
    postCoordinates(coordinatesInt, routeName)
  }
  
})

function postCoordinates(coordinatesInt, routeName){
  fetch(`${ROUTES_ENDPOINT}`,{
    method:'POST',
    headers: headers,
    body: JSON.stringify({
      coordinates: coordinatesInt,
      userId: current_user_id,
      name: routeName
    })
  })
  .then(response => response.json())
  .then(totalTravelTime => {
    console.log(totalTravelTime)
    const travelTimeDisplay = document.querySelector("#travel-time__display")
    const convertedTime = timeConversion(totalTravelTime)
    travelTimeDisplay.textContent = `${convertedTime["hours"]} hours, ${convertedTime["minutes"]} minutes, and ${convertedTime["seconds"]} seconds`

  })
}
// This function loads the saved routes and loads them into the DOM
// ****************************************************************

const savedRoutesButton = document.querySelector(".routes__button")
savedRoutesButton.addEventListener('click', (e)=>{loadSavedRoutes()})

function loadSavedRoutes(){
  fetch(`${ROUTES_ENDPOINT}`,{
    method: 'GET',
    headers: headers
  })
  .then(response => response.json())
  .then(routes =>{
    console.log(routes)
    const routesList = document.querySelector(".routes__list")

    routes.map(route =>{
      const newRoute = document.createElement("li")
      newRoute.dataset.id = route.id
      if(route.name){
        newRoute.textContent = route.name
        newRoute.addEventListener('click', (e) =>{
          console.log(e.target.textContent)
          const routeId = e.target.dataset.id
          viewSavedRouteTravelTime(routeId)
        })
      }
      else if(route.coordinates){
        newRoute.textContent = route.coordinates
        newRoute.addEventListener('click', (e) =>{
          const stringCoords = e.target.textContent
          const coordinates = JSON.parse("[" + e.target.textContent + "]")
          console.log(coordinates)

        })
      }else{
        newRoute.textContent = "No Coordinates Saved"
      }
      routesList.appendChild(newRoute)
    })
  })
}

// This function will find a route by its name in the backend and calculate
//  the current travel time based on its coordinates and the current forecast
// ***************************************************************************

function viewSavedRouteTravelTime(routeId){
  fetch(`${ROUTES_ENDPOINT}/${routeId}`,{
    method: 'GET',
    headers: headers
  })
  .then(response => response.json())
  .then(totalTravelTime => {
    console.log(totalTravelTime)
    const travelTimeDisplay = document.querySelector("#travel-time__display")
    const convertedTime = timeConversion(totalTravelTime)
    travelTimeDisplay.textContent = `${convertedTime["hours"]} hours, ${convertedTime["minutes"]} minutes, and ${convertedTime["seconds"]} seconds`
  })
}

// Method for converting from decimal time to normal time

function timeConversion(num){
  let decimalTime = num * 60 * 60
  const hours = Math.floor((decimalTime / (60 * 60)))
  decimalTime - (hours * 60 * 60)
  const minutes = Math.floor((decimalTime / 60))
  decimalTime = decimalTime - (minutes * 60)
  const seconds = Math.round(decimalTime)

  return {"hours": hours, "minutes": minutes, "seconds": seconds}
}

// Styling for the LineString
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


// This is extra code I tried to use to make new markers using Icons. might be easier to do this with Ovelays instead
  // Popup showing the position the user clicked
  // const popup = new Overlay({
  //   element: document.getElementById('popup'),
  // });
  // map.addOverlay(popup);
  // This part causes a popup to appear listing the coordinates of the spot the user clicked
  // const element = popup.element;
  // const hdms = toStringHDMS(toLonLat(coordinate));
  // $(element).popover('dispose');
  // popup.setPosition(coordinate);
  // $(element).popover({
  //   container: element,
  //   placement: 'top',
  //   animation: false,
  //   html: true,
  //   content: '<p>The location you clicked was:</p><code>' + hdms + '</code>',
  // });
  // $(element).popover('show');

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