let nightwatch = require('nightwatch');

nightwatch.runner({
  config: "./nightwatch.conf.js"
});


// I wanted to try and scan the redis database and only call nightwatch if there
// was a test to be executed, but I can not work out how to do this without
// modifying some of the source code for Nightwatch, so I will not implement
//
//
// let redisClient = require('redis').createClient(process.env.REDIS_URL);
// let nightwatch = require('nightwatch');
//
//
// redisClient.on('connect', () => {
//   console.log("Redis connected")
// })
//
// redisClient.keys('*', function (err, keys) {
//   if (err) {return console.log(err);}
//   let keyArray = keys;
//   console.log(keys);
//
//   keys.forEach(key => {
//     redisClient.hgetall(key, (err, object) => {
//       let value = object;
//       console.log("\n");
//       console.log(value);
//     });
//   });


//   keys.forEach(key => {
//     redisClient.hgetall(key, function (result) {
//       let testArray = JSON.parse(result);
//       console.log("\n\n" + testArray + "\n\n");
//       if (testArray.done === false) {
//         nightwatch.runner({
//           config: "./nightwatch.conf.js"
//         }, result);
//       }
//     })
//   })


//})
