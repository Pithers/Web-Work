//Filename: react_app.js/x
//Author: Brandon Smith

//File Description:
//This is a youtube playlist randomizer app
//Set up multiple playlists in youtube and this will
//shuffle videos between them

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
// Add functionality to search-plus icon next to search bar
//   -allow users to search for different properties
//   -could search for only playlists without knowing user
//   -could search for popular playlists etc.
//   -(style) make icon space look like it's part of the input bar
// Need to figure out how to deal with browsing and not hitting
//   youtube's api limit when multiple people are using the app
//   (making the user log in is nice, but not ideal for the user
// Efficiency Note:
//   Once done, go back and make youtube API request GETs more specific
//   There's a lot of data that youtube gives us that we don't need

//Contents:
//## Random Number Functions
//##   MurmurHash3's Mixing Function
//##   Sfc32
//##   Durstenfeld Array shuffler
//## Fix Div Height
//## HTML String Decode
//## React App
//##   Playlist Randomizer Class
//##   Player Class
//##   Playlist Class
//##   PlaylistVideo Class
//## React Render Create DOM

//Youtube Api and base Url
const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/";

//MurmurHash3's Mixing Function. Turns a string into a 32-bit hash
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

//Sfc32 random number generator. Provide it with 4 seeds.
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


//Fix Div Height
//Small jquery function to push height of divs to the bottom of the screen
function fixDivHeight(ref) {
  $(ref).height(function(index, height) {
    var current_height = $(this).height();
    var new_height = window.innerHeight - $(this).offset().top -
      parseInt($(this).css('padding-top')) -
      parseInt($(this).css('padding-bottom'));
    if (new_height > current_height) {
      $(ref).css('height', new_height);
    }
  });
}

//Takes string s and removes any html coding from it
function decodeHtml(s) {
  var txt = document.createElement("textarea");
  txt.innerHTML = s;
  return txt.value;
}

//React App
//React Playlist Randomizer
//App for generating playlists
class PlaylistRandomizer extends React.Component {
  //Object constructor
  constructor(props) {
    super(props);
    this.pageSize = 10;
    this.state = {
      term: '',
      results: [],
      playlists: [],
      selected: [],
      randomizer: [],
      page: [],
      search: false,
      options: false,
      failure: false,
    };

    //Menu Options
    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.openOptions = this.openOptions.bind(this);
    this.closeOptions = this.closeOptions.bind(this);

    //Keyboard Input
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    //Search Functions
    this.searchYoutube = this.searchYoutube.bind(this);
    this.getYoutubeResults = this.getYoutubeResults.bind(this);
    this.searchButton = this.searchButton.bind(this);
    this.nextPage = this.nextPage.bind(this);

    //Playlist Construction
    this.getPlaylists = this.getPlaylists.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.clearPlaylist = this.clearPlaylist.bind(this);

    //Video Control
    this.shufflePlaylist = this.shufflePlaylist.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this.prevVideo = this.prevVideo.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
  }

  //Open and close search overlay
  openSearch() {
    this.setState({search: true});
  }
  closeSearch() {
    this.setState({search: false});
    this.setState({options: false});
  }
  openOptions(event) {
    event.stopPropagation();
    this.setState({options: true});
  }
  closeOptions() {
    this.setState({options: false});
  }

  //Handles changes in the search bar
  //And reset failure state if needed
  handleChange(event) {
    this.setState({
      term: event.target.value,
      failure: false
    });
  }

  //Handle hitting enter key while in input box
  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.searchButton();
    }
  }

  //Search Youtube
  //search => text string to search for
  //type => type to search for: playlist, video, or channel
  //limit => amount of results desired (max 50)
  //token => nextPageToken if there is one
  searchYoutube(search, type='channel', limit=this.pageSize, token=null) {
    return new Promise((resolve, reject) => {
      $.get(baseURL + 'search', {
          part: "snippet",
          type: type,
          q: search,
          maxResults: limit,
          pageToken: token,
          key: APIKey,
        },
        (results) => {
          //If name is valid, resolve result's info
          if (results.items.length > 0) {
            resolve(results);
          } else {
            reject('No Results');
          }
        }
      ).fail((err) => {
        if (typeof err.status !== "undefined") {
          if (err.status == 403 && 
              err.responseJSON.error.errors[0].domain == "youtube.quota") {
            reject(403);
          } else {
            reject('Youtube Get Error: ' + err.status);
          }
        } else {
          console.log('Unknown Error, Please See Error Object');
          reject(err);
        }
      });
    });
  }

  //Search youtube, then store results in this.state.results
  //search => text string to search for
  //type => type to search for: playlist, video, or channel
  //limit => amount of results desired (max 50)
  //token => nextPageToken if there is one
  getYoutubeResults(search, type='channel', limit=this.pageSize, token=null) {
    this.searchYoutube(search, type, limit, token)
      .then((results) => {

        //If there are more results to be had, set up page object
        if (results.nextPageToken) {
          this.setState({
            page: [{
              type: type,
              query: search,
              token: results.nextPageToken,
            }],
          });
        } else {
          this.setState({
            page: [],
          });
        }

        //Creates the idKey as ChannelId, PlaylistId, or VideoId
        //This is used to access the youtube results json
        const idKey =  type.charAt(0).toUpperCase() + type.slice(1) + 'Id';

        results.items.forEach((element) => {
          //Check if thumbnails are present and what size they should be
          let thumbnail;
          if (typeof element.snippet !== "undefined" &&
              typeof element.snippet.thumbnails !== "undefined") {
            //Check for display size
            if (screen.width > 1024) {
              thumbnail = element.snippet.thumbnails.medium.url;
            } else {
              thumbnail = element.snippet.thumbnails.default.url;
            }
          } else {
            thumbnail = '';
          }

          //Check if id exists
          let id;
          if (typeof element.id !== "undefined" &&
              typeof element.id[idKey] !== "undefined") {
            id = element.id[idKey];
          } else {
            if (typeof element.snippet[idKey] !== "undefined") {
              id = element.snippet[idKey];
            } else {
              id = 'Id Not Found';
            }
          }

          //Check if title exists
          //Also decode any html to display it correctly
          let title;
          if (typeof element.snippet !== "undefined" &&
              typeof element.snippet.title !== "undefined") {
            title = decodeHtml(element.snippet.title);
          } else {
            title = 'Title Not Found';
          }

          //Check if description exists
          //Also decode any html to display it correctly
          let description;
          if (typeof element.snippet !== "undefined" &&
              typeof element.snippet.description !== "undefined") {
            description = decodeHtml(element.snippet.title);
          } else {
            description = 'Description Not Found';
          }

          //Append to state.results so we can look through the search results
          this.setState((prevState) => ({
            failure: false,
            results: prevState.results.concat({
              id: id,
              title: title,
              desc: description,
              thumb: thumbnail,
            })
          }));
        });
      })
      .catch((error) => {
        this.setState({
          failure: true,
        });
        if (error == 403) {
          //User needs to log in to proceed because of quota
          alert('Youtube public searches quota exceeded for website.' +
                'Please login to keep searching');
        } else {
          console.log(error);
        }
      });
  }

  //Search youtube and store results in this.state.results
  searchButton() {
    //Reset results and page objects
    this.setState({
      results: [],
      page: [],
    });

    //Search type is grabbed from the options checklist
    //If nothing is checked, default to channel option
    let type;
    if ($("input[name='search-options']:checked").length > 0) {
      type = $("input[name='search-options']:checked").val();
    } else {
      type = 'channel';
    }

    //Search youtube for result
    this.getYoutubeResults(this.state.term, type);
  }

  //Page navigation for search menu results
  //If the page object exists, call another youtube search
  nextPage() {
    if(this.state.page.length) {
      this.getYoutubeResults(
        this.state.page[0].query,
        this.state.page[0].type,
        this.pageSize,
        this.state.page[0].token
      );
    }
  }

  //Recursively get playlists from the user object (can be multiple or single)
  //Note: Might not need to be recursive anymore
  //this.getPlaylists(channels.items, [], null);
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
        key: APIKey },
        (results) => {
          results.items.forEach((element) => {
            list.push({
              id: element.id,
              title: element.snippet.title,
              owner: '',
            });
          });

          //Recurse if there are more results
          if (results.nextPageToken) {
            this.getPlaylists(users, list, results.nextPageToken)
              .then(resolve)
              .catch(reject);
          } else {
            //When done, if the list has more than one playlist
            //put the list into the playlists variable
            if (list.length >= 1) {
              this.setState({
                playlists: list,
              });
            } else {
              this.setState({
                playlists: [],
              });
            }
            resolve();
          }
        }
      ).fail(() => {
        reject('Could not get playlists for youtube user');
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

  //Remove all playlists
  clearPlaylist() {
    this.setState({
      selected: [],
      randomizer: [],
    });
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

  //Change randomizer array to have selected index be the 0th element
  changeVideo(i) {
    //This will output the array up to the index, we need to attach that removed to the end
    if (this.state.randomizer.length) {
      this.setState((prevState) => ({
        randomizer:
          prevState.randomizer.slice(i, prevState.randomizer.length)
          .concat(prevState.randomizer.slice(0, i)),
      }));
    }
  }

  //Upon first render we need to calculate some css for elements
  //Also set up event watcher for when the window resizes
  componentDidMount() {
    fixDivHeight('.video-list-container');
    fixDivHeight('.search-wrapper .content');

    //Set Watcher
    $(window).resize(() => {
      fixDivHeight('.video-list-container');
      fixDivHeight('.search-wrapper .content');
    });

    //Swipe Detection
    //On swipe right or left, switch to another video
    if ($.detectSwipe.enabled) {
      $(window).on('swipeleft', () => {
        this.nextVideo();
      });
      $(window).on('swiperight', () => {
        this.prevVideo();
      });
    }

    //Scroll watcher to get the next page for results
    $('#results-content').on('scroll', () => {
      if ($('#results-content').scrollTop() +
          $('#results-content').innerHeight() >=
          $('#results-content')[0].scrollHeight) {
        this.nextPage();
      }
    });
  }

  render() {
    //Random List of Videos, can access id, title, videoId, and playlistId
    let randomizer = null;
    if (this.state.randomizer.length) {
      randomizer = this.state.randomizer.map((element, index) => {
        return (
          <div
            className="playlist-button"
            key={element.id}
            onClick={() => {this.changeVideo(index)}}
          >
            {element.title}
          </div>
        )
      });
    }

    //List of selected Playlists
    let selected = null;
    if (this.state.selected.length) {
      //Need to include a delete button here to remove from playlist
      selected = this.state.selected.map((element) => {
        return (
          <div className='grid-x' key={element.id}>
              <div className='cell small-6'>{element.title}</div>
              <div
                className='playlist-button cell small-6'
                onClick={() => {this.removePlaylist(element.id)}}
              >
                <i className='fas fa-minus-circle'></i>
              </div>
          </div>
        )
      });
    }

    //If the video queue isn't empty, set up variables to pass to the Player
    /*let title = null;
    let videoId = null;
    if (this.state.randomizer.length) {
      title = this.state.randomizer[0].title;
      videoId = this.state.randomizer[0].videoId;
    }*/

    const searchbar =
      <div className='grid-x grid-padding-x searchbar'>
        <div className='cell small-2 icon-button' onClick={this.openOptions}>
          <i className='fas fa-filter fa-2x'></i>
        </div>
        <div className='cell small-8'>
          <input
             type='text'
             onChange={this.handleChange}
             onKeyDown={this.handleKeyDown}
             value={this.state.term}
             tabIndex="0"
           />
        </div>
        <div className='cell small-2 icon-button' onClick={this.searchButton}>
          <i className='fas fa-search fa-2x'></i>
        </div>
      </div>

    //Options menu for search box overlay
    const options =
      <div className='options'>
        <div>Search Options:</div>
        <div>
          <input
            type="radio"
            name='search-options'
            id="option-channel"
            value="channel"
          />
          Channels<br/>
          <input
            type="radio"
            name='search-options'
            id="option-playlist"
            value="playlist"
          />
          Playlists<br/>
          <input
            type="radio"
            name='search-options'
            id="option-video"
            value="video"
          />
          Videos
        </div>
      </div>

    //Render playlists
    /*const results = this.state.playlists.map((element, i) => {
      return (
        <Playlist
          addPlaylist = {this.addPlaylist}
          removePlaylist = {this.removePlaylist}
          owner = {element.owner}
          title = {element.title}
          id = {element.id}
          key = {element.id}
        />
      );
    });*/

    /*id: element.id.ChannelId,
    title: element.snippet.channelTitle,
    desc: element.snippet.description,
    thumb: element.snippet.thumbnails.default.url,*/

    //Searchbar results
    let results = this.state.results.map((element) => {
      return (
        <div className='grid-x grid-padding-x content-item'>
          <div className='cell small-4 large-2 large-offset-2'>
            <img src={element.thumb} alt='User Icon'/>
          </div>
          <div className='cell small-6 large-5'>
            <div className='name'>{element.title}</div>
            <div className='desc'>{element.desc}</div>
          </div>
          <div className='cell small-2 large-1 icon-button'>
            <i className='fas fa-chevron-down fa-2x align-vertical'></i>
          </div>
        </div>
      );
    });

    //Left and right arrow for searching
    /*let arrows;
    if(results.length > 0) {
      arrows =
        <div className='grid-x grid-padding-x page-arrows'>
          <div className='cell small-6 icon-button'>
            <i className='fas fa-chevron-left fa-2x' onClick={this.prevPage}></i>
          </div>
          <div className='cell auto icon-button'>
            {this.state.more &&
              <i className='fas fa-chevron-right fa-2x' onClick={this.nextPage}></i>
            }
          </div>
        </div>
    }*/

    //If there are no results (ie search was a failure)
    if (this.state.term != '' && this.state.failure) {
      results = <div className='center'>No results for {this.state.term}</div>
    }

    //Search box overlay for youtube playlist/user searching
    //<div id='search-overlay' className='search-wrapper'>
    const search =
      <div className='search-wrapper'>
        <div className='search-area' onClick={this.closeOptions}>
          <div className='grid-x grid-padding-x header'>
            <div className='title cell small-8 small-offset-2'>
              Search playlists or videos to start!
            </div>
            <div className='close cell small-2 icon-button' onClick={this.closeSearch}>
              &times;
            </div>
          </div>
          {searchbar}
          <div id='results-content' className='content'>
            {results}
          </div>
        </div>
        <ReactTransitionGroup.CSSTransition
          in={this.state.options}
          classNames='options-transition'
          timeout={500}
        >
          {options}
        </ReactTransitionGroup.CSSTransition>
      </div>;

    return (
      <div>
        <div>
          <ReactTransitionGroup.CSSTransition
            in={this.state.search}
            classNames='search-transition'
            timeout={500}
          >
            {search}
          </ReactTransitionGroup.CSSTransition>
        </div>
        <div className="grid-x grid-padding-x">
          <div className="cell small-12 large-6 large-order-2 center small-collapse">
            <Player
              title = {this.state.randomizer.length ? this.state.randomizer[0].title : null}
              videoId = {this.state.randomizer.length ? this.state.randomizer[0].videoId : null}
              nextVideo = {this.nextVideo}
              pause = {this.state.pause}
              id = 'video-player'
              key = 'video-player'
            />
            <div className="grid-x">
              <div className="cell small-3">
                <div className="playlist-icon-button">
                  <i className="fas fa-step-backward fa-3x" onClick={this.prevVideo}></i>
                </div>
              </div>
              <div className="cell small-3">
                <div className="playlist-icon-button">
                  <i className="fas fa-random fa-3x" onClick={this.shufflePlaylist}></i>
                </div>
              </div>
              <div className="cell small-3">
                <div className="playlist-icon-button">
                  <i className="fas fa-search fa-3x" onClick={this.openSearch}></i>
                </div>
              </div>
              <div className="cell auto">
                <div className="playlist-icon-button">
                  <i className="fas fa-step-forward fa-3x" onClick={this.nextVideo}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="video-list-container cell small-6 large-3 large-order-1 small-collapse">
            <div className="video-list center">
              Current Playlists:
              {selected}
            </div>
          </div>
          <div className="video-list-container cell small-6 large-3 large-order-3 small-collapse">
            <div className="center">Next Up:</div>
            <div className="video-list">
              {randomizer}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

//Player Class
class Player extends React.Component {
  constructor(props) {
    super(props);

    //Bind functions
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
          'onError': this.onPlayerError,
          'onStateChange': this.onPlayerStateChange,
        }
      });
    });
  }

  //We only want this compent to rerender when it's videoId property changes
  shouldComponentUpdate(nextProps) {
    return (this.props.videoId != nextProps.videoId);
  }

  //Error usually play on a broken video link
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

  render() {
    //If the player exists and is ready with a video
    if(this.player && this.props.videoId) {
      this.player.loadVideoById(this.props.videoId);
    }

    return (
      <div>
        <div className='video-container'>
          <div className='video' id='youtube-player'></div>
        </div>
        <div className='marquee-container'>
          <span className='marquee'>Now playing: {this.props.title}</span>
        </div>
      </div>
    );
  }
}

//Playlist Class
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
      <div className='search-list-item grid-x'>
        <div className='cell small-5'>
          {this.props.owner}
        </div>
        <div className='cell small-5' key={this.props.id}>
          <div className='search-button' onClick={this.handleClick}>
            {this.props.title}
          </div>
        </div>
        <div className='cell auto'>
          <div className='search-button' onClick={this.addPlaylist}>
            <i className='fas fa-plus'></i>
          </div>
        </div>
        <div>
          {this.state.active && playlist}
        </div>
      </div>
    );
  }
}

//PlaylistVideo Class
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
    //console.log(this.props.id);
    //console.log(this.props.title);
  }

  render() {
    //Get the youtube url of the video
    const ref ="https://www.youtube.com/watch?v=" + this.props.urlId;
    return (
      <div key={this.props.id} onClick={this.handleClick}>
        <a href={ref} target="_blank">
          {this.props.title}
        </a>
      </div>
    );
  }
}

//React Render Create DOM
ReactDOM.render(
  <PlaylistRandomizer />,
  document.getElementById('react-block')
);
