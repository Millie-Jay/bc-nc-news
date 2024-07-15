const express = require("express")
const app = express()
const getTopics = require("./controllers/api.topics.controller")
const endpoints = require("./endpoints.json")

app.use(express.json())


app.get("/api", (request, response, next) => {
  response.status(200).send({endpoints: endpoints})
})

app.get("/api/topics", getTopics)



module.exports = app;