'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  /**
   * renderNode
   */
  var renderNode = function renderNode(node, map) {
    var zoom = map.getZoom();
    var zoomScale = map.getZoomScale(zoom, 15);
    var radius = zoom <= 15 ? 18 : 18 / zoomScale;
    node.setRadius(radius);
  };

  /**
   * render selected path
   */
  var renderSelectedPath = function renderSelectedPath() {
    var _window = window,
        L = _window.L,
        proj4 = _window.proj4,
        arukimoji = _window.arukimoji;

    var EPSG3857 = proj4('EPSG:3857');
    var WGS84 = proj4('WGS84');
    var map = arukimoji.map,
        pointLayer = arukimoji.pointLayer,
        selectedPath = arukimoji.selectedPath,
        exportControl = arukimoji.exportControl,
        emBoxLayer = arukimoji.emBoxLayer;

    var bounds = L.latLngBounds();
    var exportControlContainer = exportControl.getContainer();

    // clear
    pointLayer.clearLayers();
    emBoxLayer.clearLayers();

    // render
    selectedPath.forEach(function (_ref) {
      var feature = _ref.feature,
          path = _ref.path;

      // render outline
      var latLngs = path.getLatLngs();
      L.polyline(latLngs, { color: '#00f', weight: 1 }).addTo(pointLayer);

      // render point
      latLngs.forEach(function (point, index) {
        var coordTime = new Date(feature.properties.coordTimes[index]).toLocaleString();
        var node = L.circle(point, {
          radius: 5,
          stroke: false,
          fillOpacity: 1,
          color: '#00f'
        });

        // create node
        node.bindTooltip('<b>' + index + '</b> of ' + feature.properties.name + '<br>' + point.lat + ', ' + point.lng + '<br>' + coordTime).addTo(pointLayer).bringToFront();
        node.arukimojiRenderNode = function () {
          renderNode(node, map);
        };
        node.arukimojiRenderNode();
      });

      bounds.extend(path.getBounds());
    });

    if (selectedPath.length > 0) {
      // emBox
      var ne = bounds.getNorthWest();
      var sw = bounds.getSouthEast();

      var _proj = proj4(EPSG3857, [ne.lng, ne.lat]),
          _proj2 = _slicedToArray(_proj, 2),
          xMin = _proj2[0],
          yMax = _proj2[1];

      var _proj3 = proj4(EPSG3857, [sw.lng, sw.lat]),
          _proj4 = _slicedToArray(_proj3, 2),
          xMax = _proj4[0],
          yMin = _proj4[1];

      var width = xMax - xMin,
          height = yMax - yMin;

      var delta = Math.abs(width - height) / 2;
      if (height > width) {
        xMin -= delta;
        xMax += delta;
      } else {
        yMin -= delta;
        yMax += delta;
      }
      width = xMax - xMin;
      height = yMax - yMin;

      var emBoxNe = proj4(EPSG3857, WGS84, { x: xMin, y: yMax });
      var emBoxSw = proj4(EPSG3857, WGS84, { x: xMax, y: yMin });
      var emBox = L.latLngBounds(L.latLng(emBoxNe.y, emBoxNe.x), L.latLng(emBoxSw.y, emBoxSw.x));
      emBox = emBox.pad(0.111111111);
      window.arukimoji.emBox = emBox;
      console.log(emBox);

      // emBoxRect
      L.rectangle(emBox, {
        weight: 1
      }).addTo(emBoxLayer).bringToBack();

      // fit emBox
      map.fitBounds(emBox);

      // enable export control
      exportControlContainer.classList.remove('leaflet-control-select--disable');
    } else {
      exportControlContainer.classList.add('leaflet-control-select--disable');
    }
  };

  window.renderSelectedPath = renderSelectedPath;
})();