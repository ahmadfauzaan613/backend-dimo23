const Auth = require('../model/auth.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const generateAccessToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET)
  return token
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await Auth.findOne({ username })

    if (!user) {
      return res.status(401).send({ message: 'Authentication failed' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).send({ message: 'Authentication failed' })
    }

    const Authorization = generateAccessToken({ username: user.username, id: user._id })

    res.json({ Authorization, username: user.username })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
