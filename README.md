[![Build Status](https://travis-ci.org/bjornstar/node-tomes.png)](https://travis-ci.org/bjornstar/node-tomes)

node-tomes
=========

Evented Storage Agnostic Data API

Problem: You've got data and you want to do something whenever it changes.

Access and modify your data through the Tomes API and you'll get change events.

Play with a live demo here - http://bjornstar.github.com/node-tomes/

Example
=======
```javascript
var filmData = {
	cast: [
		{ name: "Mr. Blonde", guns: 1, razors: 1 },
		{ name: "Marvin Nash", ears: [ "left", "right" ], cop: true },
	]
};

var reservoirDogs = Tome.conjure(filmData);

reservoirDogs.cast[1].on('signal', function (marvinNash) {
	console.log(marvinNash.ears.length);
});
// >>> 2

reservoirDogs.cast[1].ears.pop();
// >>> 1
```

API
===

conjure( data ) - Instantiate a Tome containing your data.

set( key, data ) - Assigns data to key on a Tome.

assign( data ) - Assigns data to a Tome.