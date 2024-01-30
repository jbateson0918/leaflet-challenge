const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
const RADIUS_MULTIPLIER = 3;
const MINIMUM_RADIUS = 1;


function createMap() {

    let myMap = L.map("map").setView([0,0], 2);
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    street.addTo(myMap);
    topo.addTo(myMap);
    
    return myMap;
};


function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}
    </p><br><p>Magnitude: ${feature.properties.mag}</p><br><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    console.log(feature)
};

function createRadius(geoJsonPoint) {
    let mag = geoJsonPoint.properties.mag;
    let calcRadius = mag * RADIUS_MULTIPLIER; 
    let radius = Math.max(calcRadius, MINIMUM_RADIUS);
    return radius;
};

function createColor(geoJsonPoint) {
   let depth = geoJsonPoint.geometry.coordinates[2]; 
   console.log(depth);
   if (depth > 50)
    fillColor = 'red';
   else if (depth > 10) 
    fillColor = 'blue'; 
   else {
    fillColor = 'green'
   }; 
   return fillColor;
};



function createMarker(geoJsonPoint, latlng) {
    let circleOptions = {
        radius: createRadius(geoJsonPoint),
        fillColor: createColor(geoJsonPoint),
    };
    return L.circleMarker(latlng, circleOptions);
};


function createFeatures(earthquakeData) {
    let features = earthquakeData.features;
    console.log(`number of features: ${features.length}`);
    let options = {
        onEachFeature: onEachFeature, 
        pointToLayer: createMarker
    };
    let earthquakes = L.geoJSON(features, options);
    earthquakes.addTo(myMap);
};

var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");

    div.innerHTML += '<i style="background: red"></i><span>>50</span><br>';
    div.innerHTML += '<i style="background: blue"></i><span>10-50</span><br>';
    div.innerHTML += '<i style="background: green"></i><span><10</span><br>'

    return div;
};

myMap = createMap();
legend.addTo(myMap);

d3.json(queryUrl).then(createFeatures);

