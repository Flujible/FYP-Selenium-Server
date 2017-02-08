let redisClient = require('redis').createClient(process.env.REDIS_URL);
let nightwatch;
let fs = require('fs');
let xml2js = require('xml2js');

let parser = new xml2js.Parser();

//Connect to the redis DB
redisClient.on('connect', () => {
  console.log(":: Connected to redis");
});

//Returns a promise which resolves when the files are written and rejects if they dont
let writeKey = function (key) {
  return new Promise(function(resolve, reject) {
    //Gets all the information from the key it was passed
    redisClient.hgetall(key, (err, object) => {
      if (err) return reject(err);
      let value = object;

      //Write the steps outlined in the redis database to a JSON file
        value.steps = JSON.parse(value.steps);
        if (value.status === 'pending') {
          console.log(`:: Creating test script for ${key}`);
        fs.writeFile(`tests/${key}.js`,
          `module.exports = { '${key}' : require('../testUtils')(${JSON.stringify(value, null, 4)})};`, 'utf8', err => {
            if (err) {
              return reject(err);
            } else {
              return resolve(key);
            }
          });
        } else {
          return resolve(undefined);
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

//Executes nightwatch
let runTests = (keys) => {
  return new Promise(function(resolve) {
    keys = keys.filter(key => typeof key !== 'undefined');
    if (keys.length > 0) {
      let config = './nightwatch.conf.js';
      nightwatch = require('nightwatch');
      console.log(":: Running Nightwatch");
      nightwatch.runner({ config }, () => {
        console.log(':: Nightwatch finished');
        return resolve(keys);
      });
    } else {
      console.log(':: No tests to run');
      process.exit();
    }
  });
};

let cleanUp = keys => {
  console.log(":: Cleaning up keys");
  return Promise.all(keys.map(purgeKey));
};


let purgeKey = key => {
  return new Promise(function(resolve, reject) {
    fs.readdir("reports", (err, files) => {
      if(err) {
        console.log(`:: Error finding reports folder`);
        console.error(err);
      }
      files.forEach(file => {
        if (file.includes(key)) {
          fs.readFile(`reports/${file}`, 'utf-8', (err, data) => {
            if (err) return reject(err);
            parser.parseString(data, (err, result) => {
              if(err) return reject(err);
              if (result.testsuites.$.errors === '0' && result.testsuites.$.failures === '0') {
                redisClient.hset(key, "status", "successful", function(err) {
                  if(err) return reject(err);
                  fs.unlink(`tests/${key}.js`);
                  console.log(`:: Set to successful: ${key}`);
                  return resolve(key);
                });
              } else {
                redisClient.hset(key, "status", "failed", function(err) {
                  if(err) return reject(err);
                  fs.unlink(`tests/${key}.js`);
                  console.log(`:: Set to failed: ${key}`);
                  return resolve(key);
                });
              }
            });
          });
        }
      });
    });
  });
};

let writeResults = keys => {
  let inProgress = [];

  keys.forEach(key => {
    inProgress.push(writeResult(key));
  });

  //This will return a promise which resolves to true if all of the promises in
  //the inProgress array resolve, or if any of them fail, it will reject
  console.log(":: Writing results to redis");
  return Promise.all(inProgress);
};

let writeResult = key => {
  return new Promise(function(resolve, reject) {
    fs.readdir("reports", (err, files) => {
      if(err) console.error(err);
      files.forEach(file => {
        if (file.includes(key)) {
          fs.readFile(`reports/${file}`, 'utf-8', (err, data) => {
            if (err) {
              console.log(`:: Could not write result for ${key}`);
              return reject(err);
            } else {
              redisClient.hset(key, "result", data, function(err) {
                if(err) {return reject(err);}
                return resolve(key);
              });
            }
          });
        }
      });
    });
  });
};

let exec = () => {
  // Get the redis keys and store them in an array
  redisClient.keys('*', function (err, keys) {
    if (err) return console.log(err);
    writeKeys(keys)
      .then(runTests).catch(reason => {
        console.log(`:: Catch: ${reason}`);
        process.exit();
      })
      .then(writeResults)
      .then(cleanUp)
      .then(() => {
        console.log(":: Finished running exec");
        process.exit(0);
    });
  });
};

exec();
