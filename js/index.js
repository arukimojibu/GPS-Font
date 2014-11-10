$(function() {
  initialize();
});

function initialize() {
  // gps-glyph データを読み込み
  $.getJSON('./gps-glyph/U+30/U+3071.json', function(json) {
    
    // MAPを生成
    var mapOptions = {
      center: new google.maps.LatLng(35.681382, 139.766084),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    var bounds = new google.maps.LatLngBounds();

    // 線を描画
    $.each(json.gps, function() {
      drawPath(map, this, {
        strokeColor: "#FFFFFF",
        strokeOpacity: 0.8,
        strokeWeight: 16
      }, bounds); 
    });
    $.each(json.gps, function() {
      drawPath(map, this, {
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 8 
      }, bounds); 
    });

    // 枠を描画
    /*
    var rect = new google.maps.Rectangle({
      bounds: bounds,
      strokeColor: "#00FF00",
      strokeOpacity: 0.5,
      strokeWeight: 4,
      fillOpacity: 0
    });
    rect.setMap(map);
    */
    
    // 地図を移動
    map.fitBounds(bounds);

  });

}

function drawPath(map, gpsCoordinates, option, bounds) {
  // 線を描画
  var path = [];
  
  for (var i = 0, l = gpsCoordinates.length; i < l; i++) {
    var gps = gpsCoordinates[i];
    var lat = gps.la;
    var lng = gps.lo;
    path.push(new google.maps.LatLng(lat, lng));
  }

  var gpsPath = new google.maps.Polyline(option);
  gpsPath.setPath(path);
  gpsPath.setMap(map);
  extendBounds(gpsPath, bounds);
}

function extendBounds(polyline, bounds){
  var points = polyline.getPath().getArray();
  for (var n = 0; n < points.length ; n++){
    bounds.extend(points[n]);
  }
}
