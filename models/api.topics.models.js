const db = require("../db/connection");

function fetchTopics() {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
}

function fetchArticleById(article_id) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((returned) => {
      if (returned.rows.length === 0) {
        return Promise.reject({ msg: "404 - Not found", status: 404 });
      }
      return returned.rows[0];
    });
}

function fetchArticles(topicQuery, sortBy = "created_at", orderBy = "desc") {
  if (
    (![
      "author",
      "title",
      "article_id",
      "topics",
      "created_at",
      "votes",
      "comment_count",
    ].includes(sortBy) &&
      sortBy !== undefined) ||
    (!["asc", "desc"].includes(orderBy) && orderBy !== undefined)
  ) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  let queryValues = [];
  let queryString =
    "SELECT articles.author, title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url, CAST(COUNT (comments.article_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

  if (topicQuery) {
    queryValues.push(topicQuery);
    queryString += " WHERE topic = $1";
  }

  queryString += ` GROUP BY articles.article_id ORDER BY articles.${sortBy} ${orderBy};`;

  return db.query(queryString, queryValues).then((result) => {
    return result.rows;
  });
}

function fetchArticleComments(article_id) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "404: Article does not exist",
        });
      }
      return db.query(
        `
          SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY comments.created_at DESC;`,
        [article_id]
      );
    })
    .then((result) => {
      return result.rows;
    });
}

function createComment(body, author, article_id) {
  return db
    .query(
      `INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *;`,
      [body, author, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function patchVotes(inc_votes, article_id) {
  if (!Number.isInteger(inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "400: Bad request",
    });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows[0] === undefined) {
        return Promise.reject({
          status: 404,
          msg: "404: Article does not exist",
        });
      }
      return result.rows[0];
    });
}

function modelDeleteComment(comment_id) {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return result.rows[0];
    });
}

function fetchUsers() {
  return db.query(`SELECT * FROM users;`).then((results) => {
    return results.rows;
  });
}

module.exports = {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  createComment,
  patchVotes,
  modelDeleteComment,
  fetchUsers,
};
