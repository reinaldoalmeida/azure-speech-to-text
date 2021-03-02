const express = require("express");

const IndexController = require("./controllers/IndexController");
const AuthController = require("./controllers/AuthController");
const SpeechToTextController = require("./model/SpeechToText");

const routes = express.Router();

routes.get("/", IndexController.show);
routes.get("/auth", AuthController.show);
routes.get("/stt", SpeechToTextController.stt);

module.exports = routes;
