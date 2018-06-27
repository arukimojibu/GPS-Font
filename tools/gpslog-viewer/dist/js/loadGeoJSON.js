'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

  /**
   * selectPath
   */
  var selectPath = function selectPath(feature, path) {
    if (path.arukimoji.isSelected) {
      return;
    }
    path.arukimoji.isSelected = true;
    path.interactive = false;
    path.unbindTooltip();
    window.arukimoji.selectedPath.push({ feature: feature, path: path });
    renderSelectedPath();
  };

  /**
   * unselectPath
   */
  var unselectPath = function unselectPath(featur, path) {
    if (!path.arukimoji.isSelected) {
      return;
    }
    path.arukimoji.isSelected = false;
    path.interactive = true;
    path.unbindTooltip();
    path.bindTooltip(path.arukimoji.toolTipContent);
    path.fire('mouseout');
    window.arukimoji.selectedPath = window.arukimoji.selectedPath.filter(function (item) {
      return item.path !== path;
    });
    renderSelectedPath();
  };

  /**
   * load GeoJSON
   * @param {string} url
   */
  var laodGeoJSON = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
      var _window2, L, geolib, fetch, arukimoji, gpsLayer, path, colors, res, geoJSON, geoJSONLayer;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _window2 = window, L = _window2.L, geolib = _window2.geolib, fetch = _window2.fetch, arukimoji = _window2.arukimoji;
              gpsLayer = arukimoji.gpsLayer, path = arukimoji.path;
              colors = ['red', 'blue', 'green', 'teal', 'navy', 'purple', 'lime', 'aqua', 'orange', 'LightSalmon', 'SlateBlue', 'IndianRed', 'DarkOliveGreen'];

              // fetch geojson

              _context.next = 5;
              return fetch(url);

            case 5:
              res = _context.sent;
              _context.next = 8;
              return res.json();

            case 8:
              geoJSON = _context.sent;

              console.log(geoJSON);

              // add layer
              geoJSONLayer = L.geoJSON(geoJSON, {
                style: function style() {
                  return {
                    opacity: 0.7,
                    weight: 3
                  };
                },
                onEachFeature: function onEachFeature(feature, layer) {
                  var coordTimes = feature.properties.coordTimes;
                  var start = new Date(coordTimes[0]);
                  var end = new Date(coordTimes[coordTimes.length - 1]);
                  var min = Math.round((end.getTime() - start.getTime()) / 1000 / 60);

                  // get distance
                  var distance = 0;
                  feature.geometry.coordinates.forEach(function (current, index) {
                    if (index === 0) {
                      return;
                    }
                    var prev = feature.geometry.coordinates[index - 1];
                    distance += geolib.getDistance({ latitude: current[1], longitude: current[0] }, { latitude: prev[1], longitude: prev[0] });
                  });

                  // arukimoji meta data
                  layer.arukimoji = {
                    isSelected: false,
                    toolTipContent: feature.properties.name + '<br>' + distance / 1000 + 'km<br>' + start.toLocaleString() + ' ~ ' + end.toLocaleString() + '<br>' + min + 'min',
                    select: function select() {
                      selectPath(feature, layer);
                    },
                    unselect: function unselect() {
                      unselectPath(feature, layer);
                    }
                  };

                  layer.setStyle({
                    color: colors[Math.floor(Math.random() * colors.length)]
                  });

                  // tooltip
                  layer.bindTooltip(layer.arukimoji.toolTipContent);

                  // mouseover
                  layer.on('mouseover', function (e) {
                    if (layer.arukimoji.isSelected) {
                      return;
                    }
                    path.setLatLngs(layer.getLatLngs()).bringToFront();
                    layer.setStyle({
                      weight: 8,
                      opacity: 0.5
                    }).bringToFront();
                  });

                  // mouseout
                  layer.on('mouseout', function (e) {
                    if (layer.arukimoji.isSelected) {
                      return;
                    }
                    layer.setStyle({
                      weight: 3,
                      opacity: 0.7
                    });
                    path.setLatLngs([]);
                  });

                  // click
                  layer.on('click', function (e) {
                    // select
                    if (layer.arukimoji.isSelected) {
                      layer.arukimoji.unselect();
                    } else {
                      layer.arukimoji.select();
                    }
                  });
                }
              });

              gpsLayer.addLayer(geoJSONLayer);

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function laodGeoJSON(_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  window.laodGeoJSON = laodGeoJSON;
})();