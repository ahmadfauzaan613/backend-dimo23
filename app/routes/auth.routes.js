module.exports = (app) => {
  const authController = require('../controller/auth.controller')
  const r = require('express').Router()
  r.post('/login', authController.login)

  app.use('/', r)
}
