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

exports.testBooleanCreation = function (test) {
	test.expect(11);
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
	test.ok(instanceOf(b, ScalarTome)); // 9
	test.ok(notInstanceOf(b, StringTome)); // 10
	test.ok(notInstanceOf(b, UndefinedTome)); // 11

	test.done();
};

exports.testBooleanSignal = function (test) {
	test.expect(3);

	var a = true;
	var b = Tome.conjure(a);

	b.on('signal', function (bval) {
		test.strictEqual(a, bval); // 1
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	test.done();
};


exports.testBooleanAssign = function (test) {
	test.expect(6);

	var a = true;
	var b = Tome.conjure(a);

	b.on('signal', function (bval) {
		test.strictEqual(a, bval); // 1, 4
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = false;
	b.assign(false);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(instanceOf(b, BooleanTome)); // 6

	test.done();
};

exports.testBooleanSet = function (test) {
	test.expect(13);

	var a = true;
	var b = Tome.conjure(a);

	b.on('signal', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4, 9
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = { d: true };
	b.set('d', true);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(notInstanceOf(b, BooleanTome)); // 6
	test.ok(instanceOf(b, ObjectTome)); // 7
	test.ok(instanceOf(b.d, BooleanTome)); // 8

	a = false;
	b.assign(false);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 10
	test.ok(instanceOf(b, BooleanTome)); // 11
	test.ok(notInstanceOf(b, ObjectTome)); // 12
	test.ok(notInstanceOf(b.d, BooleanTome)); // 13

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
	test.expect(3);

	var a = { d: true };
	var b = Tome.conjure(a);

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

exports.testBooleanDelete = function (test) {
	test.expect(3);

	var a = { d: true };
	var b = Tome.conjure(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 3
	});

	a = false;
	b.assign(false);

	test.done();
};

exports.testBooleanAndOr = function (test) {
	test.expect(3);

	var a = true;
	var b = Tome.conjure(a);

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 2, 3
	});

	a = a || false;
	b.assign(b || false);

	a = a && true;
	b.assign(b && true);

	test.done();
};