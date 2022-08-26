import React, { Component } from "react";
import WeatherLoading from "./WeatherLoading";
import ErrorPage from "./ErrorPage";
import "./Weather.scss";
import { ReactComponent as SunnySVG } from "./svg/WeatherSunny.svg";
import { ReactComponent as ThunderStormSVG } from "./svg/WeatherThunderStorm.svg";
import { ReactComponent as CloudySVG } from "./svg/WeatherCloudy.svg";
import { ReactComponent as FogSVG } from "./svg/WeatherFog.svg";
import { ReactComponent as SnowSVG } from "./svg/WeatherSnow.svg";
import { ReactComponent as WindySVG } from "./svg/WeatherWindy.svg";
import keys from "./private/keys";
const axios = require("axios");

export default class Weather extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isError: false,
      errorMessage: null,
      temp: "",
      tempMax: "",
      tempMin: "",
      tempFeels: "",
      humidity: "",
      location: "",
      wind: "",
      weatherDesc: "",
      aqi: "",
      dayList1: "",
      dayList2: "",
      dayList3: "",
      dayList4: "",
      dayList1Weather: "",
      dayList2Weather: "",
      dayList3Weather: "",
      dayList4Weather: "",
      weekDay: "",
      dateString: "",
      weatherIcon: "",
      altitude: "",
      lat: "",
      lon: "",
      apiKey: keys.weatherApiKey,
    };
    this.getLocation = this.getLocation.bind(this);
    this.getWeatherFiveDay = this.getWeatherFiveDay.bind(this);
    this.getAirQualityIndex = this.getAirQualityIndex.bind(this);
  }
  componentDidMount() {
    console.info("Weather Component Mounted");
    this.setDates();
    this.getLocation();
  }

  async getLocation() {
    let res = await fetch("http://localhost:3222/gpscoordinates", {
      headers: { Accept: "application/json" },
    });
    this.data = await res.json();
    if (this.data === "Error") {
      throw new Error("GPS Data Undefined. Cannot Get Temperature.");
    } else {
      let lat = this.data.lat.toFixed(3);
      let lon = this.data.lng.toFixed(3);
      this.altitude = `${this.data.altitude.slice(0, 3)} FT`;
      this.setState({
        lat: lat,
        lon: lon,
        altitude: this.altitude,
      });
    }
    this.getWeatherFiveDay();
    this.getAirQualityIndex();
    this.getWeather();
  }

  getAirQualityIndex = async () => {
    let weatherApi;
    this.props.devMode
      ? (weatherApi = null)
      : (weatherApi = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${this.state.lat}&lon=${this.state.lon}&appid=${this.state.apiKey}`);
    const res = await axios.get(weatherApi);
    let data = res.data;

    switch (data.list[0].main.aqi) {
      case 1:
      default:
        this.aqi = "Good";
        break;
      case 2:
        this.aqi = "Fair";
        break;
      case 3:
        this.aqi = "Moderate";
        break;
      case 4:
        this.aqi = "Poor";
        break;
      case 5:
        this.aqi = "Very Poor";
    }

    this.setState({
      aqi: this.aqi,
    });
  };

  getWeatherFiveDay = async () => {
    let weatherApi;
    this.props.devMode
      ? (weatherApi = null)
      : (weatherApi = `http://api.openweathermap.org/data/2.5/forecast?lat=${this.state.lat}&lon=${this.state.lon}&appid=${this.state.apiKey}`);

    const res = await axios.get(weatherApi);
    let data = res.data;

    this.dayList1Weather =
      (data.list[6].main.temp_max - 273 + 32).toFixed(0) + "°F";
    this.dayList2Weather =
      (data.list[14].main.temp_max - 273 + 32).toFixed(0) + "°F";
    this.dayList3Weather =
      (data.list[22].main.temp_max - 273 + 32).toFixed(0) + "°F";
    this.dayList4Weather =
      (data.list[30].main.temp_max - 273 + 32).toFixed(0) + "°F";

    this.setState({
      dayList1Weather: this.dayList1Weather,
      dayList2Weather: this.dayList2Weather,
      dayList3Weather: this.dayList3Weather,
      dayList4Weather: this.dayList4Weather,
    });
  };

  getWeather = async () => {
    Promise.resolve()
      .then(async () => {
        let weatherApi;
        this.props.devMode
          ? (weatherApi = null)
          : (weatherApi = `http://api.openweathermap.org/data/2.5/weather?lat=${this.state.lat}&lon=${this.state.lon}&appid=${this.state.apiKey}`);
        const res = await axios.get(weatherApi);
        console.info("Called Weather Data API.");
        let data = res.data;
        return data;
      })
      .then((data) => {
        this.weatherMain = data.weather[0].main;
        //let weatherDesc = data.weather[0].description;
        this.temp = (1.8 * (data.main.temp - 273) + 32).toFixed(0) + "°F";
        this.tempMax =
          (1.8 * (data.main.temp_max - 273) + 32).toFixed(0) + "°F";
        this.tempMin =
          (1.8 * (data.main.temp_min - 273) + 32).toFixed(0) + "°F";
        this.tempFeels =
          (1.8 * (data.main.feels_like - 273) + 32).toFixed(0) + "°F";
        this.humidity = data.main.humidity + "% RH";
        this.location = data.name;
        this.wind = data.wind.speed + " MPH";

        if (
          this.weatherMain === "Thunderstorm" ||
          this.weatherMain === "Rain" ||
          this.weatherMain === "Drizzle"
        ) {
          this.weatherIcon = <ThunderStormSVG />;
        } else if (this.weatherMain === "Clear" && data.wind.speed >= 15) {
          this.weatherIcon = <WindySVG />;
        } else if (this.weatherMain === "Clear") {
          this.weatherIcon = <SunnySVG />;
        } else if (this.weatherMain === "Snow") {
          this.weatherIcon = <SnowSVG />;
        } else if (
          this.weatherMain === "Mist" ||
          this.weatherMain === "Smoke" ||
          this.weatherMain === "Haze" ||
          this.weatherMain === "Dust" ||
          this.weatherMain === "Fog" ||
          this.weatherMain === "Sand" ||
          this.weatherMain === "Ash" ||
          this.weatherMain === "Squall"
        ) {
          this.weatherIcon = <FogSVG />;
        } else if (this.weatherMain === "Clouds") {
          this.weatherIcon = <CloudySVG />;
        } else {
          this.weatherIcon = <SunnySVG />;
        }

        this.setState({
          location: this.location,
          temp: this.temp,
          tempMax: this.tempMax,
          tempMin: this.tempMin,
          tempFeels: this.tempFeels,
          humidity: this.humidity,
          wind: this.wind,
          weatherDesc: this.weatherMain,
          weatherIcon: this.weatherIcon,
          isLoading: false,
        });
      })
      .catch((err) => {
        let message = err.toString();
        this.setState({
          isError: true,
          isLoading: false,
          errorMessage: message,
        });
      });
  };

  async setDates() {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Nov",
      "Dec",
    ];
    let d = new Date();
    this.day = d.getDate();
    this.weekday = weekdays[d.getDay()];
    this.month = months[d.getMonth()];
    this.year = d.getFullYear();
    this.dateString = [this.day + " " + this.month + " " + this.year];

    let j = -1;
    let returnArray = [];

    for (let i = 0; i < 5; i++) {
      let futureDay = weekdays[d.getDay() + i];
      if (futureDay !== undefined) {
        returnArray.push(futureDay);
      } else {
        j++;
        let wrapFutureDay = weekdays[j];
        returnArray.push(wrapFutureDay);
      }
    }
    //Return Array Values
    this.dayList1 = returnArray[1].slice(0, 3);
    this.dayList2 = returnArray[2].slice(0, 3);
    this.dayList3 = returnArray[3].slice(0, 3);
    this.dayList4 = returnArray[4].slice(0, 3);

    this.setState({
      dayList1: this.dayList1,
      dayList2: this.dayList2,
      dayList3: this.dayList3,
      dayList4: this.dayList4,
      weekDay: this.weekday,
      dateString: this.dateString,
    });
  }

  render() {
    if (this.state.isLoading) {
      return <WeatherLoading className="weatherLoadingPage" />;
    }
    if (this.state.isError) {
      return <ErrorPage {...this.state} />;
    }
    console.log("Rendering Weather Component.");
    return (
      <div className="weatherapp">
        <div className="container mainweather">
          <div className="weather-side">
            <div className="weather-gradient"></div>
            <div className="date-container">
              <h2 className="date-dayname" id="date-dayname">
                {this.state.weekDay}
              </h2>
              <span className="date-day" id="date-day">
                {this.state.dateString}
              </span>
              <img
                className="weather-icon"
                src="/images/location.png"
                alt=""
                width="15"
                height="15"
              />
              <span className="location" id="location">
                {this.location}
              </span>
            </div>
            <div className="weather-container">
              {this.state.weatherIcon}
              <h1 className="weather-temp" id="weather-temp">
                {this.state.temp}
              </h1>
              <h3 className="weather-desc" id="weather-desc">
                {this.state.weatherDesc}
              </h3>
            </div>
          </div>
          <div className="info-side">
            <div className="today-info-container">
              <div className="today-info">
                <div className="precipitation">
                  {" "}
                  <span className="title">FEELS LIKE</span>
                  <span className="feelslikevalue" id="feelslikevalue">
                    {this.state.tempFeels}
                  </span>
                  <div className="clear"></div>
                </div>
                <div className="temp-max">
                  {" "}
                  <span className="title">HIGH</span>
                  <span className="tempmax" id="tempmax">
                    {this.state.tempMax}
                  </span>
                  <div className="clear"></div>
                </div>
                <div className="temp-min">
                  {" "}
                  <span className="title">LOW</span>
                  <span className="tempmin" id="tempmin">
                    {this.state.tempMin}
                  </span>
                  <div className="clear"></div>
                </div>
                <div className="humidity">
                  {" "}
                  <span className="title">HUMIDITY</span>
                  <span className="humidityvalue" id="humidityvalue">
                    {this.state.humidity}
                  </span>
                  <div className="clear"></div>
                </div>
                <div className="wind">
                  {" "}
                  <span className="title">WIND</span>
                  <span className="windvalue" id="windvalue">
                    {this.state.wind}
                  </span>
                  <div className="clear"></div>
                </div>
                <div className="aqi">
                  {" "}
                  <span className="title">Air Quality</span>
                  <span className="windvalue" id="windvalue">
                    {this.state.aqi}
                  </span>
                  <div className="clear"></div>
                </div>
                <div className="altitude">
                  {" "}
                  <span className="title">Altitude</span>
                  <span className="windvalue" id="windvalue">
                    {this.state.altitude}
                  </span>
                  <div className="clear"></div>
                </div>
              </div>
            </div>
            <div className="week-container">
              <ul className="week-list">
                <li className="active">
                  <i className="day-icon" data-feather="sun"></i>
                  <span className="day-name" id="day1">
                    {this.state.dayList1}
                  </span>
                  <span className="day-temp" id="day1temp">
                    {this.state.dayList1Weather}
                  </span>
                </li>
                <li>
                  <i className="day-icon" data-feather="cloud"></i>
                  <span className="day-name" id="day2">
                    {this.state.dayList2}
                  </span>
                  <span className="day-temp" id="day2temp">
                    {this.state.dayList2Weather}
                  </span>
                </li>
                <li>
                  <i className="day-icon" data-feather="cloud-snow"></i>
                  <span className="day-name" id="day3">
                    {this.state.dayList3}
                  </span>
                  <span className="day-temp" id="day3temp">
                    {this.state.dayList3Weather}
                  </span>
                </li>
                <li>
                  <i className="day-icon" data-feather="cloud-rain"></i>
                  <span className="day-name" id="day4">
                    {this.state.dayList4}
                  </span>
                  <span className="day-temp" id="day4temp">
                    {this.state.dayList4Weather}
                  </span>
                </li>
                <div className="clear"></div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
