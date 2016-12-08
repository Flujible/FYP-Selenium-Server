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


//Test data until we can start pulling from the database
let rawData = { url: 'https://xes.io/contact/',
  done: 'false',
  steps: `[{"id":"ID","element":"name","action":"Click","value":""}]`
};

let testSteps = JSON.parse(rawData.steps);
let totalSteps = testSteps.length;
console.log("\n\n==========");
console.log(totalSteps);
console.log("==========\n\n");

//Click on the element
let clickCallback = (data, browser) => {
  if (data.id === 'ID') {
    browser.click(`#${data.element}`);
  } else {
    browser.click(`.${data.element}`);
  }
};

//Enter text into the element
let textEntryCallback = (data, browser) => {
  if (data.id === 'ID') {
    browser.setValue(`#${data.element}`, `${data.value}`);
  } else {
    browser.setValue(`.${data.element}`, `${data.value}`);
  }
}

//Assert the element contains text
let assertCallback = (data, browser) => {
  if (data.id === 'ID') {
    browser.assert.containsText(`#${data.element}`, `${data.value}`);
  } else {
    browser.assert.containsText(`.${data.element}`, `${data.value}`);
  }
}

//Test script that will be used
templateTest = (data, browser) => {

  browser.url(data.url);
  browser.waitForElementVisible('body', 1000);

  let actions = {
    'Click': clickCallback,
    'TextEntry': textEntryCallback,
    'Assert': assertCallback,
  };
  browser.pause(500);
  testSteps.forEach(step => {
    actions[step.action](step, browser);
    browser.pause(500);
  });
  browser.end();
}


module.exports = {
  test: this.templateTest
}
