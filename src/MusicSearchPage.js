import React, { Component } from "react";
import Keyboard from "react-simple-keyboard";

//SVGs
import { ReactComponent as GoogleAssistant } from "./svg/GoogleAssistant.svg";
import { ReactComponent as SearchIcon } from "./svg/SearchIcon.svg";

export default class MusicSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "Search Music...",
    };
    this.keyboardInput = this.keyboardInput.bind(this);
  }

  keyboardInput = (input) => {
    this.setState({ input });
  };

  render() {
    return (
      <div>
        <div className="searchMusic">
          <ul className="search-result">
            <section
              id="music-result-1"
              onClick={(e) =>
                this.props.handleSearchResults(e, this.props.search1, {
                  ...this.state,
                })
              }
            >
              {this.props.search1}
            </section>
            <section
              id="music-result-2"
              onClick={(e) =>
                this.props.handleSearchResults(e, this.props.search2, {
                  ...this.state,
                })
              }
            >
              {this.props.search2}
            </section>
            <section
              id="music-result-3"
              onClick={(e) =>
                this.props.handleSearchResults(e, this.props.search3, {
                  ...this.state,
                })
              }
            >
              {this.props.search3}
            </section>
            <section
              id="music-result-4"
              onClick={(e) =>
                this.props.handleSearchResults(e, this.props.search4, {
                  ...this.state,
                })
              }
            >
              {this.props.search4}
            </section>
            <section
              id="music-result-5"
              onClick={(e) =>
                this.props.handleSearchResults(e, this.props.search5, {
                  ...this.state,
                })
              }
            >
              {this.props.search5}
            </section>
          </ul>
          <div className="keyboardMusic">
            <form className="musicSearchForm">
              <input
                id="musicSearchInput"
                value={this.state.input}
                placeholder={"Search Music..."}
                onChange={this.keyboardInput}
                onSubmit={this.props.handleSearchResults}
              />
              <GoogleAssistant
                className="googleAssistantMusic"
                onClick={this.props.handleSearchResults}
              />
              <SearchIcon
                className="musicSearchIcon"
                onClick={(e) =>
                  this.props.handleSearchResults(e, this.state.input, {
                    ...this.state,
                  })
                }
              />
            </form>

            <Keyboard
              keyboardRef={(r) => (this.keyboard = r)}
              layoutName={this.state.layoutName}
              onChange={this.keyboardInput}
              onKeyPress={this.onKeyPress}
            />
          </div>
        </div>
      </div>
    );
  }
}
