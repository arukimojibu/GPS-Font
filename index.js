/* global L, geolib, fetch */
const colors = ['red', 'blue', 'green', 'teal', 'navy', 'purple', 'lime', 'aqua', 'orange', 'LightSalmon', 'SlateBlue', 'IndianRed', 'DarkOliveGreen']

var mymap = L.map('map', {
  zoomSnap: 0.1,
  scrollWheelZoom: false
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

// point layer
const pointLayer = L.layerGroup().addTo(mymap)

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

        // get distance
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

        // arukimoji meta data
        layer.arukimoji = {
          isSelected: false,
          toolTipContent: `${feature.properties.name}<br>${distance / 1000}km<br>${start.toLocaleString()} ~ ${end.toLocaleString()}<br>${min}min`
        }

        layer.setStyle({
          color: colors[Math.floor(Math.random() * colors.length)]
        })

        // tooltip
        layer.bindTooltip(layer.arukimoji.toolTipContent)

        // mouseover
        layer.on('mouseover', (e) => {
          if (layer.arukimoji.isSelected) {
            return
          }
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

        // mouseout
        layer.on('mouseout', (e) => {
          if (layer.arukimoji.isSelected) {
            return
          }
          layer.setStyle({
            weight: 3,
            opacity: 0.7
          })
          path
            .setLatLngs([])
        })

        // click
        layer.on('click', (e) => {
          layer.arukimoji.isSelected = true
          layer.interactive = false
          layer.unbindTooltip()
          geoJSONLayer.eachLayer(l => {
            if (l !== layer) {
              l.arukimoji.isSelected = false
              l.interactive = true
              l.bindTooltip(l.arukimoji.toolTipContent)
              l.fire('mouseout')
            }
          })
          mymap.fitBounds(layer.getBounds())

          // render point
          pointLayer.clearLayers()
          layer.getLatLngs()
            .forEach((point, index) => {
              const coordTime = new Date(coordTimes[index]).toLocaleString()
              L.circle(point, {
                radius: 5,
                weight: 2
              })
                .bindTooltip(`<b>${index}</b>: ${point.lat}, ${point.lng}<br>${coordTime}`)
                .addTo(pointLayer)
                .bringToFront()
            })
        })
      }
    }
  )
  GPSLayer.addLayer(geoJSONLayer)
}
laodGeoJSON('gpslog.geojson')
