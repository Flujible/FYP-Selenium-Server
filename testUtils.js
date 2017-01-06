module.exports = rawData => {

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

  return (browser) => {

      let testSteps = rawData.steps;
      let totalSteps = testSteps.length;

      browser.url(rawData.url);
      browser.waitForElementVisible('body', 1000);

      let actions = {
        'Click': clickCallback,
        'TextEntry': textEntryCallback,
        'Assert': assertCallback,
      };

      browser.pause(500);
      testSteps.forEach(step => {
        console.log(step, typeof actions[step.action]);
        actions[step.action](step, browser);
        browser.pause(500);
      });
      browser.end();
    }
};
