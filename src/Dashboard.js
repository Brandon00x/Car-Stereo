import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./Dashboard.css";
import { Row, Col, Container } from "react-bootstrap";

export default class Dashboard extends Component {
  render() {
    console.clear();
    return (
      <Container className="dashboard">
        <Row className="dashrow">
          <Col>
            <NavLink className="musicdash" to="/music">
              <img
                src="/images/applemusic.png"
                alt=""
                width="80"
                height="80"
                className="imgicon"
              />
              <br />
              Apple Music
            </NavLink>
          </Col>
          <Col>
            <NavLink className="bluetoothmusicdash" to="/bluetoothmusic">
              <img
                src="/images/bluetooth.png"
                alt=""
                width="80"
                height="80"
                className="phoneicon"
              />
              <br />
              Bluetooth Music
            </NavLink>
          </Col>
          <Col>
            <NavLink className="youtubedash" to="/youtube">
              <img
                src="/images/youtube.png"
                alt=""
                width="80"
                height="80"
                className="imgicon"
              />
              <br />
              Youtube
            </NavLink>
          </Col>
        </Row>
        <Row className="dashrow">
          <Col>
            <NavLink className="weatherdash" to="/weather">
              <img
                src="/images/weather.png"
                alt=""
                width="80"
                height="80"
                className="weathericon"
              />
              <br />
              Weather
            </NavLink>
          </Col>
          <Col>
            <NavLink className="navigationdash" to="/googlemaps">
              <img src="/images/map.png" alt="" width="80" height="80" />
              <br />
              Google Maps
            </NavLink>
          </Col>
          <Col>
            <NavLink className="tunerdash" to="/engine">
              <img
                src="/images/mustangtune.png"
                alt=""
                width="80"
                height="80"
              />
              <br />
              Engine
            </NavLink>
          </Col>
        </Row>
        <Row className="dashrow">
          <Col>
            <NavLink className="phonedash" to="/phone">
              <img
                src="/images/phone.png"
                alt=""
                width="80"
                height="80"
                className="phoneicon"
              />
              <br />
              Phone
            </NavLink>
          </Col>
          <Col>
            <NavLink className="messagesdash" to="/test">
              <img
                src="/images/messages.png"
                alt=""
                width="80"
                height="80"
                className="messageicon"
              />
              <br />
              Messages
            </NavLink>
          </Col>
          <Col>
            <NavLink className="settingsdash" to="/settings">
              <img src="/images/settings.png" alt="" width="80" height="80" />
              <br />
              Settings
            </NavLink>
          </Col>
        </Row>
      </Container>
    );
  }
}
