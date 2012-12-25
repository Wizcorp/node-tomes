[![Build Status](https://travis-ci.org/bjornstar/node-tomes.png)](https://travis-ci.org/bjornstar/node-tomes)

node-tomes
=========

*Evented Storage Agnostic Data API*

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

reservoirDogs.cast[1].on('readable', function (marvinNash) {
	console.log(marvinNash.ears.length);
});
// >>> 2

reservoirDogs.cast[1].ears.pop();
// >>> 1
```

Tomes API
=========

##Tome

###Tome.conjure( *data* )
Returns a new Tome containing your data.

###Tome.typeOf( data )
Returns data's type as a string. Tomes only has types that exist in JSON which are:

 - array
 - boolean
 - null
 - number
 - object
 - string
 - undefined

###Tome.isTome( *data* )
Returns a boolean indicating whether data is a Tome or not.

##TomeTypes
 - ArrayTome
 - BooleanTome
 - NullTome
 - NumberTome
 - ObjectTome
 - StringTome
 - UndefinedTome

###set( *key*, *data* )
Assign data to key on a Tome. Set will create a Tome on the key if it does not exist.

###assign( *data* )
Assign data to a Tome.

###del( *key* )
Delete a key from a Tome.

###pause( )
Start buffering all add/del/destroy/rename event emissions.

###flush( )
Emit all buffered add/del/destroy/rename events.

###resume( )
Emit all buffered add/del/destroy/rename events and stop buffering add/del/destroy/rename event emission.

###merge( *diff* )
Applies a diff to a Tome

###swap( *key*, *tome* )
Swap key with tome.

###move( *key*, *tome*, [ *newkey* ] )
Move key to tome. Optionally, give the key a new name.

###rename( *key*, *newkey* )
Rename key to newkey.

###hide( [ *boolean* ] )
Hides a Tome. The Tome still exists in this tome, but will neither stringify nor show up in any events. Shows up as a delete in the diff.

##Events

###add( *key*, *val* )
Emitted when a Tome receives a new key.

###del( *key* )
Emitted when a key is deleted from a Tome.

###destroy( )
Emitted when a Tome is deleted.

###rename( *key*, *newkey* )
Emitted when a key is renamed.

###readable( )
Emitted when you register a listener on the readable event and on every change to the Tome. 