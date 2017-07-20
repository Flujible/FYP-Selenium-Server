// require('dotenv').load({
//   silent: true
// });
//
// let redisClient = require('redis').createClient(process.env.REDIS_URL);


module.exports = {
  src_folders: "tests", //Where the tests are stored
  output_folder: "reports", //Where the test results are stored
  selenium: { //allows us to define how selenium will run
    start_process: true, //Nightwatch itself will be starting the selenium server
    server_path: "./bin/selenium.jar",
    host: "127.0.0.1",
    port: "4444",
    cli_args: {
      "webdriver.chrome.driver": "./bin/chromedriver"
    }
  },
  test_settings: {
    default: {
      screenshots: {
        enabled: false, //No screenshots please
        path: "./screenshots" //where to store screenshots if desired
      },
      globals: {
        waitForConditionTimeout: 5000 //prevent the connection from timing out if the internet is slow
      },
      desiredCapabilities: {
        browserName: "chrome" //Default browser should be chrome
      }
    },
    chrome: { //settings for the default browser
      desiredCapabilities: {
        browserName: "chrome",
        javascriptEnabled: true
      }
    }
  }
}

//Check if the selenium server and chromedriver have been successfully downloaded
require('selenium-download').ensure('./bin', function(error) {
  if (error) {
    return console.log(error);
  } else {
    console.log('✔ Selenium & Chromedriver downloaded to:', './bin');
  }
});
