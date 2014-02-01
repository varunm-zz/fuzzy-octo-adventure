var map;
var markers = [];
console.log("FIRST TIME EVER")
if (Meteor.isClient) {

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
      elat   = $('.event_latitude').val();
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
      $('.event_latitude').val("");
    }
  });
}

//-------------------------------------------------------------------------
// GOOGLE MAPS
initialize = function() {
  console.log("initialize map")
  var newlocation = Locations.find().fetch()[0];
  console.log(newlocation);
  var latitude = newlocation.latitude;
  var longitude = newlocation.longitude;
  var myLatlng = new google.maps.LatLng(latitude, longitude);

  // update a user location here
  if(Meteor.user() && Meteor.user().services && Meteor.user().services.facebook) {
    the_user = ConnectedUsers.find({'fbid': Meteor.user().services.facebook.id}).fetch()[0];
    ConnectedUsers.update({'_id': the_user._id}, {'$set': {longitude: newlocation.longitude, latitude: newlocation.latitude}})  
  }

  var mapOptions = {
        center: myLatlng,
        zoom: 15
      };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  draw_markers();
  draw_markers_users();
}


// Meteor.startup(function (){
 
//       google.maps.event.addDomListener(window, 'load', initialize);
// });

//-------------------------------------------------------------------------

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
    // set the longitude and latitude for a connected user
    // the_user = ConnectedUsers.find({'fbid': Meteor.user().services.facebook.id}).fetch()[0];
    // console.log(the_user);
    // ConnectedUsers.update({'_id': the_user._id}, {'$set': {longitude: position.coords.longitude, latitude: position.coords.latitude}})
    Locations.insert({latitude: position.coords.latitude, longitude: position.coords.longitude});
    initialize();
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

Template.update_markers.draw_markers = function () {
    draw_markers();
}

Template.update_markers_users.draw_markers_users = function () {
    draw_markers_users();
}

draw_markers = function () {
  console.log("finished marker");
      console.log(map);
      var events = Events.find().fetch();
      _.each(events, function(e) {
        var latitude = e.latitude;
        var longitude = e.longitude;
        console.log("latitude: " +  latitude);
        console.log("longitude: " + longitude);
        var eventLatLng = new google.maps.LatLng(latitude, longitude);
        // var currentMarker = markers[e.name];
        var currentMarker = null
        for (var i =0; i<markers.length; i++) {
          if(markers[i].name == e.name) {
            currentMarker = markers[i].marker;
          }
        } 
        if (currentMarker == null) {
          console.log("events if statement")
          currentMarker = new google.maps.Marker({
              position: eventLatLng,
              map: map,
              clickable: true,
              title: e.name
          });
          // markers[e.name] = currentMarker;
          insert(e.name, currentMarker);
        }
        else {
          console.log("events else statement")
          currentMarker.setPosition(eventLatLng);
        }
        google.maps.event.addListener(currentMarker, 'click', function() { 
          map.setCenter(new google.maps.LatLng(currentMarker.position.lat(), currentMarker.position.lng())); 
          map.setZoom(18); 
          onItemClick(event, currentMarker); 
        });
        console.log(markers);
      });
}

draw_markers_users = function () {
  console.log("finished user marker");
      console.log(map);
      var users = ConnectedUsers.find().fetch();
      _.each(users, function(u) {
        var latitude = u.latitude;
        var longitude = u.longitude;
        console.log("latitude: " +  latitude);
        console.log("longitude: " + longitude);
        var userLatLng = new google.maps.LatLng(latitude, longitude);
        console.log("1 : " + u.facebookUser.name);
        var currentMarker = null
        for (var i=0;i<markers.length;i++) {
          console.log("AAAHHHHHHHHHHHHHHHHHHHHHH")
          console.log(markers[i].name);
          console.log(u.facebookUser.name);

          if(markers[i].name == u.facebookUser.name) {
            console.log("in loop if");
            currentMarker = markers[i].marker;
          }
        } 
        // var currentMarker = markers[u.facebookUser.name];
        console.log("currentMarker : " + currentMarker);
        if (currentMarker == null) {
          console.log("users if statement")
          currentMarker = new google.maps.Marker({
              position: userLatLng,
              map: map,
              clickable: true,
              title: u.facebookUser.name
          });
          console.log("2 : " + u.facebookUser.name);
          insert(u.facebookUser.name, currentMarker);
          // markers[u.facebookUser.name] = currentMarker;
        }
        else {
          console.log("users else statement")
          currentMarker.setPosition(userLatLng);
          // insert
        }
        google.maps.event.addListener(currentMarker, 'click', function() {
          onItemClick(event, currentMarker); 
        });
        console.log("MARKERS: " + markers);
      });
}

// Info window trigger function 
function onItemClick(event, pin) { 
  // Create content  
  var contentString = pin.title

  // Replace our Info Window's content and position 
  infowindow.setContent(contentString); 
  infowindow.setPosition(pin.position); 
  infowindow.open(map) 
} 

update_user_position = function () {
  console.log("WOO");
  navigator.geolocation.getCurrentPosition(function(position){
    console.log("HOO");
  var user = Meteor.user();
  var mainUser = ConnectedUsers.find({fbid: user.services.facebook.id}).fetch()[0];
  console.log(mainUser);
  ConnectedUsers.update({_id: mainUser._id}, {'$set' : {'latitude': position.coords.latitude, 'longitude': position.coords.longitude}});
  }, function(e) {
    console.log("errororjkdsafnjkldsahjfkdsajf");
  });
}

function insert(name, marker) {
    markers.push({
        name: name,
        marker: marker
    });        
}

///////// dom manipulation stuff that isn't tied to meteor so I was going to put it in dom.js but jquery wasn't loaded first
$(document).ready(function() {
  // hide new event inputs when it loads
  $('#newEventInputs').hide();

  $(".showNewEventFields").click (function () {
    $('.showNewEventFields').hide();
    $('#newEventInputs').fadeIn();
  }); 

  setInterval(update_user_position, 10000);
});

