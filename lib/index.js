const DingCrop = require('./DingCrop')

module.exports = function(options={}) {

  const dingCrop = new DingCrop(options)

  return {
    service: dingCrop
  }
}