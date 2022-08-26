import React, { Component } from "react";
import { Gauge, calcCoordinatesFromAngle } from "gauge-chart-js";
import "./Engine.scss";
const axios = require("axios");

export default class Engine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vss: null, //Speed MPH
      rpm: null, //RPM
      frp: null, // Fuel Pressure
      alchpct: null, //Ethanol %
      enginefrate: null, //Engine Fuel Rate
      engineoilt: null, //Engine Oil Temp
      ect: null, //Engine Coolant Temp,
      iat: null, //Intake Air Temp
      aet: null, //Engine Percent Torque
      map: null, //Intake Manifold Absolute Pressure,
      maf: null, //Airflow From Mass Air Sensor,
    };
    this.renderLabel = this.renderLabel.bind(this);
    this.renderPercents = this.renderPercents.bind(this);
    this.setGauges = this.setGauges.bind(this);
    this.setGauges2 = this.setGauges2.bind(this);
    this.setGauges3 = this.setGauges3.bind(this);
    this.readEngineData = this.readEngineData.bind(this);
    this.setEngineData = this.setEngineData.bind(this);
    this.stopEngineRead = this.stopEngineRead.bind(this);
    this.doNotRender0 = this.doNotRender0.bind(this);
  }

  componentDidMount() {
    this.isFetching = true;
    this.setGauges();
    this.setGauges2();
    this.setGauges3();
    this.readEngineData();
  }

  componentWillUnmount() {
    this.isFetching = false;
    this.stopEngineRead();
  }

  stopEngineRead() {
    try {
      axios.post("http://localhost:3224", { data: "stop" });
    } catch (err) {
      console.log("Error Stopping Stream: ", err);
    }
  }

  async readEngineData() {
    if (this.isFetching) {
      let res = await fetch("http://localhost:3224", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: "start" }),
      });
      let reader = res.body.getReader();
      let result;
      let decoder = new TextDecoder("utf8");
      while (!result?.done) {
        result = await reader.read();
        let chunk = decoder.decode(result.value);
        try {
          let objConvert = JSON.parse(chunk);
          this.setEngineData(objConvert);
        } catch (err) {
          console.log("Error in Read Engine Data: ", err);
        }
      }
    }
  }

  //The Gauge Renders to 0 if data is equal 2x in a row. This fixes.
  async doNotRender0(data, name, gauge) {
    const maxValue = 450 - 175;
    if (data === this.state[name]) {
      console.error("ALREADY HAD THIS NUMBER. Name: ", name);
      return;
    } else {
      // this.setState({
      //   [name]: data,
      // });
      let fixed = data.toFixed(2);
      gauge.setValue(maxValue * fixed, false);
    }
  }

  async setEngineData(data) {
    if (data.name === "iat") {
      const iatTxt = document.getElementById("engineAirIntakeTempLabel");
      iatTxt.innerText = `${data.value}°C`;
      this.iat = (data.value - 0) / (215 - 0);
      this.doNotRender0(this.iat, data.name, this.gaugeAirIntakeTemp);
    } else if (data.name === "vss") {
      let vssTxt = document.getElementById("engineMphLabel");
      vssTxt.innerText = `${data.value} `;
      this.vss = (data.value - 0) / (120 - 0);
      this.doNotRender0(this.vss, data.name, this.gaugeMph);
    } else if (data.name === "rpm") {
      let rpmTxt = document.getElementById("engineRpmLabel");
      rpmTxt.innerText = `${data.value} `;
      this.rpm = (data.value - 0) / (7000 - 0);
      this.doNotRender0(this.rpm, data.name, this.gaugeRpm);
    } else if (data.name === "frp") {
      let frpTxt = document.getElementById("engineFuelPressureLabel");
      frpTxt.innerText = `${data.value}kPa`;
      this.frp = (data.value - 0) / (765 - 0);
      this.doNotRender0(this.frp, data.name, this.gaugeFuelPressure);
    } else if (data.name === "alchpct") {
      let alchpctTxt = document.getElementById("engineAlchPctLabel");
      alchpctTxt.innerText = `${data.value}%`;
      this.alchpct = (data.value - 0) / (100 - 0);
      this.doNotRender0(this.alchpct, data.name, this.gaugeEthanolPercent);
    } else if (data.name === "enginefrate") {
      let fuelRatetTxt = document.getElementById("engineFuelRateLabel");
      fuelRatetTxt.innerText = `${(data.value * 0.2642).toFixed(0)} G/Hr`;
      this.enginefrate = (data.value - 0) / (100 - 0);
      this.doNotRender0(this.enginefrate, data.name, this.gaugeFuelConsumption);
    } else if (data.name === "engineoilt") {
      let engineoiltTxt = document.getElementById("engineOilTempLabel");
      engineoiltTxt.innerText = `${data.value}°C`;
      this.engineoilt = (data.value - 0) / (210 - 0);
      this.doNotRender0(this.engineoilt, data.name, this.gaugeOilTemp);
    } else if (data.name === "ect") {
      const ectTxt = document.getElementById("engineCoolantTempLabel");
      ectTxt.innerText = `${data.value}°C`;
      this.ect = (data.value - -40) / (215 - 0);
      this.doNotRender0(this.ect, data.name, this.gaugeCoolantTemp);
      this.gaugeCoolantTemp.setValue(this.ect, false);
    } else if (data.name === "aet") {
      let aetTxt = document.getElementById("engineTorqueLabel");
      aetTxt.innerText = `${data.value}%`;
      this.aet = (data.value - 0) / (125 - 0);
      this.doNotRender0(this.aet, data.name, this.gaugeTorque);
    } else if (data.name === "map") {
      const mapTxt = document.getElementById("engineMapLabel");
      mapTxt.innerText = `${data.value}`;
      this.map = (data.value - 0) / (255 - 0);
      this.doNotRender0(this.map, data.name, this.gaugeIntakeManifold);
    } else if (data.name === "maf") {
      const mafTxt = document.getElementById("engineAirSensorTempLabel");
      mafTxt.innerText = `${data.value} G/S`;
      this.maf = (data.value - 0) / (655 - 0);
      this.doNotRender0(this.maf, data.name, this.gaugeAirFlowRate);
    }
  }

  renderLabel(gauge: Gauge, label: string, color: string) {
    const { metadata } = gauge.getElementAtValue(0);
    const labelWidth = 150;
    const left = `${metadata.relativeLeft - labelWidth}px`;
    const top = `${metadata.relativeTop + 1}px`;
    const html = `<span class="label" style="color: ${color}; right: ${left}; top: ${top}">${label}</span>`;
    gauge.insertAdjacentToRoot("beforeend", html);
  }

  renderPercents(gauge: Gauge, maxValue: number) {
    for (let i = 0; i <= 100; i += 10) {
      const { metadata } = gauge.getElementAtValue(
        i < 100 ? Math.floor((i / 100) * maxValue) : maxValue - 1
      );
      const { x, y } = calcCoordinatesFromAngle(33, metadata.angle);
      const left = `${metadata.relativeLeft + x - 13}px`;
      const top = `${metadata.relativeTop + y * 0.8}px`;
      const html = `<span style="position: absolute; left: ${left}; top: ${top}; color: white;">${i}%</span>`;
      gauge.insertAdjacentToRoot("beforeend", html);
    }
  }

  setGauges() {
    console.log("Set Gauges 1 Called");
    const fromAngle = 175;
    const toAngle = 450;
    const maxValue = toAngle - fromAngle;
    const container = document.querySelector(".multiple-gauge3");
    const sharedConfig = {
      fromAngle,
      toAngle,
      container,
    };
    const backgroundConfig = {
      ...sharedConfig,
      color: "#ebebeb",
    };
    //RPM Gauge
    const gaugeRpmBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 45,
    });
    gaugeRpmBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeRpmBackground, `RPM`, "#8067dc");
      this.renderPercents(gaugeRpmBackground, maxValue);
    });
    this.gaugeRpm = new Gauge({
      ...sharedConfig,
      color: "#8067dc",
      gaugeRadius: 45,
    });

    //MPH Gauge
    this.gaugeMphBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 36,
    });
    this.gaugeMphBackground.setValue(maxValue).then(() => {
      this.renderLabel(this.gaugeMphBackground, `MPH`, "#6870db");
    });
    this.gaugeMph = new Gauge({
      ...sharedConfig,
      color: "#6870db",
      gaugeRadius: 36,
    });
    // Torque Gauge
    const gaugeTorqueBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 27,
    });
    gaugeTorqueBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeTorqueBackground, `Torque`, "#6894dd");
    });
    this.gaugeTorque = new Gauge({
      ...sharedConfig,
      color: "#6894dd",
      gaugeRadius: 27,
    });
  }

  setGauges2() {
    console.log("Set Gauges 2 Called");
    const fromAngle = 175;
    const toAngle = 450;
    const maxValue = toAngle - fromAngle;
    const container = document.querySelector(".multiple-gauge2");
    const sharedConfig = {
      fromAngle,
      toAngle,
      container,
    };
    const backgroundConfig = {
      ...sharedConfig,
      color: "#ebebeb",
    };

    const gaugeOilTempBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 45,
    });
    gaugeOilTempBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeOilTempBackground, `Oil Temp`, "#8067dc");
      this.renderPercents(gaugeOilTempBackground, maxValue);
    });
    this.gaugeOilTemp = new Gauge({
      ...sharedConfig,
      color: "#8067dc",
      gaugeRadius: 45,
    });

    const gaugeCoolantTempBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 36,
    });
    gaugeCoolantTempBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeCoolantTempBackground, `Coolant Temp`, "#6870db");
    });
    this.gaugeCoolantTemp = new Gauge({
      ...sharedConfig,
      color: "#6870db",
      gaugeRadius: 36,
    });

    const gaugeAirIntakeTempBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 27,
    });
    gaugeAirIntakeTempBackground.setValue(maxValue).then(() => {
      this.renderLabel(
        gaugeAirIntakeTempBackground,
        `Air Intake Temp`,
        "#6894dd"
      );
    });
    this.gaugeAirIntakeTemp = new Gauge({
      ...sharedConfig,
      color: "#6894dd",
      gaugeRadius: 27,
    });

    const gaugeAirFlowBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 18,
    });
    gaugeAirFlowBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeAirFlowBackground, `Air Flow Rate`, "#67b7dc");
    });
    this.gaugeAirFlowRate = new Gauge({
      ...sharedConfig,
      color: "#67b7dc",
      gaugeRadius: 18,
    });
  }

  setGauges3() {
    console.log("Set Gauges 3 Called");
    const fromAngle = 175;
    const toAngle = 450;
    const maxValue = toAngle - fromAngle;
    const container = document.querySelector(".multiple-gauge");
    const sharedConfig = {
      fromAngle,
      toAngle,
      container,
    };
    const backgroundConfig = {
      ...sharedConfig,
      color: "#ebebeb",
    };

    const gaugeFuelPressureBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 45,
    });
    gaugeFuelPressureBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeFuelPressureBackground, `Fuel Pressure`, "#8067dc");
      this.renderPercents(gaugeFuelPressureBackground, maxValue);
    });
    this.gaugeFuelPressure = new Gauge({
      ...sharedConfig,
      color: "#8067dc",
      gaugeRadius: 45,
    });

    const gaugeEthanolPercentBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 36,
    });
    gaugeEthanolPercentBackground.setValue(maxValue).then(() => {
      this.renderLabel(
        gaugeEthanolPercentBackground,
        `Ethanol Percent`,
        "#6870db"
      );
    });
    this.gaugeEthanolPercent = new Gauge({
      ...sharedConfig,
      color: "#6870db",
      gaugeRadius: 36,
    });

    const gaugeFuelConsumptionBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 27,
    });
    gaugeFuelConsumptionBackground.setValue(maxValue).then(() => {
      this.renderLabel(gaugeFuelConsumptionBackground, `Fuel Rate`, "#6894dd");
    });
    this.gaugeFuelConsumption = new Gauge({
      ...sharedConfig,
      color: "#6894dd",
      gaugeRadius: 27,
    });

    const gaugeIntakeManifoldBackground = new Gauge({
      ...backgroundConfig,
      gaugeRadius: 18,
    });
    gaugeIntakeManifoldBackground.setValue(maxValue).then(() => {
      this.renderLabel(
        gaugeIntakeManifoldBackground,
        `Intake Manifold`,
        "#67b7dc"
      );
    });
    this.gaugeIntakeManifold = new Gauge({
      ...sharedConfig,
      color: "#67b7dc",
      gaugeRadius: 18,
    });
  }

  render() {
    console.log("Rendering Page");
    return (
      <div className="gauge-background">
        <div className="engineTitle">
          <h3 className="engineTitletext">Engine Readout</h3>
        </div>
        <div className="multiple-gauge"></div>
        <div className="multiple-gauge2"></div>
        <div className="multiple-gauge3"></div>
        <div className="engineValueLabels">
          <span className="engineMphLabel" id="engineMphLabel"></span>
          <span className="engineRpmLabel" id="engineRpmLabel"></span>
          <span className="engineTorqueLabel" id="engineTorqueLabel"></span>
          <span className="engineOilTempLabel" id="engineOilTempLabel"></span>
          <span
            className="engineAirIntakeTempLabel"
            id="engineAirIntakeTempLabel"
          ></span>
          <span
            className="engineAirSensorTempLabel"
            id="engineAirSensorTempLabel"
          ></span>
          <span
            className="engineCoolantTempLabel"
            id="engineCoolantTempLabel"
          ></span>
          <span
            className="engineFuelPressureLabel"
            id="engineFuelPressureLabel"
          ></span>
          <span className="engineAlchPctLabel" id="engineAlchPctLabel"></span>
          <span className="engineFuelRateLabel" id="engineFuelRateLabel"></span>
          <span className="engineMapLabel" id="engineMapLabel"></span>
        </div>
      </div>
    );
  }
}
