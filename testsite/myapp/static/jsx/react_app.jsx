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
//There's a lot of data that youtube gives us that we don't need

//References:
//Youtube API v3: https://developers.google.com/youtube/v3/
//Durstenfeld shuffle:
//  https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
//  https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//Seeding Random:
//  https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316

//Contents:
//##

const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/";

//MurmurHash3's mixing function. Turns a string into a 32-bit hash
function xmur3(str) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
    h = h << 13 | h >>> 19;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

//Sfc 32 random number generator. Provide it with 4 seeds.
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

//Create random number generator
const seed = xmur3(new Date().toLocaleString());
const rand = sfc32(seed(), seed(), seed(), seed());

//Durstenfeld Array shuffler
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//App for generating playlists
class PlaylistRandomizer extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);
    this.state = {
      term: '',
      playlists: [],
      selected: [],
      randomizer: [],
    };

    //Bind functions
    //Keyboard Input
    this.handleChange = this.handleChange.bind(this);

    //Playlist Construction
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.clearPlaylist = this.clearPlaylist.bind(this);

    //Video Control
    this.shufflePlaylist = this.shufflePlaylist.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this.prevVideo = this.prevVideo.bind(this);
  }

  //Handles changes in the search bar for users
  //Each search will locate the user-id and then search for
  //youtube user's playlists and display them
  //returns a promise to wait on
  handleChange(event) {
    return new Promise((resolve, reject) => {
      this.setState({
        term: event.target.value,
      });

      //Find channel of user searched
      $.get(baseURL + 'channels', {
        part: "id",
        forUsername: event.target.value,
        key: APIKey },
        (channel) => {
          //If username is valid, get playlists from user's channel
          if (channel.items.length == 1) {
            $.get(baseURL + 'playlists', {
              part: "snippet",
              channelId: channel.items[0].id,
              maxResults: 25,
              key: APIKey },
              (list) => {
                this.setState({
                  playlists: list.items,
                });
                resolve();
              }
            ).fail(() => {
              reject('Could not get playlists for youtube user');
            });
          } else {
            //If not, no playlists found
            this.setState({
              playlists: [],
            });
          }
        }
      ).fail(() => {
        reject('Could not get youtube user');
      });
    });
  }

  //Children Playlists of this object will return their playlist of videos
  //and their id when their 'add' button is clicked
  //This function will check to see if the playlist is currently in the
  //randomizer list or not then decided whether or not to add videos
  //When new values are added to the randomizer randomize the order
  addPlaylist(videos, playlist) {
    if (!(this.state.selected.filter(element => (element.id == playlist.id))).length) {
      this.setState((prevState) => ({
        selected: prevState.selected.concat(playlist),
        randomizer: prevState.randomizer.concat(videos),
      }));
      this.shufflePlaylist();
    };
  }

  //Remove playlist id from the selected list
  //and remove all videos in randomizer with playlistId
  //Use the filter function to compare both arrays with
  //the playlistId
  removePlaylist(playlistId) {
    if ((this.state.selected.filter(element => (element.id == playlistId))).length) {
      this.setState((prevState) => ({
        selected: prevState.selected.filter((element) => {
          return element.id != playlistId;
        }),
        randomizer: prevState.randomizer.filter((element) => {
          return element.playlistId != playlistId;
        }),
      }));
      this.shufflePlaylist();
    }
  }

  clearPlaylist() {
    console.log('clear playlist');
  }

  //Randomizes this.state.randomizer using a Durstenfeld shuffle
  shufflePlaylist() {
    this.setState((prevState) => ({
      randomizer: shuffleArray(prevState.randomizer),
    }));
  }

  //Puts the first element of the randomizer onto the back of the randomizer
  nextVideo() {
    if (this.state.randomizer.length) {
      this.setState((prevState) => ({
        randomizer: prevState.randomizer.concat(prevState.randomizer.shift()),
      }));
    }
  }

  //Puts the last element of the randomizer onto the front of the randomizer
  //The odd array functionality was used instead of unshift due to the need
  //to return a new array
  prevVideo() {
    if (this.state.randomizer.length) {
      this.setState((prevState) => ({
        randomizer: [prevState.randomizer.pop()].concat(prevState.randomizer),
      }));
    }
  }

  render() {
    //Render playlists
    const playlists = this.state.playlists.map((element, i) => {
      return (
        <Playlist
          addPlaylist = {this.addPlaylist}
          removePlaylist = {this.removePlaylist}
          title = {element.snippet.title}
          id = {element.id}
          key = {element.id}
        />
      );
    });

    //Searchbar results
    let result;
    if(this.state.term != '') {
      if (playlists.length == 0) {
        result = <div key='result'>User: Not Found</div>
      } else {
        result = <div key='result'>User: {this.state.term}</div>
      }
    }

    //Random List of Videos, can access id, title, videoId, and playlistId
    let randomizer = null;
    if (this.state.randomizer.length) {
      randomizer = this.state.randomizer.map((element) => {
        return (
          <li key={element.id}>
            {element.title}
          </li>
        )
      });
    }

    //Random List of Videos, can access id, title, videoId, and playlistId
    let selected = null;
    if (this.state.selected.length) {
      //Need to include a delete button here to remove from playlist
      selected = this.state.selected.map((element) => {
        return (
          <li key={element.id}>
            {element.title}
          </li>
        )
      });
    }

    let title = null;
    let videoId = null;
    if (this.state.randomizer.length) {
      title = this.state.randomizer[0].title;
      videoId = this.state.randomizer[0].videoId;
    }

    return (
      <div>
        <label htmlFor="user-search">Search Username</label>
        <input onChange={this.handleChange} name='user-search' type="text" value={this.state.term}/>
        <Player
          title = {title}
          videoId = {videoId}
          nextVideo = {this.nextVideo}
          pause = {this.state.pause}
          id = 'video-player'
          key = 'video-player'
        />
        <div className="grid-x">
          <button className="cell small-4" onClick={this.prevVideo}>Prev</button>
          <button className="cell small-4" onClick={this.shufflePlaylist}>Shuffle</button>
          <button className="cell auto" onClick={this.nextVideo}>Next</button>
        </div>
        <div className="grid-x grid-padding-x">
          <div className="cell small-4">
            {result}
            {playlists}
          </div>
          <div className="cell small-4">
            <div>
              Current Playlists
            </div>
            {selected}
          </div>
          <div className="cell auto">
            <div>
              Videos
            </div>
            {randomizer}
          </div>
        </div>
      </div>
    );
  }
}

//Video Player Class
class Player extends React.Component {
  constructor(props) {
    super(props);

    //Bind functions
    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerError = this.onPlayerError.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);

    //Init Player
    this.init();

    //This function gets exposed globally as it
    //Youtube's API will call it when ready
    this.player;
    window.onYouTubeIframeAPIReady = (() => {
      this.player = new YT.Player('youtube-player', {
        playerVars: {
          'autoplay': 1,
          'origin': window.location.href,
          'enablejsapi': 1,
        },
        events: {
          'onReady': this.onPlayerReady,
          'onError': this.onPlayerError,
          'onStateChange': this.onPlayerStateChange,
        }
      });
    });
  }

  //Uneeded for now
  onPlayerReady(event) {
    //console.log('READY');
    //  event.target.playVideo();
  }

  //Error usually play on a broken video link, so cycle to the next video
  //NOTE: very much need to differentiate these
  onPlayerError(event) {
    console.log('ERROR');
    console.log(event.data);
    //this.props.nextVideo();
  }

  //We can respond to player state changes here
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
  }

  //On creation, grab the youtube iframe helper script
  init() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  //Can probably have video logic here as 
  //The only rerendering will occur on property changes
  render() {
    //If the player exists and is ready with a video
    if(this.player && this.props.videoId) {
      this.player.loadVideoById(this.props.videoId);
    }
    return (
      <div>
        <div id='youtube-player'></div>
        <div>Now Playing: {this.props.title}</div>
      </div>
    );
  }
}

//Object that holds each playlist
class Playlist extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      loaded: false,
      added: false,
      videos: [],
    };

    //Bind functions
    this.handleClick = this.handleClick.bind(this);
    this.getPlaylistVideos = this.getPlaylistVideos.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.playVideo = this.playVideo.bind(this);
  }

  //Recurse through get request through youtube via page tokens
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
        key: APIKey },
        (videos) => {
          //Push all videos into the list
          videos.items.forEach((element) => {
            list.push({
              title: element.snippet.title,
              videoId: element.snippet.resourceId.videoId,
              id: element.id,
              playlistId: this.props.id,
            });
          });
          //Recurse if there's a nextPageToken
          //Propagate the promise recursively
          if (videos.nextPageToken) {
            this.getPlaylistVideos(list, videos.nextPageToken)
              .then(resolve)
              .catch(reject);
          } else {
            //When done, if the list has more than one video
            //put the list into the videos state variable
            if (list.length >= 1) {
              this.setState({
                videos: list,
              });
            } else {
              this.setState({
                videos: [],
              });
            }
            //Once done, set video state to loaded and resolve the promise
            this.setState({
              loaded: true,
            });
            resolve();
          }
        }
      ).fail(() => {
        reject('Could not retrieve youtube video/s');
      });
    });
  }

  //When a Playlist Item is Clicked
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
  }

  //When we want to add the playlist to the randomizer
  //If the videos are not loaded load them and await on the promise
  //Once the videos are loaded or if they are already loaded, pass
  //the video list up to the parent class (randomizer)
  addPlaylist() {
    //We only need to store the video title and videoId
    if (!this.state.loaded) {
      this.getPlaylistVideos([], null)
        .then(() => {
          this.props.addPlaylist(this.state.videos, {
            id: this.props.id,
            title: this.props.title,
          });
        })
        .catch(() => {
          console.log('Unable to add playlist to randomizer. Get failed');
        });
    } else {
      this.props.addPlaylist(this.state.videos, {
        id: this.props.id,
        title: this.props.title,
      });
    }
    this.setState({
      added: true,
    });
  }

  //This removes the playlist from the randomizer list
  removePlaylist() {
    this.props.removePlaylist(this.props.id);
    this.setState({
      added: false,
    });
  }

  //This pushes the video to the top of the list
  playVideo() {
    console.log('play Video');
  }

  render() {
    const playlist = this.state.videos.map((element) => {
      return (
        <PlaylistVideo
          title = {element.title}
          urlId = {element.videoId}
          id = {element.id}
          key = {element.id}
        />
      );
    });

    return (
      <div>
        <div key={this.props.id} onClick={this.handleClick}>
          { this.props.title }
        </div>
        <div>
          <button onClick={this.addPlaylist}>Add</button>
          <button onClick={this.removePlaylist}>Remove</button>
        </div>
        <ul>
          {this.state.active && playlist}
        </ul>
      </div>
    );
  }
}

//Object that holds each Video
class PlaylistVideo extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);

    //Bind functions
    this.handleClick = this.handleClick.bind(this);
  }

  //When a Playlist Video is Clicked
  handleClick() {
    console.log(this.props.id);
    console.log(this.props.title);
  }

  render() {
    //Get the youtube url of the video
    const ref ="https://www.youtube.com/watch?v=" + this.props.urlId;
    return (
      <li key={this.props.id} onClick={this.handleClick}>
      <a href={ref} target="_blank">
        {this.props.title}
      </a>
      </li>
    );
  }
}

//Create DOM
ReactDOM.render(
  <PlaylistRandomizer />,
  document.getElementById('react-block')
);
