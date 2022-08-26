const axios = require("axios");

const ROOT_URL = "http://localhost:3222/googleassistant";

module.exports = function (callback) {
  axios
    .post(ROOT_URL)
    .then(function (response) {
      if (callback) {
        callback(response.data.items);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};
