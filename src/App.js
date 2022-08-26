import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import Dashboard from "./Dashboard";
import Weather from "./Weather";
import Music from "./Music";
import BluetoothMusic from "./BluetoothMusic";
import Settings from "./Settings";
import Youtube from "./Youtube";
import Phone from "./Phone";
import Messages from "./Messages";
import GoogleMaps from "./GoogleMaps";
import Engine from "./Engine";
import ErrorPage from "./ErrorPage";

//CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devMode: true,
    };
  }
  render() {
    return (
      <div className="App">
        <NavBar {...this.state} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/music" element={<Music />} />
          <Route path="/youtube" element={<Youtube />} />
          <Route path="/bluetoothmusic" element={<BluetoothMusic />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/phone" element={<Phone />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/googlemaps" element={<GoogleMaps />} />
          <Route path="/engine" element={<Engine />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </div>
    );
  }
}
