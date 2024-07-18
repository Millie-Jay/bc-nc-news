const express = require("express");
const app = express();
const {
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
} = require("./controllers/api.topics.controller");
const endpoints = require("./endpoints.json");
const db = require("./db/connection");

app.use(express.json());
//adds body to the request keys.
//I will remove this comment on later tickets, I just want to see it so it sinks in.

app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.use((err, request, response, next) => {
  console.log(err);
  if (err.status) {
    response.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "400: Bad request" });
  } else next(err);
});

app.use((err, request, response, next) => {
  console.log(err);
  response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
