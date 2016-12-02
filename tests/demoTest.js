// let before = function (browser) {
//   console.log('Setting up...');
// };
//
// let after = function (browser) {
//   console.log("Closing down...");
// };
//
// let testSteps = 1;
// let beforeEach = function (browser, done) {
//   console.log(`Executing step ${testSteps}...`);
//   done();
// };
//
// let afterEach = function(browser, done) {
//   console.log(`Step ${testSteps} complete...`);
//   testSteps = testSteps+1;
//   done();
// };

// this.demoTestGoogle (browser) => {
//   browser.url('http://www.google.com')
//   browser.waitForElementVisible('body', 1000)
//   browser.setValue('input[type=text]', 'nightwatch')
//   browser.waitForElementVisible('button[name=btnG]', 1000)
//   browser.click('button[name=btnG]')
//   browser.pause(2000)
//   browser.assert.containsText('#main', 'Night Watch')
//   browser.end();
// }

// module.exports = {
//   before,
//   after,
//   beforeEach,
//   afterEach,
// };
