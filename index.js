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

// path
const path = L.polyline([], {color: '#000', weight: 1}).addTo(mymap)
path.interactive = false

// load GeoJSON
async function laodGeoJSON (url) {
  const res = await fetch(url)
  const geoJSON = await res.json()
  console.log(geoJSON)
  const geoJSONLayer = L.geoJSON(
    geoJSON,
    {
      style: () => ({
        opacity: 0.7,
        weight: 3
      }),
      onEachFeature: (feature, layer) => {
        const coordTimes = feature.properties.coordTimes
        const start = new Date(coordTimes[0])
        const end = new Date(coordTimes[coordTimes.length - 1])
        const min = Math.round((end.getTime() - start.getTime()) / 1000 / 60)
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
        layer.setStyle({
          color: colors[Math.floor(Math.random() * colors.length)]
        })
        layer.bindTooltip(() => `${feature.properties.name}<br>${distance / 1000}km<br>${start.toLocaleString()} ~ ${end.toLocaleString()}<br>${min}min`)
        layer.on('mouseover', (e) => {
          path
            .setLatLngs(layer.getLatLngs())
            .bringToFront()
          layer
            .setStyle({
              weight: 8,
              opacity: 0.5
            })
            .bringToFront()
        })
        layer.on('mouseout', (e) => {
          layer.setStyle({
            weight: 3,
            opacity: 0.7
          })
          path
            .setLatLngs([])
        })
      }
    }
  )
  GPSLayer.addLayer(geoJSONLayer)
}
laodGeoJSON('gpslog.geojson')
