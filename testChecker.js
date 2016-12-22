let nightwatch = require('nightwatch');
let redisClient = require('redis').createClient(process.env.REDIS_URL);
let fs = require('fs');
let asyn = require('async');
let sleep = require('sleep');

redisClient.on('connect', () => {
  console.log("Redis connected")
});



let writeFile = (key) => {
  //Get the value from a specified redis key and assign it to 'object'
  redisClient.hgetall(key, (err, object) => {
    let value = object;
    console.log(value);

    //Write the steps outlined in the redis database to a JSON file
    if (value.done === 'false') {
      value.steps = JSON.parse(value.steps);
      fs.writeFile("tests/data.json", JSON.stringify(value, null, 4), 'utf8',function(err) {
        if (err) {
          return console.error(err);
        }
        console.log("++++++++++ File created successfully ++++++++++");
      });

    }
  });
}

//Run nightwatch and set the 'done' value to true
let exec = (key) => {
  nightwatch.runner({config: "./nightwatch.conf.js"});
  redisClient.hmset(key, done, "true");
};



redisClient.keys('*', function (err, keys) {
  if (err) {return console.log(err);}
  console.log(keys);

  for (let i = keys.length; i > 0; i--) {
    asyn.series([
      writeFile(keys[i]),
      sleep.sleep(15),
      exec(keys[i]),
      sleep.sleep(10)
    ]);
  }
});
