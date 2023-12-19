const db = require('../model')
const Pengalaman = db.pengalaman
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
  fileSize: 100 * 1024 * 1024, // 100 MB
}

const upload = multer({ storage, fileFilter, limits })

exports.uploadImage = upload.single('gambar')

exports.create = async (req, res) => {
  try {
    if (!req.body.nama_rumah || !req.body.project_value) {
      return res.status(400).json({ message: 'Please provide all required fields.' })
    }

    const formattedHarga = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(req.body.project_value)

    const newPengalaman = new Pengalaman({
      nama_rumah: req.body.nama_rumah,
      project_value: formattedHarga,
      gambar: req.file ? baseURL + '/image-upload/' + req.file.filename : null,
    })

    const savedPengalaman = await newPengalaman.save()

    res.status(201).json(savedPengalaman)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.findAll = async (req, res) => {
  try {
    const pengalamanList = await Pengalaman.find()
    res.status(200).json(pengalamanList)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.show = async (req, res) => {
  try {
    const pengalamanID = req.params.id
    if (!db.mongoose.Types.ObjectId.isValid(pengalamanID)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }
    const pengalaman = await Pengalaman.findById(pengalamanID)
    if (!pengalaman) {
      return res.status(404).json({ message: 'Pengalaman not found' })
    }
    res.status(200).json(pengalaman)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.update = async (req, res) => {
  try {
    const pengalamanID = req.params.id

    if (!db.mongoose.Types.ObjectId.isValid(pengalamanID)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const pengalaman = await Pengalaman.findById(pengalamanID)

    if (!pengalaman) {
      return res.status(404).json({ message: 'Pengalaman not found' })
    }

    pengalaman.nama_rumah = req.body.nama_rumah || pengalaman.nama_rumah
    pengalaman.project_value = req.body.project_value || pengalaman.project_value

    if (req.file) {
      if (pengalaman.gambar) {
        const imagePath = path.join(__dirname, '..', 'app/image-upload/', pengalaman.gambar)
        try {
          await fs.unlink(imagePath)
        } catch (unlinkError) {
          console.error('Error deleting previous image:', unlinkError)
        }
      }

      pengalaman.gambar = baseURL + '/image-upload/' + req.file.filename
    }

    const updatedPengalaman = await pengalaman.save()

    res.status(200).json(updatedPengalaman)
  } catch (error) {
    console.error('Update error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.delete = async (req, res) => {
  try {
    const pengalamanID = req.params.id

    if (!db.mongoose.Types.ObjectId.isValid(pengalamanID)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const pengalaman = await Pengalaman.findById(pengalamanID)

    if (!pengalaman) {
      return res.status(404).json({ message: 'Pengalaman not found' })
    }

    if (pengalaman.gambar) {
      const filename = path.basename(pengalaman.gambar)
      const imagePath = path.join(__dirname, '..', 'app/image-upload/', filename)

      console.log('Attempting to delete image:', imagePath)

      try {
        await fs.unlink(imagePath)
        console.log('Image deleted successfully')
      } catch (unlinkError) {
        console.error('Error deleting image:', unlinkError)
      }
    } else {
      console.warn('No image associated with Pengalaman:', pengalamanID)
    }

    await Pengalaman.findByIdAndDelete(pengalamanID)

    res.status(200).json({ message: 'Pengalaman deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
