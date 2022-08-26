import React, { Component } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import ErrorPage from "./ErrorPage";
import MusicLoading from "./MusicLoading";
import { v4 as uuidv4 } from "uuid";

const axios = require("axios");
const keys = require("./private/keys");

export default class ApplemusicSearchResultsCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storefront: "us",
      isLoading: true,
      hasError: false,
      errorMessage: null,
      resultRow: null,
    };
    this.searchAppleMusic = this.searchAppleMusic.bind(this);
  }

  componentDidMount() {
    console.log("Music Search Results Mounted");
    this.searchAppleMusic();
  }

  async searchAppleMusic() {
    try {
      const res = await axios({
        method: "get",
        url: `https://api.music.apple.com/v1/catalog/${this.state.storefront}/search?types=songs,artists&limit=8&term=${this.props.input}`,
        headers: { Authorization: `Bearer ${keys.AppleMusicAPIKey}` },
      });

      let result = JSON.stringify(res.data);
      let parsed = JSON.parse(result);

      this.albumArtworkUrls = [];
      this.albumNames = [];
      this.songNames = [];
      this.songIds = [];
      this.artistNames = [];
      this.resultHTML = [];
      for (let i = 0; i < parsed.results.songs.data.length; i++) {
        this.albumArtworkUrls.push(
          JSON.stringify(
            parsed.results.songs.data[i].attributes.artwork.url
          ).slice(1, -14) + "300x300bb.jpg"
        );
        this.albumNames.push(parsed.results.songs.data[i].attributes.albumName);
        this.songNames.push(parsed.results.songs.data[i].attributes.name);
        this.songIds.push(parsed.results.songs.data[i].id);
        this.artistNames.push(
          parsed.results.songs.data[i].attributes.artistName
        );
        this.resultHTML.push(
          <Col className="musicSearchResultCol" key={uuidv4()}>
            <Card className="musicSearchResultsCard">
              <img
                className="musicSearchResultImage"
                src={
                  JSON.stringify(
                    parsed.results.songs.data[i].attributes.artwork.url
                  ).slice(1, -14) + "300x300bb.jpg"
                }
                alt=""
                width="150"
                height="150"
                onClick={(e) =>
                  this.props.handlePlay(
                    e,
                    this.songIds[i],
                    this.songNames[i],
                    this.albumArtworkUrls[i],
                    this.albumNames[i],
                    this.artistNames[i]
                  )
                }
              ></img>
              <h5 className="musicSearchSongTitle">
                {parsed.results.songs.data[i].attributes.name}
              </h5>
              <h6 className="musicSearchArtistName">
                {parsed.results.songs.data[i].attributes.artistName}
              </h6>
            </Card>
          </Col>
        );
      }

      this.setState({
        resultRow: this.resultHTML,
        isLoading: false,
      });
    } catch (err) {
      this.errorMessage = JSON.stringify(err.message);
      this.setState({
        hasError: true,
        isLoading: false,
        errorMessage: this.errorMessage,
      });
      console.error(
        "Search Error: ",
        err,
        this.state.hasError,
        this.state.errorMessage
      );
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
      <Container className="musicSearchResultContainer">
        <Row className="musicSearchRowResults">{this.resultHTML}</Row>
      </Container>
    );
  }
}
