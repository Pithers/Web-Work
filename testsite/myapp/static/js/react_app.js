//Filename: react_app.js/x
//Author: Brandon Smith
//File Description:
//This is a youtube playlist randomizer app
//Set up multiple playlists in youtube and this will
//shuffle videos between them
//Efficiency Note:
//Once done, go back and make youtube API request GETs more specific
//There's a lot of data that youtube gives us that we don't need
//References:
//Youtube API v3: https://developers.google.com/youtube/v3/
//Durstenfeld shuffle:
//  https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
//  https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//Seeding Random:
//  https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
//Swipe Detection: https://github.com/marcandre/detect_swipe
//Future Ideas:
// Place tutorial areas under Current and Next Up when they're empty
// Improve searchbar functionality so users can search for playlists without knowing the user
//  -perhaps by adding a search selection option to the search bar
//Contents:
//## Random Number Functions
//##   MurmurHash3's Mixing Function
//##   Sfc32
//##   Durstenfeld Array shuffler
//## React App
//##   Playlist Randomizer Class
//##   Player Class
//##   Playlist Class
//##   PlaylistVideo Class
//## React Render Create DOM
//Youtube Api and base Url
const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/"; //MurmurHash3's Mixing Function. Turns a string into a 32-bit hash

function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353), h = h << 13 | h >>> 19;

  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
} //Sfc32 random number generator. Provide it with 4 seeds.


function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = a + b | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
} //Create random number generator


const seed = xmur3(new Date().toLocaleString());
const rand = sfc32(seed(), seed(), seed(), seed()); //Durstenfeld Array shuffler

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
} //React App
//React Playlist Randomizer
//App for generating playlists


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
    //Keyboard Input

    this.handleChange = this.handleChange.bind(this); //Playlist Construction

    this.getPlaylists = this.getPlaylists.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.clearPlaylist = this.clearPlaylist.bind(this); //Video Control

    this.shufflePlaylist = this.shufflePlaylist.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this.prevVideo = this.prevVideo.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
  } //Handles changes in the search bar for users
  //Each search will locate the user-id and then search for
  //youtube user's playlists and display them
  //returns a promise to wait on


  handleChange(event) {
    let search = event.target.value;
    return new Promise((resolve, reject) => {
      this.setState({
        term: search
      }); //Find channel of user searched or display name of channel if there is one

      $.get(baseURL + 'channels', {
        part: "id",
        forUsername: search,
        key: APIKey
      }, channel => {
        //If username is valid, get playlists from user's channel
        if (channel.items.length == 1) {
          //console.log('results for channel names');
          //console.log(channel);
          this.getPlaylists(channel.items[0].id, [], null);
        } else {
          //If not, we will search for display names, which there can be multiple of
          $.get(baseURL + 'search', {
            part: "snippet",
            type: "channel",
            q: search,
            key: APIKey
          }, names => {
            //Get Playlists for display names, if not there's no results
            if (names.items.length > 0) {
              //console.log('results for display names');
              //console.log(names);
              this.getPlaylists(names.items, [], null);
            } else {
              this.setState({
                playlists: []
              });
            }
          }).fail(() => {
            reject('Failed to find other users of same name');
          });
        }
      }).fail(() => {
        reject('Could not get youtube user');
      });
    });
  } //Recursively get playlists from the user object (can be multiple or single)


  getPlaylists(users, list, token) {
    return new Promise((resolve, reject) => {
      //Detect if we're dealing with a channel response or a display name response
      //since the objects returned from youtube are slightly different
      let requestId;

      if (typeof users === 'object') {
        requestId = users[0].id.channelId;
      } else {
        requestId = users;
      }

      $.get(baseURL + 'playlists', {
        part: "snippet",
        channelId: requestId,
        maxResults: 50,
        pageToken: token,
        key: APIKey
      }, results => {
        results.items.forEach(element => {
          list.push({
            id: element.id,
            title: element.snippet.title,
            owner: ''
          });
        }); //Recurse if there are more results

        if (results.nextPageToken) {
          this.getPlaylists(users, list, results.nextPageToken).then(resolve).catch(reject);
        } else {
          //When done, if the list has more than one playlist
          //put the list into the playlists variable
          if (list.length >= 1) {
            this.setState({
              playlists: list
            });
          } else {
            this.setState({
              playlists: []
            });
          }

          resolve();
        }
      }).fail(() => {
        reject('Could not get playlists for youtube user');
      });
    });
  } //Children Playlists of this object will return their playlist of videos
  //and their id when their 'add' button is clicked
  //This function will check to see if the playlist is currently in the
  //randomizer list or not then decided whether or not to add videos
  //When new values are added to the randomizer randomize the order


  addPlaylist(videos, playlist) {
    if (!this.state.selected.filter(element => element.id == playlist.id).length) {
      this.setState(prevState => ({
        selected: prevState.selected.concat(playlist),
        randomizer: prevState.randomizer.concat(videos)
      }));
      this.shufflePlaylist();
    }

    ;
  } //Remove playlist id from the selected list
  //and remove all videos in randomizer with playlistId
  //Use the filter function to compare both arrays with
  //the playlistId


  removePlaylist(playlistId) {
    if (this.state.selected.filter(element => element.id == playlistId).length) {
      this.setState(prevState => ({
        selected: prevState.selected.filter(element => {
          return element.id != playlistId;
        }),
        randomizer: prevState.randomizer.filter(element => {
          return element.playlistId != playlistId;
        })
      }));
      this.shufflePlaylist();
    }
  } //Remove all playlists


  clearPlaylist() {
    this.setState({
      selected: [],
      randomizer: []
    });
  } //Randomizes this.state.randomizer using a Durstenfeld shuffle


  shufflePlaylist() {
    this.setState(prevState => ({
      randomizer: shuffleArray(prevState.randomizer)
    }));
  } //Puts the first element of the randomizer onto the back of the randomizer


  nextVideo() {
    if (this.state.randomizer.length) {
      this.setState(prevState => ({
        randomizer: prevState.randomizer.concat(prevState.randomizer.shift())
      }));
    }
  } //Puts the last element of the randomizer onto the front of the randomizer
  //The odd array functionality was used instead of unshift due to the need
  //to return a new array


  prevVideo() {
    if (this.state.randomizer.length) {
      this.setState(prevState => ({
        randomizer: [prevState.randomizer.pop()].concat(prevState.randomizer)
      }));
    }
  } //Change randomizer array to have selected index be the 0th element


  changeVideo(i) {
    //This will output the array up to the index, we need to attach that removed to the end
    if (this.state.randomizer.length) {
      this.setState(prevState => ({
        randomizer: prevState.randomizer.slice(i, prevState.randomizer.length).concat(prevState.randomizer.slice(0, i))
      }));
    }
  } //Upon first render we need to calculate some css for elements
  //Also set up event watcher for when the window resizes


  componentDidMount() {
    $('.video-list-container').css('height', $(window).height() - $('#randomizer-list').offset().top);
    $(window).resize(() => {
      $('.video-list-container').css('height', $(window).height() - $('#randomizer-list').offset().top);
    }); //Swipe Detection
    //On swipe right or left, switch to another video

    if ($.detectSwipe.enabled) {
      $(window).on('swipeleft', () => {
        this.nextVideo();
      });
      $(window).on('swiperight', () => {
        this.prevVideo();
      });
    }
  }

  render() {
    //Render playlists
    const playlists = this.state.playlists.map((element, i) => {
      return React.createElement(Playlist, {
        addPlaylist: this.addPlaylist,
        removePlaylist: this.removePlaylist,
        owner: element.owner,
        title: element.title,
        id: element.id,
        key: element.id
      });
    }); //Searchbar results

    let result;

    if (this.state.term != '') {
      if (playlists.length == 0) {
        result = React.createElement("a", {
          href: encodeURI("https://www.youtube.com/user/" + this.state.term),
          target: "_blank"
        }, React.createElement("div", {
          className: "rd-button"
        }, "No results for -", this.state.term, "-"));
      } else {
        result = React.createElement("div", null);
      }
    } //Random List of Videos, can access id, title, videoId, and playlistId


    let randomizer = null;

    if (this.state.randomizer.length) {
      randomizer = this.state.randomizer.map((element, index) => {
        return React.createElement("div", {
          className: "playlist-button",
          key: element.id,
          onClick: () => {
            this.changeVideo(index);
          }
        }, element.title);
      });
    } //List of selected Playlists


    let selected = null;

    if (this.state.selected.length) {
      //Need to include a delete button here to remove from playlist
      selected = this.state.selected.map(element => {
        return React.createElement("div", {
          className: "grid-x",
          key: element.id
        }, React.createElement("div", {
          className: "cell small-6"
        }, element.title), React.createElement("div", {
          className: "playlist-button cell small-6",
          onClick: () => {
            this.removePlaylist(element.id);
          }
        }, React.createElement("i", {
          className: "fas fa-minus-circle"
        })));
      });
    }

    let title = null;
    let videoId = null;

    if (this.state.randomizer.length) {
      title = this.state.randomizer[0].title;
      videoId = this.state.randomizer[0].videoId;
    }

    return React.createElement("div", null, React.createElement("div", {
      className: "grid-x grid-padding-x"
    }, React.createElement("div", {
      className: "cell small-12 large-6 large-order-2 center small-collapse"
    }, React.createElement("div", {
      className: "rd-wrapper"
    }, React.createElement("div", {
      className: "rd-header"
    }, React.createElement("label", {
      className: "rd-header-title",
      htmlFor: "user-search"
    }, "Search a username and add playlists to start!"), React.createElement("div", {
      className: "grid-x"
    }, React.createElement("input", {
      className: "cell small-10",
      name: "user-search",
      type: "text",
      onChange: this.handleChange,
      value: this.state.term
    }), React.createElement("div", {
      className: "cell auto search-box"
    }, React.createElement("i", {
      className: "fas fa-search-plus fa-2x"
    })))), React.createElement("div", {
      className: "rd-list"
    }, result, playlists)), React.createElement(Player, {
      title: title,
      videoId: videoId,
      nextVideo: this.nextVideo,
      pause: this.state.pause,
      id: "video-player",
      key: "video-player"
    }), React.createElement("div", {
      className: "grid-x"
    }, React.createElement("div", {
      className: "cell small-4",
      onClick: this.prevVideo
    }, React.createElement("div", {
      className: "playlist-icon-button"
    }, React.createElement("i", {
      className: "fas fa-step-backward fa-3x"
    }))), React.createElement("div", {
      className: "cell small-4",
      onClick: this.shufflePlaylist
    }, React.createElement("div", {
      className: "playlist-icon-button"
    }, React.createElement("i", {
      className: "fas fa-random fa-3x"
    }))), React.createElement("div", {
      className: "cell auto",
      onClick: this.nextVideo
    }, React.createElement("div", {
      className: "playlist-icon-button"
    }, React.createElement("i", {
      className: "fas fa-step-forward fa-3x"
    }))))), React.createElement("div", {
      className: "video-list-container cell small-6 large-3 large-order-1 small-collapse"
    }, React.createElement("div", {
      className: "video-list center"
    }, "Current Playlists:", selected)), React.createElement("div", {
      id: "randomizer-list",
      className: "video-list-container cell small-6 large-3 large-order-3 small-collapse"
    }, React.createElement("div", {
      className: "center"
    }, "Next Up:"), React.createElement("div", {
      className: "video-list"
    }, randomizer))));
  }

} //Player Class


class Player extends React.Component {
  constructor(props) {
    super(props); //Bind functions

    this.onPlayerError = this.onPlayerError.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this); //Init Player

    this.init(); //This function gets exposed globally as it
    //Youtube's API will call it when ready

    this.player;

    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player('youtube-player', {
        playerVars: {
          'autoplay': 1,
          'origin': window.location.href,
          'enablejsapi': 1
        },
        events: {
          'onError': this.onPlayerError,
          'onStateChange': this.onPlayerStateChange
        }
      });
    };
  } //We only want this compent to rerender when it's videoId property changes


  shouldComponentUpdate(nextProps) {
    return this.props.videoId != nextProps.videoId;
  } //Error usually play on a broken video link
  //Cycle to the next video if possible


  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('Youtube Video: Invalid video Id value');
        break;

      case 5:
        console.log('Youtube Video: HTML5 player error');
        this.props.nextVideo();
        break;

      case 100:
        console.log('Youtube Video: Video not found.');
        this.props.nextVideo();
        break;

      case 101:
        console.log('Youtube Video: Video not allowed in embedded players.');
        this.props.nextVideo();
        break;

      case 150:
        console.log('Youtube Video: Video not allowed in embedded players.');
        this.props.nextVideo();
        break;
    }
  } //We can respond to player state changes here
  //If the video ends, request another one from the randomizer


  onPlayerStateChange(event) {
    switch (event.data) {
      /*case YT.PlayerState.PLAYING:
        break;
      case YT.PlayerState.PAUSED:
        break;*/
      case YT.PlayerState.ENDED:
        this.props.nextVideo();
        break;
    }
  } //On creation, grab the youtube iframe helper script


  init() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  render() {
    //If the player exists and is ready with a video
    if (this.player && this.props.videoId) {
      this.player.loadVideoById(this.props.videoId);
    }

    return React.createElement("div", null, React.createElement("div", {
      className: "video-container"
    }, React.createElement("div", {
      className: "video",
      id: "youtube-player"
    })), React.createElement("div", {
      className: "marquee-container"
    }, React.createElement("span", {
      className: "marquee"
    }, "Now playing: ", this.props.title)));
  }

} //Playlist Class
//Object that holds each playlist


class Playlist extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      loaded: false,
      added: false,
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
        this.props.addPlaylist(this.state.videos, {
          id: this.props.id,
          title: this.props.title
        });
      }).catch(() => {
        console.log('Unable to add playlist to randomizer. Get failed');
      });
    } else {
      this.props.addPlaylist(this.state.videos, {
        id: this.props.id,
        title: this.props.title
      });
    }

    this.setState({
      added: true
    });
  } //This removes the playlist from the randomizer list


  removePlaylist() {
    this.props.removePlaylist(this.props.id);
    this.setState({
      added: false
    });
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
    return React.createElement("div", {
      className: "rd-list-item grid-x"
    }, React.createElement("div", {
      className: "cell small-5"
    }, this.props.owner), React.createElement("div", {
      className: "cell small-5",
      key: this.props.id
    }, React.createElement("div", {
      className: "rd-button",
      onClick: this.handleClick
    }, this.props.title)), React.createElement("div", {
      className: "cell auto"
    }, React.createElement("div", {
      className: "rd-button",
      onClick: this.addPlaylist
    }, React.createElement("i", {
      className: "fas fa-plus"
    }))), React.createElement("div", null, this.state.active && playlist));
  }

} //PlaylistVideo Class
//Object that holds each Video


class PlaylistVideo extends React.Component {
  //Object constructor
  constructor(props) {
    super(props); //Bind functions

    this.handleClick = this.handleClick.bind(this);
  } //When a Playlist Video is Clicked


  handleClick() {//console.log(this.props.id);
    //console.log(this.props.title);
  }

  render() {
    //Get the youtube url of the video
    const ref = "https://www.youtube.com/watch?v=" + this.props.urlId;
    return React.createElement("div", {
      key: this.props.id,
      onClick: this.handleClick
    }, React.createElement("a", {
      href: ref,
      target: "_blank"
    }, this.props.title));
  }

} //React Render Create DOM


ReactDOM.render(React.createElement(PlaylistRandomizer, null), document.getElementById('react-block'));
