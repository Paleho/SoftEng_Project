import axios from "axios";
import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import DatePicker from "react-date-picker";
import https from "https";
import { Card, Form, Input, Button, Error } from "../components/AuthForms";


class SessionsPerEV extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      licenseid: 0,
      sessionNumber: 0,
      sessionList: [],
      visitedPoints: 0,
      totalEnergy: 0,
      periodFrom: "",
      periodTo: "",
      err: "",
    };

    this.changeStartDate = this.changeStartDate.bind(this);
    this.changeEndDate = this.changeEndDate.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sessionLoop = this.sessionLoop.bind(this);
  }

  changeStartDate = (e) => {
    this.setState({ startDate: e });
  };

  changeEndDate = (e) => {
    this.setState({ endDate: e });
  };

  errorCheck() {
    return this.state.endDate >= this.state.startDate ? 1 : 0;
  }

  sessionLoop() {
    let length = this.state.sessionList.length;
    let list = [];
    for (var i = 0; i < length; i++) {
      list.push(
        "Session No. " +
          (i + 1) +
          ":\n Session ID: " +
          this.state.sessionList[i].SessionID +
          "\n Session Index: " +
          this.state.sessionList[i].SessionIndex +
          ",\n Energy Provider: " +
          this.state.sessionList[i].EnergyProvider +
          ",\n Started On: " +
          this.state.sessionList[i].StartedOn +
          ",\n Finished On: " +
          this.state.sessionList[i].FinishedOn +
          ",\n Price Policy: " +
          this.state.sessionList[i].PricePolicyRef +
          ",\n Cost Per kWh: " +
          this.state.sessionList[i].CostPerKWh +
          " kWh,\n Energy Delivered: " +
          this.state.sessionList[i].ΕnergyDelivered +
          " kWh,\n Total Cost: " +
          this.state.sessionList[i].SessionCost
      );
    }
    return list;
  }

  handleClick(e) {
    e.preventDefault(e);
    // Simple GET request using axios
    let tmpStart = this.state.startDate.toLocaleDateString("en-GB");
    let tmpEnd = this.state.endDate.toLocaleDateString("en-GB");

    let [startDay, startMonth, startYear] = tmpStart.split("/");
    let [endDay, endMonth, endYear] = tmpEnd.split("/");

    let url =
      "/SessionsPerEV/" +
      this.state.licenseid +
      "/" +
      startYear +
      startMonth +
      startDay +
      "/" +
      endYear +
      endMonth +
      endDay;
    window.history.replaceState(null, "Query Result", url);
    axios
      .get("https://localhost:8765/evcharge/api" + url, 
        {
        headers: {
          'x-observatory-auth': this.props.token}
      },
      {
        httpsAgent: new https.Agent({
           rejectUnauthorized: false //to make CORS work
         })}
      )
      .then((response) => {
        this.setState({ err: "ok" });
        this.setState({
          sessionNumber: response.data.NumberOfVehicleChargingSessions,
        });
        this.setState({
          sessionList: response.data.VehicleChargingSessionsList,
        });
        this.setState({ visitedPoints: response.data.NumberOfVisitedPoints });
        this.setState({ periodFrom: response.data.PeriodFrom });
        this.setState({ periodTo: response.data.PeriodTo });
        this.setState({ totalEnergy: response.data.TotalEnergyConsumed });
      })
      .catch((error) => {
        if (error.response) {
          // Request made and server responded
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          this.setState({ err: error.response.data });
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
          this.setState({ err: error.request });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
          this.setState({ err: error.message });
        }
      });
  }

  handleChange(e) {
    this.setState({ licenseid: e.target.value });
  }

  render() {
    if(this.props.token===undefined || this.props.token===null)
        {return(<Redirect to="/Login" />)}
        return (
          <div>
            <h1>EV Session Screen</h1>
            <nav>
              <button>
                <Link to="/">Return to Home</Link>
              </button>
            </nav>
            <h2>Specify License Plate</h2>
            <form onSubmit={this.handleSubmit}>
              <label>
                License Plate:
                <input
                  type="text"
                  stationid={this.state.licenseid}
                  onChange={this.handleChange}
                />
              </label>
            </form>
            <h4>Choose Start Date</h4>
            <DatePicker
              onChange={this.changeStartDate}
              value={this.state.startDate}
            />
            <h4>Choose End Date</h4>
            <DatePicker onChange={this.changeEndDate} value={this.state.endDate} />
            {this.errorCheck() ? (
              <button onClick={this.handleClick}> Proceed </button>
            ) : (
              <h4>Invalid</h4>
            )}
            {this.state.err === "ok" ? (
              <div>
                <h5>Search Results:</h5>
                <p>No. of Charging Sessions: {this.state.sessionNumber}</p>
                <p>No. of Visited Points: {this.state.visitedPoints}</p>
                <p>Period From: {this.state.periodFrom}</p>
                <p>Period To: {this.state.periodTo}</p>
                <p>Total Energy Consumed: {this.state.totalEnergy}</p>
                <div>
                  Session Summary:
                  {
                    <pre>
                      {this.sessionLoop().map((value, index) => {
                        return <li key={index}>{value}</li>;
                      })}
                    </pre>
                  }
                </div>
              </div>
            ) : (
              <p>{this.state.err}</p>
            )}
          </div>
        );
      }
    }
    
export default SessionsPerEV;