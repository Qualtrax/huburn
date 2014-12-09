![screenshot](docs/huburn.png)

Velocity and Burndown chart for GitHub milestones.

Config
------

A configuration file named config.js is required for huburn to operate. 

```js
module.exports = {
  githubClientId: 'xxx', 
  githubClientSecret: 'xxxxxx',
  sslKeyPath: '/server.key',
  sslCertPath: '/server.crt'
}
```

Less
----

To compile LESS, run the following command:

```
node node_modules/less/bin/lessc lib/static/less/main.less > lib/static/static/css/main.css
```