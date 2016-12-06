//Test data until we can start pulling from the database
let rawData = { url: 'https://xes.io/contact/',
  done: 'false',
  steps: `[{"id":"ID","element":"name","action":"Click","value":""},
  {"id":"ID","element":"name","action":"TextEntry","value":"George Bryant"},
  {"id":"Class","element":"faint","action":"Assert","value": "Tell me all about your project. Include details such as schedule, budget and example sites you like."}]`
}

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

  let testSteps = JSON.parse(data.steps);
  let totalSteps = testSteps.length;

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
