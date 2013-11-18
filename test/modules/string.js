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

exports.testStringCreation = function (test) {
	test.expect(10);
	var a = 'blue';
	var b = Tome.conjure(a);
	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(instanceOf(b, Tome)); // 3
	test.ok(notInstanceOf(b, ArrayTome)); // 4
	test.ok(notInstanceOf(b, BooleanTome)); // 5
	test.ok(notInstanceOf(b, NullTome)); // 6
	test.ok(notInstanceOf(b, NumberTome)); // 7
	test.ok(notInstanceOf(b, ObjectTome)); // 8
	test.ok(instanceOf(b, StringTome)); // 9
	test.ok(notInstanceOf(b, UndefinedTome)); // 10

	test.done();
};

exports.testStringReadable = function (test) {
	test.expect(2);

	var a = 'green';
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b); // This should not happen.
	});

	test.strictEqual(a, b.valueOf()); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	test.done();
};

exports.testStringAssign = function (test) {
	test.expect(5);

	var a = 'red';
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.equal(a, b); // 1
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = 'orange';
	b.assign('orange');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.ok(instanceOf(b, StringTome)); // 5

	test.done();
};

exports.testStringSet = function (test) {
	test.expect(10);

	var a = 'red';
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4
	});

	test.strictEqual(a, b.valueOf()); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = { d: 'orange' };
	b.set('d', 'orange');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.ok(notInstanceOf(b, StringTome)); // 6
	test.ok(instanceOf(b.d, StringTome)); // 7

	a = 'yellow';
	b.assign('yellow');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 8
	test.ok(instanceOf(b, StringTome)); // 9
	test.ok(notInstanceOf(b.d, StringTome)); // 10

	test.done();
};

exports.testStringToString = function (test) {
	test.expect(1);

	var a = 'violet';
	var b = Tome.conjure(a);

	test.strictEqual(a.toString(), b.toString()); // 1

	test.done();
};

exports.testStringValueOf = function (test) {
	test.expect(1);

	var a = 'lavender';
	var b = Tome.conjure(a);

	test.strictEqual(a.valueOf(), b.valueOf()); // 1

	test.done();
};

exports.testStringDestroy = function (test) {
	test.expect(2);

	var a = { d: 'turquoise'};
	var b = Tome.conjure(a);

	b.d.on('destroy', function () {
		test.ok(true); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = 'beige';
	b.assign('beige');

	test.done();
};

exports.testStringDelete = function (test) {
	test.expect(2);

	var a = { d: 'turquoise'};
	var b = Tome.conjure(a);

	b.on('del', function (key) {
		test.strictEqual('d', key); // 2
	});

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = 'beige';
	b.assign('beige');

	test.done();
};

exports.testStringAppend = function (test) {
	test.expect(1);

	var a = 'foo';
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});

	a = a + 'bar';
	b.assign(b + 'bar');

	test.done();
};

exports.testStringIs = function (test) {
	test.expect(4);

	var a = 'asdf';
	var b = Tome.conjure(a);

	test.ok(b.is(a));

	a = '0';
	b.assign(a);

	test.ok(b.is(a));

	a = '2.57523049';
	b.assign(a);

	test.ok(b.is(a));

	a = 'a9';
	b.assign('42');

	test.ok(!b.is(a));

	test.done();
};

exports.testStringWas = function (test) {
	test.expect(3);

	var a = 'banana';
	var b = Tome.conjure(a);

	b.on('readable', function (was) {
		test.strictEqual(was, a);
	});

	b.assign('apple');
	a = 'apple';

	test.ok(b.is(a));

	b.assign('orange');

	test.done();
};