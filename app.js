const express = require("express")
const app = express()
const getTopics = require("./controllers/api.topics.controller")


app.get("/api/topics", getTopics)


module.exports = app;