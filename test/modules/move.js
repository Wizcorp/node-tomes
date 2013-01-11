var tomes = require('../../tomes');

var Tome = tomes.Tome;

exports.testMove = function (test) {
	test.expect(1);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);

	a.d.c = a.b.c;
	delete a.b.c;

	b.b.move('c', b.d);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testMoveAndRename = function (test) {
	test.expect(1);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);

	a.d.f = a.b.c;
	delete a.b.c;

	b.b.move('c', b.d, 'f');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testMoveArray = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);

	a[4] = a[0];
	delete a[0];

	b.move(0, 4);

	test.strictEqual(a.length, b.length);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testMoveArrayLarger = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);

	a[10] = a[0];
	delete a[0];

	b.move(0, 10);


	test.strictEqual(a.length, b.length);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testMoveChangeRoots = function (test) {
	test.expect(6);

	var a = { foo: { bar: { asdf: 'nope' } }, bananas: 2 };
	var b = { apples: 100 };

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

	b.foo = a.foo;
	delete a.foo;

	c.move('foo', d);

	test.strictEqual(JSON.stringify(a), JSON.stringify(c));
	test.strictEqual(JSON.stringify(b), JSON.stringify(d));
	test.strictEqual(JSON.stringify(a), JSON.stringify(e));
	test.strictEqual(JSON.stringify(b), JSON.stringify(f));

	test.strictEqual(d.foo.__root__, d);
	test.strictEqual(c.foo, undefined);

	test.done();
};

exports.testMoveArrayChangeRoots = function (test) {
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

	b[5] = a[0];
	delete a[0];

	c.move(0, d, 5);

	test.strictEqual(JSON.stringify(a), JSON.stringify(c));
	test.strictEqual(JSON.stringify(b), JSON.stringify(d));
	test.strictEqual(JSON.stringify(a), JSON.stringify(e));
	test.strictEqual(JSON.stringify(b), JSON.stringify(f));

	test.strictEqual(d[5].__root__, d);
	test.strictEqual(c[0].valueOf(), undefined);

	test.done();
};