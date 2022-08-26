import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "./Keyboard.css";
import "./utils/DateTime";
import "./NavBar.css";
import GoogleAssistant from "./utils/GoogleAssistant";
import { ReactComponent as GoogleAssistantIcon } from "./svg/GoogleAssistant.svg";
import keys from "./private/keys";
const axios = require("axios");

//const { heyGoogle } = require("./utils/GoogleAssistant");

export default class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPaused: false,
      isHidden: true,
      isConnected: false,
      bluetoothConnected: false,
      delay: 1000,
      isVolumeChange: false,
      temp: null,
      music: null,
      musicKit: window.MusicKit,
      songName: null,
      artistName: null,
      volumeLevel: null,
    };
    this.onClick = this.onClick.bind(this);
    this.checkPlaying = this.checkPlaying.bind(this);
    this.tick = this.tick.bind(this);
    this.pauseMusic = this.pauseMusic.bind(this);
    this.resumeMusic = this.resumeMusic.bind(this);
    this.volume = this.volume.bind(this);
    this.showVolume = this.showVolume.bind(this);
    this.setNavTemp = this.setNavTemp.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.checkWifi = this.checkWifi.bind(this);
    this.connectWifi = this.connectWifi.bind(this);
    this.quickConnectBt = this.quickConnectBt.bind(this);
    this.checkBtConnection = this.checkBtConnection.bind(this);
  }

  componentDidMount() {
    clearInterval(this.interval);
    clearInterval(this.checkIp);
    this.setNavTemp();
    this.tick();
    console.log("Component Mounted");
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.checkIp);
  }

  // WiFi -
  async checkWifi() {
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/getip`,
      });
      if (res.data === "Error") {
        this.setState({
          isConnected: false,
        });
      } else {
        this.ip = res.data.IP;
        this.setState({
          isConnected: true,
        });
      }
    } catch (err) {
      console.warn(`No Internet Connection: ${err}`);
    }
  }

  connectWifi() {
    try {
      axios
        .post("http://localhost:3222/connectwifi", {
          wifiName: keys.WifiName,
          wifiPassword: keys.WifiPassword,
        })
        .then(function (response) {
          // TODO: Check if Connection was Success
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.log(`Error Posting WiFi Password: ${err}`);
    }
  }

  // End WiFi

  // Bluetooth
  quickConnectBt() {
    try {
      axios
        .post("http://localhost:3222/pairbt", {
          settings: true,
          btMac: keys.BluetoothMAC,
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.error(`Unable to POST to Pair BT Device ${err}`);
    }
  }

  async checkBtConnection() {
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/btcheckconnected`,
      });
      let devices = res.data;
      if (devices.indexOf("Connected") !== -1) {
        this.setState({
          bluetoothConnected: true,
        });
      }
    } catch (err) {
      console.log("Error Checking BT Connections: ", err);
    }
  }
  // End Bluetooth

  onClick() {
    GoogleAssistant();
  }

  async getLocation() {
    let res = await fetch("http://localhost:3222/gpscoordinates", {
      headers: { Accept: "application/json" },
    });
    this.data = await res.json();
  }

  setNavTemp() {
    Promise.resolve(this.getLocation(this.data))
      .then(async () => {
        if (this.data === "Error") {
          throw new Error("GPS Data Undefined. Cannot Get Temperature.");
        }
        let lng = this.data.lng.toFixed(3);
        let lat = this.data.lat.toFixed(3);
        let apiKey = keys.WeatherAPIKey;
        let apiAddress;

        
        this.props.devMode
          ? (apiAddress = null)
          : (apiAddress = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`);

        let resultObj = { lng, lat, apiAddress };
        return resultObj;
      })
      .then(async ({ apiAddress }) => await fetch(apiAddress))
      .then((response) => response.json())
      .then((data) => {
        this.temp = (1.8 * (data.main.temp - 273) + 32).toFixed(0) + "°F";
        this.setState({
          temp: this.temp,
        });
      })
      .catch((error) => console.warn(`Navbar Temp Update Error: ${error}`));
  }

  checkPlaying() {
    try {
      if (this.state.musicKit.getInstance().isPlaying === true) {
        this.setState({
          isHidden: false,
          music: this.state.musicKit.getInstance(),
        });
      } else if (this.state.musicKit.getInstance().isPlaying === false) {
        this.setState({ isHidden: true });
      }
    } catch (err) {
      //console.log("Was Not Playing");
    }
  }

  async tick() {
    this.interval = setInterval(this.checkPlaying, this.state.delay);
    this.interval = setInterval(this.setNavTemp, 900000); //Every 15 Minutes
    this.checkIp = setInterval(this.checkWifi, 5000);
    this.checkBluetoothConnection = setInterval(this.checkBtConnection, 10000);
  }

  pauseMusic() {
    clearInterval(this.interval);
    this.state.music.pause();
    this.setState({
      isPaused: true,
    });
    console.log(
      `Playing: ${this.props.songName} \n Is Playing: ${this.state.music.isPlaying} \n Duration: ${this.state.music.currentPlaybackDuration} \n
        Current Playback Time: ${this.state.music.currentPlaybackTime} \n
        Current Playback Progress ${this.state.music.currentPlaybackProgress}`
    );
  }

  resumeMusic() {
    this.state.music.play();
    this.interval = setInterval(this.tick, this.state.delay);
    this.setState((prevState) => ({
      isPaused: false,
    }));
  }

  async volume(e) {
    this.setState({
      volumeLevel: e.target.value / 100,
    });
    this.state.music.volume = this.state.volumeLevel;
  }

  showVolume() {
    this.setState((prevState) => ({
      isVolumeChange: !prevState.isVolumeChange,
    }));
  }

  render() {
    return (
      <Nav className="navbar navbar-dark border-bottom navbarContainer">
        <div className="navbarContainerLeft">
          <NavLink exact="true" activeclassname="navbar-brand navlogo" to="/">
            <img
              src="/images/mustang.png"
              alt=""
              width="40"
              height="29"
              className="d-inline-block align-text-top"
            />
          </NavLink>
          {this.state.isHidden ? null : (
            <div className="navbarPlayerControls">
              <div className="navSongInfo">
                <span>
                  <p className="navSongTitle">
                    {this.state.music.nowPlayingItem.attributes.name}
                  </p>
                  <p className="navArtistName">
                    {this.state.music.nowPlayingItem.attributes.artistName}
                  </p>
                </span>
              </div>
              {this.state.isPaused ? (
                <div
                  onClick={this.resumeMusic}
                  className="play-pause naviconLeftControls"
                >
                  <i className="fa-solid fa-play fa-2x"></i>
                </div>
              ) : (
                <div
                  onClick={this.pauseMusic}
                  className="play-pause naviconLeftControls"
                >
                  <i className="fa fa-pause fa-2x"></i>
                </div>
              )}
              <div
                onClick={this.showVolume}
                className="volume naviconLeftControls"
              >
                <i className="fa fa-volume-up fa-2x"></i>
              </div>
              {this.state.isVolumeChange ? (
                <input
                  type="range"
                  id="volSliderNavBar"
                  min="0"
                  max="100"
                  // value={this.state.music.volume * 100}
                  onChange={this.volume}
                />
              ) : null}
            </div>
          )}
        </div>
        <div className="navbarContainerRight">
          <div className="naviconright">
            <GoogleAssistantIcon
              className="navGoogleAssistant"
              onClick={this.onClick}
            />
          </div>
          <div className="naviconright">
            {/* //Swap Later for Mode <i className="far fa-sun fa-2x"></i> */}
            <i className="far fa-moon " onClick={this.handleClick}></i>
          </div>
          {this.state.bluetoothConnected ? (
            <div className="naviconright">
              <img
                src="./images/bluetoothconnected.png"
                alt=""
                style={{ width: "28px", height: "28px", marginBottom: "5px" }}
              />
            </div>
          ) : (
            <div className="naviconright">
              <img
                src="./images/bluetoothdisconnected.png"
                alt=""
                style={{ width: "28px", height: "28px", marginBottom: "5px" }}
                onClick={this.quickConnectBt}
              />
            </div>
          )}
          {this.state.isConnected ? (
            <div className="naviconright">
              <img
                src="./images/wifi.png"
                alt=""
                style={{ width: "28px", height: "28px", marginBottom: "5px" }}
              />
            </div>
          ) : (
            <div className="naviconright">
              <img
                src="./images/nowifi.png"
                alt=""
                style={{ width: "28px", height: "28px", marginBottom: "5px" }}
                onClick={this.connectWifi}
              />
            </div>
          )}
          <div className="naviconright navtemp">{this.state.temp}</div>
        </div>
        <div>
          <span className="navdate">
            <time id="time"></time>
            <p id="date"></p>
          </span>
        </div>
      </Nav>
    );
  }
}
