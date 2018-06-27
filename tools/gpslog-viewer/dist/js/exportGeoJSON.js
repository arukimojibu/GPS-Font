'use strict';

(function () {
  var exportGeoJSON = function exportGeoJSON(filename) {
    var selectedPath = window.arukimoji.selectedPath;

    if (selectedPath.length === 0) {
      return;
    }
    var geojson = {
      type: 'Feature',
      bbox: [],
      properties: {
        origin: []
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: []
      }
    };

    selectedPath.forEach(function (_ref) {
      var path = _ref.path,
          feature = _ref.feature;
      var properties = feature.properties,
          geometry = feature.geometry;
      var name = properties.name,
          time = properties.time;

      geojson.properties.origin.push({
        name: name, time: time
      });
      geojson.geometry.coordinates.push(geometry.coordinates);
    });
    var blob = new window.Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    var url = window.URL.createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename + '.geojson';
    link.click();
    window.URL.revokeObjectURL(url);
  };
  window.exportGeoJSON = exportGeoJSON;
})();