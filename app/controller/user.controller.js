const db = require('../model')
const User = db.user
const bcrypt = require('bcrypt')

exports.create = async (req, res) => {
  try {
    const { full_name, username, password, role } = req.body

    if (!full_name || !username || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      full_name,
      username,
      password: hashedPassword,
      role,
    })

    await newUser.save()

    res.status(201).json({ message: 'User created successfully', data: newUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.findAll = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json({ data: users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.show = async (req, res) => {
  try {
    const userId = req.params.id

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.update = async (req, res) => {
  try {
    const userId = req.params.id
    const { full_name, username, password } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.full_name = full_name || user.full_name
    user.username = username || user.username

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      user.password = hashedPassword
    }

    await user.save()

    res.status(200).json({ message: 'User updated successfully', data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.delete = async (req, res) => {
  try {
    const userId = req.params.id

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ message: 'User deleted successfully', data: deletedUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
