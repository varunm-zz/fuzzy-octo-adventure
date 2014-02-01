var map;
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
      if(Meteor.user() && Meteor.user().services && Meteor.user().services.facebook) {
        ename  = $('.event_name').val();
        edesc  = $('.event_description').val();
        estart = $('.event_start_date').val();
        eend   = $('.event_end_date').val();
        elong  = $('.event_longitude').val();
        elat   = $('.event_latitude').val();
        ecreator = Meteor.user();
        Events.insert({creator: ecreator, name: ename, description: edesc, start_time: estart, end_time: eend, longitude: elong, latitude: elat, going: [ecreator]});
      }

      $('#newEventInputs').fadeOut();
      $('.showNewEventFields').show();
    },
    'click #newEventCancel' : function(event) {
      $('.showNewEventFields').show();
      $('#newEventInputs').slideUp();
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

  var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title:"Hello World!"
  });
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
        var marker = new google.maps.Marker({
            position: eventLatLng,
            map: map,
            title: e.name
        });
        console.log(marker);
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
        var marker = new google.maps.Marker({
            position: userLatLng,
            map: map,
            title: u.facebookUser.name
        });
        console.log(marker);
      });
}

update_user_position = function () {
  console.log("WOO");
  navigator.geolocation.getCurrentPosition(function(position){
    console.log("HOO");
    var user = Meteor.user();
    if(user) {
      var mainUser = ConnectedUsers.find({fbid: user.services.facebook.id}).fetch()[0];
      console.log(mainUser);
      ConnectedUsers.update({_id: mainUser._id}, {'$set' : {'latitude': position.coords.latitude, 'longitude': position.coords.longitude}});
    }
  }, function(e) {
    console.log("errororjkdsafnjkldsahjfkdsajf");
  });
}

function update_user_position (position) {
  
}

///////// dom manipulation stuff that isn't tied to meteor so I was going to put it in dom.js but jquery wasn't loaded first
$(document).ready(function() {
  // hide new event inputs when it loads
  $('#newEventInputs').hide();

  $(".showNewEventFields").click (function () {
    if(Meteor.user() && Meteor.user().services && Meteor.user().services.facebook) {
      $('.showNewEventFields').hide();
      $('#newEventInputs').slideDown();
    }
  }); 

  setInterval(update_user_position, 3000);
});

