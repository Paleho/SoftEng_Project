import React, { Component } from "react";
import { Helmet } from "react-helmet";
import "./Sessions.css";

class MainPage extends Component {
  render() {
    return (
      <div>
        <Helmet>
          <style>{"body { background-color: #eef0f1; }"}</style>
        </Helmet>
        <h1 type="text" className="text-header">
          No REST for the Wicked
        </h1>
        <h4
          type="text"
          className="text-body  "
          style={{ fontFamily: "Snell Roundhand" }}
        >
          <em>Welcome</em>
        </h4>
      </div>
    );
  }
}

export default MainPage;
