const db = require('../model')
const Penawaran = db.penawaran
const uuid = require('uuid')
const multer = require('multer')
const path = require('path')
const fs = require('fs/promises')

const baseURL = 'http://localhost:8000'

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'app/image-upload/')
  },
  filename: function (req, file, cb) {
    const uniqueID = uuid.v4().replace(/-/g, '')
    cb(null, uniqueID + path.extname(file.originalname))
  },
})

const fileFilter = function (req, file, cb) {
  const allowedFileTypes = /jpeg|jpg|png/
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedFileTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('Hanya diperbolehkan upload gambar dengan ekstensi jpeg, jpg, atau png'))
  }
}

const limits = {
  fileSize: 100 * 1024 * 1024,
}

const upload = multer({ storage, fileFilter, limits })

exports.uploadImage = upload.single('gambar')

exports.create = async (req, res) => {
  try {
    if (!req.body.nama_rumah || !req.body.harga_rumah || !req.body.lokasi_rumah) {
      return res.status(400).json({ message: 'Please provide all required fields.' })
    }

    const formattedHarga = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(req.body.harga_rumah)

    const newPenawaran = new Penawaran({
      nama_rumah: req.body.nama_rumah,
      harga_rumah: formattedHarga,
      lokasi_rumah: req.body.lokasi_rumah,
      gambar: req.file ? baseURL + '/image-upload/' + req.file.filename : null,
    })

    const savedPenawaran = await newPenawaran.save()

    res.status(201).json(savedPenawaran)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.findAll = async (req, res) => {
  try {
    const penawaranList = await Penawaran.find()
    res.status(200).json(penawaranList)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.show = async (req, res) => {
  try {
    const penawaranId = req.params.id
    if (!db.mongoose.Types.ObjectId.isValid(penawaranId)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }
    const penawaran = await Penawaran.findById(penawaranId)
    if (!penawaran) {
      return res.status(404).json({ message: 'Penawaran not found' })
    }
    res.status(200).json(penawaran)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.update = async (req, res) => {
  try {
    const penawaranId = req.params.id

    if (!db.mongoose.Types.ObjectId.isValid(penawaranId)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const penawaran = await Penawaran.findById(penawaranId)

    if (!penawaran) {
      return res.status(404).json({ message: 'Penawaran not found' })
    }

    // const formattedHarga = new Intl.NumberFormat('id-ID', {
    //   style: 'currency',
    //   currency: 'IDR',
    // }).format(req.body.harga_rumah || penawaran.harga_rumah)

    penawaran.nama_rumah = req.body.nama_rumah || penawaran.nama_rumah
    penawaran.harga_rumah = req.body.harga_rumah || penawaran.harga_rumah
    penawaran.lokasi_rumah = req.body.lokasi_rumah || penawaran.lokasi_rumah

    if (req.file) {
      if (penawaran.gambar) {
        const imagePath = path.join(__dirname, '..', 'app/image-upload/', penawaran.gambar)
        try {
          await fs.unlink(imagePath)
        } catch (unlinkError) {
          console.error('Error deleting previous image:', unlinkError)
        }
      }

      penawaran.gambar = baseURL + '/image-upload/' + req.file.filename
    }

    const updatedPenawaran = await penawaran.save()

    res.status(200).json(updatedPenawaran)
  } catch (error) {
    console.error('Update error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.delete = async (req, res) => {
  try {
    const penawaranId = req.params.id

    if (!db.mongoose.Types.ObjectId.isValid(penawaranId)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const penawaran = await Penawaran.findById(penawaranId)

    if (!penawaran) {
      return res.status(404).json({ message: 'Penawaran not found' })
    }

    if (penawaran.gambar) {
      const filename = path.basename(penawaran.gambar)
      const imagePath = path.join(__dirname, '..', 'app/image-upload/', filename)

      console.log('Attempting to delete image:', imagePath)

      try {
        await fs.unlink(imagePath)
        console.log('Image deleted successfully')
      } catch (unlinkError) {
        console.error('Error deleting image:', unlinkError)
      }
    } else {
      console.warn('No image associated with Penawaran:', penawaranId)
    }

    await Penawaran.findByIdAndDelete(penawaranId)

    res.status(200).json({ message: 'Penawaran deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
