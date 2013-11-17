var tomes = require('../..');

var Tome = tomes.Tome,
	ArrayTome = tomes.ArrayTome,
	BooleanTome = tomes.BooleanTome,
	NumberTome = tomes.NumberTome,
	ObjectTome = tomes.ObjectTome,
	StringTome = tomes.StringTome,
	NullTome = tomes.NullTome,
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

exports.testNullCreation = function (test) {
	test.expect(10);
	var a = null;
	var b = Tome.conjure(a);
	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(instanceOf(b, Tome)); // 3
	test.ok(notInstanceOf(b, ArrayTome)); // 4
	test.ok(notInstanceOf(b, BooleanTome)); // 5
	test.ok(instanceOf(b, NullTome)); // 6
	test.ok(notInstanceOf(b, NumberTome)); // 7
	test.ok(notInstanceOf(b, ObjectTome)); // 8
	test.ok(notInstanceOf(b, StringTome)); // 9
	test.ok(notInstanceOf(b, UndefinedTome)); // 10

	test.done();
};

exports.testNullReadable = function (test) {
	test.expect(0);

	var a = null;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});

	test.done();
};

exports.testNullAssign = function (test) {
	test.expect(10);

	var a = null;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b.valueOf()); // 3, 7
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = 'orange';
	b.assign('orange');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(instanceOf(b, StringTome)); // 5
	test.strictEqual(typeof a, b.typeOf()); // 6

	a = null;
	b.assign(null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 8
	test.ok(instanceOf(b, NullTome)); // 9
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); // 10

	test.done();
};

exports.testNullSet = function (test) {
	test.expect(11);

	var a = null;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3, 8
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = { d: null };
	b.set('d', null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(notInstanceOf(b, NullTome)); // 5
	test.ok(instanceOf(b, ObjectTome)); // 6
	test.ok(instanceOf(b.d, NullTome)); // 7

	a = null;
	b.assign(null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.ok(instanceOf(b, NullTome)); // 10
	test.ok(notInstanceOf(b.d, NullTome)); // 11

	test.done();
};

exports.testNullDestroy = function (test) {
	test.expect(2);

	var a = { d: null};
	var b = Tome.conjure(a);

	b.d.on('destroy', function () {
		test.ok(true); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = null;
	b.assign(null);

	test.done();
};

exports.testNullDelete = function (test) {
	test.expect(2);

	var a = { d: null};
	var b = Tome.conjure(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = null;
	b.assign(null);

	test.done();
};

exports.testNullArrayRepeatSet = function (test) {
	test.expect(5);

	var readableCount = 0;

	var a = [ 0 ];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a[0] = null;
	b.set('0', null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 3

	test.strictEqual(readableCount, 1); // 4

	// This should do nothing, we are not changing the value.

	a[0] = null;
	b.set('0', null);

	test.strictEqual(readableCount, 1); // 5

	test.done();
};

exports.testNullArrayRepeatAssign = function (test) {
	test.expect(5);

	var readableCount = 0;

	var a = [ 0 ];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a[0] = null;
	b[0].assign(null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 3

	test.strictEqual(readableCount, 1); // 4

	// This should do nothing, we are not changing the value.

	a[0] = null;
	b[0].assign(null);

	test.strictEqual(readableCount, 1); // 5

	test.done();
};

exports.testNullIs = function (test) {
	test.expect(2);

	var a = null;
	var b = Tome.conjure(a);

	test.ok(b.is(a));

	a = undefined;
	test.ok(!b.is(a));

	test.done();
};
