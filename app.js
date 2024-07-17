const express = require("express")
const app = express()
const {getTopics, getArticleById, getArticles} = require("./controllers/api.topics.controller")
const endpoints = require("./endpoints.json")
const db = require("./db/connection")

app.use(express.json())


app.get("/api", (request, response, next) => {
  response.status(200).send({endpoints: endpoints})
})

app.get("/api/topics", getTopics)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles", getArticles)



app.use((err, request, response, next) => {
  console.log(err, "ERROR")
  if(err.status && err.message) {
    response.status(err.status).send( {message: err.message })
  }
    next(err);
})

module.exports = app;
