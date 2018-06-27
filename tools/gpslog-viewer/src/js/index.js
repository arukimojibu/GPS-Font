(() => {
  const { L } = window

  // arukimoji object
  window.arukimoji = {
    map: null,
    selectedPath: [],
    gpsLayer: null,
    path: null,
    pointLayer: null,
    exportControl: null
  }

  // init map
  var map = L.map('map', {
    zoomSnap: 0.1,
    scrollWheelZoom: false,
    maxZoom: 20
  }).setView([35.685175, 139.7528], 13)
  window.arukimoji.map = map

  // zoom controller
  L.control.scale().addTo(map)

  // tile layer
  const mapboxAccessToken = 'pk.eyJ1IjoieW5ha2FqaW1hIiwiYSI6ImNqaXN1ajM0djF1eHgza3BtN21icDczaW4ifQ.upCab-6A__zRBega4faaBA'
  const mapbox = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
    minZoom: 12,
    maxZoom: 20,
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  })
  const mapboxStreet = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
    minZoom: 12,
    maxZoom: 20,
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  })
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 12,
    maxZoom: 20,
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  })
  const baseLayers = {
    'Light': mapbox,
    'Street': mapboxStreet,
    'OpenStreetMap': osm
  }
  mapbox.addTo(map)

  // GeoJSON layer
  const gpsLayer = L.layerGroup().addTo(map)
  const overlays = {
    'GPSデータ': gpsLayer
  }
  window.arukimoji.gpsLayer = gpsLayer

  // layer control
  L.control.layers(baseLayers, overlays).addTo(map)

  // point layer
  const pointLayer = L.layerGroup().addTo(map)
  map.on('zoom', () => {
    pointLayer.invoke('arukimojiRenderNode')
  })
  window.arukimoji.pointLayer = pointLayer

  // path
  const path = L.polyline([], {color: '#000', weight: 1}).addTo(map)
  path.interactive = false
  window.arukimoji.path = path

  // export control
  const ExportControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    onAdd: (map) => {
      const container = L.DomUtil.create(
        'div',
        'leaflet-bar leaflet-control leaflet-control-select leaflet-control-select--disable'
      )

      // unselect all
      const unselectAllButton = L.DomUtil.create('i', 'fa fa-times', container)
      unselectAllButton.title = '全ての選択を解除'
      unselectAllButton.onclick = (e) => {
        window.arukimoji.selectedPath
          .forEach(({path}) => {
            path.arukimoji.unselect()
          })
      }

      // download
      const donwloadButton = L.DomUtil.create('i', 'fa fa-file-download', container)
      donwloadButton.title = 'GeoJSON ファイルをダウンロード'
      donwloadButton.onclick = (e) => {
        e.stopPropagation()
        const filename = window.prompt('ファイル名を入力してください')
        if (filename) {
          window.exportGeoJSON(filename)
        }
      }

      return container
    }
  })
  window.arukimoji.exportControl = new ExportControl().addTo(map)

  // load GPS log
  window.laodGeoJSON('/gpslog/gpslog.geojson', map, gpsLayer, path, pointLayer)
})()
