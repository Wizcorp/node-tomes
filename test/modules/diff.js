var tomes = require('../../tomes');

var Tome = tomes.Tome;

exports.testDiffSimpleString = function (test) {
	test.expect(12);

	var bsignalcount = 0;
	var csignalcount = 0;
	var a = 'asdf';
	var b = Tome.scribe(a);
	var c = Tome.scribe(a);

	b.on('diff', function (diff) {
		test.deepEqual(diff, { assign: 'fdsa' }, 'expected diff to be { assign: \'fdsa\' }'); // 6
		c.batch(diff);
	});

	b.on('signal', function (bVal) {
		bsignalcount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(bVal)); // 1, 5
	});

	c.on('signal', function (cVal) {
		csignalcount += 1;
		test.strictEqual(JSON.stringify(b), JSON.stringify(cVal)); // 2, 7
	});

	c.on('diff', function (diff) {
		test.deepEqual(diff, { assign: 'fdsa' }, 'expected diff to be { assign: \'fdsa\' }'); // 8
	});


	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 4

	a = 'fdsa';
	b.assign('fdsa');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 10

	test.strictEqual(bsignalcount, 2, 'expected b to signal 2 times.'); // 11
	test.strictEqual(csignalcount, 2, 'expected c to signal 2 times.'); // 12

	test.done();
};

exports.testDiffStringToNumber = function (test) {
	test.expect(6);

	var a = 'asdf';
	var b = Tome.scribe(a);
	var c = Tome.scribe(a);

	b.on('diff', function (diff) {
		c.batch(diff);
	});

	c.on('signal', function (cVal) {
		test.strictEqual(JSON.stringify(b), JSON.stringify(cVal));
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	a = 1;
	b.assign(1);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffStringToObject = function (test) {
	test.expect(6);

	var a = 'asdf';
	var b = Tome.scribe(a);
	var c = Tome.scribe(a);

	b.on('diff', function (diff) {
		c.batch(diff);
	});

	c.on('signal', function (cVal) {
		test.strictEqual(JSON.stringify(b), JSON.stringify(cVal));
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	a = { foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 };
	b.assign({ foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 });

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffObjectToString = function (test) {
	test.expect(6);

	var a = { foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 };
	var b = Tome.scribe(a);
	var c = Tome.scribe(a);

	b.on('diff', function (diff) {
		c.batch(diff);
	});

	c.on('signal', function (cVal) {
		test.strictEqual(JSON.stringify(b), JSON.stringify(cVal));
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	a = 'asdf';
	b.assign('asdf');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};
