//Not sure if this will work, more work on the databases side needed before I can tell

//Commenting out as it is not the standard scipt format, so is causing errors
// module.exports = function (data) {
//   return {
//     '@disabled': true,
//     testID: function(browser) {
//       browser
//         .url(data.url)
//         .waitForElementVisible(data.element)
//         .assert.title(data.title)
//         .saveScreenshot(data.screenshot)
//         .end();
//   }
// }

let data = {
    url: 'http://www.google.com',
    idOrClass: 'Class',
    elementID: '_XIi',
    action: 'Click',
    value: '',
    done: 'false'
}

this.templateTest = (browser) => {
  browser.url(data.url);
  browser.waitForElementVisible('body', 1000);
  switch(data.action) {
    case "Click":
      if (data.idOrClass === 'ID') {
        browser.click(`#${data.elementID}`);
      } else {
        browser.click(`.${data.elementID}`);
      }
      break;

    case "Text Entry":
      if (data.idOrClass === 'ID') {

      } else {

      }
      break;

    case "Assert":
      break;
  }
  browser.pause(20000);
  browser.end();
}
