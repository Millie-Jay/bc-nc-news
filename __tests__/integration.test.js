const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");
const express = require("express");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("responds with a JSON detailing all possible endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/topics", () => {
  test("should return a 200 status and an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const body = response.body;
        const topicsArray = body.topics;
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length).toBeGreaterThan(0);
        topicsArray.forEach((topic) => {
          expect(topic.hasOwnProperty("description")).toBe(true);
          expect(topic.hasOwnProperty("slug")).toBe(true);
        });
      });
  });
  test("should return 404 status if passed an endpoint that doesn't exist", () => {
    return request(app).get("/api/notARealEndpoint").expect(404);
  });
});

describe("GET /api/articles/:article_id", () => {
  test("should return an article object with specific properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article).toHaveProperty("author", "butter_bridge");
        expect(article).toHaveProperty(
          "title",
          "Living in the shadow of a great man"
        );
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("topic", "mitch");
        expect(article).toHaveProperty(
          "created_at",
          "2020-07-09T20:11:00.000Z"
        );
        expect(article).toHaveProperty("votes", 100);
        expect(article).toHaveProperty(
          "article_img_url",
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });

  test("should respond with a 404 & error message for a valid id not registered", () => {
    return request(app)
      .get("/api/articles/999999999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("404 - Not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("should return a 200 status and array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(Array.isArray(articles)).toBe(true);
      });
  });
  test("should return an array containing expected properties as well as a comment_count with correct data type values", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("articles should be ordered by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("should return a status 200 and an array of comments for specified article id in descending order", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        expect(comments.length).toBe(2);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            comment_id: expect.any(Number),
            article_id: expect.any(Number),
            created_at: expect.any(String),
          });
        });
      });
  });
  test("should return a 404 - not found if the article id doesn't exist", () => {
    return request(app)
      .get("/api/articles/35433/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("404: Article does not exist");
      });
  });
  test("should return a 400 status if the request made is not in the expected form", () => {
    return request(app)
      .get("/api/articles/socks_with_flip_flops/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
});

describe("POST api/:article_id/comments", () => {
  test("should return a posted comment with a 201 status", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        author: "butter_bridge",
        body: "Brilliant article, going on the fridge",
      })
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment).toEqual({
          article_id: expect.any(Number),
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
        });
      });
  });
  test("should return 400 if comment has no input", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        author: "butter_bridge",
        body: "",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
  test("should return a 400 if no username given", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        author: "",
        body: "Brilliant article, going on the fridge",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
  test("should return a 404 if the article does not exist", () => {
    return request(app)
      .post("/api/articles/3493/comments")
      .send({
        author: "butter_bridge",
        body: "Brilliant article, going on the fridge",
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("404: Not found");
      });
  });
  test("should return a 400 status if the article id is invalid", () => {
    return request(app)
      .post("/api/articles/flipflops/comments")
      .send({
        author: "butter_bridge",
        body: "Brilliant article, going on the fridge",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
  test("should ignore anything else sent on the body that is not relevant", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        author: "butter_bridge",
        body: "Brilliant article, going on the fridge",
        teapot: "I am a teapot",
      })
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment).toEqual({
          article_id: expect.any(Number),
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
        });
      });
  });
  test("should return a 404 status when passed a username that is not valid", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        author: "notAregisteredUser",
        body: "Brilliant article, going on the fridge",
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("404: Not found");
      });
  });
  test("should return a 404 response when provided an incorrect username data type", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        author: 5,
        body: "Brilliant article, going on the fridge",
      })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("404: Not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should return 200 status and update the vote count for article_id", () => {
    const increaseVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(increaseVotes)
      .expect(200)
      .then((response) => {
        const article = response.body;
        expect(article.votes).toEqual(101);
        expect(article.article_id).toEqual(1);
      });
  });
  test("should return 404 article does not exist when given an article number that doesn't exist", () => {
    const increaseVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/63242")
      .send(increaseVotes)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("404: Article does not exist");
      });
  });
  test("should return 400 bad request when given an invalid article", () => {
    const increaseVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/notANumber")
      .send(increaseVotes)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
  test("should return 400 when given a vote that another data type than a number", () => {
    const increaseVotes = { inc_votes: "1" };
    return request(app)
      .patch("/api/articles/1")
      .send(increaseVotes)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
  test("should return 400 when given an vote that is is a float value", () => {
    const increaseVotes = { inc_votes: 1.4 };
    return request(app)
      .patch("/api/articles/1")
      .send(increaseVotes)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
  test("should return 400 when not given an inc_votes object", () => {
    const increaseVotes = { FlipFlops: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(increaseVotes)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("400: Bad request");
      });
  });
});
