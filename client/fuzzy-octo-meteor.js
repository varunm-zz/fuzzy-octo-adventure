if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to fuzzy-octo-meteor.";
  };

  Meteor.autorun(function() {
    if (Meteor.user() && Meteor.user().services && Meteor.user().services.facebook) {
      // create a new user when they connect to facebook
      // if they don't exist
      var fbid = Meteor.user().services.facebook.id;
      found_users = ConnectedUsers.find({'fbid': fbid});
      if(found_users.fetch().length == 0) {
        ConnectedUsers.insert({fbid: fbid, facebookUser: Meteor.user().services.facebook, longitude: 0, latitude: 0, events: [], close_friends:[]});
      }
    }
  });

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
      $('.showNewEventFields').show();
    },
    'click .showNewEventFields' : function() {
      $('.showNewEventFields').hide();
      $('#newEventInputs').fadeIn();
    },
    'click .resetForm' : function(event) {
      $('.showNewEventFields').show();
      $('#newEventInputs').fadeOut();
      // because the reset default functionality won't work
      $('.event_name').val("");
      $('.event_description').val("");
      $('.event_start_date').val("");
      $('.event_end_date').val("");
      $('.event_longitude').val("");
      $('event_latitude').val("");
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
    // set the longitude and latitude for a connected user
    the_user = ConnectedUsers.find({'fbid': Meteor.user().services.facebook.id}).fetch()[0];
    ConnectedUsers.update({'_id': the_user._id}, {'$set': {longitude: position.coords.longitude, latitude: position.coords.latitude}})
    Locations.insert({latitude: position.coords.latitude, longitude: position.coords.longitude});
    var newlocation = Locations.find().fetch()[0];
    var latitude = newlocation.latitude;
    var longitude = newlocation.longitude;
    longelement.innerHTML = 'LONGITUDE : ' + longitude;
}
// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

Template.display_event.events({
  'click .attendEventButton' : function(event) {
      var unique_identifier = $(event.target).attr('data');
      // add the logged in user to the event
      Events.update({_id: unique_identifier}, {'$push':{'going':Meteor.user()}});
    }
});

Template.hello.event_list = function() {
  // get all the events
  return Events.find();
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}



///////// dom manipulation stuff that isn't tied to meteor so I was going to put it in dom.js but jquery wasn't loaded first
$(document).ready(function() {
  // hide new event inputs when it loads
  $('#newEventInputs').hide();
});

