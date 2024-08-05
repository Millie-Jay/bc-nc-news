const express = require("express");
const app = express();
const {
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postComment,
  incDecVotes,
  deleteComment,
  getUsers,
} = require("./controllers/api.topics.controller");
const endpoints = require("./endpoints.json");
const db = require("./db/connection");

const cors = require("cors");

app.use(express.json());

app.get("/api", (request, response, next) => {
  response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", incDecVotes);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers);

app.use((err, request, response, next) => {
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
  if (err.code === "23503") {
    response.status(404).send({ msg: "404: Not found" });
  } else next(err);
});

app.use((err, request, response, next) => {
  response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
