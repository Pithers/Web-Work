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

//App for generating playlists
class PlaylistRandomizer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      term: '',
      playlists: [],
      randomizer: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.pullPlaylist = this.pullPlaylist.bind(this);
  }

  handleChange(event) {
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
            }
          ).fail(() => {
            console.log('Get youtube playlists error');
          });
        } else {
          //If not, no playlists found
          this.setState({
            playlists: [],
          });
        }
      }
    ).fail(() => {
      console.log('Get youtube user error');
    });
  }

  pullPlaylist(value) {
    console.log(value);
  }

  render() {
    const playlist_items = this.state.playlists.map((element, i) => {
      return (
        <Playlist
          pullPlaylist = {this.pullPlaylist}
          title = {element.snippet.title}
          id = {element.id}
          key= {element.id}
        />
      );
    });

    let result;
    if(this.state.term != '') {
      if (playlist_items.length == 0) {
        result = <li key='result'>No User Found</li>
      } else {
        result = <li key='result'>User: {this.state.term}</li>
      }
    }
    return (
      <div>
        <label htmlFor="user-search">Search Username</label>
        <input onChange={this.handleChange} name='user-search' type="text" value={this.state.term}/>
        { result }
        { playlist_items }
      </div>
    );
  }
}

//Object that holds each playlist
class Playlist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      videos_grabbed: false,
      playlist_videos: [],
    };

    this.handleClick = this.handleClick.bind(this);
    this.getPlaylistVideos = this.getPlaylistVideos.bind(this);
  }

  //Recurse through get request through youtube via page tokens
  //Send multiple get requests if the playlist is over 50 videos
  //The list parameter will accumulate the playlist videos
  //Once recursion is done, the list will be saved to the
  //playlist_videos state variable
  getPlaylistVideos(list, token) {
    $.get(baseURL + 'playlistItems', {
      part: "snippet",
      playlistId: this.props.id,
      maxResults: 50,
      pageToken: token,
      key: APIKey },
      (videos) => {
        //Push all videos into the list
        videos.items.forEach((element) => {
          list.push(element);
        });
        //Recurse if there's a nextPageToken
        if (videos.nextPageToken) {
          this.getPlaylistVideos(list, videos.nextPageToken);
        } else {
          //When done, if the list has more than one video
          //put the list into the playlist_videos state variable
          if (list.length >= 1) {
            this.setState({
              playlist_videos: list,
            });
          } else {
            this.setState({
              playlist_videos: [],
            });
          }
        }
      }
    ).fail(() => {
      console.log('Get playlist videos error');
    });
  }

  //When a Playlist Item is Clicked
  handleClick() {
    //Toggle active state
    this.setState({
      active: !this.state.active
    });

    //Pass data up to parent
    this.props.pullPlaylist(this.state.active);

    //On first click, grab all videos associated with the playlist
    if (!this.state.videos_grabbed) {
      this.getPlaylistVideos([], null);
      this.setState({
        videos_grabbed: true
      });
    }
  }

  render() {
    const playlist_videos_items = this.state.playlist_videos.map((element, i) => {
      return (
        <PlaylistVideo
          title = {element.snippet.title}
          urlId = {element.snippet.resourceId.videoId}
          id = {element.id}
          key= {element.id}
        />
      );
    });

    return (
      <div>
        <div key={this.props.id} onClick={ this.handleClick }>
          { this.props.title }
        </div>
        <ul>
          { this.state.active && playlist_videos_items }
        </ul>
      </div>
    );
  }
}

//Object that holds each playlist
class PlaylistVideo extends React.Component {
  constructor(props) {
    super(props);
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
