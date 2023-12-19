const express = require('express')
const cors = require('cors')
const db = require('./app/model')
const app = express()
const path = require('path')

const corsOption = {
  origin: '*',
}

//Register cors
app.use(cors(corsOption))
app.use(express.json())

// Menangani permintaan gambar
app.use('/image-upload', express.static(path.join(__dirname, 'app/image-upload')))

// KonekDB
db.mongoose
  .connect(db.url)
  .then(() => console.log('DB Connected'))
  .catch((err) => {
    console.log(`${err.message}`)
    process.exit()
  })

// Route Data
require('./app/routes/penawaran.routes')(app)
require('./app/routes/pengalaman.routes')(app)
require('./app/routes/portofolio.routes')(app)
require('./app/routes/user.routes')(app)
require('./app/routes/auth.routes')(app)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`server running ${PORT}`))
