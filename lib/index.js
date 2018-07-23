const DingCrop = require('./DingCrop')

module.exports = function(options={}) {
  return {
    service: new DingCrop(options)
  }
}