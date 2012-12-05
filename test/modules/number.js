var tomes = require('../../tomes');

var Tome = tomes.Tome,
	ArrayTome = tomes.ArrayTome,
	BooleanTome = tomes.BooleanTome,
	NumberTome = tomes.NumberTome,
	ObjectTome = tomes.ObjectTome,
	ScalarTome = tomes.ScalarTome,
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
	test.expect(11);
	var a = -43.75;
	var b = Tome.scribe(a);
	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(instanceOf(b, Tome)); // 3
	test.ok(notInstanceOf(b, ArrayTome)); // 4
	test.ok(notInstanceOf(b, BooleanTome)); // 5
	test.ok(notInstanceOf(b, NullTome)); // 6
	test.ok(instanceOf(b, NumberTome)); // 7
	test.ok(notInstanceOf(b, ObjectTome)); // 8
	test.ok(instanceOf(b, ScalarTome)); // 9
	test.ok(notInstanceOf(b, StringTome)); // 10
	test.ok(notInstanceOf(b, UndefinedTome)); // 11

	test.done();
};

exports.testNumberSignal = function (test) {
	test.expect(3);

	var a = -43.75;
	var b = Tome.scribe(a);

	b.on('signal', function (bval) {
		test.strictEqual(a, bval); // 1
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	test.done();
};


exports.testNumberAssign = function (test) {
	test.expect(6);

	var a = -43.75;
	var b = Tome.scribe(a);

	b.on('signal', function (bval) {
		test.strictEqual(a, bval); // 1, 4
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = 3;
	b.assign(3);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(instanceOf(b, NumberTome)); // 6

	test.done();
};

exports.testNumberSet = function (test) {
	test.expect(13);

	var a = -43.74;
	var b = Tome.scribe(a);

	b.on('signal', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4, 9
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = { d: 6600 };
	b.set('d', 6600);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(notInstanceOf(b, NumberTome)); // 6
	test.ok(instanceOf(b, ObjectTome)); // 7
	test.ok(instanceOf(b.d, NumberTome)); // 8

	a = -9.81;
	b.assign(-9.81);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 10
	test.ok(instanceOf(b, NumberTome)); // 11
	test.ok(notInstanceOf(b, ObjectTome)); // 12
	test.ok(notInstanceOf(b.d, NumberTome)); // 13

	test.done();
};

exports.testNumberToString = function (test) {
	test.expect(1);

	var a = -43.76;
	var b = Tome.scribe(a);

	test.strictEqual(a.toString(), b.toString()); // 1

	test.done();
};

exports.testNumberValueOf = function (test) {
	test.expect(1);

	var a = -9988.33;
	var b = Tome.scribe(a);

	test.strictEqual(a.valueOf(), b.valueOf()); // 1

	test.done();
};

exports.testNumberDestroy = function (test) {
	test.expect(3);

	var a = { d: -44.23 };
	var b = Tome.scribe(a);

	b.d.on('destroy', function () {
		test.ok(true); // 2
	});

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 3
	});

	a = false;
	b.assign(false);

	test.done();
};

exports.testNumberDelete = function (test) {
	test.expect(3);

	var a = { d: -88.89876 };
	var b = Tome.scribe(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 3
	});

	a = 13413;
	b.assign(13413);

	test.done();
};

exports.testNumberInc = function (test) {
	test.expect(3);

	var a = 44;
	var b = Tome.scribe(a);

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 2
	});

	a = a + 1;
	b.inc(1);

	a = a - 10;
	b.inc(-10);

	test.done();
};

exports.testNumberOperand = function (test) {
	test.expect(3);

	var a = 10;
	var b = Tome.scribe(a);

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 2
	});

	a = a + 5;
	b.assign(b + 5);

	a = a - 10;
	b.assign(b - 10);

	test.done();
};