/*global -google */
'use strict';
var jsons = window.jsons;
var colors = ['red', 'blue', 'green', 'teal', 'navy', 'purple', 'lime', 'aqua', 'orange', 'yellow'];

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.685175, lng: 139.7506055},
    zoom: 13
  });

  var mapStyle = [
    {
      'stylers': [
        { 'saturation': -100 },
        { 'lightness': 80 }
      ]
    }
  ];
  var mapType = new google.maps.StyledMapType(mapStyle);
  map.mapTypes.set('GrayScaleMap', mapType);
  map.setMapTypeId('GrayScaleMap');

  jsons.forEach(function(json) {
    jQuery.getJSON(json, function(data, index) {
      // 情報window
      var date = new Date(data[0].tm * 1000);
      var infowindow = new google.maps.InfoWindow({
        content: [
          date.toLocaleString(),
          json
        ].join('<br />')
      });
      // 経路を描画
      var coordinates = data.map(function(coordinate) {
        return {
          lat: coordinate.la,
          lng: coordinate.lo
        };
      });
      var color = colors[Math.ceil(Math.random() * 10)];
      var walkPath = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.6,
        strokeWeight: 5
      });
      walkPath.addListener('click', function(e) {
        infowindow.setPosition(e.latLng);
        infowindow.open(map);
      });

      walkPath.setMap(map);
    });
  });
}
