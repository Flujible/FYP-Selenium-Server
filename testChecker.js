let redisClient = require('redis').createClient(process.env.REDIS_URL);
let nightwatch = require('nightwatch');
let fs = require('fs');
let xml2js = require('xml2js');

let parser = new xml2js.Parser();

//Connect to the redis DB
redisClient.on('connect', () => {
  console.log("Redis connected");
});

//Returns a promise which resolves when the files are written and rejects if they dont
let writeKey = function (key) {
  return new Promise(function(resolve, reject) {
    //Gets all the information from the key it was passed
    redisClient.hgetall(key, (err, object) => {
      let value = object;

      //Write the steps outlined in the redis database to a JSON file
      if (value.status === 'pending') {
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

  //This will return a promise which resolves to true if all of the promises in
  //the inProgress array resolve, or if any of them fail, it will reject
  return Promise.all(inProgress);
};

//Executes nightwatch
let runTests = (keys) => {
  return new Promise(function(resolve, reject) {
    keys = keys.filter(key => typeof key !== 'undefined');
    if (keys.length > 0) {
      let config = './nightwatch.conf.js';
      nightwatch.runner({ config }, () => {
        console.log(':: Done');
        return resolve(keys);
      });
    } else {
      console.log(':: No tests to run, exiting');
      process.exit();
    }
  });
};

let cleanUp = keys => {
  console.log(":: cleanUp function");
  return Promise.all(keys.map(purgeKey));
};


let purgeKey = key => {
  return new Promise(function(resolve, reject) {
    console.log(`:: Marking ${key} as done`);
    fs.readdir("reports", (err, files) => {
      console.log(`:: fs.readdir initiated`);
      if(err) {
        console.log(`:: Error finding reports folder`);
        console.error(err);
      }
      console.log(`:: Folder found`);
      files.forEach(file => {
        if (file.includes(key)) {
          console.log(`:: About to read file`);
          fs.readFile(`reports/${file}`, 'utf-8', (err, data) => {
            if (err) return reject(err);
            parser.parseString(data, (err, result) => {
              if(err) return reject(err);
              if (result.testsuites['$'].errors === '0' && result.testsuites['$'].failures === '0') {
                redisClient.hset(key, "status", "successful", function(err, _) {
                  if(err) return reject(err);
                  fs.unlink(`tests/${key}.js`);
                  console.log(`:: Resolving on successful`);
                  return resolve(key);
                });
              } else {
                redisClient.hset(key, "status", "failed", function(err, _) {
                  if(err) return reject(err);
                  fs.unlink(`tests/${key}.js`);
                  console.log(`:: Resolving on failed`);
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
  return Promise.all(inProgress);
};

let writeResult = key => {
  return new Promise(function(resolve, reject) {
    fs.readdir("reports", (err, files) => {
      if(err) console.error(err);
      files.forEach(file => {
        if (file.includes(key)) {
          console.log(`:: File ${file} contains key`);
          fs.readFile(`reports/${file}`, 'utf-8', (err, data) => {
            if (err) {
              console.log(`:: Rejecting ${key}`);
              return reject(err);
            } else {
              redisClient.hset(key, "result", data, function(err, _) {
                if(err) {return reject(err);}
                console.log(`:: Writing result - resolving ${key}`);
                return resolve(key);
              });
            }
          });
        }
      });
    });
  });
};

// Get the Redis keys and store them in an array
redisClient.keys('*', function (err, keys) {
  if (err) {return console.log(err);}
  console.log(keys);

  writeKeys(keys).then(runTests).then(writeResults).then(cleanUp).then(process.exit);

});
