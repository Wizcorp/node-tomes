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

exports.testNullCreation = function (test) {
	test.expect(11);
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
	test.ok(notInstanceOf(b, ScalarTome)); // 9
	test.ok(notInstanceOf(b, StringTome)); // 10
	test.ok(notInstanceOf(b, UndefinedTome)); // 11

	test.done();
};

exports.testNullSignal = function (test) {
	test.expect(3);

	var a = null;
	var b = Tome.conjure(a);

	b.on('signal', function (bval) {
		test.strictEqual(a, bval); // 1
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	test.done();
};

exports.testNullAssign = function (test) {
	test.expect(11);

	var a = null;
	var b = Tome.conjure(a);

	b.on('signal', function (bval) {
		test.strictEqual(a, bval); // 1, 4, 8
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = 'orange';
	b.assign('orange');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(instanceOf(b, StringTome)); // 6
	test.strictEqual(typeof a, b.typeOf()); // 7

	a = null;
	b.assign(null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.ok(instanceOf(b, NullTome)); // 10
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); // 11

	test.done();
};

exports.testNullSet = function (test) {
	test.expect(12);

	var a = null;
	var b = Tome.conjure(a);

	b.on('signal', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4, 9
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = { d: null };
	b.set('d', null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(notInstanceOf(b, NullTome)); // 6
	test.ok(instanceOf(b, ObjectTome)); // 7
	test.ok(instanceOf(b.d, NullTome)); // 8

	a = null;
	b.assign(null);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 10
	test.ok(instanceOf(b, NullTome)); // 11
	test.ok(notInstanceOf(b.d, NullTome)); // 12


	test.done();
};

exports.testNullDestroy = function (test) {
	test.expect(3);

	var a = { d: null};
	var b = Tome.conjure(a);

	b.d.on('destroy', function () {
		test.ok(true); // 2
	});

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 3
	});

	a = null;
	b.assign(null);

	test.done();
};

exports.testNullDelete = function (test) {
	test.expect(3);

	var a = { d: null};
	var b = Tome.conjure(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('signal', function (bval) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(bval)); // 1, 3
	});

	a = null;
	b.assign(null);

	test.done();
};