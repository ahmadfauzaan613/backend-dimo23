module.exports = (app) => {
  const portofolio = require('../controller/portofolio.controller')
  const authMiddleware = require('../middleware/authMiddleware')
  const r = require('express').Router()

  r.post('/', authMiddleware.authenticateToken, portofolio.uploadImage, portofolio.create)
  r.get('/', portofolio.findAll)
  r.get('/:id', authMiddleware.authenticateToken, portofolio.show)
  r.put('/:id', authMiddleware.authenticateToken, portofolio.uploadImage, portofolio.update)
  r.delete('/:id', authMiddleware.authenticateToken, portofolio.delete)

  app.use('/portofolio', r)
}
