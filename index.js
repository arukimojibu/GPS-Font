/* global L, geolib, fetch */
const colors = ['red', 'blue', 'green', 'teal', 'navy', 'purple', 'lime', 'aqua', 'orange', 'LightSalmon', 'SlateBlue', 'IndianRed', 'DarkOliveGreen']

var mymap = L.map('map', {
  scrollWheelZoom: false,
  minZoom: 12
}).setView([35.685175, 139.7528], 13)

// zoom controller
L.control.scale().addTo(mymap)

// tile layer
const mapboxAccessToken = 'pk.eyJ1IjoieW5ha2FqaW1hIiwiYSI6ImNqaXN1ajM0djF1eHgza3BtN21icDczaW4ifQ.upCab-6A__zRBega4faaBA'
const mapbox = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
  minZoom: 12,
  attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(mymap)
const mapboxStreet = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
  minZoom: 12,
  attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
})
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 12,
  attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
})
const baseLayers = {
  'Light': mapbox,
  'Street': mapboxStreet,
  'OpenStreetMap': osm
}

// GeoJSON layer
const GPSLayer = L.layerGroup().addTo(mymap)
const overlays = {
  'GPSデータ': GPSLayer
}
L.control.layers(baseLayers, overlays).addTo(mymap)

async function laodGeoJSON (url) {
  const res = await fetch(url)
  const geoJSON = await res.json()
  console.log(geoJSON)
  geoJSON.features
    .forEach((feature, index) => {
      console.log(feature.properties.name)
      const coordTimes = feature.properties.coordTimes
      const start = new Date(coordTimes[0])
      const end = new Date(coordTimes[coordTimes.length - 1])
      let distance = 0
      feature.geometry.coordinates
        .forEach((current, index) => {
          if (index === 0) {
            return
          }
          const prev = feature.geometry.coordinates[index - 1]
          distance += geolib.getDistance(
            {latitude: current[1], longitude: current[0]},
            {latitude: prev[1], longitude: prev[0]}
          )
        })
      const geoJSONLayer = L.geoJSON(
        feature,
        {
          style: () => ({
            color: colors[index % colors.length],
            opacity: 0.7,
            weight: 2.5
          })
        }
      )
        .bindTooltip(() => `${feature.properties.name} (${distance / 1000}km)<br>${start.toLocaleString()} ~ ${end.toLocaleString()}`)
      GPSLayer.addLayer(geoJSONLayer)
    })
}
laodGeoJSON('gpslog.geojson')
