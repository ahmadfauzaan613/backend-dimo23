module.exports = (app) => {
  const pengalaman = require('../controller/pengalaman.controller')
  const authMiddleware = require('../middleware/authMiddleware')
  const r = require('express').Router()

  r.get('/', pengalaman.findAll)
  r.get('/:id', authMiddleware.authenticateToken, pengalaman.show)
  r.post('/', authMiddleware.authenticateToken, pengalaman.uploadImage, pengalaman.create)
  r.put('/:id', authMiddleware.authenticateToken, pengalaman.uploadImage, pengalaman.update)
  r.delete('/:id', authMiddleware.authenticateToken, pengalaman.delete)

  app.use('/pengalaman', r)
}
