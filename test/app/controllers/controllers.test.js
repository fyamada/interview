const { root } = require('../../../app/controllers/root')
const { notFound } = require('../../../app/controllers/notfound')
const { store } = require('../../../app/store')

test('Microservice endpoint status', () => {
  const res = { json: jest.fn() }
  root({app: { store: store }}, res)
  expect(res.json.mock.calls[0][0].message).toEqual("Draw microservice running")
})

test('Not Found Route', () => {
  expect(notFound).toThrow("Route Not Found")
})
