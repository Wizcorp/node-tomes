var tomes = require('../..');

var Tome = tomes.Tome,
	ObjectTome = tomes.ObjectTome,
	UndefinedTome = tomes.UndefinedTome;

var instanceOf = function (actual, expected) {
	if (actual instanceof expected) {
		return true;
	}
};

var notInstanceOf = function (actual, expected) {
	if (!(actual instanceof expected)) {
		return true;
	}
};

exports.testUndefinedCreation = function (test) {
	test.expect(1);
	
	test.throws(function () { Tome.conjure(); }, TypeError);
	
	test.done();
};

exports.testUndefinedProperty = function (test) {
	test.expect(5);
	var a = { c: undefined };
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.ok(instanceOf(b, Tome)); // 2
	test.ok(instanceOf(b, ObjectTome)); // 3
	test.strictEqual(a.c, b.c); // 4
	test.ok(notInstanceOf(b.c, UndefinedTome)); // 5
	test.done();
};

exports.testUndefinedArrayElements = function (test) {
	test.expect(2);
	var a = new Array(4);
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 2
	test.done();
};

exports.testUndefinedArrayElements2 = function (test) {
	test.expect(2);
	var a = [ undefined, undefined, undefined, undefined ];
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 2
	test.done();
};


exports.testUndefinedObjectSet = function (test) {
	test.expect(3);
	var a = { c: true };
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	a.c = undefined;
	b.set('c', undefined);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty('c'), b.hasOwnProperty('c')); // 3
	test.done();
};

exports.testUndefinedObjectAssign = function (test) {
	test.expect(1);

	var a = { c: true };
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen
	});

	// You can only assign undefined to array elements.

	a.c = undefined;
	test.throws(function () { b.c.assign(undefined); }, TypeError); // 1

	test.done();
};

exports.testUndefinedStringAssign = function (test) {
	test.expect(1);

	var a = 'a string.';
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen
	});

	// You can only assign undefined to array elements.

	a = undefined;
	test.throws(function () { b.assign(undefined); }, TypeError); // 1

	test.done();
};

exports.testUndefinedStringSet = function (test) {
	test.expect(4);

	var readableCount = 0;

	var a = 'a string.';
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen
	});

	// This does absolutely nothing... a is still a string, b is still a
	// StringTome. We mimic JavaScript's behavior.

	a.c = undefined;
	b.set('c', undefined);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'Expected \'a string.\''); // 1
	test.strictEqual(a.hasOwnProperty('c'), b.hasOwnProperty('c'), 'Expected no property called c'); // 2
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b), 'Expected typeof \'string\''); // 3

	test.strictEqual(readableCount, 0, 'expected readable 0 times.'); // 4

	test.done();
};

exports.testUndefinedArrayRepeatSet = function (test) {
	test.expect(5);

	var readableCount = 0;

	var a = [ 0 ];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a[0] = undefined;
	b.set('0', undefined); // This should cause b to emit readable.

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 3

	test.strictEqual(readableCount, 1); // 4

	// This should do nothing, we are not changing the value.

	a[0] = undefined;
	b.set('0', undefined);

	test.strictEqual(readableCount, 1); // 5

	test.done();
};

exports.testUndefinedArrayRepeatAssign = function (test) {
	test.expect(5);

	var readableCount = 0;

	var a = [ 0 ];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a[0] = undefined;
	b[0].assign(undefined); // This should cause b to emit readable

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 3

	test.strictEqual(readableCount, 1); // 4

	// This should do nothing, we are not changing the value.

	a[0] = undefined;
	b[0].assign(undefined);

	test.strictEqual(readableCount, 1); // 5

	test.done();
};

exports.testUndefinedIs = function (test) {
	test.expect(2);

	var a = [undefined];
	var b = Tome.conjure(a);

	test.ok(b[0].is(a[0]));

	a[0] = false;

	test.ok(!b[0].is(a[0]));

	test.done();
};

