//Filename: react_app.js
//Author: Brandon Smith
//File Description:
//References:
//Contents:
//##
const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/"; //Get the specified username

function youtubeUserIdPromise(username) {
  return new Promise(function (resolve, reject) {
    $.get(baseURL + 'channels', {
      part: "id",
      forUsername: username,
      key: APIKey
    }, function (data) {
      resolve(data.items[0].id);
    });
  });
}

function youtubePlaylistsPromise(id) {
  return new Promise(function (resolve, reject) {
    $.get(baseURL + 'playlists', {
      part: "snippet",
      channelId: id,
      maxResults: 25,
      key: APIKey
    }, function (data) {
      resolve(data.items);
    });
  });
}

function youtubePlaylistVideosPromise(listId) {
  return new Promise(function (resolve, reject) {
    $.get(baseURL + 'playlistItems', {
      part: "snippet",
      playlistId: listId,
      key: APIKey
    }, function (data) {
      resolve(data);
    });
  });
} //Retreive playlist from name


function getUserPlaylists(username) {
  youtubeUserIdPromise(username).then(function (user_id) {
    youtubePlaylistsPromise(user_id).then(function (data) {
      data.forEach(function (element) {
        console.log(element.snippet.title); //console.log(element.id);
      });
    });
  });
}

function getPlaylistVideos(listId) {
  youtubePlaylistVideosPromise(listId).then(function (data) {
    console.log(data.items[0].snippet.title);
  });
}

getUserPlaylists('misterpithers');
getPlaylistVideos('PLH0PzuhXpJp2N1XZN7ikHF8UqDcbCbY5q');

class Clock extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement("h1", null, "Hello, world!"), React.createElement("h2", null, "It is ", this.props.date.toLocaleTimeString(), "."));
  }

}

function tick() {
  ReactDOM.render(React.createElement(Clock, {
    date: new Date()
  }), document.getElementById('react-block'));
}

setInterval(tick, 1000);
