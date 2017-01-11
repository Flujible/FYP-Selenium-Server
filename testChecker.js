let redisClient = require('redis').createClient(process.env.REDIS_URL);
let nightwatch = require('nightwatch');
let fs = require('fs');

//Connect to the redis DB
redisClient.on('connect', () => {
  console.log("Redis connected")
});

//Returns a promise which resolves when the files are written and rejects if they dont
let writeKey = function (key) {
  return new Promise(function(resolve, reject) {
    //Gets all the information from the key it was passed
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

//Creates an array of promises and filters out the ones that have been done and
//returns a promise
let writeKeys = keys => {
  let inProgress = [];

  keys.forEach(key => {
    inProgress.push(writeKey(key));
  });

  return Promise.all(inProgress);
};

I want to take the inProgress array that is used above, pass it into the runTests 
function, and return the same array so that it can be passed into the markDone
function through the chained promises, and then those keys can be marked as done

//Executes nightwatch
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
