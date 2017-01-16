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
              return resolve(key);
            }
          });
        } else {
          return undefined;
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

  inProgress = inProgress.filter(i => {
    return typeof i !== 'undefined';
  });

  //This will return a promise which resolves to true if all of the promises in
  //the inProgress array resolve, or if any of them fail, it will reject
  return Promise.all(inProgress);
};

//Executes nightwatch
let runTests = (keys) => {
  return new Promise(function(resolve, reject) {
    let config = './nightwatch.conf.js';
    nightwatch.runner({ config }, () => {
      console.log('Done');
      return resolve(keys);
    });
  });
};

let markDone = keys => {
  keys.forEach(key => {
    client.hmset(key, "done", "true");
  })
}

// Get the Redis keys and store them in an array
redisClient.keys('*', function (err, keys) {
  if (err) {return console.log(err);}
  console.log(keys);

  writeKeys(keys).then(runTests).then(markDone);

});
