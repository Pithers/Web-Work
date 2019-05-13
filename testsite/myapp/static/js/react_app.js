//Filename: react_app.js/x
//Author: Brandon Smith
//File Description:
//This is a youtube playlist randomizer app
//Set up multiple playlists in youtube and this will
//Shuffle videos between them
//Notes:
//As this is a JSX app, here will be an attempt to contain the
//JS, HTML, and CSS styling all in a single file. There have been
//arguments made about the benefit of this; so this is kind of an
//experiment in how it reads.
//References:
//Contents:
//##
const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/"; //Get the specified username

function getYoutubeUserId(username) {
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

function getYoutubePlaylists(id) {
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
}

function getPlaylistVideos(listId) {
  youtubePlaylistVideosPromise(listId).then(function (data) {
    console.log(data.items[0].snippet.title);
  });
} //Search For User
//getUserPlaylists('misterpithers').then();
//Display Playlists from User
//Select Playlists from User
//getPlaylistVideos('PLH0PzuhXpJp2N1XZN7ikHF8UqDcbCbY5q');
//Cancelable promise

/*const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
      error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

const cancelablePromise = makeCancelable(
  //Search for typed user and get all playlists
  getYoutubeUserId(this.state.term).then((user_id) => {
    getYoutubePlaylists(user_id).then((data) => {
      data.forEach(function(element) {
        console.log(element.snippet.title);
        console.log(element.id);
      });
      this.setState({
        playlists: ['a'],
      });
    });
  })
);*/
//Main class. App goes here


class PlaylistRandomizer extends React.Component {
  render() {
    return React.createElement(Playlist, null);
  }

}

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      term: '',
      playlists: []
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      term: event.target.value
    });
    $.get(baseURL + 'channels', {
      part: "id",
      forUsername: this.state.term,
      key: APIKey
    }, channel => {
      $.get(baseURL + 'playlists', {
        part: "snippet",
        channelId: channel.items[0].id,
        maxResults: 25,
        key: APIKey
      }, list => {
        this.setState({
          playlists: list.items
        });
      });
    });
  }

  render() {
    const items = this.state.playlists.map((element, i) => {
      return React.createElement("li", {
        key: i
      }, element.snippet.title);
    });
    return React.createElement("div", null, items, React.createElement("label", {
      htmlFor: "user-search"
    }, "Input Username"), React.createElement("input", {
      onChange: this.handleChange,
      name: "user-search",
      type: "text",
      value: this.state.term
    }));
  }

}

class Clock extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement("h1", null, "Hello, world!"), React.createElement("h2", null, "It is ", this.props.date.toLocaleTimeString(), "."));
  }

} //Create DOM


function tick() {
  ReactDOM.render(React.createElement(PlaylistRandomizer, null), document.getElementById('react-block'));
}

setInterval(tick, 1000);
