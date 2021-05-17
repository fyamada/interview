const express = require('express')
const { root } = require('../controllers/root')
const { drawChecker } = require('../controllers/drawchecker')
const { notFound } = require('../controllers/notfound')

const router = express.Router()

// Routes
router.get('/', root)
router.get('/drawchecker', drawChecker)

// Fall Through Route
router.use(notFound)

module.exports = router