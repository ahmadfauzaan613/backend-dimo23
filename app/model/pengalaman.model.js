module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      nama_rumah: String,
      project_value: String,
      gambar: String,
    },
    { timestamps: true }
  )

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id

    return object
  })

  return mongoose.model('pengalaman', schema)
}
