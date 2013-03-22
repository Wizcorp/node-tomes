// Copyright (C) 2012 Wizcorp, Inc. <info@wizcorp.jp>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var EventEmitter;

try {
	EventEmitter = typeof require === 'function' ? require('emitter') : EventEmitter;
} catch (e) {
	EventEmitter = typeof require === 'function' ? require('events').EventEmitter : EventEmitter;
}

function inherits(Child, Parent) {
	Child.prototype = Object.create(Parent.prototype, {
		constructor: { value: Child, enumerable: false, writable: true, configurable: true }
	});
}

var exports = exports || {};
var isArray = Array.isArray;


//  ________
// |        \
//  \$$$$$$$$______   ______ ____    ______    _______
//    | $$  /      \ |      \    \  /      \  /       \
//    | $$ |  $$$$$$\| $$$$$$\$$$$\|  $$$$$$\|  $$$$$$$
//    | $$ | $$  | $$| $$ | $$ | $$| $$    $$ \$$    \
//    | $$ | $$__/ $$| $$ | $$ | $$| $$$$$$$$ _\$$$$$$\
//    | $$  \$$    $$| $$ | $$ | $$ \$$     \|       $$
//     \$$   \$$$$$$  \$$  \$$  \$$  \$$$$$$$ \$$$$$$$


function Tome(parent, key) {

	// The Tome type holds references and methods that all 'real' types
	// inherit. We should never get an object that is just a Tome, it should
	// always be at least one other type. We call this function in the
	// constructor of each Tome type.

	// __root__ holds a reference to the Tome at the top of the chain. We use
	// it to identify where our change operations are being held. It exists on
	// all Tomes.

	// __diff__ is our buffer that holds all of the change operations that have
	// been generated. It only exists on the root Tome.

	// __version__ is a number that increments whenever a Tome or any of its
	// child Tomes changes. It only exists on the root Tome.

	// __parent__ holds a reference to the Tome's parent object so we can
	// signal up the Tome chain. It only exists on Tomes with parents.

	// __key__ is the key that our Tome is referred to by its parent. It only
	// exists on Tomes with parents.

	// __hidden__ is a boolean indicating whether or not a Tome's value should
	// be hidden from toJSON and event emission. It exists on all Tomes.

	// If you're using the node.js event emitter, we need to make the _events
	// non-enumerable. Ideally, node.js would make this the default behavior.

	var properties = {
		__dirty__: { writable: true, value: 1 },
		__hidden__: { writable: true, value: false },
		__root__: { writable: true, value: parent instanceof Tome ? parent.__root__ : this },
		_events: { configurable: true, writable: true },
		_callbacks: { configurable: true, writable: true }
	};

	if (parent instanceof Tome) {
		properties.__parent__ = { writable: true, value: parent };
		properties.__key__ = { writable: true, value: key };
	} else {
		properties.__diff__ = { writable: true, value: [] };
		properties.__version__ = { writable: true, value: 1 };
	}

	Object.defineProperties(this, properties);
}

function emitAdd(tome, key) {
	if (tome.__hidden__) {
		return;
	}

	tome.emit('add', key);
}

function emitDel(tome, key) {
	if (tome.__hidden__) {
		return;
	}

	tome.emit('del', key);
}

function emitDestroy(tome) {
	if (tome.__hidden__) {
		return;
	}

	tome.emit('destroy');
}

function destroy(tome) {
	if (tome.__hidden__) {
		return;
	}

	// When a Tome is deleted we emit a destroy event on it and all of its child
	// Tomes since they will no longer exist. We go down the Tome chain first and
	// then emit our way up.

	var keys = Object.keys(tome);
	for (var i = 0, len = keys.length; i < len; i += 1) {
		var k = keys[i];
		if (tome[k] instanceof Tome) {
			destroy(tome[k]);
		}
	}

	emitDestroy(tome);

	tome.removeAllListeners();
}

function reset(tome) {

	// The reset method deletes all properties on a Tome and turns it back into
	// a base Tome with no real type. We should immediately assign it a new type
	// based on the value.

	delete tome._arr;
	delete tome.length;
	delete tome._val;

	var keys = Object.keys(tome);
	var len = keys.length;
	var key, i;

	// Here we delete all of the properties and emit destroy on all of their
	// child Tomes. For destroy we don't really care about the order of events.
	// All that matters is that a Tome got destroyed.

	for (i = 0; i < len; i += 1) {
		key = keys[i];
		var o = tome[key];
		delete tome[key];
		if (o instanceof Tome) {
			destroy(o);
		}
	}

	// Once we have deleted all of the properties we emit del for each of the
	// deleted properties. We use this order so that when we emit del the
	// properties have already been deleted.

	for (i = 0; i < len; i += 1) {
		emitDel(tome, keys[i]);
	}
}

Tome.resolveChain = function (tome, chain) {
	var len = chain.length;
	var target = tome.__root__;

	for (var i = 0; i < len; i += 1) {
		var link = chain[i];
		if (!target.hasOwnProperty(link)) {
			throw new ReferenceError('resolveChain - Error resolving chain.' + chain);
		}
		target = target[link];
	}

	return target;
};

Tome.buildChain = function (tome) {
	var chain = [];

	while (tome.hasOwnProperty('__key__')) {
		chain.push(tome.__key__);
		tome = tome.__parent__;
	}

	return chain.reverse();
};

Tome.unTome = function (tome) {
	var out, keys;

	var tomeType = Tome.typeOf(tome);

	switch (tomeType) {
	case 'object':
		out = {};
		keys = Object.keys(tome);
		break;
	case 'array':
		out = new Array(tome.length);
		keys = Object.keys(tome);
		break;
	case 'undefined':
		out = undefined;
		break;
	case 'null':
		out = null;
		break;
	default:
		out = tome.valueOf();
		break;
	}

	if (!keys) {
		return out;
	}

	for (var i = 0; i < keys.length; i += 1) {
		var key = keys[i];
		out[key] = Tome.unTome(tome[key]);
	}
	return out;
};

function markDirty(tome, dirtyAt, was) {
	if (tome.__dirty__ === dirtyAt) {
		return;
	}

	tome.__dirty__ = dirtyAt;

	if (!tome.__hidden__) {
		tome.emit('readable', was);
	}
	
	if (tome.hasOwnProperty('__parent__')) {
		markDirty(tome.__parent__, dirtyAt);
	}
}

function diff(tome, op, val, chain, pair, was) {
	var root = tome.__root__;
	tome.__root__.__version__ += 1;

	if (!chain) {
		chain = Tome.buildChain(tome);
	}

	var newOp = { chain: chain, op: op };
	if (val !== undefined) {
		newOp.val = val;
	}

	root.__diff__.push(newOp);

	markDirty(tome, root.__version__, was);

	if (pair) {
		markDirty(pair, root.__version__, pair);
	}
}

function arrayInit(tome, val) {

	// An ArrayTome has two non-enumerable properties:
	//  -   _arr: Holds the actual array that we reference.
	//  - length: Holds the length of the array in _arr.

	if (!tome.hasOwnProperty('_arr')) {
		Object.defineProperty(tome, '_arr', { configurable: true, writable: true });
	}

	if (!tome.hasOwnProperty('length')) {
		Object.defineProperty(tome, 'length', { configurable: true, writable: true });
	}

	// val is an array so we take its length and instantiate a new array of
	// the appropriate size in _arr. We already know the length so we
	// assign that as well.

	var len = val.length;
	tome._arr = new Array(len);
	tome.length = len;

	// We go through each element in val and conjure a new Tome based on that
	// value with a reference to this tome as its parent. We also assign
	// properties with references to those new array elements. We need this
	// so we can do things like myTome[3].on('readable', function () {});

	// One additional special case that bears mentioning here is when an
	// array element has undefined as its value. When that element goes
	// through JSON.stringify it turns into null. We handle that by having
	// an UndefinedTome type and making its toJSON method return null. Also,
	// that element does not show up in hasOwnProperty, so we do not assign
	// a property for that element.

	for (var i = 0; i < len; i += 1) {
		tome._arr[i] = Tome.conjure(val[i], tome, i);
		
		// We use hasOwnProperty here because arrays instantiated with new
		// have elements, but no keys ie. new Array(1) is different from
		// [undefined].

		if (val.hasOwnProperty(i)) {
			tome[i] = tome._arr[i];
		}
	}

	for (i = 0; i < len; i += 1) {

		// We want to emit add after the values have all been assigned.
		// Otherwise, we would have unassigned values in the array.
		// Additionally, we always emit the value from _arr since the key may
		// not exist.
	
		emitAdd(tome, i);
	}
}

function emptyInit() {
}

function objectInit(tome, val) {

	// An ObjectTome is a Tome that holds other Tomes. It has no
	// non-enumerable properties. Every property of an ObjectTome is an
	// instance of another Tome.

	// There is one special case we need to handle with the ObjectTome type
	// and that is when the value of a property is undefined. To match
	// javascript's behavior we assign undefined directly to the property
	// instead of creating an UndefinedTome since when you JSON.stringify an
	// object with a property that has undefined as its value, it will
	// leave that property out. This is different behavior from arrays
	// which will stringify undefined elements to null.

	var added = Object.keys(val);
	var len = added.length;
	var k;

	for (var i = 0; i < len; i += 1) {
		k = added[i];
		var kv = val[k];
		tome[k] = kv === undefined ? undefined : Tome.conjure(kv, tome, k);
	}

	// Just like with arrays, we only want to emit add after we are done
	// assigning values. We used Object.keys to get an array of all the
	// properties we assigned so we can use it again to do the emission of
	// adds. We also need to pay special attention when emitting add on
	// undefined keys.

	for (i = 0; i < len; i += 1) {
		k = added[i];
		emitAdd(tome, k);
	}
}

function primitiveInit(tome, val) {
	if (!tome.hasOwnProperty('_val')) {
		Object.defineProperty(tome, '_val', { configurable: true, writable: true, value: val.valueOf() });
	} else {
		tome._val = val.valueOf();
	}
}

var initMap = {
	"array": arrayInit,
	"boolean": primitiveInit,
	"null": emptyInit,
	"number": primitiveInit,
	"object": objectInit,
	"string": primitiveInit,
	"undefined": emptyInit
};

function ArrayTome(parent, key) {
	Tome.call(this, parent, key);
}

function BooleanTome(parent, key) {
	Tome.call(this, parent, key);
}

function NullTome(parent, key) {
	Tome.call(this, parent, key);
}

function NumberTome(parent, key) {
	Tome.call(this, parent, key);
}

function ObjectTome(parent, key) {
	Tome.call(this, parent, key);
}

function StringTome(parent, key) {
	Tome.call(this, parent, key);
}

function UndefinedTome(parent, key) {
	Tome.call(this, parent, key);
}

var tomeMap = {
	"array": ArrayTome,
	"boolean": BooleanTome,
	"null": NullTome,
	"number": NumberTome,
	"object": ObjectTome,
	"string": StringTome,
	"undefined": UndefinedTome
};

inherits(Tome, EventEmitter);

// Every Tome is an EventEmitter, we can listen for four different events:
//
//  -     add: Emitted when a Tome receives a new property. Emits the key and
//             the value of the property added. This event is only emitted on
//             the Tome that received a new property and does not traverse up
//             the Tome chain. An add event is always accompanied by a signal
//             that does traverse up the Tome chain.
//
//  -     del: Emitted when deleting a property from a Tome. Emits the key of
//             the property that was deleted. This event is only emitted on the
//             Tome whose property was deleted and does not traverse up the
//             Tome chain. A del event is always accompanied by a signal event
//             that does traverse up the Tome chain. Additionally, the Tome
//             that was deleted and all of it's children will also emit a
//             destroy event.
//
//  - destroy: Emitted when a Tome has been deleted. We use this to tell all
//             interested parties that the Tome no longer exists and will not
//             emit any more events.
//
//  - readable: Emitted when a Tome or any of its child Tomes are altered.
//

exports.Tome = Tome;

Tome.isTome = function (o) {
	return o instanceof Tome;
};

Tome.typeOf = function (v) {

	// We use this function to identify a value's data type. We pay special
	// attention to array and null as JavaScript currently considers these
	// objects. This also works on Tomes.

	if (isArray(v)) {
		return 'array';
	}

	if (v === null) {
		return 'null';
	}

	if (v instanceof Tome) {
		return v.typeOf();
	}

	return typeof v;
};

Tome.conjure = function (val, parent, key) {

	// We instantiate a new Tome object by using the Tome.conjure method.
	// It will return a new Tome of the appropriate type for our value with Tome
	// inherited. This is also how we pass parent into our Tome so we can signal
	// a parent that its child has been modified.
	
	if (val instanceof Tome && val.__hidden__) {
		return;
	}

	var vType = Tome.typeOf(val);
	var ClassRef = tomeMap[vType];
	var vInit = initMap[vType];

	if (vType === 'undefined' && Tome.typeOf(parent) !== 'array') {
		throw new TypeError('Tome.conjure - You can only set array elements to undefined.');
	}

	if (ClassRef === undefined) {
		throw new TypeError('Tome.conjure - Invalid value type: ' + vType);
	}

	var newTome = new ClassRef(parent, key);
	vInit(newTome, val);
	return newTome;
};

Tome.destroy = function (tome) {
	if (!(tome instanceof Tome)) {
		throw new TypeError('Tome.destroy - You can only destroy Tomes.');
	}

	destroy(tome);
};

Tome.prototype.is = function (val) {
	if (!arguments.length) {
		return !!this.valueOf();
	}

	var x = this.valueOf();
	var y = val instanceof Tome ? val.valueOf() : val;

	if (x === y) {
		// 0 === -0, but they are not identical
		return x !== 0 || 1 / x === 1 / y;
	}

	// NaN !== NaN, but they are identical.
	// NaNs are the only non-reflexive value, i.e., if x !== x,
	// then x is a NaN.
	// isNaN is broken: it converts its argument to number, so
	// isNaN("foo") => true
	return x !== x && y !== y;
};

Tome.prototype.isDirty = function () {
	// When we mark a Tome as dirty, we set dirty to the new version from the
	// root tome. This way, we can know when the diff for that operation has
	// been read by comparing the root Tome's version minus the the number of
	// unread diffs against this tome's version.

	return this.__dirty__ > this.__root__.__version__ - this.__root__.__diff__.length;
};

Tome.prototype.getVersion = function () {
	return this.__root__.__version__;
};

Tome.prototype.getKey = function () {
	return this.__key__;
};

Tome.prototype.getParent = function () {
	return this.__parent__;
};

Tome.prototype.set = function (key, val) {

	// We use this to set a property on a Tome to the specified value. This can
	// either be a new property in which case we'd emit add and signal, or we
	// assign a new value to an existing value, destroying the old value.

	// If we try to assign an undefined value to a property, it will only have
	// an effect on ObjectTomes, otherwise it will do nothing. This mimics
	// JavaScript's behavior.

	var tomeType = this.typeOf();
	var valType = Tome.typeOf(val);

	if (valType === 'undefined') {
		if (tomeType === 'object') {
			this[key] = undefined;
			diff(this, 'del', key);
		}
		return undefined;
	}

	if (tomeType !== 'object') {

		// Only ObjectTomes can have properties, therefore we reset the Tome to
		// the Tome type and then turn it into an ObjectTome. ArrayTome has its
		// own set method which falls through to this one if the key is not a
		// number.

		this.__root__.emit('typeChange', this, tomeType, 'object');

		reset(this);
		this.__proto__ = ObjectTome.prototype;
	}

	if (!this.hasOwnProperty(key)) {

		// This is a new property, we conjure a new Tome with a type based on
		// the type of the value and assign it to the property. Then we emit an
		// add event followed by a signal which goes up the Tome chain.

		this[key] = Tome.conjure(val, this, key);
		emitAdd(this, key);
		diff(this, 'set', { key: key, val: val });

		// We've already assigned the value to the property so we return this.

		return this;
	}

	var p = this[key];

	if (p === undefined) {

		// This property exists, but has undefined as its value. We need to
		// conjure a Tome to assign a value to it.

		this[key] = Tome.conjure(val, this, key);
		diff(this, 'set', { key: key, val: val });

		// We've already assigned the value to the property so we return this.

		return this;
	}

	if (!(p instanceof Tome)) {

		// If this key is not a Tome, complain loudly.

		throw new TypeError('Tome.set - Key is not a Tome: ' + key);
	}

	// And finally, assign the value to the property. This will make sure the
	// property is the correct type for the value and emit the signal event.

	p.assign(val);

	return this;
};

Tome.prototype.assign = function (val) {

	// First we need to get the type of the value and the type of the Tome to
	// ensure we match the Tome type to the value type.

	var vType = Tome.typeOf(val);
	var vClass = tomeMap[vType];
	var vInit = initMap[vType];
	var pType = this.typeOf();

	if (vClass === undefined) {
		throw new TypeError('Tome.assign - Invalid value type: ' + vType);
	}

	if (vType === 'undefined' && (!this.hasOwnProperty('__parent__') || this.__parent__.typeOf() !== 'array')) {
		throw new TypeError('Tome.assign - You can only assign undefined to ArrayTome elements');
	}

	// The simplest cases are boolean, number, and string. If we already have
	// the correct Tome type we assign the value, signal, and return our new
	// value.

	if (vType === pType) {
		if (pType === 'boolean' || pType === 'number' || pType === 'string') {

			// If we already have the value then just return the value.

			if (this._val === val.valueOf()) {
				return this;
			}

			var oldVal = this._val;
			this._val = val.valueOf();

			diff(this, 'assign', val.valueOf(), null, null, oldVal);
			return this;
		}

		if (vType === 'null') {
			return this;
		}

		if (vType === 'undefined') {
			return;
		}
	}

	this.__root__.emit('typeChange', this, pType, vType);

	// If we're dealing with an array or object we need to reset the Tome.

	if (vType === 'array' || vType === 'object' || pType === 'array' || pType === 'object') {
		reset(this);
	}

	// Now we need to apply a new Tome type based on the value type.

	this.__proto__ = vClass.prototype;
	vInit(this, val ? val.valueOf() : val);

	diff(this, 'assign', val);

	return this;
};

Tome.prototype.del = function (key) {

	// The del method is used to delete a property from a Tome. The key must
	// exist and be a Tome. The Tome will emit a del event with the name of the
	// property that was deleted and destory will be emitted by the property
	// that was deleted as well as all of its child Tomes. Finally, the Tome will
	// also signal that it was changed which also signals all the way up the
	// Tome chain.

	if (!this.hasOwnProperty(key)) {
		throw new ReferenceError('Tome.del - Key is not defined: ' + key);
	}

	if (!(this[key] instanceof Tome)) {
		throw new TypeError('Tome.del - Key is not a Tome: ' + key);
	}

	var o = this[key];

	delete this[key];

	destroy(o);

	emitDel(this, key);
	diff(this, 'del', key);

	return this;
};

Tome.prototype.move = function (key, newParent, onewKey) {
	if (!this.hasOwnProperty(key)) {
		throw new ReferenceError('Tome.move - Key is not defined: ' + key);
	}

	if (onewKey !== undefined && !(newParent instanceof Tome)) {
		throw new TypeError('Tome.move - new parent must be a Tome');
	} else if (onewKey === undefined && !(newParent instanceof Tome)) {
		onewKey = newParent;
		newParent = this;
	}

	if (newParent === this) {
		var rO = {};
		rO[key] = onewKey;
		return this.rename(rO);
	}

	if (onewKey === undefined) {
		onewKey = key;
	}

	var newKey = parseInt(onewKey, 10);

	if (newKey < 0 && newParent instanceof ArrayTome) {
		return this;
	}

	// Make a copy of the chains before we move them. For use in the diff.

	var newParentChain = Tome.buildChain(newParent);
	var oldParentChain = Tome.buildChain(this);

	// convert (if not already the case) the newParent to an ObjectTome if:
	// - the key is not numeric, or:
	// - the key is numeric, but the parent is not an ArrayTome

	// if the newKey that you're adding to newParent is numeric, allow it only
	// if newParent is an ArrayTome, else (if needed) convert newParent into an
	// ObjectTome.

	var newParentType = newParent.typeOf();
	var keyIsNumeric = (onewKey.toString() === newKey.toString());

	if (!keyIsNumeric || (keyIsNumeric && newParentType !== 'array')) {
		// use the string version of the newKey

		newKey = onewKey;

		// ensure newParent is an ObjectTome

		if (newParentType !== 'object') {
			newParent.__root__.emit('typeChange', newParent, newParentType, 'object');

			reset(newParent);
			newParent.__proto__ = ObjectTome.prototype;
		}
	}

	// add newKey to newParent

	if (newParent instanceof ArrayTome) {
		var arr = newParent._arr;
		var len = arr.length;

		arr[newKey] = this[key];
		newParent[newKey] = arr[newKey];

		// If the newKey is longer than the length of the array, fill to that
		// point.

		if (newKey >= len) {
			for (var i = len; i < newKey - 1; i += 1) {
				arr[i] = Tome.conjure(undefined, this, i);
				emitAdd(this, i);
			}
			this.length = arr.length;
		}
	} else {
		newParent[newKey] = this[key];
	}

	// remove key from oldParent.

	if (this instanceof ArrayTome) {

		// if oldParent is a tome, create an undefinedTome in it's place.

		this._arr[key] = Tome.conjure(undefined, this, key);
		this[key] = this._arr[key];
	} else {
		delete this[key];
	}

	// fix up newKey to reflect it's new location.

	newParent[newKey].__parent__ = newParent;
	newParent[newKey].__key__ = newKey;
	newParent[newKey].__root__ = newParent.__root__;

	// now emit the addition and deletion of the keys.

	emitDel(this, key);
	emitAdd(newParent, newKey);

	if (this.__root__ === newParent.__root__) {
		var moveOp = { key: key, newParent: newParentChain };

		if (newKey !== key) {
			moveOp.newKey = newKey;
		}

		diff(this, 'move', moveOp, oldParentChain, newParent);
	} else {
		diff(this, 'del', key);
		diff(newParent, 'set', { key: newKey, val: newParent[newKey].valueOf() });
	}

	return this;
};

Tome.prototype.read = function () {
	// Diffs are automatically buffered by default. When read is called on a
	// Tome we consider the diff to be consumed and walk down the chain to
	// remove all buffered diffs. We also need to walk up the chain to remove
	// the consumed diffs from the parents who may still have other diffs that
	// have not been consumed yet.

	if (!this.__root__.__diff__.length) {
		return null;
	}

	return this.__root__.__diff__.shift();
};

Tome.prototype.merge = function (diff) {

	// merge is used to apply diffs to our Tomes. Typically the diff would be a
	// parsed JSON string or come directly from another Tome.

	if (this.__hidden__) {
		throw new Error('Tome.merge - Cannot merge to hidden Tomes.');
	}

	var diffs = diff;

	if (Tome.typeOf(diff) !== 'array') {
		diffs = [ diff ];
	}

	for (var i = 0, len = diffs.length; i < len; i += 1) {
		var currentDiff = diffs[i];
		var tome = Tome.resolveChain(this, currentDiff.chain);

		var newParent;
		var opVal = currentDiff.val;
		switch (currentDiff.op) {
		case 'assign':
			tome.assign(opVal);
			break;
		case 'del':
			tome.del(opVal);
			break;
		case 'move':
			newParent = Tome.resolveChain(this, opVal.newParent);
			tome.move(opVal.key, newParent, opVal.newKey);
			break;
		case 'pop':
			tome.pop();
			break;
		case 'push':
			tome.push.apply(tome, opVal);
			break;
		case 'rename':
			tome.rename(opVal);
			break;
		case 'reverse':
			tome.reverse();
			break;
		case 'set':
			tome.set(opVal.key, opVal.val);
			break;
		case 'shift':
			tome.shift();
			break;
		case 'splice':
			tome.splice.apply(tome, opVal);
			break;
		case 'swap':
			newParent = Tome.resolveChain(this, opVal.newParent);
			tome.swap(opVal.key, newParent[opVal.newKey]);
			break;
		case 'unshift':
			tome.unshift.apply(tome, opVal);
			break;
		default:
			throw new Error('Tome.merge - Unsupported operation: ' + currentDiff.op);
		}
	}
};

Tome.prototype.swap = function (key, target) {
	if (key instanceof Tome) {
		target = key;
		key = this.__key__.toString();
	} else if (!this.hasOwnProperty(key)) {
		throw new ReferenceError('Tome.swap - Key is not defined: ' + key);
	}

	if (!(target instanceof Tome)) {
		throw new TypeError('Tome.swap - Target must be a Tome');
	}

	if (!target.hasOwnProperty('__parent__')) {
		throw new ReferenceError('Tome.swap - Cannot swap to a root Tome');
	}

	var newKey = target.__key__;
	var newParent = target.__parent__;
	var newRoot = target.__root__;

	var oldParentChain = Tome.buildChain(this);
	var newParentChain = Tome.buildChain(newParent);

	var op = { key: key, newParent: newParentChain, newKey: newKey };

	this[key].__key__ = newKey;
	this[key].__parent__ = newParent;
	this[key].__root__ = newRoot;

	var intermediate = this[key];

	target.__parent__ = this;
	target.__key__ = key;
	target.__root__ = this.__root__;

	this[key] = target;
	newParent[newKey] = intermediate;

	if (this instanceof ArrayTome) {
		this._arr[key] = this[key];
	}

	if (newParent instanceof ArrayTome) {
		newParent._arr[newKey] = newParent[newKey];
	}

	if (this.__root__ === newRoot) {
		diff(this, 'swap', op, oldParentChain, newParent);
	} else {
		diff(newParent, 'set', { key: newKey, val: newParent[newKey].valueOf() });
		diff(this, 'set', { key: key, val: this[key].valueOf() });
	}

	return this;
};

Tome.prototype.hide = function (h) {
	if (h === undefined) {
		h = true;
	}

	if (this.__hidden__ === h) {
		return;
	}

	this.__hidden__ = h;

	if (h) {
		diff(this.__parent__, 'del', this.__key__);
	} else {
		diff(this.__parent__, 'set', { key: this.__key__, val: this.valueOf() });
	}
};


//   ______
//  /      \
// |  $$$$$$\  ______    ______   ______   __    __
// | $$__| $$ /      \  /      \ |      \ |  \  |  \
// | $$    $$|  $$$$$$\|  $$$$$$\ \$$$$$$\| $$  | $$
// | $$$$$$$$| $$   \$$| $$   \$$/      $$| $$  | $$
// | $$  | $$| $$      | $$     |  $$$$$$$| $$__/ $$
// | $$  | $$| $$      | $$      \$$    $$ \$$    $$
//  \$$   \$$ \$$       \$$       \$$$$$$$ _\$$$$$$$
//                                        |  \__| $$
//                                         \$$    $$
//                                          \$$$$$$


inherits(ArrayTome, Tome);

exports.ArrayTome = ArrayTome;

ArrayTome.isArrayTome = function (o) {
	return o instanceof ArrayTome;
};

ArrayTome.prototype.valueOf = function () {
	if (!this.__hidden__) {
		return this._arr || [];
	}
};

ArrayTome.prototype.toJSON = function () {
	if (!this.__hidden__) {
		return this._arr || [];
	}
};

ArrayTome.prototype.typeOf = function () {
	return 'array';
};

ArrayTome.prototype.join = function (separator) {
	var out = '';
	var len = this._arr.length;

	if (!len) {
		return out;
	}

	if (separator === undefined) {
		separator = ',';
	}

	out += this._arr[0];

	for (var i = 1; i < len; i += 1) {
		out += separator;
		var e = this._arr[i];
		var eType = e.typeOf();
		if (eType !== 'null' && eType !== 'undefined') {
			out += e.toString();
		}
	}

	return out;
};

ArrayTome.prototype.toString = function () {
	return this.join();
};

ArrayTome.prototype.set = function (okey, val) {
	var key = parseInt(okey, 10);

	if (okey.toString() !== key.toString()) {
		Tome.prototype.set.apply(this, arguments);
		return;
	}

	if (key < 0) {
		return;
	}

	var arr = this._arr;
	var len = arr.length;

	if (key >= len) {
		arr[key] = Tome.conjure(val, this, key);
		this[key] = arr[key];
		this.length = arr.length;
		emitAdd(this, key);

		for (var i = len, newlen = arr.length - 1; i < newlen; i += 1) {
			arr[i] = Tome.conjure(undefined, this, i);
			this.length = arr.length;
			emitAdd(this, i);
		}

		diff(this, 'set', { key: key, val: val });
	} else if (this[key] instanceof Tome) {
		this[key].assign(val);
	}
	return this;
};

ArrayTome.prototype.del = function (key) {
	if (!this.hasOwnProperty(key)) {
		throw new ReferenceError('ArrayTome.del - Key is not defined: ' + key);
	}

	if (!(this[key] instanceof Tome)) {
		throw new TypeError('ArrayTome.del - Key is not a Tome: ' + key);
	}

	var o = this[key];

	destroy(o);

	this._arr[key] = Tome.conjure(undefined, this, key);
	this[key] = this._arr[key];

	emitDel(this, key);
	diff(this, 'del', key);

	return this;
};

ArrayTome.prototype.shift = function () {
	var oldLen = this._arr.length;

	var out = this._arr.shift();
	var len = this._arr.length;

	if (oldLen > len) {
		this.length = len;

		var o = this[0];

		delete this[0];

		for (var i = 0; i < len; i += 1) {
			this[i] = this._arr[i];
			this._arr[i].__key__ = i;
		}

		delete this[len];

		if (o instanceof Tome) {
			destroy(o);
		}

		emitDel(this, 0);
		diff(this, 'shift');
	}

	return out ? out.valueOf() : out;
};

ArrayTome.prototype.pop = function () {
	var oldlen = this._arr.length;

	var out = this._arr.pop();
	var len = this._arr.length;
	
	if (oldlen > len) {
		this.length = len;
		
		var o = this[len];

		delete this[len];

		if (o instanceof Tome) {
			destroy(o);
		}

		emitDel(this, len);
		diff(this, 'pop');
	}

	return out ? out.valueOf() : out;
};

ArrayTome.prototype.push = function () {
	var length = this._arr.length;

	if (arguments.length) {
		var args = new Array(arguments.length);
		for (var i = 0, len = arguments.length; i < len; i += 1) {
			var k = length + i;
			this._arr.push(Tome.conjure(arguments[i], this, k));
			this[k] = this._arr[k];
			this.length = this._arr.length;
			emitAdd(this, k);
			args[i] = arguments[i];
		}
		diff(this, 'push', args);
	}
	return this.length;
};

ArrayTome.prototype.reverse = function () {
	this._arr.reverse();

	for (var i = 0, len = this._arr.length; i < len; i += 1) {
		this[i] = this._arr[i];
		this._arr[i].__key__ = i;
	}

	diff(this, 'reverse');

	return this;
};

ArrayTome.prototype.splice = function (spliceIndex, toRemove) {
	spliceIndex = spliceIndex >= 0 ? Math.min(spliceIndex, this._arr.length) : Math.max(this._arr.length + spliceIndex, 0);

	var len = arguments.length;
	var toAdd = new Array(len - 2);

	var i, key;

	var args = new Array(len);
	args[0] = spliceIndex;
	args[1] = toRemove;

	for (i = 2, len = arguments.length; i < len; i += 1) {
		toAdd[i - 2] = arguments[i];
		args[i] = arguments[i];
	}

	var out = this._arr.splice(spliceIndex, toRemove);

	for (i = 0, len = out.length; i < len; i += 1) {
		key = spliceIndex + i;
		var o = this[key];
		delete this[key];
		this.length = this._arr.length;
		if (o instanceof Tome) {
			destroy(o);
		}
		emitDel(this, key);
	}

	for (i = 0, len = toAdd.length; i < len; i += 1) {
		key = spliceIndex + i;
		this._arr.splice(key, 0, Tome.conjure(toAdd[i], this, key));
		this[key] = this._arr[key];
		this.length = this._arr.length;
		emitAdd(this, key);
	}

	for (i = 0, len = this._arr.length; i < len; i += 1) {
		this[i] = this._arr[i];
	}

	if (out.length > toAdd.length) {
		for (i = 0, len = out.length; i < len; i += 1) {
			key = this._arr.length + i;
			delete this[key];
		}
	}

	if (toRemove || toAdd.length) {
		diff(this, 'splice', args);
	}

	return out;
};

ArrayTome.prototype.rename = function () {
	var oType = Tome.typeOf(arguments[0]);
	var rO;

	switch (oType) {
	case 'object':
		rO = arguments[0];
		break;
	case 'string':
	case 'number':
		rO = {};
		rO[arguments[0]] = arguments[1];
		break;
	default:
		throw new TypeError('ArrayTome.rename - invalid arguments.');
	}

	var oldKey, newKey;

	var temporary = {};

	for (oldKey in rO) {
		newKey = rO[oldKey];
		if (!this.hasOwnProperty(oldKey)) {
			throw new ReferenceError('ObjectTome.rename - Key is not defined: ' + oldKey);
		}

		this._arr[oldKey].__key__ = newKey;
		temporary[newKey] = this._arr[oldKey];

		delete this._arr[oldKey];
		emitDel(this, oldKey);
	}

	for (var k in temporary) {
		this._arr[k] = temporary[k];
		emitAdd(this, newKey);
	}

	this.length = this._arr.length;

	var i;

	for (i = 0; i < this.length; i += 1) {
		if (this._arr[i] === undefined) {
			this._arr[i] = Tome.conjure(undefined, this, i);
		}
	}

	this._arr.sort(function (a, b) { return a.__key__ - b.__key__; });

	for (i = 0; i < this.length; i += 1) {
		this[i] = this._arr[i];
	}

	diff(this, 'rename', rO);

	return this;
};


ArrayTome.prototype.sort = function () {
	this._arr.sort.apply(this._arr, arguments);

	var hasChanges = false;
	var rO = {};

	for (var i = 0, len = this._arr.length; i < len; i += 1) {
		if (this._arr[i].__key__ !== i) {
			var oldKey = this._arr[i].__key__;
			this._arr[i].__key__ = i;
			this[i] = this._arr[i];
			rO[oldKey] = i;
			emitDel(this, oldKey);
			emitAdd(this, i);
			hasChanges = true;
		}
	}

	if (hasChanges) {
		diff(this, 'rename', rO);
	}

	return this;
};

ArrayTome.prototype.unshift = function () {
	var arglen = arguments.length;
	if (arglen) {
		var args, i, len;
		
		args = new Array(arglen);
		
		for (i = arglen - 1; i >= 0; i -= 1) {
			this._arr.unshift(Tome.conjure(arguments[i], this, i));
			args[i] = arguments[i];
		}

		for (i = 0, len = this._arr.length; i < len; i += 1) {
			this[i] = this._arr[i];
			this._arr[i].__key__ = i;
		}

		for (i = 0; i < arglen; i += 1) {
			this.length = this._arr.length;
			emitAdd(this, i);
		}

		diff(this, 'unshift', args);
	}

	return this._arr.length;
};

ArrayTome.prototype.indexOf = function (searchElement) {
	// straight from MDN, Tomes have to do valueOf instead of ===
	var t = this._arr;
	var len = t.length;

	if (len === 0) {
		return -1;
	}

	var n = 0;
	
	if (arguments.length > 1) {
		n = Number(arguments[1]);
		if (n !== n) { // shortcut for verifying if it's NaN
			n = 0;
		} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
			n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
	}
	
	if (n >= len) {
		return -1;
	}
	
	var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	
	for (; k < len; k += 1) {
		if (k in t && t[k].valueOf() === searchElement) {
			return k;
		}
	}
	
	return -1;
};

ArrayTome.prototype.lastIndexOf = function (searchElement) {
	// straight from MDN, Tomes have to do valueOf instead of ===
	var t = this._arr;
	var len = t.length;
	
	if (len === 0) {
		return -1;
	}

	var n = len;
	
	if (arguments.length > 1) {
		n = Number(arguments[1]);
		if (n !== n) { // shortcut for verifying if it's NaN
			n = 0;
		} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
			n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
	}
	
	var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
	
	for (; k >= 0; k -= 1) {
		if (k in t && t[k].valueOf() === searchElement) {
			return k;
		}
	}
	
	return -1;
};

ArrayTome.prototype.concat = function () {
	var out = Tome.conjure([]);
	var len = this._arr.length;

	out._arr = new Array(len);

	for (var i = 0; i < len; i += 1) {
		out._arr[i] = this._arr[i];
		out[i] = out._arr[i];
	}

	var arglen = arguments.length;
	var j, ken;

	for (i = 0; i < arglen; i += 1) {
		var newVal = arguments[i];
		var newValType = Tome.typeOf(newVal);
		if (newVal instanceof Tome) {
			if (newValType === 'array') {
				for (j = 0, ken = newVal.length; j < ken; j += 1) {
					out._arr.push(newVal[j]);
					out[len] = out._arr[len];
					len += 1;
				}
			} else {
				out._arr.push(newVal);
				out[len] = out._arr[len];
				len += 1;
			}
		} else {
			if (newValType === 'array') {
				for (j = 0, ken = newVal.length; j < ken; j += 1) {
					out._arr.push(Tome.conjure(newVal[j], this, len));
					out[len] = out._arr[len];
					len += 1;
				}
			} else {
				out._arr.push(Tome.conjure(newVal, this, len));
				out[len] = out._arr[len];
				len += 1;
			}
		}
	}

	out.length = len;

	return out;
};


//  _______                       __
// |       \                     |  \
// | $$$$$$$\  ______    ______  | $$  ______    ______   _______
// | $$__/ $$ /      \  /      \ | $$ /      \  |      \ |       \
// | $$    $$|  $$$$$$\|  $$$$$$\| $$|  $$$$$$\  \$$$$$$\| $$$$$$$\
// | $$$$$$$\| $$  | $$| $$  | $$| $$| $$    $$ /      $$| $$  | $$
// | $$__/ $$| $$__/ $$| $$__/ $$| $$| $$$$$$$$|  $$$$$$$| $$  | $$
// | $$    $$ \$$    $$ \$$    $$| $$ \$$     \ \$$    $$| $$  | $$
//  \$$$$$$$   \$$$$$$   \$$$$$$  \$$  \$$$$$$$  \$$$$$$$ \$$   \$$


inherits(BooleanTome, Tome);

exports.BooleanTome = BooleanTome;

BooleanTome.isBooleanTome = function (o) {
	return o instanceof BooleanTome;
};

BooleanTome.prototype.toString = function () {
	return this._val.toString();
};

BooleanTome.prototype.typeOf = function () {
	return 'boolean';
};

BooleanTome.prototype.valueOf = function () {
	if (!this.__hidden__) {
		return this._val;
	}
};

BooleanTome.prototype.toJSON = function () {
	if (!this.__hidden__) {
		return this._val;
	}
};


//  __    __            __  __
// |  \  |  \          |  \|  \
// | $$\ | $$ __    __ | $$| $$
// | $$$\| $$|  \  |  \| $$| $$
// | $$$$\ $$| $$  | $$| $$| $$
// | $$\$$ $$| $$  | $$| $$| $$
// | $$ \$$$$| $$__/ $$| $$| $$
// | $$  \$$$ \$$    $$| $$| $$
//  \$$   \$$  \$$$$$$  \$$ \$$


exports.NullTome = NullTome;

inherits(NullTome, Tome);

NullTome.isNullTome = function (o) {
	return o instanceof NullTome;
};

NullTome.prototype.valueOf = function () {
	if (!this.__hidden__) {
		return null;
	}
};

NullTome.prototype.toJSON = function () {
	if (!this.__hidden__) {
		return null;
	}
};

NullTome.prototype.typeOf = function () {

	// Here we make an abrupt departure from pedantically duplicating the
	// behavior of JavaScript. Instead of null being an object, we call it
	// null.

	return 'null';
};


//  __    __                          __
// |  \  |  \                        |  \
// | $$\ | $$ __    __  ______ ____  | $$____    ______    ______
// | $$$\| $$|  \  |  \|      \    \ | $$    \  /      \  /      \
// | $$$$\ $$| $$  | $$| $$$$$$\$$$$\| $$$$$$$\|  $$$$$$\|  $$$$$$\
// | $$\$$ $$| $$  | $$| $$ | $$ | $$| $$  | $$| $$    $$| $$   \$$
// | $$ \$$$$| $$__/ $$| $$ | $$ | $$| $$__/ $$| $$$$$$$$| $$
// | $$  \$$$ \$$    $$| $$ | $$ | $$| $$    $$ \$$     \| $$
//  \$$   \$$  \$$$$$$  \$$  \$$  \$$ \$$$$$$$   \$$$$$$$ \$$


exports.NumberTome = NumberTome;

inherits(NumberTome, Tome);

NumberTome.isNumberTome = function (o) {
	return o instanceof NumberTome;
};

NumberTome.prototype.inc = function (val) {
	if (val === undefined) {
		val = 1;
	}

	if (typeof val !== 'number' || !isFinite(val)) {
		throw new TypeError('You can only increment by a finite number');
	}

	if (val === 0) {
		return this._val;
	}

	var was = this._val;
	this._val += val;
	diff(this, 'assign', this._val, null, null, was);

	return this;
};

NumberTome.prototype.toString = function () {
	return this._val.toString();
};

NumberTome.prototype.typeOf = function () {
	return 'number';
};

NumberTome.prototype.valueOf = function () {
	if (!this.__hidden__) {
		return this._val;
	}
};

NumberTome.prototype.toJSON = function () {
	if (!this.__hidden__) {
		return this._val;
	}
};

//   ______   __                                      __
//  /      \ |  \                                    |  \
// |  $$$$$$\| $$____       __   ______    _______  _| $$_
// | $$  | $$| $$    \     |  \ /      \  /       \|   $$ \
// | $$  | $$| $$$$$$$\     \$$|  $$$$$$\|  $$$$$$$ \$$$$$$
// | $$  | $$| $$  | $$    |  \| $$    $$| $$        | $$ __
// | $$__/ $$| $$__/ $$    | $$| $$$$$$$$| $$_____   | $$|  \
//  \$$    $$| $$    $$    | $$ \$$     \ \$$     \   \$$  $$
//   \$$$$$$  \$$$$$$$__   | $$  \$$$$$$$  \$$$$$$$    \$$$$
//                   |  \__/ $$
//                    \$$    $$
//                     \$$$$$$


inherits(ObjectTome, Tome);

exports.ObjectTome = ObjectTome;

ObjectTome.isObjectTome = function (o) {
	return o instanceof ObjectTome;
};

ObjectTome.prototype.typeOf = function () {
	return 'object';
};

ObjectTome.prototype.rename = function () {

	// ObjectTome.rename can take a few different styles of arguments:
	// - object: { oldKey1: newKey1, oldKey2: newKey2 }
	// - string: 'oldKey', newKey'

	var oType = Tome.typeOf(arguments[0]);
	var rO;

	switch (oType) {
	case 'object':
		rO = arguments[0];
		break;
	case 'string':
		rO = {};
		rO[arguments[0]] = arguments[1];
		break;
	default:
		throw new TypeError('ObjectTome.rename - Invalid arguments');
	}

	var key;
	var temporary = {};

	for (var oldKey in rO) {
		var newKey = rO[oldKey];

		if (!this.hasOwnProperty(oldKey)) {
			throw new ReferenceError('ObjectTome.rename - Key is not defined: ' + oldKey);
		}

		this[oldKey].__key__ = newKey;
		temporary[newKey] = this[oldKey];

		delete this[oldKey];
		emitDel(this, oldKey);
	}

	for (key in temporary) {
		this[key] = temporary[key];
		emitAdd(this, key);
	}

	diff(this, 'rename', rO);

	return this;
};

ObjectTome.prototype.valueOf = function () {
	if (!this.__hidden__) {
		return this;
	}
};

ObjectTome.prototype.toJSON = function () {
	if (!this.__hidden__) {
		return this;
	}
};


//   ______     __                __
//  /      \   |  \              |  \
// |  $$$$$$\ _| $$_     ______   \$$ _______    ______
// | $$___\$$|   $$ \   /      \ |  \|       \  /      \
//  \$$    \  \$$$$$$  |  $$$$$$\| $$| $$$$$$$\|  $$$$$$\
//  _\$$$$$$\  | $$ __ | $$   \$$| $$| $$  | $$| $$  | $$
// |  \__| $$  | $$|  \| $$      | $$| $$  | $$| $$__| $$
//  \$$    $$   \$$  $$| $$      | $$| $$  | $$ \$$    $$
//   \$$$$$$     \$$$$  \$$       \$$ \$$   \$$ _\$$$$$$$
//                                             |  \__| $$
//                                              \$$    $$
//                                               \$$$$$$


exports.StringTome = StringTome;

inherits(StringTome, Tome);

StringTome.isStringTome = function (o) {
	return o instanceof StringTome;
};

StringTome.prototype.toString = function () {
	return this._val;
};

StringTome.prototype.typeOf = function () {
	return 'string';
};

StringTome.prototype.valueOf = function () {
	if (!this.__hidden__) {
		return this._val;
	}
};

StringTome.prototype.toJSON = function () {
	if (!this.__hidden__) {
		return this._val;
	}
};


//  __    __                  __             ______   __                            __
// |  \  |  \                |  \           /      \ |  \                          |  \
// | $$  | $$ _______    ____| $$  ______  |  $$$$$$\ \$$ _______    ______    ____| $$
// | $$  | $$|       \  /      $$ /      \ | $$_  \$$|  \|       \  /      \  /      $$
// | $$  | $$| $$$$$$$\|  $$$$$$$|  $$$$$$\| $$ \    | $$| $$$$$$$\|  $$$$$$\|  $$$$$$$
// | $$  | $$| $$  | $$| $$  | $$| $$    $$| $$$$    | $$| $$  | $$| $$    $$| $$  | $$
// | $$__/ $$| $$  | $$| $$__| $$| $$$$$$$$| $$      | $$| $$  | $$| $$$$$$$$| $$__| $$
//  \$$    $$| $$  | $$ \$$    $$ \$$     \| $$      | $$| $$  | $$ \$$     \ \$$    $$
//   \$$$$$$  \$$   \$$  \$$$$$$$  \$$$$$$$ \$$       \$$ \$$   \$$  \$$$$$$$  \$$$$$$$


exports.UndefinedTome = UndefinedTome;

inherits(UndefinedTome, Tome);

UndefinedTome.isUndefinedTome = function (o) {
	return o instanceof UndefinedTome;
};

UndefinedTome.prototype.valueOf = function () {
	return undefined;
};

UndefinedTome.prototype.typeOf = function () {
	return 'undefined';
};

UndefinedTome.prototype.toJSON = function () {

	// When you JSON.stringify an array with elements that have undefined
	// values, they stringify as 'null' so we do the same thing here to match
	// the behavior of JavaScript. That is the sole reason for UndefinedTome's
	// existence.

	if (!this.__hidden__) {
		return null;
	}
};

var classMap = {
	"array": Array,
	"boolean": Boolean,
	"number": Number,
	"string": String
};

function inheritClassMethods() {
	for (var ck in classMap) {

		// Here we inherit all of the methods from javascript classes. This works
		// because we provide a valueOf method on our Tomes.

		var c = classMap[ck]; // class
		var t = tomeMap[ck]; // tome

		var methods = Object.getOwnPropertyNames(c.prototype);
		var len = methods.length;

		for (var i = 0; i < len; i += 1) {
			var k = methods[i];
			if (!t.prototype.hasOwnProperty(k)) {
				t.prototype[k] = c.prototype[k];
			}
		}
	}
}

inheritClassMethods();
