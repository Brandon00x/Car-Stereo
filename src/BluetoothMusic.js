import React, { Component } from "react";
import "./Bluetooth.scss";
import { v4 as uuidv4 } from "uuid";
const axios = require("axios");

export default class BluetoothMusic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHidden: false,
      volumeHidden: true,
      hideBTCountDown: true,
      isPlayPause: false,
      btPairTitle: null,

      song: "Nothing Playing...",
      artist: null,
      album: null,
      duration: null,
      songDurationUnformatted: 0,
      currentPlaybackTime: 0,
      trackNumber: null,
      numberOfTracks: null,

      pairDeviceCard: null,
      btNames: null,
      btMacs: null,
      delay: 1000,
      delayUpdateSong: 5000,
      btScanTime: 10,
    };
    this.pairDevice = this.pairDevice.bind(this);
    this.startBtScan = this.startBtScan.bind(this);
    this.getBtDevices = this.getBtDevices.bind(this);
    this.play = this.play.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.tick = this.tick.bind(this);
    this.scanTime = this.scanTime.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.handleSongInfo = this.handleSongInfo.bind(this);
    this.handleSongInfo = this.handleSongInfo.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.getSongInfo = this.getSongInfo.bind(this);
  }

  componentDidMount() {
    console.log("Component Mounted");
    this.cmd = "done";
    this.getSongInfo();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    if (this.state.currentPlaybackTime >= this.songDurationUnformatted) {
      console.log("Song has ended");
      this.cmd = "done";
      this.getSongInfo();
    } else if (this.state.currentPlaybackTime === 0) {
      console.log("Song has Started.");
      this.setState({
        currentPlaybackTime: this.state.currentPlaybackTime + 4000, //Account for Delay
      });
    } else if (this.state.currentPlaybackTime >= 1000) {
      this.formatTime(this.state.currentPlaybackTime);
      this.setState({
        currentPlaybackTime: this.state.currentPlaybackTime + 1000,
      });
    }
  }

  async formatTime(time) {
    this.mstosec = Math.floor(time / 1000);
    this.minutes = Math.floor(this.mstosec / 60);
    this.seconds = (this.mstosec - this.minutes * 60).toString();
    if (this.seconds.length === 1) {
      this.seconds = `0${this.seconds}`;
      this.songPlaybackTime = this.minutes + ":" + this.seconds;
    } else {
      this.songPlaybackTime = this.minutes + ":" + this.seconds;
    }
  }

  scanTime() {
    if (this.state.btScanTime === 1) {
      this.setState({
        hideBTCountDown: true,
      });
      clearInterval(this.scanInterval);
    }
    this.setState({
      btScanTime: this.state.btScanTime - 1,
    });
    console.log(this.state.btScanTime);
  }

  async startBtScan() {
    this.setState({
      btPairTitle: "Searching for Bluetooth Devices",
    });
    try {
      axios({
        method: "get",
        url: `http://localhost:3222/scanbtdevices`,
      });
    } catch (err) {
      console.log(`Error Requesting BT Scan: ${err}`);
    }
    this.scanInterval = setInterval(this.scanTime, this.state.delay);
    this.loadingBtCard = (
      <div className="btdevicecard">
        <h4 className="btdevicecardtitle">{this.state.btPairTitle}</h4>
      </div>
    );
    this.setState((prevstate) => ({
      hideBTCountDown: false,
      isHidden: !prevstate.isHidden,
      pairDeviceCard: this.loadingBtCard,
    }));
    this.getBtDevices();
  }

  async getBtDevices() {
    setTimeout(async () => {
      try {
        const res = await axios({
          method: "get",
          url: `http://localhost:3222/sendbtdevices`,
        });
        let data = res.data;
        let rows = data.split("\n");

        //No Devices Found
        if (data === "No Devices Found") {
          clearInterval(this.scanInterval);
          this.notFoundCard = (
            <div className="btdevicecard">
              <h4 className="btdevicecardtitle">No Bluetooth Devices Found</h4>
            </div>
          );
          this.setState({
            pairDeviceCard: this.notFoundCard,
          });
          setTimeout(() => {
            this.setState({
              isHidden: false,
              btScanTime: 10,
            });
          }, 2000);
        } else {
          //Devices Found
          this.btnames = [];
          this.btmacs = [];
          this.btdevicerows = [];
          for (let i = 0; i < rows.length; i++) {
            this.btnames.push(rows[i].slice(18));
            this.btmacs.push(rows[i].slice(0, 17));
            this.btdevicerows.push(
              <div key={uuidv4()}>
                <input
                  className="btdevicelist"
                  defaultValue={rows[i].slice(18)}
                  disabled
                ></input>
                <button
                  value={rows[i].slice(0, 17)}
                  className="btPairButton"
                  onClick={this.pairDevice}
                >
                  Connect
                </button>
              </div>
            );
          }
          this.setState({
            btPairTitle: "Pair with Device:",
          });

          this.pairBtCard = (
            <div className="btdevicecard">
              <h4 className="btdevicecardtitle">{this.state.btPairTitle}</h4>
              {this.btdevicerows}
            </div>
          );
          clearInterval(this.scanInterval);
          this.setState({
            isHidden: true,
            pairDeviceCard: this.pairBtCard,
            btNames: this.btnames,
            btMacs: this.btmacs,
            btScanTime: 10,
          });
        }
      } catch (err) {
        console.error(`Error Scanning BT Devices: ${err}`);
      }
    }, 11000);
  }

  pairDevice(e) {
    this.selectedDevice = e.target.value;
    console.log(`Selected Device: ${this.selectedDevice}`);
    this.setState({
      isHidden: false,
      pairDeviceCard: null,
    });
    try {
      axios
        .post("http://localhost:3222/pairbt", {
          btMac: this.selectedDevice,
        })
        .then(async (response) => {
          await this.handleSongInfo(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.error(`Unable to POST to Pair BT Device ${err}`);
    }
  }

  handleSongInfo = async (response) => {
    clearInterval(this.interval);
    console.log("Updating Song Info");
    if (response === undefined) {
      console.error("Error: Undefined Response for get song info");
      return;
    } else {
      try {
        let trackInfo = response.data.TrackInfo;
        //let pairedDevice =  response.data.PairedDevice.replaceAll('"', "");
        let songName = trackInfo.Title.replaceAll('"', "");
        let albumName = trackInfo.Album.replaceAll('"', "");
        let artistName = trackInfo.Artist.replaceAll('"', "");
        this.songDurationUnformatted = parseFloat(
          trackInfo.Duration.replaceAll('"', "")
        );
        let numberOfSongs = trackInfo.TrackNumber.replaceAll('"', "");
        let songNumber = trackInfo.TrackNumber.replaceAll('"', "");

        this.mstosec = Math.floor(this.songDurationUnformatted / 1000);
        this.minutes = Math.floor(this.mstosec / 60);
        this.seconds = (this.mstosec - this.minutes * 60).toString();
        if (this.seconds.length === 1) {
          this.seconds = `0${this.seconds}`;
          this.songTotalTime = this.minutes + ":" + this.seconds;
        } else {
          this.songTotalTime = this.minutes + ":" + this.seconds;
        }

        let results = {
          //pairedDevice,
          songName,
          albumName,
          artistName,
          songNumber,
          numberOfSongs,
        };
        this.setState({
          isPlayPause: true,
          song: results.songName,
          album: results.albumName,
          artist: results.artistName,
          duration: this.songTotalTime,
          songDurationUnformatted: this.songDurationUnformatted,
          numberOfTracks: results.numberOfSongs,
          trackNumber: results.songNumber,
          currentPlaybackTime: 0,
        });
        console.log("Song Duration: ", this.state.duration);
        this.interval = setInterval(this.tick, this.state.delay);
      } catch (err) {
        console.log("Could Not Set Song Info");
      }
    }
  };

  getSongInfo() {
    console.log("Called Get Song Info: CMD WAS ", this.cmd);
    clearInterval(this.interval);
    try {
      axios
        .post("http://localhost:3222/playerControls", { cmd: this.cmd })
        .then(async (response) => {
          this.handleSongInfo(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.error(`BT Play Post Error: ${err}`);
    }
  }

  play() {
    this.cmd = "play";
    this.getSongInfo();
    this.setState((prevState) => ({
      isPlayPause: !prevState.isPlayPause,
    }));
    console.log("PlayPause State: ", this.state.isPlayPause);
    if (this.state.isPlayPause === false) {
      this.interval = setInterval(this.tick, this.state.delay);
    }
  }

  next() {
    this.cmd = "next";
    this.getSongInfo();
  }

  prev() {
    this.cmd = "prev";
    this.getSongInfo();
  }

  //Volume
  setVolume() {
    this.setState((prevState) => ({
      volumeHidden: !prevState.volumeHidden,
    }));
  }

  handleVolumeChange(e) {
    this.volumeLevel = e.target.value;
    this.changeVolume();
  }

  changeVolume() {
    try {
      axios
        .post("http://localhost:3222/volume", {
          volume: this.volumeLevel,
        })
        .then((res) => {
          this.volResponse = res.data;
          console.log(this.volResponse);
        });
    } catch (err) {
      console.error(`Error Changing Volume ${err}`);
    }
  }
  //End Volume

  render() {
    return (
      <div className="btMusicContainer">
        <div className="music_player">
          <div className="artist_img">
            <img src="./images/notplaying.png" alt="" />
          </div>

          {this.state.isHidden ? (
            <div>
              {this.state.pairDeviceCard}
              {this.state.hideBTCountDown ? null : (
                <h4 className="btScanTime">{this.state.btScanTime}</h4>
              )}
            </div>
          ) : (
            <div className="music_info">
              <h2>{this.state.artist}</h2>
              <p className="btalbum">{this.state.album}</p>
              <p className="song_title">{this.state.song} </p>
            </div>
          )}

          <div className="btMusicBottom">
            <div className="time_slider">
              <span className="runing_time">{this.songPlaybackTime}</span>
              <input
                className="btMusicPlaybackTime"
                type="range"
                value={this.state.currentPlaybackTime}
                max={this.songDurationUnformatted}
              />
              <span className="song_long">{this.state.duration}</span>
            </div>
            <div className="controllers">
              {this.state.volumeHidden ? null : (
                <div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={this.volumeLevel}
                    className="btVolumeSlider"
                    onChange={this.handleVolumeChange}
                    style={{ marginTop: "30px" }}
                  />
                </div>
              )}
              <img
                className="btvolume"
                src="./images/volumedown.png"
                alt=""
                onClick={this.setVolume}
              />
              <img
                className="btprev"
                src="./images/prevnext.png"
                alt=""
                onClick={this.prev}
              />

              {this.state.isPlayPause ? (
                <img
                  className="btplay"
                  src="./images/pause.png"
                  alt=""
                  onClick={this.play} //Pause/Play is bool
                />
              ) : (
                <img
                  className="btplay"
                  src="./images/play.png"
                  alt=""
                  onClick={this.play} //Pause/Play is bool
                />
              )}
              <img
                className="btnext"
                src="./images/prevnext.png"
                alt=""
                onClick={this.next}
              />
              <img
                className="btsettings"
                src="./images/btsettings.png"
                alt=""
                onClick={this.startBtScan}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
