const dbConfig = require('../config/database')
const mongoose = require('mongoose')

module.exports = {
  mongoose,
  url: dbConfig.url,
  penawaran: require('./penawaran.model')(mongoose),
  pengalaman: require('./pengalaman.model')(mongoose),
  portofolio: require('./portofolio.model')(mongoose),
  user: require('./user.model')(mongoose),
  auth: require('./auth.model')(mongoose),
}
