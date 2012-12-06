var tomes = require('../../tomes');

var Tome = tomes.Tome;

exports.testDiffSimpleString = function (test) {
	test.expect(6);

	var a = 'asdf';
	var b = Tome.scribe(a);
	var c = Tome.scribe(a);

	b.on('diff', function (diff) {
		c.batch(diff);
	});

	c.on('signal', function (cVal) {
		test.strictEqual(JSON.stringify(b), JSON.stringify(cVal)); // 1, 4
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 3

	a = 'fdsa';
	b.assign('fdsa');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

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
