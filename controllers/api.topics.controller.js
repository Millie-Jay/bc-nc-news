const {fetchTopics, fetchArticleById, fetchArticles} = require("../models/api.topics.models");
const db = require("../db/connection");


function getTopics(request, response){
    fetchTopics().then((topics) => {
        response.status(200).send({topics})
})
}

function getArticleById(request, response, next){
    const { article_id } = request.params;
    fetchArticleById(article_id)
      .then((article) => {
        response.status(200).send({ article });
      }).catch((err) => {
          next(err)
      })
  };

  function getArticles(request, response, next){
    fetchArticles()
    .then((articles) => {
        response.status(200).send({articles: articles});
  }).catch((err) => {
        next(err)
  })}

module.exports = {getTopics, getArticleById, getArticles}