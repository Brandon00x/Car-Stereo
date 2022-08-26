import React, { Component } from "react";
import "./Phone.css";

export default class Phone extends Component {
  render() {
    return (
      <div className="phoneContainer">
        <div className="phoneCallNumber">
          <input placeholder="555-555-5555" />
        </div>
        <div className="phoneRecentCalls">
          <h3>Recent Calls</h3>
          <h5>Caller</h5>
          <h5>Caller</h5>
          <h5>Caller</h5>
          <h5>Caller</h5>
          <h5>Caller</h5>
        </div>
        <div className="phoneRow">
          <div className="phoneNumber">1</div>
          <div className="phoneNumber">2</div>
          <div className="phoneNumber">3</div>
          <div className="phoneNumber" style={{ fontSize: "40px" }}>
            Clear
          </div>
        </div>
        <div className="phoneRow">
          <div className="phoneNumber">4</div>
          <div className="phoneNumber">5</div>
          <div className="phoneNumber">6</div>
          <div className="phoneNumber" style={{ fontSize: "40px" }}>
            Mute
          </div>
        </div>
        <div className="phoneRow">
          <div className="phoneNumber">7</div>
          <div className="phoneNumber">8</div>
          <div className="phoneNumber">9</div>
          <div className="phoneNumber" style={{ borderColor: "green" }}>
            Call
          </div>
        </div>
        <div className="phoneRow">
          <div className="phoneNumber">*</div>
          <div className="phoneNumber">0</div>
          <div className="phoneNumber">#</div>
          <div
            className="phoneNumber"
            style={{ fontSize: "20px", borderColor: "red" }}
          >
            Disconnect
          </div>
        </div>
      </div>
    );
  }
}
