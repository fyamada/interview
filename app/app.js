const express = require('express')
const config = require('config')
const logger = require('./logger.js')
const routes = require('./routes')
const { store, STORE_API } = require('./store')


logger.info('Starting Express app')
// Create Express App
const app = express()


logger.info('DRAW_ENDPOINT set to ' + config.get('Powerball.drawEndpoint'))
// Set endpoint
store.commit(STORE_API.MUTATIONS.DRAW_ENDPOINT, config.get('Powerball.drawEndpoint'))
// Init store
store.dispatch(STORE_API.ACTIONS.INIT)

// Attach vuex store to express app
app.store = store

// Parse JSON bodies for this app. Make sure you put
// `app.use(express.json())` **before** your route handlers!
app.use(express.json())

// Routes
app.use('/', routes)

module.exports = app
