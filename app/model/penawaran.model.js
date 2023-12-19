module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      nama_rumah: String,
      harga_rumah: String,
      lokasi_rumah: String,
      gambar: String,
    },
    { timestamps: true }
  )

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject()
    object.id = _id

    return object
  })

  return mongoose.model('penawaran', schema)
}
