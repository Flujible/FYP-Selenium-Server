let redisClient = require('redis').createClient(process.env.REDIS_URL);
let nightwatch = require('nightwatch');
let fs = require('fs');
let xml2js = require('xml2js');

let systemSetup = "CHROME_55.0.2883.87_LINUX_";
let parser = new xml2js.Parser();

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

let cleanUp = keys => {
  let done = 0, length = keys.length;
  keys.forEach(key => {
    console.log(`:: Marking ${key} as done`);
    fs.readFile(`reports/${systemSetup}${key}.xml`, 'utf-8', (err, data) => {
      if (err) {return reject(err);}
      parser.parseString(data, (err, result) => {
        if (result.testsuites['$'].errors === '0' && result.testsuites['$'].failures === '0') {
          redisClient.hset(key, "status", "successful", function(err, res) {
                if(err) {return reject(err);}
                fs.unlink(`tests/${key}.js`);
                return resolve(key);
              });
        } else {
          redisClient.hset(key, "status", "failed", function(err, res) {
                if(err) {return reject(err);}
              });
              fs.unlink(`tests/${key}.js`);
              return resolve(key);
        }
        // result = JSON.stringify(result, null, 4);
      });
    });
  });
}

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
    fs.readFile(`reports/${systemSetup}${key}.xml`, 'utf-8', (err, data) => {
      if (err) {return reject(err)};
      //Cant change to JSON easily as there are objects within objetcs, so
      //stringifying once doesnt actually stringify everything, and stringifying
      //twice causes issues with the beginning of the JSON
      //parser.parseString(data, (err, result) => {
        //result = JSON.stringify(result);
        // console.log(data);
        redisClient.hset(key, "result", data, function(err, res) {
          if(err) {return reject(err);}
          return resolve(key);
        });
      //})
    });
  });
}

// Get the Redis keys and store them in an array
redisClient.keys('*', function (err, keys) {
  if (err) {return console.log(err);}
  console.log(keys);

  writeKeys(keys).then(runTests).then(cleanUp);

});
