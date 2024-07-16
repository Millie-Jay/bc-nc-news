const {fetchTopics, fetchArticleById} = require("../models/api.topics.models");
const db = require("../db/connection");


function getTopics(request, response){
    fetchTopics().then((topics) => {
        response.status(200).send({topics})
})
}

function getArticleById(req, res, next){
    const { article_id } = req.params;
    fetchArticleById(article_id)
      .then((article) => {
        res.status(200).send({ article });
      }).catch((err) => {
          next(err)
      })
  };

module.exports = {getTopics, getArticleById}