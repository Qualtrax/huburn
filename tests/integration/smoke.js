var config = require('./tests.conf.js');

describe('huburn', function() {
  it('should have a title', function() {
  	browser.driver.get('https://localhost:8443');

  	var signInForm = browser.driver.findElement(by.id('login'));

  	var loginField = signInForm.findElement(by.name('login'));
  	loginField.sendKeys(config.githubLogin);

  	var passwordField = signInForm.findElement(by.name('password'));
  	passwordField.sendKeys(config.githubPassword);

    var signInButton = browser.driver.findElement(by.name('commit'));
  	signInButton.click();

  	browser.driver.sleep(10000);
  });
});