'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

(function () {
  var _window = window,
      renderSelectedPath = _window.renderSelectedPath;

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
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
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
      return _ref.apply(this, arguments);
    };
  }();

  window.laodGeoJSON = laodGeoJSON;
})();