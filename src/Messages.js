import React, { Component } from "react";
import "./Messages.scss";

export default class Messages extends Component {
  render() {
    return (
      <div class="main-container">
        <div class="account-container">
          <button class="create-message-btn">
            {" "}
            <span>WIP Not Finished - New Message</span>
          </button>
        </div>
        <div class="messages-container">
          <input
            class="search-input"
            type="text"
            placeholder="Search for messages..."
          />
          <div class="filter">
            <span class="filter-name">Lastest</span>
          </div>
          <ul class="message-list">
            <li class="message-item not-readed">
              <div class="header">
                <h3 class="author">Jane Doe</h3>
                <span class="date">13 Jan 2019</span>
              </div>
              <h2 class="title">Hey there, hope you'r fine.</h2>
              <p class="text">
                Facilisis arcu maximus et molestie urna eget a urna felis
                scelerisque nisl maximus metus sed felis eros interdum sed
                maximus quis eu morbi enim mi.
              </p>
            </li>
            <li class="message-item">
              <div class="header">
                <h3 class="author">Jane Doe</h3>
                <span class="date">13 Jan 2019</span>
              </div>
              <h2 class="title">Hey there, hope you'r fine.</h2>
              <p class="text">
                Facilisis arcu maximus et molestie urna eget a urna felis
                scelerisque nisl maximus metus sed felis eros interdum sed
                maximus quis eu morbi enim mi.
              </p>
            </li>
            <li class="message-item">
              <div class="header">
                <h3 class="author">Jane Doe</h3>
                <span class="date">13 Jan 2019</span>
              </div>
              <h2 class="title">Hey there, hope you'r fine.</h2>
              <p class="text">
                Facilisis arcu maximus et molestie urna eget a urna felis
                scelerisque nisl maximus metus sed felis eros interdum sed
                maximus quis eu morbi enim mi.
              </p>
            </li>
            <li class="message-item not-readed">
              <div class="header">
                <h3 class="author">Jane Doe</h3>
                <span class="date">13 Jan 2019</span>
              </div>
              <h2 class="title">Hey there, hope you'r fine.</h2>
              <p class="text">
                Facilisis arcu maximus et molestie urna eget a urna felis
                scelerisque nisl maximus metus sed felis eros interdum sed
                maximus quis eu morbi enim mi.
              </p>
            </li>
          </ul>
        </div>
        <div class="content-container">
          <div class="email-container">
            <div class="header">
              <h3 class="author">
                Jane Doe<span class="email">janedoe@code.com</span>
              </h3>
              <span class="date">13 Jan 2019</span>
            </div>
            <h2 class="title">Hey there, hope you'r fine.</h2>
            <div class="text">
              <p>
                Facilisis arcu maximus et molestie urna eget a urna felis
                scelerisque nisl maximus metus sed felis eros interdum sed
                maximus quis eu morbi enim mi.
              </p>
              <p>
                Erat condimentum quis placerat rutrum diam nisl bibendum dolor
                purus tempus rutrum euismod ipsum urna felis massa et orci
                scelerisque diam portaest rutrum phasellus ipsum metus vivamus
                erat lacus suspendisse lacus bibendum elit metus magna orci
                massa phasellus morbi cursus urna pellentesque gravida nisi et
                bibendum ipsum hendrerit metus id gravida accumsan mi nunc dolor
                suspendisse ex phasellus urna tristique sollicitudin aliquam
                nisi.
              </p>
            </div>
          </div>
        </div>
        <div class="clear"></div>
      </div>
    );
  }
}
