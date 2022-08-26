import React, { Component } from "react";
import "./ErrorPage.css";

export default class ErrorPage extends Component {
  render() {
    return (
      <div className="errorpage">
        <img
          src="./images/ErrorPageTwo.gif"
          alt=""
          className="errorpageimage"
        ></img>
        <div className="errorContent">
          <h1 className="errorText">OH, NO! WE CRASHED.</h1>
          <h2 className="errorText">We promise to drive better next time.</h2>
          <h3 className="errorText">Error: {this.props.errorMessage}</h3>
        </div>
      </div>
    );
  }
}
