const request = require("supertest")
const app = require("../app");
const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const data = require('../db/data/test-data')
const endpoints = require("../endpoints.json")

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