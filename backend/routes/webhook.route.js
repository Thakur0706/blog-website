const express = require('express')
const { ClerkWebhook } = require('../controllers/webhook.controller')
const bodyParser = require('body-parser')

const webhookRouter = express.Router()

webhookRouter.post('/clerk',bodyParser.raw({ type: 'application/json' }) ,ClerkWebhook)

module.exports = {webhookRouter}