const request = require("supertest")
const app = require("../app");
const seed = require('../db/seeds/seed')
const db = require('../db/connection')
const data = require('../db/data/test-data')

beforeEach(() => {
    return seed(data)
  })
  
  afterAll(() => {
    return db.end()
  })


  describe("/api/topics", () => {
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
})