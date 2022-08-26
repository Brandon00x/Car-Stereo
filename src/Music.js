import React, { Component } from "react";
import keys from "./private/keys";
import MusicFirstLoad from "./MusicFirstLoad";
import MusicSearchPage from "./MusicSearchPage";
import AppleMusicSearchResults from "./MusicGetSearchResults";
import MusicPlayer from "./MusicPlayer";

// Styling
import "./Keyboard.css";
import "./Music.scss";
import "./MusicLoading.css";

export default class Music extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "Search Music...",
      isSearching: false,
      isFirstLoad: true,
      isPlayerLoaded: false,
      hasSearchResults: false,
      isAuthorized: false,
      songId: "",
      songName: "",
      albumArtwork: "",
      albumName: "",
      artistName: "",
      musicKit: window.MusicKit,
      search1: null,
      search2: null,
      search3: null,
      search4: null,
      search5: null,
    };
    this.loadSearch = this.loadSearch.bind(this);
    this.handleSearchResults = this.handleSearchResults.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.authorizeMusicKit = this.authorizeMusicKit.bind(this);
  }

  componentDidMount() {
    this.authorizeMusicKit();
  }

  loadSearch() {
    this.setState({
      isSearching: true,
      isFirstLoad: false,
      isPlayerLoaded: false,
      hasSearchResults: false,
    });
    console.log(`Loading Music Search Component.`);
  }

  async handleSearchResults(e, val) {
    e.preventDefault();
    this.setState({});
    this.setState((prevState) => ({
      input: val,
      //input: "Hayes Carll",
      isSearching: false,
      isFirstLoad: false,
      isPlayerLoaded: false,
      hasSearchResults: true,
      search1: val,
      search2: prevState.search1,
      search3: prevState.search2,
      search4: prevState.search3,
      search5: prevState.search4,
    }));
  }

  async handlePlay(e, songId, songName, albumArtwork, albumName, artistName) {
    e.preventDefault();
    this.setState({
      input: "",
      isSearching: false,
      isFirstLoad: false,
      hasSearchResults: false,
      isPlayerLoaded: true,
      songId: songId,
      songName: songName,
      albumArtwork: albumArtwork,
      albumName: albumName,
      artistName: artistName,
    });
  }

  async authorizeMusicKit() {
    await this.state.musicKit.configure({
      developerToken: keys.AppleMusicAPIKey,
      app: {
        name: "CarConsole",
        build: ".50",
      },
    });
    await this.state.musicKit.getInstance().authorize();
    if (this.state.musicKit.getInstance().isAuthorized === true) {
      console.log(
        `Apple Music Player Authorized: ${
          this.state.musicKit.getInstance().isAuthorized
        }`
      );
      this.setState({
        isAuthorized: true,
      });
    } else if (this.state.musicKit.getInstance().isAuthorized === false) {
      alert(
        "Apple Music is not Authorized. Sign into the popup page. If it is not there reload and try again."
      );
      this.setState({
        input: "Authorize Apple Music...",
      });
    }
  }

  render() {
    return (
      <div>
        {/* FIRST LOADING SEARCH */}
        {this.state.isFirstLoad ? (
          <MusicFirstLoad
            loadSearch={this.loadSearch.bind(this)}
            {...this.state}
          />
        ) : null}

        {/* SEARCH PAGE */}
        {this.state.isSearching ? (
          <MusicSearchPage
            {...this.state}
            handleSearchResults={this.handleSearchResults.bind(this)}
          />
        ) : null}

        {/* SEARCH RESULTS */}
        {this.state.hasSearchResults ? (
          <AppleMusicSearchResults
            {...this.state}
            handlePlay={this.handlePlay.bind(this)}
          />
        ) : null}

        {/* Music Player */}
        {this.state.isPlayerLoaded ? (
          <MusicPlayer
            loadSearch={this.loadSearch.bind(this)}
            {...this.state}
          />
        ) : null}
      </div>
    );
  }
}
