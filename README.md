![screenshot](docs/huburn.png)

Velocity and Burndown chart for GitHub milestones.

Config
------

A configuration file named config.js is required for huburn to operate. 

```js
module.exports = {
  githubClientId: 'xxx',
  githubClientSecret: 'xxxxxx'
}
```

SSL certificate files 'server.crt' and 'server.key' are expected to exist in the root application folder.

Development
-----------

Install dependencies

```
npm install
```


Run tests

```
grunt
```