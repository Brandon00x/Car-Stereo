import React, { Component } from "react";
import ReactPlayer from "react-player";
import YTSearch from "./utils/YoutubeAPI";
import { v4 as uuidv4 } from "uuid";
import Keyboard from "react-simple-keyboard";
import keys from "./private/keys";

//SVG
import { ReactComponent as GoogleAssistant } from "./svg/GoogleAssistant.svg";
import { ReactComponent as SearchIcon } from "./svg/SearchIcon.svg";

// CSS
import "./Keyboard.css";
import styles from "./Youtube.scss";
import { Col } from "react-bootstrap";

export default class Youtube extends Component {
  constructor(props) {
    super(props);
    this.state = {
      term: "",
      isSearching: false,
      API_KEY: keys.YouTubeAPIKey,
      videoResults: [],
      hasResult: false,
      chosenResult: "",
      maxResults: 6,
      mainTitile: " Search YouTube: ",
      title: "",
      videoPlaying: false,
      isSearchingClass: "initial-load",
    };
    this.keyboardInput = this.keyboardInput.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.chooseVideo = this.chooseVideo.bind(this);
  }

  keyboardInput = (term) => {
    this.setState({
      term: term,
      isSearching: true,
      hasResult: false,
    });
  };

  onBack = () => {
    this.setState({
      term: "",
      isSearching: false,
      hasResult: false,
      videoPlaying: false,
      isSearchingClass: "initial-load",
    });
    console.info(`Youtube Component: onBack Called`);
  };

  onClick = () => {
    this.setState({
      term: "",
      isSearching: true,
      hasResult: false,
      videoPlaying: false,
      isSearchingClass: "is-searching",
      mainTitile: "Search YouTube: ",
      title: "",
    });
    console.info(`Youtube Component: onClick Called`);
  };

  onSubmit(e, term) {
    e.preventDefault();
    this.setState({
      term: e.target.value,
      isSearching: false,
    });
    console.info(`YouTube Component onSubmit Called:.`);
  }

  chooseVideo(e) {
    e.preventDefault();
    console.warn(`VALUE: ${e.currentTarget.value}`);
    this.setState({
      chosenResult: e.target.value,
      isSearching: false,
      hasResult: false,
      videoPlaying: true,
      title: e.target.title,
      mainTitile: "Playing: ",
    });
    console.warn(`Chosen Result: ${this.state.chosenResult}`);
  }

  videoSearch = (e) => {
    e.preventDefault();
    try {
      YTSearch(
        {
          key: this.state.API_KEY,
          term: this.state.term,
          maxResults: this.state.maxResults,
        },
        (videos) => {
          let errorCheck = JSON.stringify(videos);
          let rateCheck = JSON.parse(errorCheck);
          if (rateCheck["name"] === "Error") {
            alert(
              "YouTube API Search Limit Reached. No more searches allowed."
            );
          } else {
            let resultsArr = [];
            for (let i = 0; i < videos.length; i++) {
              let result = {
                key: uuidv4(),
                VideoURL: `https://www.youtube.com/watch?v=${videos[i].id.videoId}`,
                Title: videos[i].snippet.title,
                Description: videos[i].snippet.description,
                Channel: videos[i].snippet.channelTitle,
                ThumbnailURL: videos[i].snippet.thumbnails.medium.url,
              };
              resultsArr.push(result);
            }
            console.warn(
              `YoutubeSearchResults Component: New Search. Values: ${resultsArr}`
            );
            this.setState(() => ({
              videoResults: resultsArr,
              isSearching: false,
              hasResult: true,
            }));
          }
        }
      );
    } catch (err) {
      console.error(`Error Searching Youtube in YouTubeSearchResults.js: ${err}`);
    }
  };

  render() {
    let YoutubePlayerOptions = {
      url: this.state.chosenResult,
      controls: true,
      width: "800px",
      height: "390px",
      playing: true,
    };
    return (
      <div className={styles.youtubecontainer}>
        {this.state.videoPlaying ? (
          <ReactPlayer {...YoutubePlayerOptions} />
        ) : null}
        {this.state.hasResult ? null : <div></div>}

        {/* VIDEO IS PLAYING */}
        {this.state.hasResult ? null : (
          <div onClick={this.onClick}>
            {this.state.videoPlaying ? (
              <div className="videoPlaying">
                <div className="videoPlayingText">
                  <h4>
                    {this.state.mainTitile} {this.state.title}
                  </h4>
                </div>
                <div>
                  <button
                    className="videoPlayingSearchButton"
                    onClick={this.videoSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
            ) : (
              // DEFAULT SEARCH PAGE LOAD NO RESULTS
              <div className={this.state.isSearchingClass}>
                <div className="searchInputDivYoutube">
                  <h4 className="searchInputTitle">
                    Search <span className="searchInputSpan">Youtube</span>
                  </h4>
                  <form className="searchFormYouTube">
                    <input
                      type="text"
                      className="searchBoxInputYoutube"
                      value={this.state.term}
                      onClick={this.onClick}
                      onChange={this.keyboardInput}
                      onSubmit={this.videoSearch}
                    />
                    <div className="searchDivButtonsYoutube">
                      <GoogleAssistant className="googleAssistantButtonYouTube" />
                      <SearchIcon
                        className="searchInputIconYoutube"
                        onClick={this.videoSearch}
                      />
                    </div>
                  </form>
                  {this.state.isSearching
                    ? null // <button onClick={this.onBack}>Back</button>
                    : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IS SEARCHING WITH KEYBOARD */}
        {this.state.isSearching ? (
          <div className="YoutubeKeyboard">
            <Keyboard
              keyboardRef={(r) => (this.keyboard = r)}
              layoutName={this.state.layoutName}
              onChange={this.keyboardInput}
              onKeyPress={this.onKeyPress}
            />
          </div>
        ) : null}

        {/* SEARCH HAS A RESULT */}
        {this.state.hasResult ? (
          <div>
            <div className={styles.searchresultscontainer}>
              <Col className="ResultGrid">
                {this.state.videoResults.map((result) => (
                  //CHOOSE VIDEO
                  <form className="-card" key={result.key}>
                    <div className="-top">
                      <div
                        className="image"
                        style={{
                          backgroundImage: `url(${result.ThumbnailURL})`,
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat center",
                        }}
                      ></div>
                    </div>
                    <div className="-bottom">
                      <h3 className="title">{result.Title}</h3>
                      <button
                        className="play"
                        title={result.Title}
                        value={result.VideoURL}
                        onClick={this.chooseVideo}
                      >
                        Play
                      </button>
                    </div>
                  </form>
                ))}
                <div className="row-button">
                  <img
                    src="./images/backarrow.png"
                    className="searchResultsBackButton"
                    onClick={this.onBack}
                    alt=""
                  />
                  <SearchIcon
                    className="searchResultsSearchAgain"
                    onClick={this.onClick}
                  />
                </div>
              </Col>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
