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

exports.testObjectCreation = function (test) {
	test.expect(10);
	var a = {};
	var b = Tome.conjure(a);
	test.deepEqual(a, b); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(instanceOf(b, Tome)); // 3
	test.ok(instanceOf(b, ObjectTome)); // 4
	test.ok(notInstanceOf(b, ArrayTome)); // 5
	test.ok(notInstanceOf(b, BooleanTome)); // 6
	test.ok(notInstanceOf(b, NumberTome)); // 7
	test.ok(notInstanceOf(b, StringTome)); // 8
	test.ok(notInstanceOf(b, NullTome)); // 9
	test.ok(notInstanceOf(b, UndefinedTome)); // 10
	
	test.done();
};

exports.testObjectStringify = function (test) {
	test.expect(14);
	var a, b;

	a = { 'number': 1 };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1

	a = { 'string': 'a' };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	a = { 'boolean': true };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3

	a = { 'null': null };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4

	a = { 'undefined': undefined };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 5

	a = { 'array': [] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 6

	a = { 'object': {} };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 7

	a = { 'arrayofnumbers': [0, 1, 2, 3, 4] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 8

	a = { 'arrayofstrings': ['0', '1', '2', '3', '4'] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 9

	a = { 'arrayofbooleans': [true, false, false, true, false] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 10

	a = { 'arrayofnulls': [null, null, null, null, null] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 11

	a = { 'arrayofundefineds': [undefined, undefined, undefined, undefined, undefined] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 12

	a = { 'arrayofobjects': [{}, {}, {}, {}, {}] };
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));	// 13

	test.ok(instanceOf(b, ObjectTome)); // 14

	test.done();
};

exports.testObjectReadable = function (test) {
	test.expect(0);

	var a, b;
	a = { test: 'is this thing on?' };
	b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});

	test.done();
};

exports.testObjectAssign = function (test) {
	test.expect(9);

	var a, b;
	a = { john: { shirt: 'blue' } };
	b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 5
	});

	b.john.on('readable', function () {
		test.strictEqual(JSON.stringify(a.john), JSON.stringify(b.john)); // 2, 6
	});

	b.john.shirt.on('readable', function () {
		test.strictEqual(JSON.stringify(a.john.shirt), JSON.stringify(b.john.shirt)); // 3
	});

	b.john.on('del', function (k) {
		test.strictEqual('shirt', k); // 7
	});

	b.john.shirt.on('destroy', function () {
		test.ok(true); // 8
	});

	a.john.shirt = 'red';
	b.john.shirt.assign('red');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4

	var c = { pants: 'green' };

	a.john = c;
	b.john.assign(c);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9

	test.done();
};

exports.testObjectSet = function (test) {
	test.expect(9);

	var a, b;
	a = { john: { shirt: 'blue' } };
	b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 5
	});

	b.john.on('readable', function () {
		test.strictEqual(JSON.stringify(a.john), JSON.stringify(b.john)); // 2, 6
	});

	b.john.shirt.on('readable', function () {
		test.strictEqual(JSON.stringify(a.john.shirt), JSON.stringify(b.john.shirt)); // 3
	});

	b.john.on('del', function (k) {
		test.strictEqual('shirt', k); // 7
	});

	b.john.shirt.on('destroy', function () {
		test.ok(true); // 8
	});

	a.john.shirt = 'red';
	b.john.set('shirt', 'red');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4

	var c = { pants: 'green' };

	a.john = c;
	b.set('john', c);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9

	test.done();
};

exports.testObjectAdd = function (test) {
	test.expect(9);

	var a, b, c;
	a = { john: { shirt: 'blue' } };
	b = Tome.conjure(a);
	c = { shirt: 'red' };

	var readableCount = 0;

	b.on('readable', function () {
		readableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'expected ' + JSON.stringify(a)); // 1, 5
	});

	b.on('add', function (k) {
		test.strictEqual('dave', k, 'expected dave'); // 6
		test.strictEqual(JSON.stringify(c), JSON.stringify(b[k]), 'expected ' + JSON.stringify(c)); // 7
	});

	b.john.on('add', function (k) {
		test.strictEqual('pants', k, 'expected pants'); // 2
		test.equal('green', b.john[k], 'expected green'); // 3
	});

	a.john.pants = 'green';
	b.john.set('pants', 'green');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4

	a.dave = c;
	b.set('dave', c);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 8

	test.strictEqual(2, readableCount); // 9

	test.done();
};

exports.testObjectDel = function (test) {
	test.expect(7);

	var a, b;
	a = { john: { shirt: 'blue', pants: 'khaki' }, steve: { shoes: 'brown' } };
	b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 5
	});

	b.john.on('del', function (k) {
		test.strictEqual('shirt', k); // 2
	});

	b.john.shirt.on('destroy', function () {
		test.ok(true); // 3
	});

	b.john.pants.on('destroy', function () {
		test.ok(true); // 6
	});

	delete a.john.shirt;
	b.john.del('shirt');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4

	delete a.john;
	b.del('john');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 7

	test.done();
};

exports.testObjectToString = function (test) {
	test.expect(1);

	var a = { bubble: 'gum' };
	var b = Tome.conjure(a);

	test.strictEqual(a.toString(), b.toString()); // 1

	test.done();
};

exports.testObjectAssignValues = function (test) {
	test.expect(2);

	var a = 'asdf';
	var b = Tome.conjure(a);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1

	a = { foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 };
	b.assign({ foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 });

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	test.done();
};

exports.testObjectIs = function (test) {
	test.expect(2);

	var a = { foo: 'bar' };
	var b = Tome.conjure(a);

	test.ok(!b.is(a));
	test.ok(b.is(b));

	test.done();
};
