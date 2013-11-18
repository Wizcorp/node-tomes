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

exports.testBooleanCreation = function (test) {
	test.expect(10);
	var a = true;
	var b = Tome.conjure(a);
	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(instanceOf(b, Tome)); // 3
	test.ok(notInstanceOf(b, ArrayTome)); // 4
	test.ok(instanceOf(b, BooleanTome)); // 5
	test.ok(notInstanceOf(b, NullTome)); // 6
	test.ok(notInstanceOf(b, NumberTome)); // 7
	test.ok(notInstanceOf(b, ObjectTome)); // 8
	test.ok(notInstanceOf(b, StringTome)); // 9
	test.ok(notInstanceOf(b, UndefinedTome)); // 10

	test.done();
};

exports.testBooleanReadable = function (test) {
	test.expect(2);

	var a = true;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b); // This should not happen.
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	test.done();
};


exports.testBooleanAssign = function (test) {
	test.expect(5);

	var a = true;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b); // 3
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = false;
	b.assign(false);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(instanceOf(b, BooleanTome)); // 5

	test.done();
};

exports.testBooleanSet = function (test) {
	test.expect(12);

	var a = true;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3, 4, 8
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = { d: true };
	b.set('d', true);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(notInstanceOf(b, BooleanTome)); // 5
	test.ok(instanceOf(b, ObjectTome)); // 6
	test.ok(instanceOf(b.d, BooleanTome)); // 7

	a = false;
	b.assign(false);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.ok(instanceOf(b, BooleanTome)); // 10
	test.ok(notInstanceOf(b, ObjectTome)); // 11
	test.ok(notInstanceOf(b.d, BooleanTome)); // 12

	test.done();
};

exports.testBooleanToString = function (test) {
	test.expect(1);

	var a = true;
	var b = Tome.conjure(a);

	test.strictEqual(a.toString(), b.toString()); // 1

	test.done();
};

exports.testBooleanValueOf = function (test) {
	test.expect(1);

	var a = false;
	var b = Tome.conjure(a);

	test.strictEqual(a.valueOf(), b.valueOf()); // 1

	test.done();
};

exports.testBooleanDestroy = function (test) {
	test.expect(2);

	var a = { d: true };
	var b = Tome.conjure(a);

	b.d.on('destroy', function () {
		test.ok(true); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = false;
	b.assign(false);

	test.done();
};

exports.testBooleanDelete = function (test) {
	test.expect(2);

	var a = { d: true };
	var b = Tome.conjure(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = false;
	b.assign(false);

	test.done();
};

exports.testBooleanAndOr = function (test) {
	test.expect(1);

	var a = true;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = a || false;
	b.assign(b || false); // true or false = true so no update.

	a = a && false;
	b.assign(b && false); // true and false = false so update.

	test.done();
};

exports.testBooleanIs = function (test) {
	test.expect(5);

	var a = true;
	var b = Tome.conjure(a);

	test.ok(b.is(a));

	a = false;
	b.assign(a);

	test.ok(b.is(a));

	a = true;

	test.ok(!b.is(a));

	b.assign(true);

	test.ok(b.is());

	b.assign(false);

	test.ok(!b.is());

	test.done();
};

exports.testBooleanWas = function (test) {
	test.expect(3);

	var a = true;
	var b = Tome.conjure(a);

	b.on('readable', function (was) {
		test.strictEqual(was, a);
	});

	b.assign(false);
	a = false;

	test.ok(b.is(a));

	b.assign(true);

	test.done();
};