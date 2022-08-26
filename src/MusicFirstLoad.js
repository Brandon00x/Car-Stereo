import React, { Component } from "react";
import { Col, Row } from "react-bootstrap";

//SVGs
import { ReactComponent as GoogleAssistant } from "./svg/GoogleAssistant.svg";
import { ReactComponent as SearchIcon } from "./svg/SearchIcon.svg";

export default class MusicFirstLoad extends Component {
  render() {
    return (
      <Col className="musicSearchFirstLoad">
        <Row className="musicFirstLoadTitleRow">
          <h1>Apple Music</h1>
        </Row>
        <Row className="musicFirstLoadSearchRow">
          <form className="musicFormFirstLoad">
            <input
              id="musicSearchInputFirstLoad"
              placeholder={this.props.input}
            />
            {this.props.isAuthorized ? (
              <div>
                <GoogleAssistant
                  className="googleAssistantFirstLoad"
                  onClick={this.props.loadSearch}
                />
                <SearchIcon
                  className="musicSearchIconFirstLoad"
                  onClick={this.props.loadSearch}
                />
              </div>
            ) : null}
          </form>
        </Row>
      </Col>
    );
  }
}
