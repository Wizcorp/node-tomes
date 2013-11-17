var tomes = require('../..');

var Tome = tomes.Tome;

exports.testChainSet = function (test) {
	test.expect(12);

	var readableCount = 0;
	var addCount = 0;

	var a = { a: 1 };
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
	});

	b.on('add', function (key) {
		addCount += 1;
		test.strictEqual(a[key], b[key].valueOf());
	});

	a.b = 1;
	a.c = 1;
	a.d = 1;
	a.e = 1;
	a.f = 1;
	a.g = 1;
	a.h = 1;
	a.i = 1;
	a.j = 1;
	a.k = 1;

	b.set('b', 1).set('c', 1).set('d', 1).set('e', 1).set('f', 1).set('g', 1).set('h', 1).set('i', 1).set('j', 1).set('k', 1);

	test.strictEqual(readableCount, 10);
	test.strictEqual(addCount, 10);

	test.done();
};

exports.testChainDel = function (test) {
	test.expect(12);

	var readableCount = 0;
	var delCount = 0;

	var a = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1, j: 1, k: 1 };
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
	});

	b.on('del', function (key) {
		delCount += 1;
		test.strictEqual(a[key], b[key]);
	});

	delete a.b;
	delete a.c;
	delete a.d;
	delete a.e;
	delete a.f;
	delete a.g;
	delete a.h;
	delete a.i;
	delete a.h;
	delete a.j;
	delete a.k;

	b.del('b').del('c').del('d').del('e').del('f').del('g').del('h').del('i').del('j').del('k');

	test.strictEqual(readableCount, 10);
	test.strictEqual(delCount, 10);

	test.done();
};

exports.testChainDestroy = function (test) {
	test.expect(2);

	var readableCount = 0;
	var destroyCount = 0;

	var a = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1, j: 1, k: 1 };
	var b = Tome.conjure(a);

	b.on('readable', function () {
		readableCount += 1;
	});

	b.b.on('destroy', function () {
		destroyCount += 1;
	});

	b.c.on('destroy', function () {
		destroyCount += 1;
	});

	delete a.b;
	delete a.c;

	b.del('b').del('c');

	test.strictEqual(readableCount, 2);
	test.strictEqual(destroyCount, 2);

	test.done();
};