const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
})

userSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('User', userSchema)
