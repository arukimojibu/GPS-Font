'use strict';

(function () {
  var _window = window,
      L = _window.L;

  // arukimoji object

  window.arukimoji = {
    map: null,
    selectedPath: [],
    gpsLayer: null,
    path: null,
    emBox: null,
    emBoxLayer: null,
    pointLayer: null,
    exportControl: null

    // init map
  };var map = L.map('map', {
    zoomSnap: 0.1,
    scrollWheelZoom: false,
    maxZoom: 20
  }).setView([35.685175, 139.7528], 13);
  window.arukimoji.map = map;

  // zoom controller
  L.control.scale().addTo(map);

  // tile layer
  var mapboxAccessToken = 'pk.eyJ1IjoieW5ha2FqaW1hIiwiYSI6ImNqaXN1ajM0djF1eHgza3BtN21icDczaW4ifQ.upCab-6A__zRBega4faaBA';
  var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
    minZoom: 12,
    maxZoom: 20,
    attribution: '<a href="https://www.mapbox.com/about/maps/">&copy; Mapbox</a> <a href="https://openstreetmap.org">&copy; OpenStreetMap</a>'
  });
  var mapboxStreet = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
    minZoom: 12,
    maxZoom: 20,
    attribution: '<a href="https://www.mapbox.com/about/maps/">&copy; Mapbox</a> <a href="https://openstreetmap.org">&copy; OpenStreetMap</a>'
  });
  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 12,
    maxZoom: 20,
    attribution: '<a href="https://openstreetmap.org">&copy; OpenStreetMap</a>'
  });
  var baseLayers = {
    'Light': mapbox,
    'Street': mapboxStreet,
    'OpenStreetMap': osm
  };
  mapbox.addTo(map);

  // GeoJSON layer
  var gpsLayer = L.layerGroup().addTo(map);
  var overlays = {
    'GPSデータ': gpsLayer
  };
  window.arukimoji.gpsLayer = gpsLayer;

  // layer control
  L.control.layers(baseLayers, overlays).addTo(map);

  // point layer
  var pointLayer = L.layerGroup().addTo(map);
  map.on('zoom', function () {
    pointLayer.invoke('arukimojiRenderNode');
  });
  window.arukimoji.pointLayer = pointLayer;

  // path
  var path = L.polyline([], { color: '#000', weight: 1 }).addTo(map);
  path.interactive = false;
  window.arukimoji.path = path;

  // emBox
  var emBox = L.latLngBounds(L.latLng([0, 0]).toBounds(2));
  window.arukimoji.emBox = emBox;

  // emBoxLayer
  var emBoxLayer = L.layerGroup().addTo(map);
  window.arukimoji.emBoxLayer = emBoxLayer;

  // export control
  var ExportControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    onAdd: function onAdd(map) {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-select leaflet-control-select--disable');

      // unselect all
      var unselectAllButton = L.DomUtil.create('i', 'fa fa-times', container);
      unselectAllButton.title = '全ての選択を解除';
      unselectAllButton.onclick = function (e) {
        window.arukimoji.selectedPath.forEach(function (_ref) {
          var path = _ref.path;

          path.arukimoji.unselect();
        });
        map.setView([35.685175, 139.7528], 13);
      };

      // download
      var donwloadButton = L.DomUtil.create('i', 'fa fa-file-download', container);
      donwloadButton.title = 'GeoJSON ファイルをダウンロード';
      donwloadButton.onclick = function (e) {
        e.stopPropagation();
        var filename = window.prompt('ファイル名を入力してください');
        if (filename) {
          window.exportGeoJSON(filename);
        }
      };

      return container;
    }
  });
  window.arukimoji.exportControl = new ExportControl().addTo(map);

  // load GPS log
  window.laodGeoJSON('/gpslog/gpslog.geojson', map, gpsLayer, path, pointLayer);
})();