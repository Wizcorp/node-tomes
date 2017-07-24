[![NPM](https://nodei.co/npm/tomes.png?downloads=true)](https://nodei.co/npm/tomes/)

[![Build Status](https://travis-ci.org/Wizcorp/node-tomes.png)](https://travis-ci.org/Wizcorp/node-tomes)

Tomes
=====

*Evented Storage Agnostic Data API*

![Tomes Logo](https://raw.github.com/bjornstar/tomes/master/logo/tomes-logo-small.png)

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

## Tome

### Tome.conjure( *data* )
Returns a new Tome containing your data.

### Tome.typeOf( *data* )
Returns data's type as a string. Tomes has types that exist in JSON which are:
 - array
 - boolean
 - null
 - number
 - object
 - string
As well as:
 - undefined

### Tome.isTome( *data* )
Returns a boolean indicating whether data is a Tome or not.

### Tome.unTome( *tome* )
Returns a regular JavaScript version of your Tome.

## TomeTypes
 - ArrayTome
 - BooleanTome
 - NullTome
 - NumberTome
 - ObjectTome
 - StringTome
 - UndefinedTome

### Tome.destroy( *tome* )
Make a tome and all of it's sub-tomes emit destroy. This will not delete anything.

## Methods

### assign( *data* )
Assign data to a Tome.

### set( *key*, *data* )
Assign data to key on a Tome. Set will create a Tome on the key if it does not exist.

### del( *key* )
Delete a key from a Tome.

### swap( *key*, *tome* )
Swap key with tome.

### rename( *key*, *newkey* )
Rename key to newkey.

### move( *key*, *tome*, [ *newkey* ] )
Move key to tome. Optionally call it newkey on that tome.

### read( )
Get a single change operation from the root Tome, removing it in the process. Returns null if there are no changes.

### readAll( )
Get all change operations from the Tome

### merge( *diff* )
Applies a change operation or an array of change operations to a Tome.

### getKey( )
Returns a Tome's key.

### getParent( )
Returns a Tome's parent Tome.

### getVersion( )
Returns a Tome's version.

### is( *value* )
Returns a boolean value indicating whether or not the Tome is observably indistinguishable from value ([ref](http://wiki.ecmascript.org/doku.php?id=harmony:egal)). If no value is given, returns whether or not the Tome's value is truthy.

### isDirty( )
Returns whether a Tome has been changed, but the change has not been read.

### takeSnapshot( [ *snapshot* ] )
Returns a snapshot object of the root Tome. If you pass a previously made snapshot, it may be returned instead of a
fresh snapshot, if the Tome has not changed in the mean time.

### restoreSnapshot( *snapshot* )

You can pass a snapshot object back to the root Tome from which you took it. This brings the Tome back to that state,
including the state of the diff. This can be useful for scenarios where you want to be able to rollback changes.
If the version (see `getVersion()`) of the snapshot is the same as tome you are restoring the snapshot to,
this operation won't do anything. This makes it unsafe to apply snapshots to tomes from which they weren't taken.

## Events

### add( *key* )
Emitted when a Tome receives a new key.

### del( *key* )
Emitted when a key is deleted from a Tome.

### destroy( )
Emitted when a Tome is deleted. Removes all event listeners for this Tome.

### readable( *was* )
Emitted every time a Tome or any of its child Tomes are altered. If the Tome was a primitive (ie. string, number, or boolean) the previous value will be emitted as well, but only if it did not change types.

### typeChange( *tome*, *oldType*, *newType* )
Emitted by the root tome when a Tome changes type.
