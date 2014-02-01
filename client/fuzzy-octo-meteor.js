if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to fuzzy-octo-meteor.";
  };

  Template.hello.events({
    'click .event_submit' : function () {
      ename  = $('.event_name').val();
      edesc  = $('.event_description').val();
      estart = $('.event_start_date').val();
      eend   = $('.event_end_date').val();
      elong  = $('.event_longitude').val();
      elat   = $('event_latitude').val();
      ecreator = Meteor.user();
      Events.insert({creator: ecreator, name: ename, description: edesc, start_time: estart, end_time: eend, longitude: elong, latitude: elat, going: [ecreator]});
      $('#newEventInputs').fadeOut();
    },
    'click .showNewEventFields' : function() {
      $('.showNewEventFields').hide();
      $('#newEventInputs').fadeIn();
    },
    'click .resetForm' : function() {
      $('.showNewEventFields').show();
      $('#newEventInputs').fadeOut();
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
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

///////// dom manipulation stuff that isn't tied to meteor so I was going to put it in dom.js but jquery wasn't loaded first
$(document).ready(function() {
  // hide new event inputs when it loads
  $('#newEventInputs').hide();

});

