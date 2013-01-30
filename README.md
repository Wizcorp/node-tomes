[![Build Status](https://travis-ci.org/Wizcorp/node-tomes.png)](https://travis-ci.org/Wizcorp/node-tomes)

Tomes
=========

*Evented Storage Agnostic Data API*

Problem: You've got data and you want to do something whenever it changes.

Access and modify your data through the Tomes API and you'll get change events.

Play with a live demo here - http://bjornstar.github.com/tomes/

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

###Tome.destroy( *tome* )
Make a tome and all of it's sub-tomes emit destroy. This will not delete anything.

##Methods

###assign( *data* )
Assign data to a Tome.

###set( *key*, *data* )
Assign data to key on a Tome. Set will create a Tome on the key if it does not exist.

###del( *key* )
Delete a key from a Tome.

###swap( *key*, *tome* )
Swap key with tome.

###rename( *key*, *newkey* )
Rename key to newkey.

###move( *key*, *tome*, [ *newkey* ] )
Move key to tome. Optionally call it newkey on that tome.

###hide( [ *boolean* ] )
Hides a Tome. The Tome still exists in this tome, but will neither stringify nor show up in any events. Shows up as a delete in change operations.

###read( )
Get a single change operation from a Tome, removing it in the process. Returns null if there are no changes.

###merge( *diff* )
Applies a change operation or an array of change operations to a Tome.

###isDirty( )
Returns whether a Tome has been changed, but the change has not been read.

##Events

###add( *key* )
Emitted when a Tome receives a new key.

###del( *key* )
Emitted when a key is deleted from a Tome.

###destroy( )
Emitted when a Tome is deleted. Removes all event listeners for this Tome.

###readable( )
<<<<<<< HEAD
Emitted on every time a Tome or any of it's child Tomes are altered. 

###typeChange( *oldType*, *newType* )
Emitted when a Tome changes type.
=======
Emitted every time a Tome or any of it's child Tomes are altered. 
>>>>>>> develop
