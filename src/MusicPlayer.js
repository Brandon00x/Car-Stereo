import React, { Component } from "react";
import { Col, Row } from "react-bootstrap";
//import MusicPlayerUpNext from "./MusicPlayerUpNext";
import ErrorPage from "./ErrorPage";
import MusicLoading from "./MusicLoading";
import { ReactComponent as GoogleAssistant } from "./svg/GoogleAssistant.svg";
import { v4 as uuidv4 } from "uuid";

const axios = require("axios");
const keys = require("./private/keys");

export default class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true, //Loading
      isFirstPlay: true, //Is the song the first played song after search?
      hasError: false, //Did we hit an error? Load Error Page.
      errorMessage: null, //If we hit an error, set the error message to display.
      isDisabled: false, //Disable the Next Track Until Promise is Done.
      isHidden: true, //Hide Vol Slider

      music: this.props.musicKit.getInstance(), // Get's Apple MusicKit Instance
      textColor1: null, //Dynamic Color 1 of Player Based on Album
      textColor2: null, //Dynamic Color 2 of Player Based on Album
      textColor3: null, //Dynamic Color 3 of Player Based on Album
      textColor4: null, //Dynamic Color 4 of Player Based on Album

      isPaused: false, //Toggles Pause/Play
      songName: this.props.songName, //Sets Playing Song Title
      artistName: this.props.artistName, //Sets Playing Song Artist Name
      upNextSong: null, //Sets Up Next Song Title
      upNextSongId: null, //Sets Next Song ID To Play
      repeatBool: false,
      songId: this.props.songId,
      volumeLevel: null,

      albumUpNextCount: null, //Sets Total Album Songs Up Next
      albumArtworkSmall: null, //Sets Album Small Artwork
      delay: 1000, //Sets Playback Time Counter
      songDuration: null, //Sets Song Duration Displayed on Page
      formattedPlaybackTime: null, //Sets Song Duration as Formatted MM:SS
      currentPlaybackProgress: null, //Sets Media Slider Progress
      resultRows: null, //Sets Row Count of Up Next Songs to Generate
    };
    this.onLoadPlay = this.onLoadPlay.bind(this); //Plays Music After Loading Done
    this.pauseMusic = this.pauseMusic.bind(this); //Pauses Music on Click
    this.resumeMusic = this.resumeMusic.bind(this); //Resumes Song on Click
    this.stopMusic = this.stopMusic.bind(this); //Stops Current Playing Song.
    this.next = this.next.bind(this); //Plays Next Song
    this.prev = this.prev.bind(this); // Plays Prev Song
    this.volume = this.volume.bind(this);
    this.repeat = this.repeat.bind(this); //Repeats Current Song
    this.getAlbumSongs = this.getAlbumSongs.bind(this); //Gets Album Songs based on Playing Song
    this.tick = this.tick.bind(this); //Counts Playback Time Up.
    this.createRows = this.createRows.bind(this); //Creates Rows for Album Song Count
    this.formatTime = this.formatTime.bind(this); //Formats Total Song Time to MM:SS
    this.showVolume = this.showVolume.bind(this); //Hide/Show the volume slider
    this.setPlaybackTime = this.setPlaybackTime.bind(this);
  }

  async componentDidMount() {
    console.log("Music Player Mounted");
    await this.onLoadPlay();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async onLoadPlay() {
    this.state.music
      .setQueue({ song: this.props.songId })
      .then(async () => {
        await this.state.music.play();
        this.formatTime(this.state.music.currentPlaybackDuration);
        this.setState({
          songDuration: this.songTimeFormatted,
        });
      })
      .then(async () => {
        this.interval = setInterval(this.tick, this.state.delay);
      })
      .then(async () => {
        await this.getAlbumSongs();
        this.createRows();
      })
      .then(async () => {
        if (this.state.upNextSongId[0] === this.props.songId) {
          console.log(
            `Was EQL: UpNext Array: ${this.state.upNextSongId[0]} Prop: ${this.props.songId}`
          );
          await this.state.upNextSong.shift();
          await this.state.upNextSongId.shift();
          await this.state.resultRows.shift();
          this.setState({
            albumUpNextCount: this.state.albumUpNextCount - 1,
          });
          this.createRows();
        }
      })
      .then(() => {
        console.log("LOAD VOL: ", this.state.music.volume * 100);
        this.setState({
          isLoading: false,
          volume: this.state.music.volume * 100,
        });
      });
  }

  async getAlbumSongs() {
    try {
      const res = await axios({
        method: "get",
        url: `https://api.music.apple.com/v1/catalog/us/albums/${this.state.music.nowPlayingItem.relationships.albums.data[0].id}`,
        headers: { Authorization: `Bearer ${keys.AppleMusicAPIKey}` },
      });

      let result = JSON.stringify(res.data);
      let parsed = JSON.parse(result);

      this.albumTrackCount = parsed.data[0].relationships.tracks.data.length;
      this.textColor1 = "#" + parsed.data[0].attributes.artwork.textColor1;
      this.textColor2 = "#" + parsed.data[0].attributes.artwork.textColor2;
      this.textColor3 = "#" + parsed.data[0].attributes.artwork.textColor3;
      this.textColor4 = "#" + parsed.data[0].attributes.artwork.textColor4;
      this.albumArtworkUrl =
        parsed.data[0].relationships.tracks.data[0].attributes.artwork.url.slice(
          0,
          -14
        ) + "/45x45bb.jpg";

      this.upNextSong = [];
      this.upNextSongId = [];
      for (
        let i = 0;
        i < parsed.data[0].relationships.tracks.data.length;
        i++
      ) {
        this.upNextSong.push(
          parsed.data[0].relationships.tracks.data[i].attributes.name
        );
        this.upNextSongId.push(parsed.data[0].relationships.tracks.data[i].id);
      }

      this.setState({
        upNextSong: this.upNextSong,
        upNextSongId: this.upNextSongId,
        albumArtworkSmall: this.albumArtworkUrl,
        albumUpNextCount: this.albumTrackCount,
        textColor1: this.textColor1,
        textColor2: this.textColor2,
        textColor3: this.textColor3,
        textColor4: this.textColor4,
      });
    } catch (err) {
      console.log(err);
      this.errorMessage = JSON.stringify(err.message);
      this.setState({
        hasError: true,
        isLoading: false,
        errorMessage: this.errorMessage,
      });
    }
  }

  async tick() {
    this.formatTime(this.state.music.currentPlaybackTime);
    if (
      this.state.music.currentPlaybackTime >=
        this.state.music.currentPlaybackDuration &&
      this.state.repeatBool === true
    ) {
      console.warn("CLEARED INTERVAL FOR REPEAT");
      clearInterval(this.interval);
      await this.state.music.setQueue({ song: this.state.songId });
      await this.state.music.play();
      this.interval = setInterval(this.tick, this.state.delay);
      this.setState({
        songId: this.state.music.nowPlayingItem.id,
      });
      return;
    } else if (
      this.state.music.currentPlaybackTime >=
        this.state.music.currentPlaybackDuration &&
      this.state.repeatBool === false
    ) {
      console.warn("CLEARED INTERVAL");
      this.next();
      clearInterval(this.interval);
      return;
    }
    this.setState({
      formattedPlaybackTime: this.songTimeFormatted,
    });
  }

  pauseMusic() {
    clearInterval(this.interval);
    this.state.music.pause();
    this.setState({
      isPaused: true,
    });
  }

  resumeMusic() {
    this.state.music.play();
    this.interval = setInterval(this.tick, this.state.delay);
    this.setState({
      isPaused: false,
    });
  }

  stopMusic() {
    this.state.music.stop();
    clearInterval(this.interval);
    this.setState({
      formattedPlaybackTime: null,
      songDuration: null,
    });
  }

  // TODO: Add Previous Feature
  prev() {}

  async repeat() {
    this.setState((prevState) => ({
      repeatBool: !prevState.repeatBool,
    }));
    console.log(`Toggled Repeat Bool ${await this.state.songId}`);
  }

  async volume(e) {
    this.setState({
      volumeLevel: e.target.value / 100,
    });
    this.state.music.volume = this.state.volumeLevel;
  }

  showVolume() {
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
    }));
  }

  //This really just clears the error about having a default value.
  async setPlaybackTime(e) {
    this.currentPlaybackProgress =
      this.state.music.currentPlaybackProgress * 100;
    this.setState({
      currentPlaybackProgress: this.currentPlaybackProgress,
    });
  }

  async next() {
    if (this.state.albumUpNextCount === 0) {
      console.log("Nothing Left To Play");
      this.state.music.stop();
      return this.props.loadSearch();
    }
    await this.state.music
      .stop()
      .then(async () => {
        //Disable Next Icon Until Promise Finish
        this.setState({ isDisabled: true, isPaused: true });
        clearInterval(this.interval);
      })
      // Clear Song and Shift Album Rows on if first play.
      .then(async () => {
        if (this.state.isFirstPlay === true) {
          await this.state.resultRows.shift();
          await this.state.upNextSong.shift();
          this.setState({
            albumUpNextCount: this.state.albumUpNextCount - 1,
          });
          this.createRows();
        } else if (this.state.isFirstPlay === false) {
          await this.state.upNextSong.shift();
          await this.state.upNextSongId.shift();
          await this.state.resultRows.shift();
          this.setState({
            albumUpNextCount: this.state.albumUpNextCount - 1,
          });
          this.createRows();
        }
      })
      //Set Queue to play next song
      .then(async () => {
        await this.state.music.setQueue({ song: this.state.upNextSongId[0] });
      })
      // Play next song
      .then(async () => {
        await this.state.music.play();
        this.formatTime(this.state.music.currentPlaybackDuration);
        this.setState({
          songDuration: this.songTimeFormatted,
        });
      })
      // Update State with New Song Properties Set Time to 0.
      .then(async () => {
        this.interval = setInterval(this.tick, this.state.delay);
        this.setState({
          songName: this.state.music.nowPlayingItem.attributes.name,
          artistName: this.state.music.nowPlayingItem.attributes.artistName,
          isFirstPlay: false,
          isDisabled: false,
          isPaused: false,
        });
        console.log(
          `AFTER Change Queue\n
          Up Next Song: ${this.state.upNextSong[0]}, \n
          Up Next SongID: ${this.state.upNextSongId[0]}, \n
          Interval Time: ${this.interval} \n
          Song Duration: ${this.state.songDuration} \n
          Was First Play: ${this.state.isFirstPlay} \n
          `
        );
      });
  }

  formatTime(time) {
    this.minutes = Math.floor(time / 60);
    this.seconds = (time - this.minutes * 60).toString();
    if (this.seconds.length === 1) {
      this.seconds = `0${this.seconds}`;
      this.songTimeFormatted = this.minutes + ":" + this.seconds;
    } else {
      this.songTimeFormatted = this.minutes + ":" + this.seconds;
    }
  }

  createRows() {
    if (this.state.albumUpNextCount > -1) {
      this.resultsRows = [];
      for (let i = 0; i < this.state.albumUpNextCount; i++) {
        this.rows = (
          <Row
            key={uuidv4()}
            className="musicPlayerUpNextRow"
            style={{ color: this.state.textColor1 }}
          >
            <span className="upNextRowSongName">
              <img
                src={this.state.albumArtworkSmall}
                className="musicPlayerAlbumArtSmall"
                alt=""
              ></img>{" "}
              {this.state.upNextSong[i]}
            </span>
          </Row>
        );
        this.resultsRows.push(this.rows);
      }
      this.setState({
        resultRows: this.resultsRows,
      });
    }
  }

  render() {
    if (this.state.isLoading) {
      return <MusicLoading />;
    }
    if (this.state.hasError) {
      return <ErrorPage {...this.state} />;
    }
    return (
      <div
        className="musicPlayerContainer"
        style={{ backgroundColor: this.state.textColor3 }}
      >
        <Col
          className="music-box"
          style={{ backgroundColor: this.state.textColor4 }}
        >
          <div className="album">
            <img className="photo" src={this.props.albumArtwork} alt=""></img>
            <div className="infos">
              <div className="song">
                <span
                  className="songTitle"
                  style={{ color: this.state.textColor1 }}
                >
                  {this.state.songName}
                </span>
                <small style={{ color: this.state.textColor2 }}>
                  {this.props.artistName}
                </small>
              </div>
            </div>
          </div>
          <div className="musicPlayerDashboard">
            <div className="player">
              <div className="time" style={{ color: this.state.textColor1 }}>
                <small className="current">
                  {this.state.formattedPlaybackTime}
                  <span style={{ color: this.state.textColor2 }}> / </span>
                </small>
                <small className="duration">{this.state.songDuration}</small>
              </div>

              <div className="time-rail">
                <input
                  style={{ backgroundColor: this.state.textColor2 }}
                  type="range"
                  id="musicProgress"
                  min="0"
                  max="100"
                  onChange={this.setPlaybackTime} //This really does nothing except clear error about no default value
                  value={this.state.music.currentPlaybackProgress * 100}
                />
              </div>
            </div>
            {this.state.isHidden ? (
              <div className="action-button">
                <div className="prev" style={{ color: this.state.textColor1 }}>
                  <i className="fa fa-step-backward"></i>
                </div>
                {this.state.isPaused ? (
                  <div
                    onClick={this.resumeMusic}
                    className="play-pause"
                    style={{
                      color: this.state.textColor1,
                      borderColor: this.state.textColor1,
                    }}
                  >
                    <i className="fa-solid fa-play"></i>
                  </div>
                ) : (
                  <div
                    onClick={this.pauseMusic}
                    className="play-pause"
                    style={{
                      color: this.state.textColor1,
                      borderColor: this.state.textColor1,
                    }}
                  >
                    <i className="fa fa-pause"></i>
                  </div>
                )}
                <div
                  onClick={this.stopMusic}
                  className="stop"
                  style={{ color: this.state.textColor1 }}
                >
                  <i className="fa fa-stop"></i>
                </div>
                {this.state.isDisabled ? (
                  <div
                    className="next"
                    style={{ color: this.state.textColor2 }}
                  >
                    <i className="fa fa-step-forward"></i>
                  </div>
                ) : (
                  <div
                    onClick={this.next}
                    className="next"
                    style={{ color: this.state.textColor1 }}
                  >
                    <i className="fa fa-step-forward"></i>
                  </div>
                )}
                <div
                  onClick={this.repeat}
                  className="repeat"
                  style={{ color: this.state.textColor1 }}
                >
                  <i className="fa fa-repeat"></i>
                </div>
                <GoogleAssistant
                  className="googleAssistantMusicPlayer"
                  onClick={this.props.handleSearchResults}
                />
                <i
                  className="fa fa-search musicSearchIconPlayer"
                  onClick={this.props.loadSearch}
                  style={{ color: this.state.textColor1 }}
                ></i>
              </div>
            ) : null}
            <div className="vol">
              <div
                onClick={this.showVolume}
                className="volume"
                style={{ color: this.state.textColor1 }}
              >
                <i className="fa fa-volume-up"></i>
              </div>
              {this.state.isHidden ? null : (
                <input
                  style={{ backgroundColor: this.state.textColor2 }}
                  type="range"
                  id="volSlider"
                  min="0"
                  max="100"
                  value={this.state.music.volume * 100}
                  onChange={this.volume}
                />
              )}
            </div>
          </div>
        </Col>
        <Col className="musicPlayerUpNext">
          <Row
            className="musicPlayerUpNextRowStart"
            style={{ color: this.props.textColor1 }}
          >
            <h4 style={{ color: this.props.textColor4, textAlign: "right" }}>
              Up Next:
            </h4>
          </Row>
          {this.resultsRows}
        </Col>
      </div>
    );
  }
}
