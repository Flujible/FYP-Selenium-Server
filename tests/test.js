// module.exports = { // adapted from: https://git.io/vodU0
//   'Guinea Pig Assert Title': function(browser) {
//     browser
//       .url('https://saucelabs.com/test/guinea-pig')
//       .waitForElementVisible('body')
//       .assert.title('I am a page title - Sauce Labs')
//       .end();
//   }
// };
//
// module.exports = function (settings) {
//   return {
//     '@disabled': true,
//     'Guinea Pig Assert Title': function(browser) {
//       browser
//         .url(settings.url)
//         .waitForElementVisible(settings.element)
//         .assert.title(settings.title)
//         .saveScreenshot(settings.screenshot)
//         .end();
//   };
// }
//
// var settings = generator({
//   title: 'I am a page title - Sauce Labs',
//   url:'www.example.org'
// });
//
// Generator will create the script for me based on what is defined in the JSON
// object being stored in the DB
//
// Store the entire object as JSON-encoded string in a single key and keep track
// of all Objects using a set (or list, if more appropriate). For example:
//
// INCR id:users
// SET user:{id} '{"name":"Fred","age":25}'
// SADD users {id}
// Generally speaking, this is probably the best method in most cases. If there
// are a lot of fields in the Object, your Objects are not nested with other
// Objects, and you tend to only access a small subset of fields at a time, it
// might be better to go with option 2.
//
// Advantages: considered a "good practice." Each Object is a full-blown Redis
// key. JSON parsing is fast, especially when you need to access many fields for
// this Object at once. Disadvantages: slower when you only need to access a
// single field.
