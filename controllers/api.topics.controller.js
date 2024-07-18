const {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  createComment,
  patchVotes,
} = require("../models/api.topics.models");
const db = require("../db/connection");

function getTopics(request, response) {
  fetchTopics().then((topics) => {
    response.status(200).send({ topics });
  });
}

function getArticleById(request, response, next) {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(request, response, next) {
  fetchArticles()
    .then((articles) => {
      response.status(200).send({ articles: articles });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticleComments(request, response, next) {
  const { article_id } = request.params;
  fetchArticleComments(article_id)
    .then((comments) => {
      response.status(200).send({ comments: comments });
    })
    .catch((err) => {
      next(err);
    });
}

function postComment(request, response, next) {
  const body = request.body.body;
  const author = request.body.author;
  const { article_id } = request.params;
  if (body.length === 0 || author.length === 0) {
    next({ status: 400, msg: "400: Bad request" });
  }
  createComment(body, author, article_id)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
}

function incDecVotes(request, response, next) {
  const { article_id } = request.params;
  const { inc_votes } = request.body;
  patchVotes(inc_votes, article_id)
    .then((article) => {
      response.status(200).send(article);
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  getTopics,
  getArticleById,
  getArticles,
  getArticleComments,
  postComment,
  incDecVotes,
};
