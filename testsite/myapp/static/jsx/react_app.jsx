//Filename: react_app.js/x
//Author: Brandon Smith

//File Description:
//This is a youtube playlist randomizer app
//Search for users, playlists, or videos
//Then add in playlists or singular videos
//The app will then randomize the videos into a large playlist

//References:
//Youtube API v3: https://developers.google.com/youtube/v3/
//Durstenfeld shuffle:
//  https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
//  https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//Seeding Random:
//  https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
//Swipe Detection: https://github.com/marcandre/detect_swipe

//Current Bugs:
//  Adding individual videos and then selecting them in the Next Up section can lead to
//  weird visual bugs or most likely video title corruption.

//Future Ideas:
// -Place tutorial areas under Current and Next Up when they're empty.
// -Need to figure out how to deal with browsing and not hitting
//    youtube's api limit when multiple people are using the app.
//    Making the user login is nice, but not ideal for the user
// -Give special screen animations to addPlaylist or addVideo so the user
//    knows if they successfully added or didn't add an element.
// -Add loading spiral or something to search bar area.
// -Add loading spiral or something to channel expand.
// -Figure out way to hide either the Pithers bar (I'd rather not) or
//   instead hide the webpage searchbar until a swipe down

//Contents (ctrl-f or / to locate any of the following):
//## Random Number Functions
//##   MurmurHash3's Mixing Function
//##   Sfc32 Random Number Generator
//##   Durstenfeld Array Shuffler
//---------------------------------------------------------------------------------------
//## Formatting Functions
//##   Fix Div Height
//##   Decode Html String
//---------------------------------------------------------------------------------------
//## Playlist Randomizer React Class
//##   Object Constructor
//##   Function Declarations
//##   componentDidMount
//##   componentDidUpdate
//##   Menu Options
//##     openSearch
//##     closesearch
//##     openOptions
//##     closeOptions
//##     searchButton
//##     playlistExpand
//##     channelExpand
//##     closeChannel
//##   Keyboard Input
//##     handleChange
//##     handleKeyDown
//##   Search Functions
//##     searchYoutube
//##     getYoutubeResults
//##     nextPage
//##     nextChannelPage
//##   Playlist/Video Construction
//##     getPlaylists
//##     getPlaylistvideos
//##     addPlaylist
//##     removePlaylist
//##     addIndividualVideo
//##     removeIndividualVideo
//##     clearPlaylist
//##   Video Player Control
//##     shufflePlaylist
//##     nextVideo
//##     prevVideo
//##     changeVideo
//##   Render
//##     Randomizer
//##     Selected Playlists and Videos
//##     Search Overlay
//##     Channel Overlay
//##     Render Return
//---------------------------------------------------------------------------------------
//## Player React Class
//##   Constructor
//##   Function Declarations
//##   onYouTubeIframeAPIReady
//##   shouldComponentUpdate
//##   Functions
//##     onPlayerError
//##     onPlayerstateChange
//##     init
//##   Render
//##     Render Return
//---------------------------------------------------------------------------------------
//## React DOM Render
//---------------------------------------------------------------------------------------

//Youtube Api and base Url
//Localhost key (swap out for production key in production server)
const APIKey = "AIzaSyCHDk3UdiZ5MEXlFKRwCdhzDGDPi2dD4x0";
const baseURL = "https://www.googleapis.com/youtube/v3/";

//***************************************************************************************
// Random Number Functions
//***************************************************************************************
//MurmurHash3's Mixing Function
//Turns a string into a 32-bit hash
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

//Sfc32 Random Number Generator
//Provide it with 4 seeds.
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

//Create RNG
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

//***************************************************************************************
// Formatting Functions
//***************************************************************************************
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

//Decode Html String
//Takes string s and removes any html coding from it
function decodeHtml(s) {
  var txt = document.createElement("textarea");
  txt.innerHTML = s;
  return txt.value;
}

//***************************************************************************************
// Playlist Randomizer React Class
//***************************************************************************************
//App for generating playlists
class PlaylistRandomizer extends React.Component {
  //Object Constructor
  constructor(props) {
    super(props);
    this.pageSize = 10;
    this.state = {
      term: '',
      results: [],
      playlists: [],
      channel: {},
      channelSelected: false,
      channelSelectedId: null,
      selected: [],
      individualVideos: [],
      randomizer: [],
      page: [],
      channelPage: [],
      search: false,
      options: false,
      failure: false,
    };

    //Function Declarations
    //--Menu Options--
    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.openOptions = this.openOptions.bind(this);
    this.closeOptions = this.closeOptions.bind(this);
    this.searchButton = this.searchButton.bind(this);
    this.playlistExpand = this.playlistExpand.bind(this);
    this.channelExpand = this.channelExpand.bind(this);
    this.closeChannel = this.closeChannel.bind(this);

    //--Keyboard Input--
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    //--Search Functions--
    this.searchYoutube = this.searchYoutube.bind(this);
    this.getYoutubeResults = this.getYoutubeResults.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.nextChannelPage = this.nextChannelPage.bind(this);

    //--Playlist/Video Construction--
    this.getPlaylists = this.getPlaylists.bind(this);
    this.getPlaylistVideos = this.getPlaylistVideos.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.addIndividualVideo = this.addIndividualVideo.bind(this);
    this.removeIndividualVideo = this.removeIndividualVideo.bind(this);
    this.clearPlaylist = this.clearPlaylist.bind(this); //currently unused

    //--Video Player Control--
    this.shufflePlaylist = this.shufflePlaylist.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this.prevVideo = this.prevVideo.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
  }

  //componentDidMount
  //Upon first render we need to calculate some css for elements
  //Also set up event watcher for when the window resizes
  componentDidMount() {
    fixDivHeight('.video-list-container');

    //Set Watcher
    $(window).resize(() => {
      fixDivHeight('.video-list-container');
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
    $('#channel-content').on('scroll', () => {
      if ($('#channel-content').scrollTop() +
          $('#channel-content').innerHeight() >=
          $('#channel-content')[0].scrollHeight) {
        this.nextChannelPage();
      }
    });
  }

  //=====================================================================================
  // Menu Options
  //=====================================================================================

  //Open and close search/options overlays
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

  //searchButton
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

  //playlistExpand
  //When a playlist is clicked on, verify it's not already in the randomizer,
  //then pull all the videos from the playlist and add them to the randomizer
  playlistExpand(playlistId, title, owner='') {
    if (!(this.state.selected.filter((element) => {
      element.playlistId == playlistId
    })).length) {
      //Retrieve all videos from this playlist and add them in
      this.getPlaylistVideos(playlistId, title)
        .then((results) => {
          this.addPlaylist(results, {
            playlistId: playlistId,
            title: title,
            owner: owner,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  //channelExpand
  //When a channel is clicked on, verify that it hasn't already been clicked on
  //Then get the playlists associated with that channel
  channelExpand(channelId, channelTitle, channelThumb, channelDesc) {
    if(this.state.channelSelectedId != channelId) {
      this.getPlaylists(channelId)
        .then((results) => {
          this.setState({
            channel: {
              playlists: results,
              channelId: channelId,
              title: channelTitle,
              thumb: channelThumb,
              desc: channelDesc,
            },
            channelSelected: true,
            channelSelectedId: channelId,
          });
        })
        .catch((error) => {
          console.log(error);
        })
    } else {
      this.setState({
        channelSelected: true,
      });
    }
  }

  //closeChannel
  //Toggle the channel submenu off
  closeChannel() {
    this.setState({
      channelSelected: false,
    })
  }

  //=====================================================================================
  // Keyboard Input
  //=====================================================================================

  //handleChange
  //Handles changes in the search bar
  //And reset failure state if needed
  handleChange(event) {
    this.setState({
      term: event.target.value,
      failure: false
    });
  }

  //handleKeyDown
  //Handle hitting enter key while in input box
  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.searchButton();
    }
  }

  //=====================================================================================
  // Search Functions
  //=====================================================================================

  //searchYoutube
  //search => text string to search for
  //type => type to search for: playlist, video, or channel
  //limit => amount of results desired (max 50)
  //token => nextPageToken if there is one
  searchYoutube(search, type='channel', limit=this.pageSize, token=null) {
    //Implement fields to cut down on quota costs. Only retrieve what we need
    let fields;
    if (type == 'channel') {
      fields = 'nextPageToken,items(id/channelId,snippet(' +
       'channelId,title,description, thumbnails(default/url,medium/url)))';
    } else {
      fields = 'nextPageToken,items(id/' + type + 'Id,snippet(' +
        'title,description, thumbnails(default/url,medium/url)))';
    }

    return new Promise((resolve, reject) => {
      $.get(baseURL + 'search', {
          part: "snippet",
          type: type,
          q: search,
          fields: fields,
          maxResults: limit,
          pageToken: token,
          key: APIKey,
        },
        (results) => {
          //If there are actually results resolve with them
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

  //getYoutubeResults
  //Search youtube, then store results in this.state.results
  //search => text string to search for
  //type => type to search for: playlist, video, or channel
  //limit => amount of results desired (max 50)
  //token => nextPageToken if there is one
  getYoutubeResults(search, type='channel', token=null, limit=this.pageSize) {
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

        //Creates the idKey as channelId, playlistId, or videoId
        //This is used to access the youtube results json
        const idKey =  type + 'Id';

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
          //Sometimes a missing id.channelId can be found under snippet.channelId
          let id;
          if (typeof element.id !== "undefined" &&
              typeof element.id[idKey] !== "undefined") {
            id = element.id[idKey];
          } else if (typeof element.snippet.channelId !== "undefined") {
            id = element.snippet.channelId;
          } else {
            id = null;
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
              type: type,
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

  //nextPage
  //Page navigation for search menu results
  //If the page object exists, call another youtube search
  nextPage() {
    if(this.state.page.length) {
      this.getYoutubeResults(
        this.state.page[0].query,
        this.state.page[0].type,
        this.state.page[0].token
      );
    }
  }

  //nextChannelPage
  //Gets the next page of results for the channel
  nextChannelPage() {
    if(this.state.channelPage.length) {
      this.getPlaylists(
        this.state.channelPage[0].channelId,
        this.state.channelPage[0].token,
      ).then((results) => {
        this.setState((prevState) => ({
          channel: {
            playlists: prevState.channel.playlists.concat(results),
            channelId: prevState.channel.channelId,
            title: prevState.channel.title,
            thumb: prevState.channel.thumb,
            desc: prevState.channel.desc,
          },
        }));
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }

  //=====================================================================================
  // Playlist/Video Construction
  //=====================================================================================

  //getPlaylists
  //When selecting a user, grab all of the playlists.
  //If there are a bunch, set up the channel page object so
  //if the user scrolls down we can grab more
  getPlaylists(channelId, token=null, list=[], pageSize=this.pageSize) {
    //Only get what we need
    const fields = 'nextPageToken,items(id,snippet(' +
      'title,thumbnails(default/url,medium/url)))';
    return new Promise((resolve, reject) => {
      $.get(baseURL + 'playlists', {
        part: "snippet",
        channelId: channelId,
        maxResults: pageSize,
        pageToken: token,
        fields: fields,
        key: APIKey },
        (results) => {
          results.items.forEach((element) => {
            //Determine thumbnail size
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

            list.push({
              playlistId: element.id,
              title: element.snippet.title,
              thumb: thumbnail,
            });
          });

          //Recurse if there are more results
          if (results.nextPageToken) {
            this.setState({
              channelPage: [{
                channelId: channelId,
                token: results.nextPageToken,
              }],
            });
          } else {
            this.setState({
              channelPage: [],
            });
          }

          //When done, if the list has more than one playlist
          //put the list into the playlists variable
          if (list.length >= 1) {
            resolve(list);
          } else {
            reject([]);
          }
        }
      ).fail(() => {
        reject('Could not get playlists for youtube user');
      });
    });
  }

  //getPlaylistVideos
  //Recurse through get request to youtube via page tokens
  //Send multiple get requests if the playlist is over 50 videos
  //The list parameter will accumulate the playlist videos
  //Once recursion is done, the list will be added to the randomizer
  getPlaylistVideos(playlistId, title, list=[], token=null) {
    //Only get what we need
    const fields = 'nextPageToken,items(id,snippet(' +
      'title,resourceId/videoId))';
    return new Promise((resolve, reject) => {
      $.get(baseURL + 'playlistItems', {
        part: "snippet",
        playlistId: playlistId,
        maxResults: 50,
        fields: fields,
        pageToken: token,
        key: APIKey },
        (videos) => {
          //Push all videos into the list
          videos.items.forEach((element) => {
            list.push({
              title: element.snippet.title,
              videoId: element.snippet.resourceId.videoId,
              id: element.id,
              playlistId: playlistId,
            });
          });
          //Recurse if there's a nextPageToken
          //Propagate the promise recursively
          if (videos.nextPageToken) {
            this.getPlaylistVideos(playlistId, title, list, videos.nextPageToken)
              .then((results) => {resolve(results)})
              .catch((error) => {reject(error)});
          } else {
            //When done, if the list has more than one video return it
            if (list.length >= 1) {
              resolve(list);
            } else {
              reject('Playlist empty');
            }
          }
        }
      ).fail(() => {
        reject('Could not retrieve youtube video/s');
      });
    });
  }

  //addPlaylist
  //This function will check to see if the playlist is currently in the
  //randomizer list then decide whether or not to add videos
  //When new values are added to the randomizer, randomize the order
  addPlaylist(videos, playlist) {
    if (!(this.state.selected.filter(
      element => (element.playlistId == playlist.playlistId))).length) {
      this.setState((prevState) => ({
        selected: prevState.selected.concat(playlist),
        randomizer: prevState.randomizer.concat(videos),
      }));
      this.shufflePlaylist();
    };
  }

  //removePlaylist
  //Remove playlist id from the selected list
  //and remove all videos in randomizer with playlistId
  //Use the filter function to compare both arrays
  removePlaylist(playlistId) {
    if ((this.state.selected.filter(element => (element.playlistId == playlistId))).length) {
      this.setState((prevState) => ({
        selected: prevState.selected.filter((element) => {
          return element.playlistId != playlistId;
        }),
        randomizer: prevState.randomizer.filter((element) => {
          return element.playlistId != playlistId;
        }),
      }));
      this.shufflePlaylist();
    }
  }

  //addIndividualVideo
  //Check to make sure video isn't on list, then add video id
  addIndividualVideo(videoId, title) {
    if (!(this.state.individualVideos.filter(element => (element.videoId == videoId))).length) {
      this.setState((prevState) => ({
        individualVideos: prevState.individualVideos.concat({
          videoId: videoId,
          title: title,
        }),
        randomizer: prevState.randomizer.concat({
          videoId: videoId,
          title: title,
          id: null,
          playlistId: null,
        }),
      }));
    }
  }

  //removeIndividualVideo
  //Find videoId on list and remove from it
  removeIndividualVideo(videoId) {
    if ((this.state.individualVideos.filter(element => (element.videoId == videoId))).length) {
      this.setState((prevState) => ({
        individualVideos: prevState.individualVideos.filter((element) => {
          return element.videoId != videoId;
        }),
        randomizer: prevState.randomizer.filter((element) => {
          return (element.playlistId != null || element.videoId != videoId);
        }),
      }));
    }
  }

  //clearPlaylist
  //Remove all playlists
  clearPlaylist() {
    this.setState({
      selected: [],
      randomizer: [],
    });
  }

  //=====================================================================================
  // Video Player Control
  //=====================================================================================

  //shufflePlaylist
  //Randomizes this.state.randomizer using a Durstenfeld shuffle
  shufflePlaylist() {
    this.setState((prevState) => ({
      randomizer: shuffleArray(prevState.randomizer),
    }));
  }

  //nextVideo
  //Puts the first element of the randomizer onto the back of the randomizer
  nextVideo() {
    if (this.state.randomizer.length) {
      this.setState((prevState) => ({
        randomizer: prevState.randomizer.concat(prevState.randomizer.shift()),
      }));
    }
  }

  //prevVideo
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

  //changeVideo
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

  //=====================================================================================
  // Render
  //=====================================================================================

  render() {
    //-----------------------------------------------------------------------------------
    // Randomizer
    //-----------------------------------------------------------------------------------
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

    //-----------------------------------------------------------------------------------
    // Selected Playlists and Videos
    //-----------------------------------------------------------------------------------
    //List of selected Playlists
    let selectedPlaylists;
    if (this.state.selected.length) {
      //Need to include a delete button here to remove from playlist
      selectedPlaylists = this.state.selected.map((element) => {
        return (
          <div className='grid-x' key={element.id}>
            <div
              className='playlist-button cell small-2 center'
              onClick={() => {this.removePlaylist(element.playlistId)}}
            >
              <i className='fas fa-minus-circle'></i>
            </div>
            <div className='cell auto'>{element.title}</div>
          </div>
        )
      });
    }
    //List of selected individual videos
    let selectedVideos;
    if (this.state.individualVideos.length) {
      selectedVideos = this.state.individualVideos.map((element) => {
        return (
          <div className='grid-x' key={element.id}>
              <div
                className='playlist-button cell small-2 center'
                onClick={() => {this.removeIndividualVideo(element.videoId)}}
              >
                <i className='fas fa-minus-circle'></i>
              </div>
              <div className='cell auto'>{element.title}</div>
          </div>
        )
      });
    }

    //-----------------------------------------------------------------------------------
    // Search Overlay
    //-----------------------------------------------------------------------------------
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

    //Searchbar results
    //Next we need to expand this zone
    //If only videos were searched, show + key with ability to add video straight to playlist
    //If playlists were searched, allow playlist to be expanded or add straight to playlist via +
    //If users were searched, allow expansion to playlists and then videos, all with +
    let results = this.state.results.map((element) => {
      //Decide button functionality (for playlist, video, or channel)
      let button;
      if (element.type == 'channel') {
        button =
          <div className='cell small-2 large-1 icon-button'
               onClick={() => {
                 this.channelExpand(element.id, element.title, element.thumb, element.desc)
               }}
          >
            <i className='fas fa-chevron-down fa-2x align-vertical'></i>
          </div>
      } else if (element.type == 'playlist') {
        button =
          <div className='cell small-2 large-1 icon-button'
               onClick={() => {this.playlistExpand(element.id, element.title)}}
          >
            <i className='fas fa-plus fa-2x align-vertical'></i>
          </div>
      } else {
        button =
          <div className='cell small-2 large-1 icon-button'
               onClick={() => {this.addIndividualVideo(element.id, element.title)}}
          >
            <i className='fas fa-plus fa-2x align-vertical'></i>
          </div>
      }

      return (
        <div className='grid-x grid-padding-x content-item'>
          <div className='cell small-4 large-2 large-offset-2 center'>
            <img src={element.thumb} alt='User Icon'/>
          </div>
          <div className='cell small-6 large-5'>
            <div className='name'>{element.title}</div>
            <div className='desc'>{element.desc}</div>
          </div>
          {button}
        </div>
      );
    });

    //If there are no results (ie search was a failure)
    if (this.state.term != '' && this.state.failure) {
      results = <div className='center'>No results for {this.state.term}</div>
    }

    //Search box overlay for youtube playlist/user searching
    const search =
      <div className='search-wrapper'>
        <div className='search-area' onClick={this.closeOptions}>
          <div className='grid-x grid-padding-x header'>
            <div className='title cell small-8 small-offset-2'>
              Search something to start!
            </div>
            <div className='close cell small-2 icon-button' onClick={this.closeSearch}>
              &times;
            </div>
          </div>
          {searchbar}
          <div id='results-content' className='search-content'>
            {results}
          </div>
        </div>
        <ReactTransitionGroup.CSSTransition
          in={this.state.options}
          classNames='options-transition'
          timeout={250}
        >
          {options}
        </ReactTransitionGroup.CSSTransition>
      </div>;

    //-----------------------------------------------------------------------------------
    // Channel Overlay
    //-----------------------------------------------------------------------------------
    //Make sure channel info/playlists exist
    let channelInfo;
    let channelPlaylists;
    if (this.state.channelSelected  && this.state.channel.playlists !== "undefined") {
      channelInfo =
        <div id='channel-header' className='grid-x grid-padding-x header'>
          <div className='cell small-4 large-2 large-offset-2 center'>
            <img src={this.state.channel.thumb} alt='User Icon'/>
          </div>
          <div className='cell small-6 large-5'>
            <div className='title center align-vertical'>
              <div>{this.state.channel.title}</div>
              <div>Playlists:</div>
            </div>
          </div>
          <div className='close cell small-2 icon-button' onClick={this.closeChannel}>
            &times;
          </div>
        </div>
      channelPlaylists = this.state.channel.playlists.map((element) => {
        return (
          <div className='grid-x grid-padding-x content-item'>
            <div className='cell small-4 large-2 large-offset-2 center'>
              <img src={element.thumb} alt='Image'/>
            </div>
            <div className='cell small-6 large-5'>
              <div className='name'>{element.title}</div>
            </div>
            <div className='cell small-2 large-1 icon-button'
              onClick={() => {this.playlistExpand(element.playlistId, element.title)}}
            >
              <i className='fas fa-plus fa-2x align-vertical'></i>
            </div>
          </div>
        );
      });
    }

    //Channel overlay for when a user wants to search through channel's playlists
    const channel =
      <div className='search-wrapper'>
        {channelInfo}
        <hr/>
        <div id='channel-content' className='channel-content'>
          {channelPlaylists}
        </div>
      </div>;

    //-----------------------------------------------------------------------------------
    // Render Return
    //-----------------------------------------------------------------------------------
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
          <ReactTransitionGroup.CSSTransition
            in={this.state.channelSelected}
            classNames='channel-transition'
            timeout={500}
          >
            {channel}
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
            <div className="video-list">
              <div className="center">Selected Items:</div>
              {selectedPlaylists}
              {selectedVideos}
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

//***************************************************************************************
// Player React Class
//***************************************************************************************
class Player extends React.Component {
  constructor(props) {
    super(props);

    //Function Declarations
    this.onPlayerError = this.onPlayerError.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);

    //Init Player
    this.init();

    //onYouTubeIframeAPIReady
    //This function gets exposed globally as
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

  //=====================================================================================
  // Functions
  //=====================================================================================

  //onPlayerError
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

  //onPlayerStateChange
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

  //init
  //On creation, grab the youtube iframe helper script
  init() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  //=====================================================================================
  // Render
  //=====================================================================================
  render() {
    //If the player exists and is ready with a video
    if(this.player && this.props.videoId) {
      this.player.loadVideoById(this.props.videoId);
    }

    //Render Return
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

//***************************************************************************************
// React DOM Render
//***************************************************************************************
ReactDOM.render(
  <PlaylistRandomizer />,
  document.getElementById('react-block')
);
