
describe('huburn', function() {
  beforeEach(function() {
    signIn();
  });

  it('should have a title', function(){
    browser.get(baseUrl);
    expect(browser.getTitle()).toBe('Huburn');
  });

  it('should start at the repositories view', function() {
    browser.get(baseUrl);
    expect(browser.getCurrentUrl()).toBe(baseUrl + '/#/repositories');
  });
});

var baseUrl = 'https://localhost:8443';

var signIn = function() {
  var config = require('./tests.conf.js');

  browser.driver.get('https://localhost:8443');

  browser.driver.getCurrentUrl().then(function(url) {
    if (url.indexOf('https://github.com/login') == 0) {
      var signInForm = browser.driver.findElement(by.id('login'));

      var loginField = signInForm.findElement(by.name('login'));
      loginField.sendKeys(config.githubLogin);

      var passwordField = signInForm.findElement(by.name('password'));
      passwordField.sendKeys(config.githubPassword);

      var signInButton = signInForm.findElement(by.name('commit'));
      signInButton.click();

      browser.driver.getTitle().then(function(t){
        if (t.indexOf('Authorize') == 0) {
          var authorizeButton = browser.driver.findElement(by.css('button[name="authorize"]'));
          authorizeButton.click();
        }
      });
    }
  });
}