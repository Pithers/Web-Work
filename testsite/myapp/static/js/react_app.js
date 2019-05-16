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
//Efficiency Note:
//Once done, go back and make youtube API request GETs more specific
//There's a lot of data youtube gives us that we don't need
//References:
//Youtube API v3: https://developers.google.com/youtube/v3/
//Durstenfeld shuffle: 
//  https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
//  https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//Contents:
//##
const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
} //App for generating playlists


class PlaylistRandomizer extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);
    this.state = {
      term: '',
      playlists: [],
      selected: [],
      randomizer: []
    }; //Bind functions

    this.handleChange = this.handleChange.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.shufflePlaylist = this.shufflePlaylist.bind(this);
  } //Handles changes in the search bar for users
  //Each search will locate the user-id and then search for
  //youtube user's playlists and display them
  //returns a promise to wait on


  handleChange(event) {
    return new Promise((resolve, reject) => {
      this.setState({
        term: event.target.value
      }); //Find channel of user searched

      $.get(baseURL + 'channels', {
        part: "id",
        forUsername: event.target.value,
        key: APIKey
      }, channel => {
        //If username is valid, get playlists from user's channel
        if (channel.items.length == 1) {
          $.get(baseURL + 'playlists', {
            part: "snippet",
            channelId: channel.items[0].id,
            maxResults: 25,
            key: APIKey
          }, list => {
            this.setState({
              playlists: list.items
            });
            resolve();
          }).fail(() => {
            reject('Could not get playlists for youtube user');
          });
        } else {
          //If not, no playlists found
          this.setState({
            playlists: []
          });
        }
      }).fail(() => {
        reject('Could not get youtube user');
      });
    });
  } //Randomizes this.state.randomizer using a Durstenfeld shuffle


  shufflePlaylist() {
    console.log('shuffling');
    this.setState(prevState => ({
      randomizer: shuffleArray(prevState.randomizer)
    }));
  } //Children Playlists of this object will return their playlist of videos
  //and their id when their 'add' button is clicked
  //This function will check to see if the playlist is currently in the
  //randomizer list or not then decided whether or not to add videos
  //When new values are added to the randomizer randomize the order


  addPlaylist(videos, playlistId) {
    if (!this.state.selected.includes(playlistId)) {
      this.setState(prevState => ({
        selected: prevState.selected.concat(playlistId),
        randomizer: prevState.randomizer.concat(videos)
      }));
    }

    ;
  } //Remove playlist id from the selected list
  //and remove all videos in randomizer with playlistId
  //Use the filter function to compare both arrays with
  //the playlistId


  removePlaylist(playlistId) {
    if (this.state.selected.includes(playlistId)) {
      this.setState(prevState => ({
        selected: prevState.selected.filter(element => {
          return element != playlistId;
        }),
        randomizer: prevState.randomizer.filter(element => {
          return element.playlistId !== playlistId;
        })
      }));
    }
  }

  render() {
    //Render playlists
    const playlists = this.state.playlists.map((element, i) => {
      return React.createElement(Playlist, {
        addPlaylist: this.addPlaylist,
        removePlaylist: this.removePlaylist,
        title: element.snippet.title,
        id: element.id,
        key: element.id
      });
    }); //Searchbar results

    let result;

    if (this.state.term != '') {
      if (playlists.length == 0) {
        result = React.createElement("li", {
          key: "result"
        }, "No User Found");
      } else {
        result = React.createElement("li", {
          key: "result"
        }, "User: ", this.state.term);
      }
    } //Random List of Videos, can access id, title, videoId, and playlistId


    const randomizer = this.state.randomizer.map(element => {
      return React.createElement("li", {
        key: element.id
      }, element.title);
    });
    return React.createElement("div", null, React.createElement("button", {
      onClick: this.shufflePlaylist
    }, "Shuffle"), React.createElement("label", {
      htmlFor: "user-search"
    }, "Search Username"), React.createElement("input", {
      onChange: this.handleChange,
      name: "user-search",
      type: "text",
      value: this.state.term
    }), result, playlists, React.createElement("ul", null, randomizer));
  }

} //Object that holds each playlist


class Playlist extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      loaded: false,
      videos: []
    }; //Bind functions

    this.handleClick = this.handleClick.bind(this);
    this.getPlaylistVideos = this.getPlaylistVideos.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
  } //Recurse through get request through youtube via page tokens
  //and create a promise to wait on
  //Send multiple get requests if the playlist is over 50 videos
  //The list parameter will accumulate the playlist videos
  //Once recursion is done, the list will be saved to the
  //videos state variable


  getPlaylistVideos(list, token) {
    return new Promise((resolve, reject) => {
      $.get(baseURL + 'playlistItems', {
        part: "snippet",
        playlistId: this.props.id,
        maxResults: 50,
        pageToken: token,
        key: APIKey
      }, videos => {
        //Push all videos into the list
        videos.items.forEach(element => {
          list.push({
            title: element.snippet.title,
            videoId: element.snippet.resourceId.videoId,
            id: element.id,
            playlistId: this.props.id
          });
        }); //Recurse if there's a nextPageToken
        //Propagate the promise recursively

        if (videos.nextPageToken) {
          this.getPlaylistVideos(list, videos.nextPageToken).then(resolve).catch(reject);
        } else {
          //When done, if the list has more than one video
          //put the list into the videos state variable
          if (list.length >= 1) {
            this.setState({
              videos: list
            });
          } else {
            this.setState({
              videos: []
            });
          } //Once done, set video state to loaded and resolve the promise


          this.setState({
            loaded: true
          });
          resolve();
        }
      }).fail(() => {
        reject('Could not retrieve youtube video/s');
      });
    });
  } //When a Playlist Item is Clicked
  //On first click, grab all videos associated with the playlist
  //Don't bother with .then or .catch here.
  //If nothing loads, nothing will be rendered


  handleClick() {
    //Toggle active state
    this.setState({
      active: !this.state.active
    });

    if (!this.state.loaded) {
      this.getPlaylistVideos([], null);
    }
  } //When we want to add the playlist to the randomizer
  //If the videos are not loaded load them and await on the promise
  //Once the videos are loaded or if they are already loaded, pass
  //the video list up to the parent class (randomizer)


  addPlaylist() {
    //We only need to store the video title and videoId
    if (!this.state.loaded) {
      this.getPlaylistVideos([], null).then(() => {
        this.props.addPlaylist(this.state.videos, this.props.id);
      }).catch(() => {
        console.log('Unable to add playlist to randomizer. Get failed');
      });
    } else {
      this.props.addPlaylist(this.state.videos, this.props.id);
    }
  }

  removePlaylist() {
    this.props.removePlaylist(this.props.id);
  }

  render() {
    const playlist = this.state.videos.map(element => {
      return React.createElement(PlaylistVideo, {
        title: element.title,
        urlId: element.videoId,
        id: element.id,
        key: element.id
      });
    });
    return React.createElement("div", null, React.createElement("div", {
      key: this.props.id,
      onClick: this.handleClick
    }, this.props.title), React.createElement("div", null, React.createElement("button", {
      onClick: this.addPlaylist
    }, "Add"), React.createElement("button", {
      onClick: this.removePlaylist
    }, "Remove")), React.createElement("ul", null, this.state.active && playlist));
  }

} //Object that holds each Video


class PlaylistVideo extends React.Component {
  //Object constructor
  constructor(props) {
    super(props); //Bind functions

    this.handleClick = this.handleClick.bind(this);
  } //When a Playlist Video is Clicked


  handleClick() {
    console.log(this.props.id);
    console.log(this.props.title);
  }

  render() {
    //Get the youtube url of the video
    const ref = "https://www.youtube.com/watch?v=" + this.props.urlId;
    return React.createElement("li", {
      key: this.props.id,
      onClick: this.handleClick
    }, React.createElement("a", {
      href: ref,
      target: "_blank"
    }, this.props.title));
  }

} //Create DOM


ReactDOM.render(React.createElement(PlaylistRandomizer, null), document.getElementById('react-block'));
