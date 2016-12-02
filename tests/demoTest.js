module.exports = {

  // before : function (browser) {
  //   console.log("Setting up...");
  // }
  //
  // after : function (browser) {
  //   console.log("Closing down...");
  //};
  //
  // let testSteps = 1
  // beforeEach : function (browser) {
  //   console.log("Executing step "+testSteps+"...");
  // }
  //
  // afterEach : function () {
  //   console.log("Step "+testSteps+" complete...");
  //   testSteps = testSteps+1;
  // }

  'Demo test Google' : function (browser) {
    browser.url('http://www.google.com')
    browser.waitForElementVisible('body', 1000)
    browser.setValue('input[type=text]', 'nightwatch')
    browser.waitForElementVisible('button[name=btnG]', 1000)
    browser.click('button[name=btnG]')
    browser.pause(1000)
    browser.assert.containsText('#main', 'Night Watch')
    browser.end();
  }
};
