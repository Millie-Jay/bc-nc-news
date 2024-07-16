const request = require("supertest")
const app = require("../app");
const seed = require("../db/seeds/seed")
const db = require("../db/connection")
const data = require("../db/data/test-data")
const endpoints = require("../endpoints.json")
const express = require("express")

beforeEach(() => {
    return seed(data)
  })
  
  afterAll(() => {
    return db.end()
  })

  describe("GET /api", () => {
    test("responds with a JSON detailing all possible endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({body}) => {
            expect(body.endpoints).toEqual(endpoints)
        })
    })
  })


  describe("GET /api/topics", () => {
    test("should return a 200 status and an array of all topics", () => {
    return request(app)
    .get('/api/topics')
    .expect(200)
    .then((response) => {
        const body = response.body
        const topicsArray = body.topics
        expect(Array.isArray(body.topics)).toBe(true)
        expect(body.topics.length).toBeGreaterThan(0)
        topicsArray.forEach((topic) => {
            expect(topic.hasOwnProperty('description')).toBe(true)
            expect(topic.hasOwnProperty('slug')).toBe(true)
    })
    })
  })  
  test("should return 404 status if passed an endpoint that doesn't exist", ()=> {
    return request(app)
    .get("/api/notARealEndpoint")
    .expect(404)
  })
  })

  describe("GET /api/articles/:article_id", () => {
    test("should return an article object with specific properties", () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then((response) => {
          const article = response.body.article;
          expect(article).toBeDefined();
          expect(article).toHaveProperty('author', "butter_bridge");
          expect(article).toHaveProperty('title', "Living in the shadow of a great man");
          expect(article).toHaveProperty('article_id', 1);
          expect(article).toHaveProperty('topic', "mitch");
          expect(article).toHaveProperty('created_at', "2020-07-09T20:11:00.000Z"); // Date should be in ISO format string
          expect(article).toHaveProperty('votes', 100);
          expect(article).toHaveProperty('article_img_url', "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
        });
    });
  
    test("should respond with a 404 & error message for a valid id not registered", () => {
      return request(app)
        .get("/api/articles/999999999")
        .expect(404)
        .then((response) => {
          expect(response.body.message).toBe('404 - Bad Request');
        });
    });
  });