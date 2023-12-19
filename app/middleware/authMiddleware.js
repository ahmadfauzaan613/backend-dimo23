const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization')

  // Memeriksa apakah header Authorization ada
  if (!authHeader) {
    return res.sendStatus(401) // Unauthorized
  }

  // Memeriksa apakah header Authorization memiliki format yang benar
  const tokenParts = authHeader.split(' ')
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.sendStatus(401) // Unauthorized
  }

  const token = tokenParts[1]

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: 'Token expired' })
      } else {
        return res.sendStatus(403) // Forbidden
      }
    }

    req.user = user
    next()
  })
}

module.exports = { authenticateToken }
