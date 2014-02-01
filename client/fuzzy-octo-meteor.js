Locations = new Meteor.Collection("locations");
if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to fuzzy-octo-meteor.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

initialize = function() {
  console.log("initialize map")
  // var newlocation = Locations.find().fetch()[0];
  // console.log(newlocation);
  // var latitude = newlocation.latitude;
  // var longitude = newlocation.longitude;
  var mapOptions = {
        center: new google.maps.LatLng(40.443834, -79.9444535),
        zoom: 14
      };
      var map = new google.maps.Map(document.getElementById("map-canvas"),
          mapOptions);
    }

Meteor.startup(function (){
 
      google.maps.event.addDomListener(window, 'load', initialize);
});


// Wait for PhoneGap to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// PhoneGap is ready
//
function onDeviceReady() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// onSuccess Geolocation
//
function onSuccess(position) {
    var element = document.getElementById('geolocation');
    var longelement = document.getElementById('longitude');
    Locations.insert({latitude: position.coords.latitude, longitude: position.coords.longitude});
    var newlocation = Locations.find().fetch()[0];
    var latitude = newlocation.latitude;
    var longitude = newlocation.longitude;
    longelement.innerHTML = 'LONGITUDE : ' + longitude
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

// Template.maps.rendered = function() {
//     var newlocation = Locations.find().fetch()[0];
//     var latitude = newlocation.latitude;
//     var longitude = newlocation.longitude;
//     var mapOptions = {
//         center: new google.maps.LatLng(latitude, longitude),
//         zoom: 8,
//         mapTypeId: google.maps.MapTypeId.ROADMAP
//     };

//     var map = new google.maps.Map(document.getElementById("map-canvas"),
//         mapOptions);   
// }
