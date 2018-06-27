const togeojson = require('togeojson')
const xmldom = new (require('xmldom').DOMParser)()
const fs = require('fs')
const path = require('path')

// gpx2geojson
const gpx2geojson = (data) => (
  (togeojson.gpx(xmldom.parseFromString(data.toString()))).features[0]
)
const gpxDir = path.join(__dirname, '../src/gpx')
const tracks = fs.readdirSync(gpxDir)
  .filter(file => ((/\.gpx$/.test(file))))
  .map(file => {
    const data = fs.readFileSync(path.join(gpxDir, file))
    const geojson = gpx2geojson(data)
    geojson.properties.name = file
    return geojson
  })

// json2geojson
const json2geojson = (data) => {
  const json = JSON.parse(data.toString())
  const feature = {
    type: 'Feature',
    properties: {
      name: '',
      desc: json[0].tl || '',
      owner: json[0].ow || '',
      time: new Date(json[0].tm * 1000).toISOString(),
      coordTimes: []
    },
    geometry: {
      type: 'LineString',
      coordinates: []
    }
  }
  const coordTimes = []
  const coordinates = []
  json
    .forEach(location => {
      coordTimes.push(new Date(location.tm * 1000).toISOString())
      coordinates.push([
        location.lo,
        location.la,
        Number(location.al)
      ])
    })
  feature.properties.coordTimes = coordTimes
  feature.geometry.coordinates = coordinates
  return feature
}
const jsonDir = path.join(__dirname, '../src/json')
const jsons = fs.readdirSync(jsonDir)
  .filter(file => ((/\.json$/.test(file))))
  .map(file => {
    const data = fs.readFileSync(path.join(jsonDir, file))
    const geojson = json2geojson(data)
    geojson.properties.name = file
    return geojson
  })

// echo geojson
const geojson = {
  type: 'FeatureCollection',
  features: jsons.concat(tracks)
}
console.log(JSON.stringify(geojson, null, 2))
