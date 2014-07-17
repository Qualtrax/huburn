Huburn
======

Burndown chart for GitHub milestones. Assign points to issues via labels using the format "points: %d", eg. "points: 2".

![screenshot](docs/huburn.png)

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
