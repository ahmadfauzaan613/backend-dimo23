module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      nama_portofolio: String,
      gambar: String,
    },
    { timestamps: true }
  )

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id

    return object
  })

  return mongoose.model('portofolio', schema)
}
