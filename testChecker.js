let nightwatch = require('nightwatch');


// redisClient.keys('*', function (keys) {
//   keys.forEach(key => {
//     redisClient.get(key, function (result) {
//
//     })
//   })
// })


nightwatch.runner({
  config: "./nightwatch.conf.js"
});
