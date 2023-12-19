module.exports = (app) => {
  const user = require('../controller/user.controller')
  const authMiddleware = require('../middleware/authMiddleware')
  const r = require('express').Router()

  r.post('/', authMiddleware.authenticateToken, user.create)
  r.get('/', authMiddleware.authenticateToken, user.findAll)
  r.get('/:id', authMiddleware.authenticateToken, user.show)
  r.put('/:id', authMiddleware.authenticateToken, user.update)
  r.delete('/:id', authMiddleware.authenticateToken, user.delete)

  app.use('/user', r)
}
