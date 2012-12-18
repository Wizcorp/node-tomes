[![Build Status](https://travis-ci.org/bjornstar/node-tomes.png)](https://travis-ci.org/bjornstar/node-tomes)

node-tomes
=========

Evented Storage Agnostic Data API

Play with a demo here - http://bjornstar.github.com/node-tomes/

Problem: You've got data and you want to do something whenever it changes.

Access and modify your data through the Tomes API and you'll get change events.

```javascript
var filmData = {
	cast: [
		{ name: "Mr. Pink", guns: 1 },
		{ name: "Mr. Blonde", guns: 1, razors: 1 },
		{ name: "Mr. White", guns: 2 },
		{ name: "Mr. Orange", guns: 1, cop: true },
		{ name: "Mr. Brown", guns: 1 },
		{ name: "Mr. Blue", guns: 1 },
		{ name: "Marvin Nash", ears: [ "left", "right" ], cop: true },
		{ name: "Nice Guy Eddie", guns: 2 },
		{ name: "Joe Cabot", guns: 1 }
	]
};

var reservoirDogs = Tome.conjure(filmData);

reservoirDogs.set('director', reservoirDogs.cast[4]);

reservoirDogs.director.name.assign('Quentin Tarantino');
```
