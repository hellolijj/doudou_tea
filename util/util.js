var Promise = require('../plugins/es6-promise.js')  //我用了bluebird.js
function formatTime(time, _type = '') {
  if (typeof time !== 'number' || time < 0) {
    return time
  }
  var date = new Date(time)
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  if(_type == 'minute') {
    hour = hour < 10 ? '0' + hour : hour
    minute = minute < 10 ? '0' + minute : minute
    return hour + ':' + minute;
  }
  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatDate(timescamp, _type) {
  if (typeof timescamp !== 'number' || timescamp < 0) {
    return timescamp
  }
  var date = new Date(timescamp)
  var year = date.getFullYear()
  var mouth = date.getMonth()+1
  var day = date.getDate()
  var hours = date.getHours()
  var minute = date.getMinutes()
  if(_type == 'mouth') {
    mouth = mouth < 10 ? '0'+mouth : mouth
    day = day < 10 ? '0'+day: day
    return mouth + '月' + day + '日'
  }
  if(_type == 'datetime') {
    return ([year, mouth, day]).map(function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }).join('-') + ([hours, minute]).map(function (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }).join(':')

  }
  return ([year, mouth, day]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join('-')
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}
module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatLocation: formatLocation,
  wxPromisify: wxPromisify
}