var EventEmitter = require('events') ? require('events').EventEmitter : EventEmitter;
var inherits = require('util') ? require('util').inherits : inherits;


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

	// The Tome type holds references and methods that all 'real' types inherit.
	// We should never get an object that is just a Tome, it should always be
	// at least one other type ie. a NumberTome is a ScalarTome and a Tome. We
	// call this function in the constructor of each Tome type.

	// __parent__ holds a reference to the Tome's parent object so we can signal
	// up the Tome chain.

	// __batch__ is our indicator that we will only emit signal events once we
	// are finished with all our changes. We set this to true in the startBatch
	// method and then set it to false in the endBatch method which follows it
	// up with calling the notify method that signals all changed Tomes.

	if (parent instanceof Tome) {
		Object.defineProperty(this, '__parent__', { writable: true, value: parent });
	} else {
		Object.defineProperty(this, '__batch__', { writable: true, value: false });
	}

	if (key !== undefined) {
		Object.defineProperty(this, '__key__', { writable: true, value: key });
	}

	// __root__ holds a reference to the Tome at the top of the chain. We use it
	// to batch signals when we perform operations that would cause a Tome to
	// signal multiple times, ie. consuming diffs.

	Object.defineProperty(this, '__root__', { value: parent instanceof Tome ? parent.__root__ : this });

	// __signal__ is our indicator that while we are in batch mode this object
	// had changes and needs to emit signal events once we are finished with
	// all our changes. This gets set to true in the signal method and set to
	// false in the notify method once we emit the signal event.

	Object.defineProperty(this, '__signal__', { writable: true, value: false });

	// If you're using the node.js event emitter, we need to make the _events
	// non-enumerable. Ideally, node.js would make this the default behavior.

	Object.defineProperty(this, '_events', { configurable: true, writable: true });

	// When we add a signal listener, we emit once with the current value. This
	// is helpful when setting up UI components. We shouldn't have to create
	// separate logic for initial values and value changes.

	this.on('newListener', function (eventName, listener) {
		if (eventName === 'signal') {
			listener.call(this, this.valueOf());
		}
	});
}

function ArrayTome(arr, parent, key) {
	Tome.call(this, parent, key);
	Object.defineProperty(this, '_arr', { configurable: true, writable: true });
	Object.defineProperty(this, 'length', { configurable: true, writable: true });

	var len = arr.length;
	
	this._arr = new Array(len);

	for (var i = 0; i < len; i += 1) {
		this._arr[i] = Tome.scribe(arr[i], this, i);
		if (arr.hasOwnProperty(i)) {
			this[i] = this._arr[i];
		}
	}
	this.length = len;
}

function ObjectTome(val, parent, key) {
	Tome.call(this, parent, key);

	for (var k in val) {
		if (val.hasOwnProperty(k)) {
			var kv = val[k];
			if (kv === undefined) {
				this[k] = undefined;
			} else {
				this[k] = Tome.scribe(kv, this, k);
			}
		}
	}
}

function ScalarTome(val, parent, key) {
	Tome.call(this, parent, key);
	Object.defineProperty(this, '_val', { configurable: true, writable: true });

	this._val = val.valueOf();
}

function BooleanTome() {
	ScalarTome.apply(this, arguments);
}

function NullTome() {
	Tome.apply(this, arguments);
}

function NumberTome() {
	ScalarTome.apply(this, arguments);
}

function StringTome() {
	ScalarTome.apply(this, arguments);
}

function UndefinedTome() {
	Tome.apply(this, arguments);
}



Tome.prototype.constructor = Tome;

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
//             Tome whose property was deleted and does not traverse up the Tome
//             chain. A del event is always accompanied by a signal event that
//             does traverse up the Tome chain. Additionally, the Tome that was
//             deleted and all of it's children will also emit a destroy event.
//
//  - destroy: Emitted when a Tome is destroyed. We use this to tell all
//             interested parties that the Tome no longer exists and will not
//             emit any more events.
//
//  -  signal: Emitted when a Tome is modified. This is our bread and butter
//             event. A signal is emitted by a Tome when it or any of its child
//             Tomes change. It is also emitted when we register an event
//             listener for the signal event. When an operation occurs that
//             changes multiple children of a Tome, we only emit signal once.

exports.Tome = Tome;

Tome.isTome = function (o) {
	return o instanceof Tome;
};

Tome.typeOf = function (v) {

	// We use this function to identify a value's data type. We pay special
	// attention to array and null as JavaScript currently considers these
	// objects. This also works on Tomes.

	var t = Array.isArray(v) ? 'array' : typeof v;
	t = v === null ? 'null' : t;
	if (v instanceof Tome) {
		t = v.typeOf();
	}
	return t;
};

Tome.scribe = function (val, parent, key) {

	// We instantiate a new Tome object by using the Tome.scribe method.
	// It will return a new Tome of the appropriate type for our value with Tome
	// inherited. This is also how we pass parent into our Tome so we can signal
	// a parent that its child has been modified.

	var vType = Tome.typeOf(val);

	switch (vType) {
	case 'array':
		return new ArrayTome(val, parent, key);
	case 'boolean':
		return new BooleanTome(val, parent, key);
	case 'null':
		return new NullTome(parent, key);
	case 'number':
		return new NumberTome(val, parent, key);
	case 'string':
		return new StringTome(val, parent, key);
	case 'object':
		return new ObjectTome(val, parent, key);
	case 'undefined':

		// UndefinedTomes only exist in the context of Arrays because they JSON
		// stringify to null when in arrays.

		if (Tome.typeOf(parent) === 'array') {
			return new UndefinedTome(parent, key);
		}
		return;
	default:

		// If the value's type is not supported, complain loudly.

		throw new TypeError('Tome.scribe - Invalid value type: ' + vType);
	}
};

Tome.prototype.set = function (key, val) {

	// We use this to set a property on a Tome to the specified value. This can
	// either be a new property in which case we'd emit add and signal, or we
	// assign a new value to an existing value, destroying the old value.

	// If we try to assign an undefined value to a property, it will only have
	// an effect on ObjectTomes, otherwise it will do nothing.

	if (Tome.typeOf(val) === 'undefined') {
		if (this instanceof ObjectTome) {
			this[key] = undefined;
			this.signal();
		}
		return undefined;
	}

	if (!(this instanceof ObjectTome)) {

		// Only ObjectTomes can have properties, therefore we reset the Tome to
		// the Tome type and then turn it into an ObjectTome. ArrayTome has its
		// own set method which falls through to this one if the key is not a
		// number.

		this.reset();
		this.__proto__ = ObjectTome.prototype;
	}

	if (!this.hasOwnProperty(key)) {

		// This is a new property, we scribe a new Tome with a type based on the
		// type of the value and assign it to the property. Then we emit an add
		// event followed by a signal which goes up the Tome chain.

		this[key] = Tome.scribe(val, this, key);
		this.emitAdd(key, this[key].valueOf());
		var diff = {};
		diff[key] = val;
		this.diff('set', diff);
		this[key].signal();

		// We've already assigned the value to the property so we return this.

		return this.valueOf();
	}

	var p = this[key];

	if (p === undefined) {

		// This property exists, but has undefined as its value. We need to
		// scribe a Tome to assign a value to it.

		this[key] = Tome.scribe(val, this, key);
		this[key].signal();

		// We've already assigned the value to the property so we return this.

		return this[key].valueOf();
	}

	if (!(p instanceof Tome)) {

		// If this key is not a Tome, complain loudly.

		throw new TypeError('Tome.set - Key is not a Tome: ' + key);
	}

	// And finally, assign the value to the property. This will make sure the
	// property is the correct type for the value and emit the signal event.

	p.assign(val);
	return this[key].valueOf();
};

Tome.prototype.assign = function (val) {

	// This is where the magic happens.

	// First we need to get the type of the value and the type of the Tome to
	// ensure we match the Tome type to the value type.

	var vType = Tome.typeOf(val);
	var pType = this.typeOf();

	if (vType === pType && this instanceof ScalarTome) {

		// The simplest case is scalar types: boolean, number, and string. If
		// we already have the correct Tome type we assign the value, signal,
		// and return our new value.

		this._val = val.valueOf();
		this.signal();
		this.diff('assign', val.valueOf());
		return this.valueOf();
	}

	// We reset the Tome type back to the base Tome to ensure we're clean.

	this.reset();

	// Now we need to apply a new Tome type based on the value type.

	var len, i, k;

	switch (vType) {
	case 'array':

		// An ArrayTome has two non-enumerable properties:
		//  -   _arr: Holds the actual array that we reference.
		//  - length: Holds the length of the array in _arr.

		this.__proto__ = ArrayTome.prototype;

		Object.defineProperty(this, '_arr', { configurable: true, writable: true });
		Object.defineProperty(this, 'length', { configurable: true, writable: true });

		// val is an array so we take its length and instantiate a new array of
		// the appropriate size in _arr. We already know the length so we
		// assign that as well.

		len = val.length;
		this._arr = new Array(len);
		this.length = len;

		// We go through each element in val and scribe a new Tome based on that
		// value with a reference to this as its parent. We also assign
		// properties with references to those new array elements. We need this
		// so we can do things like myTome[3].on('signal', function () {});

		// One additional special case that bears mentioning here is when an
		// array element has undefined as its value. When that element goes
		// through JSON.stringify it turns into null. We handle that by having
		// an UndefinedTome type and making its toJSON method return null. Also,
		// that element does not show up in hasOwnProperty, so we do not assign
		// a property for that element.

		for (i = 0; i < len; i += 1) {
			this._arr[i] = Tome.scribe(val[i], this, i);
			
			// We use hasOwnProperty here because arrays instantiated with new
			// have elements, but no keys ie. new Array(1) is different from
			// [undefined].

			if (val.hasOwnProperty(i)) {
				this[i] = this._arr[i];
			}
		}

		for (i = 0; i < len; i += 1) {

			// We want to emit add after the values have all been assigned.
			// Otherwise, we would have unassigned values in the array.
			// Additionally, we always emit the value from the array since
			// the key may not exist.
		
			this.emitAdd(i, this._arr[i].valueOf());
		}

		break;

	case 'boolean':
		
		// A BooleanTome is a ScalarTome type that holds a boolean value. It has
		// one non-enumerable property:
		//  - _val: Holds the actual value that we reference.

		this.__proto__ = BooleanTome.prototype;

		Object.defineProperty(this, '_val', { configurable: true, writable: true });

		// We use valueOf() because it is a common method between Tomes and
		// standard javascript objects. This way we can assign Tomes to Tomes and
		// still get the same behavior as javascript objects.

		this._val = val.valueOf();

		break;

	case 'null':

		// A NullTome holds a null value. It has no non-enumerable properties.

		this.__proto__ = NullTome.prototype;
		
		break;

	case 'number':

		// A NumberTome is a ScalarTome type that holds a number value. It has
		// one non-enumerable property:
		//  - _val: Holds the actual value that we reference.

		this.__proto__ = NumberTome.prototype;

		Object.defineProperty(this, '_val', { configurable: true, writable: true });

		// We use valueOf() because it is a common method between Tomes and
		// standard javascript objects. This way we can assign Tomes to Tomes and
		// still get the same behavior as javascript objects.

		this._val = val.valueOf();

		break;

	case 'object':

		// An ObjectTome is a Tome that holds other Tomes. It has no
		// non-enumerable properties. Every property of an ObjectTome is an
		// instance of another Tome.

		this.__proto__ = ObjectTome.prototype;

		// There is one special case we need to handle with the ObjectTome type
		// and that is when the value of a property is undefined. To match
		// javascript's behavior we assign undefined directly to the property
		// instead of creating an UndefinedTome since when you JSON.stringify an
		// object with a property that has undefined as its value, it will
		// leave that property out. This is different behavior from arrays
		// which will stringify undefined elements to null.

		var added = Object.keys(val);
		len = added.length;

		for (i = 0; i < len; i += 1) {
			k = added[i];
			var kv = val[k];
			if (kv === undefined) {
				this[k] = undefined;
			} else {
				this[k] = Tome.scribe(kv, this, k);
			}
		}

		// Just like with arrays, we only want to emit add after we are done
		// assigning values. We use Object.keys to get an array of all the
		// properties we are going to assign then we can use it again to do the
		// emission of adds.

		for (i = 0; i < len; i += 1) {
			k = added[i];
			this.emitAdd(k, this[k].valueOf());
		}

		break;

	case 'string':

		// A NumberTome is a ScalarTome type that holds a string value. It has
		// one non-enumerable property:
		//  - _val: Holds the actual value that we reference.

		this.__proto__ = StringTome.prototype;

		Object.defineProperty(this, '_val', { configurable: true, writable: true });
		
		this._val = val.valueOf();
		
		break;

	case 'undefined':

		// An UndefinedTome is a Tome type that holds an undefined value. We use
		// this in arrays since javascript's behavior when using JSON.stringify
		// is to return null. We accomplish this by making the toJSON method on
		// UndefinedTomes return null, therefore it can only be assigned to
		// elements of ArrayTomes.

		if (!this.hasOwnProperty('__parent__') || this.__parent__.typeOf() !== 'array') {
			throw new TypeError('Tome.assign - You can only assign undefined to ArrayTome elements');
		}

		this.__proto__ = UndefinedTome.prototype;
		break;
	default:
		throw new TypeError('Tome.assign - Invalid value type: ' + vType);
	}

	this.diff('assign', val);
	this.signal();

	return this.valueOf();
};

Tome.prototype.signal = function () {

	// The signal method emits the signal event on a Tome and traverses up the
	// Tome chain to indicate that the Tome has changed. Generally, we just emit
	// the signal immediately.

	// Every Tome should only emit signal once regardless of how many child Tomes
	// have have changes. To accomplish this we use the startBatch method to
	// set the __batch__ property on the root Tome to true. When in batch mode,
	// instead of emitting immediately we set __signal__ to true to indicate
	// that this Tome has changed and needs to emit signal.

	// When we are done making changes we use the endBatch method which sets
	// the __batch__ property on the root Tome to false and calls the notify
	// method which starts at the root Tome and emits signal from all Tomes that
	// have __signal__ true on them, then goes further down the Tome tree until
	// it runs out of Tomes to emit signal from.

	if (!this.__root__.__batch__) {
		this.emit('signal', this.valueOf());
	} else if (!this.__signal__) {
		this.__signal__ = true;
	}

	// Now we go up the Tome tree and signal from the parent that the Object has
	// changed.

	if (this.hasOwnProperty('__parent__') && this.__parent__ instanceof Tome) {
		this.__parent__.signal();
	}
};

Tome.prototype.notify = function () {

	// The notify method is called on the root Tome by endBatch to emit signal
	// on all Tomes that need to. We know a Tome needs to emit signal because its
	// __signal__ property was set to true by the signal method.

	if (!this.__signal__) {
		return;
	}

	this.__signal__ = false;
	this.emit('signal', this.valueOf());

	// Since our Tomes inherit from multiple prototypes, they have a large
	// number of properties. We use Object.keys to only get its own enumerable
	// properties, this is much faster than using for ... in which would
	// iterate over all properties in the prototype chain.

	var keys = Object.keys(this);
	for (var i = 0, len = keys.length; i < len; i += 1) {
		var k = keys[i];
		if (this[k].__signal__) {
			this[k].notify();
		}
	}
};

Tome.prototype.startBatch = function () {

	// startBatch enables batch mode for signal emission. We need this so that
	// we only emit signal once per object even if there were multiple changes
	// on its child Tomes. Whenever you call startBatch, you must call endBatch
	// to perform signal emission.

	this.__root__.__batch__ = true;
};

Tome.prototype.endBatch = function () {

	// endBatch disables batch mode for signal emission and calls the notify
	// method to trigger signal emission on all child Tomes that need to signal.

	this.__root__.__batch__ = false;
	this.__root__.notify();
};

Tome.prototype.destroy = function () {

	// When a Tome is deleted we emit a destroy event on it and all of its child
	// Tomes since they will no longer exist. We go down the Tome chain first and
	// then emit our way up.

	for (var key in this) {
		if (this.hasOwnProperty(key) && this[key] instanceof Tome) {
			this[key].destroy();
		}
	}
	this.emit('destroy');
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

	if (!this[key] instanceof Tome) {
		throw new TypeError('Tome.del - Key is not a Tome: ' + key);
	}

	var o = this[key];

	delete this[key];

	o.destroy();

	this.emitDel(key);

	this.signal();
};

Tome.prototype.reset = function () {

	// The reset method deletes all properties on a Tome and turns it back into
	// a base Tome with no real type. We should immediately assign it a new type
	// based on the value.

	delete this._arr;
	delete this.length;
	delete this._val;

	var keys = Object.keys(this);
	var len = keys.length;
	var key, i, o;

	// Here we delete all of the properties and emit destroy on all of their
	// child Tomes. For destroy we don't really care about the order of events.
	// All that matters is that a Tome got destroyed.

	for (i = 0; i < len; i += 1) {
		key = keys[i];
		if (this[key] instanceof Tome) {
			o = this[key];
			delete this[key];
			o.destroy();
		}
	}

	// Once we have deleted all of the properties we emit del for each of the
	// deleted properties. We use this order so that when we emit del the
	// properties have already been deleted.

	for (i = 0; i < len; i += 1) {
		key = keys[i];
		this.emitDel(key);
	}
};

Tome.prototype.toJSON = function () {

	// The toJSON method is automatically used by JSON.stringify to turn a Tome
	// into a string. All Tome types except for the UndefinedTome type use
	// valueOf when they are stringified. UndefinedTome has its own toJSON
	// method that returns null, this is because undefined elements in arrays
	// stringify to null.

	return this.valueOf();
};

Tome.prototype.emitDel = function (key) {
	this.emit('del', key);
	if (this.typeOf() !== 'array') {
		this.diff('del', key);
	}
};

Tome.prototype.emitAdd = function (key, val) {
	this.emit('add', key, val);
	// if (this.typeOf() !== 'array') {
		// this.diff('add', val, key);
	// }
};

Tome.prototype.diff = function (op, val, diff) {
	if (diff === undefined) {
		diff = {};
		diff[op] = val;
	}
	
	// If our diff object is empty, we are at the bottom of the chain and we
	// need to build up.

	var bigger = {};
	if (this.hasOwnProperty('__key__')) {
		bigger['_' + this.__key__] = diff;
	} else {
		bigger = diff;
	}

	this.emit('diff', bigger);

	if (this.__parent__ instanceof Tome) {
		this.__parent__.diff(op, val, bigger);
	}
};

Tome.prototype.batch = function (JSONDiff) {

	// The batch method takes an object and assigns new values to the Tome based
	// on the object. It enables batch mode through startBatch, applies the new
	// values using the consume method, then calls endBatch to disable batch
	// mode and signal on the Tomes that were changed.

	this.startBatch();
	if (Tome.typeOf(JSONDiff) === 'array') {
		for (var i = 0, len = JSONDiff.length; i < len; i += 1) {
			this.consume(JSONDiff[i]);
		}
	} else {
		this.consume(JSONDiff);
	}
	this.endBatch();
};

Tome.prototype.consume = function (JSONDiff) {
	for (var key in JSONDiff) {
		var val = JSONDiff[key];
		switch (key) {
		case 'set':
			for (var k in val) {
				this.set(k, val[k]);
			}
			break;
		case 'assign':
			this.assign(val);
			break;
		case 'inc':
			this.inc(val);
			break;
		case 'pop':
			for (var i = 0; i < val; i += 1) {
				this.pop();
			}
			break;
		case 'push':
			this.push(val);
			break;
		case 'del':
			this.del(val);
			break;
		default:
			if (key.indexOf('_') === 0) {
				var unfd = key.substring(1);
				if (this.hasOwnProperty(unfd)) {
					this[unfd].consume(val);
				} else {
					throw new ReferenceError('Tome.consume - key is not defined: ' + unfd);
				}
			} else {
				console.log('unhandled op:', key);
			}
		}
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


ArrayTome.prototype.constructor = ArrayTome;

inherits(ArrayTome, Tome);

exports.ArrayTome = ArrayTome;

ArrayTome.isArrayTome = function (o) {
	return o instanceof ArrayTome;
};

ArrayTome.prototype.valueOf = function () {
	return this._arr ? this._arr : [];
};

ArrayTome.prototype.typeOf = function () {
	return 'array';
};

ArrayTome.prototype.join = function (separator) {
	var out = '';
	if (!this._arr.length) {
		return out;
	}

	if (separator === undefined) {
		separator = ',';
	}

	out += this._arr[0];

	for (var i = 1, len = this._arr.length; i < len; i += 1) {
		out += separator;
		var e = this._arr[i];
		if (e.typeOf() !== 'null' && e.typeOf() !== 'undefined') {
			out += this._arr[i].toString();
		}
	}

	return out;
};

ArrayTome.prototype.toString = function () {
	return this.join();
};

ArrayTome.prototype.set = function (key, val) {
	if (parseInt(key, 10) !== key) {
		Tome.prototype.set.apply(this, arguments);
		return;
	}

	if (key < 0) {
		return;
	}

	if (key >= this._arr.length) {
		var len = this._arr.length;

		this._arr[key] = Tome.scribe(val, this, key);
		this[key] = this._arr[key];
		this.length = this._arr.length;
		this.emitAdd(key, this._arr[key].valueOf());

		for (var i = len, newlen = this._arr.length - 1; i < newlen; i += 1) {
			this._arr[i] = Tome.scribe(undefined, this, i);
			this.length = this._arr.length;
			this.emitAdd(i, this._arr[i].valueOf());
		}

		this.signal();
	} else {
		if (this[key] instanceof Tome) {
			this[key].assign(val);
		}
	}
	return this._arr[key].valueOf();
};

ArrayTome.prototype.del = function (key) {
	if (!this.hasOwnProperty(key)) {
		throw new ReferenceError('ArrayTome.del - Key is not defined: ' + key);
	}

	if (!this[key] instanceof Tome) {
		throw new TypeError('ArrayTome.del - Key is not a Tome: ' + key);
	}

	this._arr[key] = Tome.scribe(undefined, this, key);
	this[key] = this._arr[key];

	this.emitDel(key);

	this.signal();
};

ArrayTome.prototype.shift = function () {
	var out = this._arr.shift();
	var key = 0;
	var o = this[key];

	if (o instanceof Tome) {
		delete this[key];

		for (var i = 0, len = this._arr.length; i < len; i += 1) {
			this[i] = this._arr[i];
		}

		delete this[len];

		this.length = this._arr.length;
		o.destroy();
		this.emitDel(key);
		this.signal();
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
			o.destroy();
		}

		this.emitDel(len);
		this.diff('pop', 1);
		this.signal();
	}

	return out ? out.valueOf() : out;
};

ArrayTome.prototype.push = function () {
	var length = this._arr.length;

	if (arguments.length) {
		for (var i = 0, len = arguments.length; i < len; i += 1) {
			var k = length + i;
			this._arr.push(Tome.scribe(arguments[i], this, k));
			this[k] = this._arr[k];
			this.length = this._arr.length;
			this.emitAdd(k, this[k].valueOf());
			this.diff('push', this[k].valueOf());
		}

		this.signal();
	}

	return this.length;
};

ArrayTome.prototype.reverse = function () {
	this._arr.reverse();

	for (var i = 0, len = this._arr.length; i < len; i += 1) {
		this[i] = this._arr[i];
	}

	this.signal();

	return this;
};

ArrayTome.prototype.splice = function (spliceIndex, toRemove) {
	spliceIndex = spliceIndex >= 0 ? Math.min(spliceIndex, this._arr.length) : Math.max(this._arr.length + spliceIndex, 0);
	var toAdd = [];

	var i, len, key;

	for (i = 2, len = arguments.length; i < len; i += 1) {
		toAdd.push(arguments[i]);
	}

	var out = this._arr.splice(spliceIndex, toRemove);

	for (i = 0, len = out.length; i < len; i += 1) {
		key = spliceIndex + i;
		var o = this[key];
		delete this[key];
		this.length = this._arr.length;
		this.emitDel(key);
		if (o instanceof Tome) {
			o.destroy();
		}
	}

	for (i = 0, len = toAdd.length; i < len; i += 1) {
		key = spliceIndex + i;
		this._arr.splice(key, 0, Tome.scribe(toAdd[i], this, key));
		this[key] = this._arr[key];
		this.length = this._arr.length;
		this.emitAdd(key, this[key].valueOf());
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
		this.signal();
	}

	return out;
};

ArrayTome.prototype.sort = function () {
	this._arr.sort.apply(this._arr, arguments);

	for (var i = 0, len = this._arr.length; i < len; i += 1) {
		this[i] = this._arr[i];
	}

	this.signal();

	return this;
};

ArrayTome.prototype.unshift = function () {
	if (arguments.length) {
		var i, len;

		for (i = arguments.length - 1; i >= 0; i -= 1) {
			this._arr.unshift(Tome.scribe(arguments[i], this, i));
		}

		for (i = 0, len = this._arr.length; i < len; i += 1) {
			this[i] = this._arr[i];
		}

		for (i = 0, len = arguments.length; i < len; i += 1) {
			this.length = this._arr.length;
			this.emitAdd(i, this[i].valueOf());
		}

		this.signal();
	}

	return this._arr.length;
};

ArrayTome.prototype.indexOf = function (searchElement) {
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
	var t = this._arr;
	var len = t.length;
	if (len === 0) {
		return -1;
	}
	var n = len;
	if (arguments.length > 1) {
		n = Number(arguments[1]);
		if (n !== n) {
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
	var out = Tome.scribe([]);
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
					out._arr.push(Tome.scribe(newVal[j]));
					out[len] = out._arr[len];
					len += 1;
				}
			} else {
				out._arr.push(Tome.scribe(newVal));
				out[len] = out._arr[len];
				len += 1;
			}
		}
	}

	out.length = len;

	return out;
};

ArrayTome.prototype.slice = function () {
	return this._arr.slice.apply(this._arr, arguments);
};

ArrayTome.prototype.map = function () {
	return this._arr.map.apply(this._arr, arguments);
};

ArrayTome.prototype.reduce = function () {
	return this._arr.reduce.apply(this._arr, arguments);
};

ArrayTome.prototype.reduceRight = function () {
	return this._arr.reduceRight.apply(this._arr, arguments);
};

ArrayTome.prototype.filter = function () {
	return this._arr.filter.apply(this._arr, arguments);
};

ArrayTome.prototype.some = function () {
	return this._arr.some.apply(this._arr, arguments);
};

ArrayTome.prototype.every = function () {
	return this._arr.every.apply(this._arr, arguments);
};

ArrayTome.prototype.forEach = function () {
	return this._arr.forEach.apply(this._arr, arguments);
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


ObjectTome.prototype.constructor = ObjectTome;

inherits(ObjectTome, Tome);

exports.ObjectTome = ObjectTome;

ObjectTome.isObjectTome = function (o) {
	return o instanceof ObjectTome;
};

ObjectTome.prototype.typeOf = function () {
	return 'object';
};


//   ______                      __
//  /      \                    |  \
// |  $$$$$$\  _______  ______  | $$  ______    ______
// | $$___\$$ /       \|      \ | $$ |      \  /      \
//  \$$    \ |  $$$$$$$ \$$$$$$\| $$  \$$$$$$\|  $$$$$$\
//  _\$$$$$$\| $$      /      $$| $$ /      $$| $$   \$$
// |  \__| $$| $$_____|  $$$$$$$| $$|  $$$$$$$| $$
//  \$$    $$ \$$     \\$$    $$| $$ \$$    $$| $$
//   \$$$$$$   \$$$$$$$ \$$$$$$$ \$$  \$$$$$$$ \$$


ScalarTome.prototype.constructor = ScalarTome;

inherits(ScalarTome, Tome);

exports.ScalarTome = ScalarTome;

ScalarTome.isScalarTome = function (o) {
	return o instanceof ScalarTome;
};

ScalarTome.prototype.valueOf = function () {
	return this._val;
};

ScalarTome.prototype.typeOf = function () {
	return typeof this._val;
};

ScalarTome.prototype.toString = function () {
	return this._val.toString();
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


BooleanTome.prototype.constructor = BooleanTome;

inherits(BooleanTome, ScalarTome);

exports.BooleanTome = BooleanTome;

BooleanTome.isBooleanTome = function (o) {
	return o instanceof BooleanTome;
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


NumberTome.prototype.constructor = NumberTome;

exports.NumberTome = NumberTome;

NumberTome.isNumberTome = function (o) {
	return o instanceof NumberTome;
};

inherits(NumberTome, ScalarTome);

NumberTome.prototype.inc = function (val) {
	if (typeof val !== 'number') {
		throw new TypeError('You can only increment by a number');
	}

	this._val = this._val + val;
	this.diff('inc', val);
	this.signal();
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


StringTome.prototype.constructor = StringTome;

exports.StringTome = StringTome;

StringTome.isStringTome = function (o) {
	return o instanceof StringTome;
};

inherits(StringTome, ScalarTome);


//  __    __            __  __
// |  \  |  \          |  \|  \
// | $$\ | $$ __    __ | $$| $$
// | $$$\| $$|  \  |  \| $$| $$
// | $$$$\ $$| $$  | $$| $$| $$
// | $$\$$ $$| $$  | $$| $$| $$
// | $$ \$$$$| $$__/ $$| $$| $$
// | $$  \$$$ \$$    $$| $$| $$
//  \$$   \$$  \$$$$$$  \$$ \$$

NullTome.prototype.constructor = NullTome;

exports.NullTome = NullTome;

NullTome.isNullTome = function (o) {
	return o instanceof NullTome;
};

inherits(NullTome, Tome);

NullTome.prototype.valueOf = function () {
	return null;
};

NullTome.prototype.typeOf = function () {

	// Here we make an abrupt departure from pedantically duplicating the
	// behavior of JavaScript. Instead of null being an object, we call it
	// null.

	return 'null';
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


UndefinedTome.prototype.constructor = UndefinedTome;

exports.UndefinedTome = UndefinedTome;

UndefinedTome.isUndefinedTome = function (o) {
	return o instanceof UndefinedTome;
};

inherits(UndefinedTome, Tome);

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

	return null;
};
