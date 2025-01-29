// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
let myMap = L.map("map", {
  center: [39.82, -98.58],
  zoom: 5
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);

let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Make a request that retrieves the earthquake geoJSON data.
d3.json(geoData).then(function (data) {

  // Define the geojson variable with options for limits and colors
  let limits = [-10, 10, 30, 50, 70, 90]
  let geojson = {
    options: {
      limits : limits,
      colors : limits.map(getColor),
    }
  };

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      fillColor: getColor(feature.geometry.coordinates[2]),
      radius: getRadius(feature.properties.mag),
  };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
      if (depth < 10) {
        return "#98EE00";
    } else if (depth < 30) {
        return "#D4EE00";
    } else if (depth < 50) {
        return "#EECC00";
    } else if (depth < 70) {
        return "#EE9C00";    
    } else if (depth < 90) {
        return "#EA822C";          
    } else {
        return "#EA2C2C";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  var radiusScale = d3.scaleLinear()
    .domain([-1.0, 10.0])
    .range([5, 30]);

  function getRadius(magnitude) {
    return radiusScale(magnitude);
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {

    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: getRadius(feature.properties.mag), // Use the getRadius function to set the radius
        fillColor: getColor(feature.geometry.coordinates[2]), // Use getColor for fill color based on depth
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });
    },

    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
        //they are initialized above on lines 29-35 and used in the getColor function on lines 48-62

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    div.innerHTML += "<ul>";
    for (let i = 0; i < limits.length; i++) {
      div.innerHTML +=
        "<li><div style='background: " + getColor(limits[i]) + "'></div>" +
        limits[i] + (limits[i + 1] ? "&ndash;" + limits[i + 1] + "<br>" : "+") + "</li>" ;
    }
    div.innerHTML += "</ul>";
  
    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);
});
