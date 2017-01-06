let redisClient = require('redis').createClient(process.env.REDIS_URL);
let nightwatch = require('nightwatch');
let fs = require('fs');

redisClient.on('connect', () => {
  console.log("Redis connected")
});

let writeKey = function (key) {
  return new Promise(function(resolve, reject) {
    redisClient.hgetall(key, (err, object) => {
      let value = object;

      //Write the steps outlined in the redis database to a JSON file
      if (value.done === 'false') {
        value.steps = JSON.parse(value.steps);
        fs.writeFile(`tests/${key}.js`,
          `module.exports = { '${key}' : require('../testUtils')(${JSON.stringify(value, null, 4)})};`
          , 'utf8', err => {
            if (err) {
              return reject(err);
            } else {
              return resolve(true);
            }
          });
        } else {
          return Promise.resolve();
        }
      });

  });
};

let writeKeys = keys => {
  let inProgress = [];

  keys.forEach(key => {
    inProgress.push(writeKey(key));
  });

  return Promise.all(inProgress);
};

let runTests = () => {
  let config = './nightwatch.conf.js';
  nightwatch.runner({ config }, () => {
    console.log('Done');
    process.exit(0);
  });
};

// Get the Redis keys and store them in an array
redisClient.keys('*', function (err, keys) {
  if (err) {return console.log(err);}
  console.log(keys);
  writeKeys(keys).then(runTests);
});
