const db = require("../db/connection")

function fetchTopics(){
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        return rows;
    }
)
}

function fetchArticleById(article_id){
  return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((returned) => {
      if (returned.rows.length === 0) {
        return Promise.reject({ message: "404 - Bad Request", status: 404 });
      }
      return returned.rows[0];
    });
}

module.exports = {fetchTopics, fetchArticleById}