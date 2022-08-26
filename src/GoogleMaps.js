import React, { Component } from "react";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  LoadScript,
} from "@react-google-maps/api";
import keys from "./private/keys";
import Keyboard from "react-simple-keyboard";
import { Row, Col, Button } from "react-bootstrap";
import "./GoogleMaps.css";
//import { geoencode } from "./private/geoencode";

const axios = require("axios");

export default class Directions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      response: null,
      travelMode: "DRIVING",
      origin: "",
      destination: "",
      isHidden: true,
      lat: null,
      lng: null,
      speed: null,
      altitude: null,
    };

    this.directionsCallback = this.directionsCallback.bind(this);
    this.getOrigin = this.getOrigin.bind(this);
    this.getDestination = this.getDestination.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.keyboardInputOrigin = this.keyboardInputOrigin.bind(this);
    this.keyboardInputDestination = this.keyboardInputDestination.bind(this);
    this.getLocationData = this.getLocationData.bind(this);
    this.getMapsLocationData = this.getMapsLocationData.bind(this);
  }

  componentDidMount() {
    console.log("Google Maps Component Mounted.");
    this.getLocationData();
  }

  directionsCallback(response) {
    console.log(response);

    if (response !== null) {
      if (response.status === "OK") {
        this.setState(() => ({
          response,
        }));
      } else {
        console.log("response: ", response);
      }
    }
  }

  getOrigin(ref) {
    this.origin = ref;
  }

  getDestination(ref) {
    this.destination = ref;
  }

  onClick() {
    if (this.origin.value !== "" && this.destination.value !== "") {
      this.setState(() => ({
        origin: this.state.origin,
        destination: this.destination.value,
        isHidden: false,
      }));
    }
  }

  onMapClick(...args) {
    console.log("onClick args: ", args);
  }

  keyboardInputOrigin(e) {
    this.setState({
      origin: e.target.value,
    });
  }

  keyboardInputDestination(e) {
    this.setState({
      destination: e.target.value,
    });
  }

  async getLocationData() {
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/gpscoordinates`,
      });
      console.log("Getting Location Data");
      this.data = await res.data
      this.lng = parseFloat(this.data.lng.toFixed(6));
      this.lat = parseFloat(this.data.lat.toFixed(6));
      this.speed = this.data.speed;
      this.altitude = this.data.altitude;
      this.setState({
        lat: this.lat,
        lng: this.lng,
        speed: this.speed,
        altitude: this.altitude,
      });
      await this.getMapsLocationData();
    } catch (err) {
      console.warn(err);
      this.setState({
        origin: "Unable to get location.",
      });
    }
  }

  async getMapsLocationData() {
    try {
      const res = await axios({
        method: "get",
        url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.lat},${this.state.lng}&key=${keys.GoogleMapsAPIKey}`,
      });
      this.locationData = res.data;
      // this.locationData = geoencode;
      this.setState({
        locationData: this.locationData,
        origin: this.locationData.results[0].formatted_address.replace(
          ", USA",
          ""
        ),
      });
    } catch (err) {
      console.error(`Error Getting Location Data from Google Maps API ${err}`);
    }
  }

  render() {
    return (
      <div className="map">
        {this.state.isHidden ? (
          <div>
            <Col className="map-features">
              <Row className="map-features-row1">
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Home
                </Button>
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Work
                </Button>
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Restaurants
                </Button>
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Gas
                </Button>
              </Row>
              <Row className="map-features-row2">
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Hotels
                </Button>
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Groceries
                </Button>
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Shopping
                </Button>
                <Button
                  className="mapFeatureButton"
                  type="button"
                  //onClick={this.onClick}
                >
                  Parks
                </Button>
              </Row>
            </Col>
            <div className="map-settings">
              <hr className="mt-0 mb-3" />

              <Row className="row">
                <Col className="mapsOriginCol">
                  <div className="form-group">
                    <label htmlFor="ORIGIN">Current Address:</label>
                    <br />
                    <h4
                      id="ORIGIN"
                      className="mapsOriginInput"
                      value={this.state.origin}
                      ref={this.getOrigin}
                    >
                      {this.state.origin}
                    </h4>
                  </div>
                </Col>

                <Col className="mapsDestinationCol">
                  <div className="form-group">
                    <label htmlFor="DESTINATION">Where To?</label>
                    <br />
                    <input
                      id="DESTINATION"
                      className="mapsDestinationInput"
                      type="text"
                      value={this.state.destination}
                      onChange={this.keyboardInputDestination}
                      ref={this.getDestination}
                    />
                  </div>
                </Col>

                <Button
                  className="mapSearchButton"
                  type="button"
                  onClick={this.onClick}
                >
                  Get Directions
                </Button>
              </Row>
            </div>
            <div className="MapsKeyboard">
              <Keyboard
                keyboardRef={(r) => (this.keyboard = r)}
                layoutName={this.state.layoutName}
                //onChange={this.keyboardInput}
                onKeyPress={this.onKeyPress}
              />
            </div>
          </div>
        ) : (
          <div className="map-container">
            <LoadScript googleMapsApiKey={keys.GoogleMapsAPIKey}>
              <GoogleMap
                // required
                id="direction-example"
                // required
                mapContainerStyle={{
                  height: "430px",
                  width: "100%",
                }}
                // required
                zoom={14}
                // required
                center={{
                  lat: this.state.lat,
                  lng: this.state.lng,
                }}
                // optional
                onClick={this.onMapClick}
                // optional
                onLoad={(map) => {
                  console.log("DirectionsRenderer onLoad map: ", map);
                }}
                // optional
                onUnmount={(map) => {
                  console.log("DirectionsRenderer onUnmount map: ", map);
                }}
              >
                {this.state.destination !== "" && this.state.origin !== "" && (
                  <DirectionsService
                    // required
                    options={{
                      // eslint-disable-line
                      destination: this.state.destination,
                      origin: this.state.origin,
                      travelMode: this.state.travelMode,
                    }}
                    // required
                    callback={this.directionsCallback}
                    // optional
                    onLoad={(directionsService) => {
                      console.log(
                        "DirectionsService onLoad directionsService: ",
                        directionsService
                      );
                    }}
                    // optional
                    onUnmount={(directionsService) => {
                      console.log(
                        "DirectionsService onUnmount directionsService: ",
                        directionsService
                      );
                    }}
                  />
                )}

                {this.state.response !== null && (
                  <DirectionsRenderer
                    // required
                    options={{
                      // eslint-disable-line
                      directions: this.state.response,
                    }}
                    // optional
                    onLoad={(directionsRenderer) => {
                      console.log(
                        "DirectionsRenderer onLoad directionsRenderer: ",
                        directionsRenderer
                      );
                    }}
                    // optional
                    onUnmount={(directionsRenderer) => {
                      console.log(
                        "DirectionsRenderer onUnmount directionsRenderer: ",
                        directionsRenderer
                      );
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        )}
      </div>
    );
  }
}
// eslint-disable-next-line
{
  /* <LoadScript>
  <Directions />
</LoadScript> */
}
