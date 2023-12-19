const db = require('../model')
const Portofolio = db.portofolio
const uuid = require('uuid')
const multer = require('multer')
const path = require('path')
const fs = require('fs/promises')

const baseURL = 'http://localhost:8000'

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
    if (!req.body.nama_portofolio) {
      return res.status(400).json({ message: 'Please provide all required fields.' })
    }

    const newPortofolio = new Portofolio({
      nama_portofolio: req.body.nama_portofolio,
      gambar: req.file ? baseURL + '/image-upload/' + req.file.filename : null,
    })

    const savedPortofolio = await newPortofolio.save()

    res.status(201).json(savedPortofolio)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.findAll = async (req, res) => {
  try {
    const portofolioList = await Portofolio.find()
    res.status(200).json(portofolioList)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.show = async (req, res) => {
  try {
    const portofolioID = req.params.id
    if (!db.mongoose.Types.ObjectId.isValid(portofolioID)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }
    const portofolio = await Portofolio.findById(portofolioID)
    if (!portofolio) {
      return res.status(404).json({ message: 'Portofolio not found' })
    }
    res.status(200).json(portofolio)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.update = async (req, res) => {
  try {
    const portofolioID = req.params.id

    if (!db.mongoose.Types.ObjectId.isValid(portofolioID)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const portofolio = await Portofolio.findById(portofolioID)

    if (!portofolio) {
      return res.status(404).json({ message: 'Portofolio not found' })
    }

    portofolio.nama_portofolio = req.body.nama_portofolio || portofolio.nama_portofolio

    if (req.file) {
      if (portofolio.gambar) {
        const imagePath = path.join(__dirname, '..', 'app/image-upload/', portofolio.gambar)
        try {
          await fs.unlink(imagePath)
        } catch (unlinkError) {
          console.error('Error deleting previous image:', unlinkError)
        }
      }

      portofolio.gambar = baseURL + '/image-upload/' + req.file.filename
    }

    const updatedPortofolio = await portofolio.save()

    res.status(200).json(updatedPortofolio)
  } catch (error) {
    console.error('Update error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.delete = async (req, res) => {
  try {
    const portofolioID = req.params.id

    if (!db.mongoose.Types.ObjectId.isValid(portofolioID)) {
      return res.status(400).json({ message: 'Invalid ID format' })
    }

    const portofolio = await Portofolio.findById(portofolioID)

    if (!portofolio) {
      return res.status(404).json({ message: 'Portofolio not found' })
    }

    if (portofolio.gambar) {
      const filename = path.basename(portofolio.gambar)
      const imagePath = path.join(__dirname, '..', 'app/image-upload/', filename)

      console.log('Attempting to delete image:', imagePath)

      try {
        await fs.unlink(imagePath)
        console.log('Image deleted successfully')
      } catch (unlinkError) {
        console.error('Error deleting image:', unlinkError)
      }
    } else {
      console.warn('No image associated with Portofolio:', portofolioID)
    }

    await Portofolio.findByIdAndDelete(portofolioID)

    res.status(200).json({ message: 'Portofolio deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
