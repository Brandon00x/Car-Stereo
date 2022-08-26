import ReactDOM from "react-dom";

function setTime() {
  const element = <span>{new Date().toLocaleTimeString()}</span>;
  ReactDOM.render(element, document.getElementById("time"));
}
setInterval(setTime, 1000);

function setDate() {
  const element = <span>{new Date().toDateString()}</span>;
  ReactDOM.render(element, document.getElementById("date"));
}
setInterval(setDate, 1000);
