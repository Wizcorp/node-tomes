var Tome = require('../..').Tome;

exports.testSwap = function (test) {
	test.expect(1);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('b', b.d);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapDiff = function (test) {
	test.expect(6);
	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('b', b.d);

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));
	test.strictEqual(b.b.e.__parent__, b.b);
	test.strictEqual(b.d.c.__parent__, b.d);
	test.strictEqual(c.b.e.__parent__, c.b);
	test.strictEqual(c.d.c.__parent__, c.d);

	test.done();
};

exports.testSwapChangeTomes = function (test) {
	test.expect(6);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = [ 5, 6, 7, 8, 9 ];

	var c = Tome.conjure(a);
	var d = Tome.conjure(b);

	var e = Tome.conjure(a);
	var f = Tome.conjure(b);

	c.on('readable', function () {
		var diff = c.read();
		if (diff) {
			e.merge(diff);
		}
	});

	d.on('readable', function () {
		var diff = d.read();
		if (diff) {
			f.merge(diff);
		}
	});

	var intermediate = b[4];
	b[4] = a[0];
	a[0] = intermediate;

	c.swap(0, d[4]);

	test.strictEqual(JSON.stringify(a), JSON.stringify(c));
	test.strictEqual(JSON.stringify(b), JSON.stringify(d));
	test.strictEqual(JSON.stringify(a), JSON.stringify(e));
	test.strictEqual(JSON.stringify(b), JSON.stringify(f));

	test.strictEqual(c[0].__root__, c);
	test.strictEqual(d[4].__root__, d);

	test.done();
};

exports.testSwapArrayKeyKey = function (test) {
	test.expect(1);

	var a = [ 'bread', 'bacon', 'lettuce', 'tomato', 'egg','cheese' ];
	var b = Tome.conjure(a);

	var intermediate = a[0];
	a[0] = a[1];
	a[1] = intermediate;

	b.swap(0, 1);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapArrayValueValue = function (test) {
	test.expect(1);

	var a = [ 'bread', 'bacon', 'lettuce', 'tomato', 'egg','cheese' ];
	var b = Tome.conjure(a);

	var intermediate = a[0];
	a[0] = a[1];
	a[1] = intermediate;

	b.swap('bread', 'bacon');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapArrayKeyValue = function (test) {
	test.expect(1);

	var a = [ 'bread', 'bacon', 'lettuce', 'tomato', 'egg','cheese' ];
	var b = Tome.conjure(a);

	var intermediate = a[0];
	a[0] = a[1];
	a[1] = intermediate;

	b.swap(0, 'bacon');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapArrayValueKey = function (test) {
	test.expect(1);

	var a = [ 'bread', 'bacon', 'lettuce', 'tomato', 'egg','cheese' ];
	var b = Tome.conjure(a);

	var intermediate = a[0];
	a[0] = a[1];
	a[1] = intermediate;

	b.swap('bread', 1);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapObjectKeyKey = function (test) {
	test.expect(1);

	var a = { a: 'bread', b: 'bacon', c: 'lettuce', d: 'tomato', e: 'egg', f: 'cheese' };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('b', 'd');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapObjectValueValue = function (test) {
	test.expect(1);

	var a = { a: 'bread', b: 'bacon', c: 'lettuce', d: 'tomato', e: 'egg', f: 'cheese' };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('bacon', 'tomato');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapObjectKeyValue = function (test) {
	test.expect(1);

	var a = { a: 'bread', b: 'bacon', c: 'lettuce', d: 'tomato', e: 'egg', f: 'cheese' };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('b', 'tomato');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapObjectValueKey = function (test) {
	test.expect(1);

	var a = { a: 'bread', b: 'bacon', c: 'lettuce', d: 'tomato', e: 'egg', f: 'cheese' };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('bacon', 'd');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testSwapObjectValueValue = function (test) {
	test.expect(1);

	var a = { a: 'bread', b: 'bacon', c: 'lettuce', d: 'tomato', e: 'egg', f: 'cheese' };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap('bacon', 'tomato');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testBadSwap = function (test) {
	test.expect(2);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);

	var intermediate = a.b;
	a.b = a.d;
	a.d = intermediate;

	b.swap(b.b, b.d);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	var x = { b: { c: 1 }, d: { e: 1} };
	var y = Tome.conjure(x);

	var intermediate2 = x.b;
	x.b = x.d;
	x.d = intermediate2;

	y.swap('b', 'd');

	test.strictEqual(JSON.stringify(x), JSON.stringify(y));

	test.done();
};
