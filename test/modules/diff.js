var tomes = require('../../tomes');

var Tome = tomes.Tome;

exports.testDiffSimpleString = function (test) {
	test.expect(12);

	var bsignalcount = 0;
	var csignalcount = 0;
	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

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
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

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
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

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
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

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

exports.testDiffSubObjectAssign = function (test) {
	test.expect(8);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('diff', function (diff) {
		test.deepEqual(diff, { _a: { _b: { _c: { _d: { _e: { assign: 100 } } } } } });
		c.batch(diff);
	});

	c.on('diff', function (diff) {
		test.deepEqual(diff, { _a: { _b: { _c: { _d: { _e: { assign: 100 } } } } } });
	});

	b.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	c.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	a.a.b.c.d.e = 100;
	b.a.b.c.d.e.assign(100);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffSubObjectSet = function (test) {
	test.expect(8);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('diff', function (diff) {
		test.deepEqual(diff, { _a: { _b: { assign: { l: 100 } } } });
		c.batch(diff);
	});

	c.on('diff', function (diff) {
		test.deepEqual(diff, { _a: { _b: {  assign: { l: 100 } } } });
	});

	b.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	c.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	a.a.b = { l: 100 };
	b.a.set('b', { l: 100 });

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffDel = function (test) {
	test.expect(8);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('diff', function (diff) {
		test.deepEqual(diff, { _a: { del: 'b' } });
		c.batch(diff);
	});

	c.on('diff', function (diff) {
		test.deepEqual(diff, { _a: {  del: 'b' } });
	});

	b.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	c.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	delete a.a.b;
	b.a.del('b');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffSort = function (test) {
	test.expect(8);

	var a = [ 0, 5, 6, 8, 2, 3, 6, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('diff', function (diff) {
		test.strictEqual(JSON.stringify(diff), JSON.stringify({ "_1": { "assign": 0 }, "_2": { "assign": 2 }, "_3": { "assign": 3 }, "_4": { "assign": 5 }, "_5": { "assign": 6 }, "_8": { "assign": 8 } }));
		c.batch(diff);
	});

	c.on('diff', function (diff) {
		test.strictEqual(JSON.stringify(diff), JSON.stringify({ "_1": { "assign": 0 }, "_2": { "assign": 2 }, "_3": { "assign": 3 }, "_4": { "assign": 5 }, "_5": { "assign": 6 }, "_8": { "assign": 8 } }));
	});

	b.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	c.on('signal', function (val) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(val));
	});

	a.sort();
	b.sort();

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};