let nightwatch = require('nightwatch');
let redisClient = require('redis').createClient(process.env.REDIS_URL);
let fs = require('fs');

redisClient.on('connect', () => {
  console.log("Redis connected")
});

redisClient.keys('*', function (err, keys) {
  if (err) {return console.log(err);}
  let keyArray = keys;
  console.log(keys);

  keys.forEach(key => {
    redisClient.hgetall(key, (err, object) => {
      let value = object;
      console.log("\n");
      console.log(value);
      if (value.done === 'false') {
        value.steps = JSON.parse(value.steps);
        fs.writeFile("tests/data.json", JSON.stringify(value, null, 4), 'utf8',function(err) {
          if (err) {
            return console.error(err);
          }
          console.log("File created successfully");

        });
        //This may need a setTimout if the files get written to quickly
        nightwatch.runner({config: "./nightwatch.conf.js"});
        //
        // Need to set done to true here
        //
      }
    });
  });
});
