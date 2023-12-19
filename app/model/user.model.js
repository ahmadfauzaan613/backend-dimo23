module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      full_name: String,
      username: String,
      password: String,
      role: String,
    },
    { timestamps: true }
  )

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id

    return object
  })

  return mongoose.model('user', schema)
}
