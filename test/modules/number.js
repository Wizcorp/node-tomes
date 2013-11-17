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

exports.testNumberCreation = function (test) {
	test.expect(10);
	var a = -43.75;
	var b = Tome.conjure(a);
	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(instanceOf(b, Tome)); // 3
	test.ok(notInstanceOf(b, ArrayTome)); // 4
	test.ok(notInstanceOf(b, BooleanTome)); // 5
	test.ok(notInstanceOf(b, NullTome)); // 6
	test.ok(instanceOf(b, NumberTome)); // 7
	test.ok(notInstanceOf(b, ObjectTome)); // 8
	test.ok(notInstanceOf(b, StringTome)); // 9
	test.ok(notInstanceOf(b, UndefinedTome)); // 10

	test.done();
};

exports.testNumberReadable = function (test) {
	test.expect(2);

	var a = -43.75;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b); // This should not happen.
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	test.done();
};


exports.testNumberAssign = function (test) {
	test.expect(5);

	var a = -43.75;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b); // 3
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = 3;
	b.assign(3);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(instanceOf(b, NumberTome)); // 5

	test.done();
};

exports.testNumberSet = function (test) {
	test.expect(12);

	var a = -43.74;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3, 8
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = { d: 6600 };
	b.set('d', 6600);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(notInstanceOf(b, NumberTome)); // 5
	test.ok(instanceOf(b, ObjectTome)); // 6
	test.ok(instanceOf(b.d, NumberTome)); // 7

	a = -9.81;
	b.assign(-9.81);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.ok(instanceOf(b, NumberTome)); // 10
	test.ok(notInstanceOf(b, ObjectTome)); // 11
	test.ok(notInstanceOf(b.d, NumberTome)); // 12

	test.done();
};

exports.testNumberToString = function (test) {
	test.expect(1);

	var a = -43.76;
	var b = Tome.conjure(a);

	test.strictEqual(a.toString(), b.toString()); // 1

	test.done();
};

exports.testNumberValueOf = function (test) {
	test.expect(1);

	var a = -9988.33;
	var b = Tome.conjure(a);

	test.strictEqual(a.valueOf(), b.valueOf()); // 1

	test.done();
};

exports.testNumberDestroy = function (test) {
	test.expect(2);

	var a = { d: -44.23 };
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

exports.testNumberDelete = function (test) {
	test.expect(2);

	var a = { d: -88.89876 };
	var b = Tome.conjure(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = 13413;
	b.assign(13413);

	test.done();
};

exports.testNumberInc = function (test) {
	test.expect(2);

	var a = 44;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 2
	});

	a = a + 1;
	b.inc(1);

	a = a - 10;
	b.inc(-10);

	test.done();
};

exports.testNumberOperand = function (test) {
	test.expect(2);

	var a = 10;
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 2
	});

	a = a + 5;
	b.assign(b + 5);

	a = a - 10;
	b.assign(b - 10);

	test.done();
};

exports.testNumberIncChain = function (test) {
	test.expect(2);

	var a = 44;
	var b = Tome.conjure(a);

	a = a + 1 + 2;
	b.inc(1).inc(2);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a = a - 10 - 20;
	b.inc(-10).inc(-20);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testNumberIs = function (test) {
	test.expect(5);

	var a = 1;
	var b = Tome.conjure(a);

	test.ok(b.is(a));

	a = 0;
	b.assign(a);

	test.ok(b.is(a));

	a = 2.57523049;
	b.assign(a);

	test.ok(b.is(a));

	a = 9;
	b.assign(42);

	test.ok(!b.is(a));

	a = NaN;
	b.assign(a);

	test.ok(b.is(a));

	test.done();
};

exports.testNumberWas = function (test) {
	test.expect(4);

	var a = 0;
	var b = Tome.conjure(a);

	b.on('readable', function (was) {
		test.strictEqual(was, a);
	});

	b.assign(7);
	a = 7;

	test.ok(b.is(a));

	b.assign(-1);

	test.ok(!b.is(a));

	test.done();
};

exports.testNumberWasInc = function (test) {
	test.expect(1);

	var a = -999;
	var b = Tome.conjure(a);

	b.on('readable', function (was) {
		test.strictEqual(was, a);
	});

	b.inc(999);

	test.done();
};