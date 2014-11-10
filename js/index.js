$(function() {
  initialize();
});

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(35.681382, 139.766084),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}
