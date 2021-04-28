const express = require("express");

const SpeechToTextController = require("./controllers/SpeechToTextController");

const routes = express.Router();

routes.get("/stt", SpeechToTextController.stt);

module.exports = routes;
