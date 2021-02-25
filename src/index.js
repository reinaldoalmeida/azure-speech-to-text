const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes.js");

const app = new express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(routes);

app.listen(3000, () => {
    console.log("===== Azure Speech to Text =====");
});
