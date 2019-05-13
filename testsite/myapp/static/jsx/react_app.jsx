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
const baseURL = "https://www.googleapis.com/youtube/v3/";

function youtubePlaylistVideosPromise(listId) {
  return new Promise(function(resolve, reject) {
    $.get(baseURL + 'playlistItems', {
      part: "snippet",
      playlistId: listId,
      key: APIKey },
      function(data) {
        resolve(data);
      }
    );
  });
}

function getPlaylistVideos(listId) {
  youtubePlaylistVideosPromise(listId).then(function(data) {
    console.log(data.items[0].snippet.title);
  });
}

//Main class. App goes here
class PlaylistRandomizer extends React.Component {
  render() {
    return (
      <Playlist />
    );
  }
}

//App for generating playlists
class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      term: '',
      playlists: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      term: event.target.value,
    });

    //NEXT: Implement error handling here
    //Find channel of user searched
    $.get(baseURL + 'channels', {
      part: "id",
      forUsername: this.state.term,
      key: APIKey },
      (channel) => {
        //Get playlists from user listed
        $.get(baseURL + 'playlists', {
          part: "snippet",
          channelId: channel.items[0].id,
          maxResults: 25,
          key: APIKey },
          (list) => {
            this.setState({
              playlists: list.items,
            })
          }
        );
      }
    );
  }

  render() {
    const items = this.state.playlists.map((element, i) => {
      return <li key={i}>{ element.snippet.title }</li>
    });
    return (
      <div>
      { items }
      <label htmlFor="user-search">Input Username</label>
      <input onChange={this.handleChange} name='user-search' type="text" value={this.state.term}/>
      </div>
    );
  }
}

//Create DOM
function tick() {
  ReactDOM.render(
    <PlaylistRandomizer />,
    document.getElementById('react-block')
  );
}
setInterval(tick, 1000);
