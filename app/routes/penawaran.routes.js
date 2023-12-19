module.exports = (app) => {
  const penawaran = require('../controller/penawaran.controller')
  const authMiddleware = require('../middleware/authMiddleware')
  const r = require('express').Router()

  r.get('/', penawaran.findAll)
  r.post('/', authMiddleware.authenticateToken, penawaran.uploadImage, penawaran.create)
  r.get('/:id', authMiddleware.authenticateToken, penawaran.show)
  r.put('/:id', authMiddleware.authenticateToken, penawaran.uploadImage, penawaran.update)
  r.delete('/:id', authMiddleware.authenticateToken, penawaran.delete)

  app.use('/penawaran', r)
}
