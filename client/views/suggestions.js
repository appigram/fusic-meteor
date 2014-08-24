var refreshSuggestions = function() {
    Meteor.call('hotRightNow', function(error,result) {
    if(error) { console.log(error); return; }
    Session.set("suggestions", result);
  });
}

Template.suggestions.created = refreshSuggestions;

Template.suggestions.songs = function() {
    return Session.get('suggestions');
}

Template.suggestions.events = {
  'click button#refreshSuggestions' : refreshSuggestions,
  
  'click #addSong': function (e,template) {
    var playlistId = Router.current().params._id;
    
    //prepare query for Youtube
    var options = {
      part: 'id',
      type: 'video',
      videoEmbeddable: 'true',
      q: this.artist_name + " " + this.title
    }
    //perform Youtube search using artist and song information
    Meteor.call('youtube_search', options, function(error, data) { 
      if (error) { return false; }
      
      //Id from first search result
      var videoId = data.items[0].id.videoId;
      
      //Fetch extra info, put it in songcache
      var options = {
        'part': 'snippet,contentDetails,statistics',
        'id': videoId,
      }
      Meteor.call('youtube_videos_list', options);
      
      //Put it in current playlist
      var songObject = {
        "added" : new Date(),
        "author" : Meteor.userId(),
        "songId" : videoId
      };
      
      Playlists.update(
        { _id: playlistId},
        { $push: { songs: songObject} }
      );
    });

  },
}