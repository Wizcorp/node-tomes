var Tome = require('../../tomes').Tome;

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

exports.testDiffMove = function (test) {
	test.expect(3);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.merge(diff);
		}
	});

	b.b.move('c', b.d.e);

	test.strictEqual(JSON.stringify(b), JSON.stringify(c));
	test.strictEqual(b.d.e.c.__parent__, b.d.e);
	test.strictEqual(c.d.e.c.__parent__, c.d.e);

	test.done();
};

exports.testDiffMoveArray = function (test) {
	test.expect(14);

	var a = [ 0, 1, 2, 3, 4];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.merge(diff);
		}
	});

	a[4] = a[0];
	delete a[0];

	b.move(0, 4);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.strictEqual(a.length, b.length);
	test.strictEqual(b.length, c.length);

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.equal(b[i].__key__, i);
		test.equal(c[i].__key__, i);
	}

	test.done();
};

exports.testDiffMoveArrayLarger = function (test) {
	test.expect(26);

	var a = [ 0, 1, 2, 3, 4];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.merge(diff);
		}
	});

	a[10] = a[0];
	delete a[0];

	b.move(0, 10);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.strictEqual(a.length, b.length);
	test.strictEqual(b.length, c.length);

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.equal(b[i].__key__, i);
		test.equal(c[i].__key__, i);
	}

	test.done();
};

exports.testDiffMoveBackAndForth = function (test) {
	test.expect(5);

	var a = { a: 1, b: 1, c: 1 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.b = a.a;
	delete a.a;
	b.move('a', 'b');

	test.deepEqual(b.__diff__, { rename: { a: { to: 'b', over: true } } }, JSON.stringify(b.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.a = a.b;
	delete a.b;
	b.move('b', 'a');

	test.deepEqual(b.__diff__, { del: [ 'b' ] }, JSON.stringify(b.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	var diff = b.read();

	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffSetMove = function (test) {
	test.expect(7);

	var a = { bob: { pants: 'orange' }, scarf: 'green' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.bob.shirt = false;
	b.bob.set('shirt', false);

	test.deepEqual(b.__diff__, { '_bob': { 'set': { shirt: false } } });
	test.deepEqual(b.bob.__diff__, { set: { shirt: false } });
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.pants = a.bob.shirt;
	delete a.bob.shirt;
	b.bob.move('shirt', b, 'pants');

	test.deepEqual(b.__diff__, { set: { pants: false } });
	test.deepEqual(b.bob.__diff__, {});
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffRenameMove = function (test) {
	test.expect(7);

	var a = { bob: { pants: 'orange' }, scarf: 'green' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.bob.shirt = a.bob.pants;
	delete a.bob.pants;
	b.bob.rename('pants', 'shirt');

	test.deepEqual(b.__diff__, { '_bob': { rename: { pants: { to: 'shirt' } } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.bob.__diff__, { rename: { pants: { to: 'shirt' } } }, JSON.stringify(b.bob.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.shirt = a.bob.shirt;
	delete a.bob.shirt;
	b.bob.move('shirt', b);

	test.deepEqual(b.__diff__, {from: { shirt: { chain: [ 'bob' ], was: 'pants', order: 2 } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.bob.__diff__, { }, JSON.stringify(b.bob.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffMoveUpRename = function (test) {
	test.expect(6);

	var a = { bob: { shirt: 'red' }, jim: { }, paul: { } };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.shirt = a.bob.shirt;
	delete a.bob.shirt;
	b.bob.move('shirt', b);

	test.deepEqual(b.__diff__, { from: { shirt: { chain: [ 'bob' ], order: 1 } } });
	test.deepEqual(b.bob.__diff__, { });

	a.pants = a.shirt;
	delete a.shirt;
	b.rename('shirt', 'pants');

	test.deepEqual(b.__diff__, { from: { pants: { chain: [ 'bob' ], was: 'shirt', order: 1 } } });
	test.deepEqual(b.bob.__diff__, { });

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffMoveTwice = function (test) {
	test.expect(9);

	var a = { bob: { shirt: 'red' }, jim: { }, paul: { } };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.jim.scarf = a.bob.shirt;
	delete a.bob.shirt;
	b.bob.move('shirt', b.jim, 'scarf');

	test.deepEqual(b.__diff__, { '_jim': { from: { scarf: { chain: [ 'bob' ], was: 'shirt', order: 1 } } } });
	test.deepEqual(b.jim.__diff__, { from: { scarf: { chain: [ 'bob' ], was: 'shirt', order: 1 } } });
	test.deepEqual(b.bob.__diff__, { });

	a.paul.shirt = a.jim.scarf;
	delete a.jim.scarf;
	b.jim.move('scarf', b.paul, 'shirt');

	test.deepEqual(b.__diff__, { '_paul': { from: { shirt: { chain: [ 'bob' ], order: 3 } } } });
	test.deepEqual(b.jim.__diff__, { });
	test.deepEqual(b.bob.__diff__, { });
	test.deepEqual(b.paul.__diff__, { from: { shirt: { chain: [ 'bob' ], order: 3 } } });

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffMoveUpDownUp = function (test) {
	test.expect(10);

	var a = { bob: { shirt: 'blue', pants: 'orange' }, scarf: 'green' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.shirt = a.bob.shirt;
	delete a.bob.shirt;
	b.bob.move('shirt', b);

	test.deepEqual(b.__diff__, { from: { shirt: { chain: [ 'bob' ], order: 1 } } });
	test.deepEqual(b.bob.__diff__, { });
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.bob.shirt = a.shirt;
	delete a.shirt;
	b.move('shirt', b.bob);

	test.deepEqual(b.__diff__, {});
	test.deepEqual(b.bob.__diff__, {});
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.shirt = a.bob.shirt;
	delete a.bob.shirt;
	b.bob.move('shirt', b);

	test.deepEqual(b.__diff__, { from: { shirt: { chain: [ 'bob' ], order: 5 } } });
	test.deepEqual(b.bob.__diff__, { });
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffMoveDownUpDown = function (test) {
	test.expect(15);

	var a = { shirt: 'red', bob: { shorts: 'blue' }, jim: { scarf: 'green' } };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.bob.pants = a.shirt;
	delete a.shirt;
	b.move('shirt', b.bob, 'pants');

	test.deepEqual(b.__diff__, { '_bob': { from: { pants: { chain: [ ], was: 'shirt', order: 1} } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.bob.__diff__, { from: { pants: { chain: [ ], was: 'shirt', order: 1} } }, JSON.stringify(b.bob.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.scarf = a.jim.scarf;
	delete a.jim.scarf;
	b.jim.move('scarf', b);

	test.deepEqual(b.__diff__, { '_bob': { from: { pants: { chain: [ ], was: 'shirt', order: 1} } }, from: { scarf: { chain: [ 'jim' ], order: 3 } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.bob.__diff__, { from: { pants: { chain: [ ], was: 'shirt', order: 1} } }, JSON.stringify(b.bob.__diff__));
	test.deepEqual(b.jim.__diff__, { }, JSON.stringify(b.jim.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.pants = a.bob.pants;
	delete a.bob.pants;
	b.bob.move('pants', b);

	test.deepEqual(b.__diff__, { from: { scarf: { chain: [ 'jim' ], order: 3 } }, rename: { shirt: { to: 'pants' } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.bob.__diff__, { });
	test.deepEqual(b.jim.__diff__, { }, JSON.stringify(b.jim.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.jim.shirt = a.scarf;
	delete a.scarf;
	b.move('scarf', b.jim, 'shirt');

	test.deepEqual(b.__diff__, { rename: { shirt: { to: 'pants' } }, '_jim': { rename: { scarf: { to: 'shirt' } } } });
	test.deepEqual(b.bob.__diff__, { });
	test.deepEqual(b.jim.__diff__, { rename: { scarf: { to: 'shirt' } } });

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffAssignMove = function (test) {
	test.expect(9);

	var a = { foo: 'bar', jim: { off: 'on' }, bar: 'baz' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.jim.off = 'hi';
	b.jim.off.assign('hi');

	test.deepEqual(b.__diff__, { '_jim': { '_off': { assign: 'hi' } } });
	test.deepEqual(b.jim.__diff__, { '_off': { assign: 'hi' } });
	test.deepEqual(b.jim.off.__diff__, { assign: 'hi' });
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.off = a.jim.off;
	b.jim.move('off', b);
	delete a.jim.off;

	test.deepEqual(b.__diff__, { from: { off: { chain: [ 'jim' ], order: 2 } }, '_off': { assign: 'hi' } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.jim.__diff__, { }, JSON.stringify(b.jim.__diff__));
	test.deepEqual(b.off.__diff__, { assign: 'hi' });

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffMultiMove = function (test) {
	test.expect(7);

	var a = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, z: { y: 1 } };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.z.x = a.a;
	delete a.a;

	b.move('a', b.z, 'x');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.z.x = a.b;
	delete a.b;

	b.move('b', b.z, 'x');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.z.x = a.c;
	delete a.c;

	b.move('c', b.z, 'x');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.z.w = a.e;
	delete a.e;

	b.move('e', b.z, 'w');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.z.x = a.d;
	delete a.d;
	b.move('d', b.z, 'x');

	test.deepEqual(b.__diff__, { del: ['a', 'b', 'c'], '_z': { from: { x: { chain: [ ], was: 'd', over: true, order: 11 }, w: { chain: [ ], was: 'e', order: 9 } } } }, JSON.stringify(b.__diff__));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(b, c);

	test.done();
};

exports.testDiffCombineMove = function (test) {
	test.expect(12);

	var a = { foo: 'bar', jim: { off: 'on' }, bar: 'baz' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.jim.foo = a.foo;
	delete a.foo;
	b.move('foo', b.jim);

	test.deepEqual(b.__diff__, { '_jim': { from: { foo: { chain: [ ], order: 1 } } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.jim.__diff__, { from: { foo: { chain: [ ], order: 1 } } }, JSON.stringify(b.jim.__diff__));
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.jim.foo = 'why';
	b.jim.foo.assign('why');

	test.deepEqual(b.__diff__, { '_jim': { '_foo': { assign: 'why' }, from: { foo: { chain: [ ], order: 1 } } } }, JSON.stringify(b.__diff__));
	test.deepEqual(b.jim.__diff__, { '_foo': { assign: 'why' }, from: { foo: { chain: [ ], order: 1 } } }, JSON.stringify(b.jim.__diff__));
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	a.jim = a.jim.foo;
	delete a.jim.foo;
	b.jim.move('foo', b, 'jim');

	test.deepEqual(b.__diff__, { rename: { foo: { to: 'jim', over: true } }, _jim: { assign: 'why'} }, JSON.stringify(b.__diff__));
	test.deepEqual(b.jim.__diff__, { assign: 'why' }, JSON.stringify(b.jim.__diff__));
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.foo = a.jim;
	delete a.jim;
	b.move('jim', b, 'foo');

	test.deepEqual(b.__diff__, { del: [ 'jim' ], '_foo': { assign: 'why' } }, JSON.stringify(b.__diff__));

	var diff = b.read();

	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(b, c);

	test.done();
};

exports.testDiffDeletedFrom = function (test) {
	test.expect(5);

	var a = { bob: { shirts: { blue: 3 } }, sam: { shirts: { red: 1 } } };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.sam.shirts.blue = a.bob.shirts.blue;
	delete a.bob.shirts.blue;
	b.bob.shirts.move('blue', b.sam.shirts);

	test.deepEqual(JSON.stringify(a), JSON.stringify(b));
	test.deepEqual(b.__diff__, { _sam: { _shirts: { from: { blue: { chain: [ 'bob', 'shirts' ], order: 1 } } } } }, JSON.stringify(b.__diff__));

	delete a.bob;
	b.del('bob');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(b.__diff__, { del: [ 'bob' ], _sam: { _shirts: { from: { blue: { chain: [ 'bob', 'shirts' ], order: 1 } } } } }, JSON.stringify(b.__diff__));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffMoveRename = function (test) {
	test.expect(7);

	var a = { bob: { pants: 'orange' }, scarf: 'green' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.shirt = a.bob.pants;
	delete a.bob.pants;
	b.bob.move('pants', b, 'shirt');

	test.deepEqual(b.__diff__, { from: { shirt: { chain: [ 'bob' ], was: 'pants', order: 1 } } });
	test.deepEqual(b.bob.__diff__, { });
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.pants = a.shirt;
	delete a.shirt;
	b.rename('shirt', 'pants');

	test.deepEqual(b.__diff__, { from: { pants: { chain: [ 'bob' ], order: 1 } } });
	test.deepEqual(b.bob.__diff__, {});
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(b, c);

	test.done();
};

exports.testDiffReverseMove = function (test) {
	test.expect(5);

	var a = { a: [ 0, 1, 2, 3, 4, 5 ], b: [ 0 ] };
	var b = Tome.conjure(a);
	var c = Tome.conjure(b);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 2
	});

	a.a.reverse();
	b.a.reverse();

	a.b[1] = a.a[5];
	delete a.a[5];
	b.a.move(5, b.b, 1);

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 3
	test.deepEqual(b, c); // 4
	
	test.done();
};

exports.testDiffMoveReverse = function (test) {
	test.expect(5);

	var a = { a: [ 0, 1, 2, 3, 4, 5 ], b: [ 0 ] };
	var b = Tome.conjure(a);
	var c = Tome.conjure(b);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 2
	});

	a.b[1] = a.a[5];
	delete a.a[5];
	b.a.move(5, b.b, 1);

	a.a.reverse();
	b.a.reverse();

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 3
	test.deepEqual(b, c); // 4
	
	test.done();
};

exports.testDiffMoveParentMove = function (test) {
	test.expect(2);

	var a = { b: { c: 1, d: 1 }, e: { f: 1 }, g: { h: 1 } };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.e.c = a.b.c;
	delete a.b.c;
	b.b.move('c', b.e);

	a.e.b = a.b;
	delete a.b;
	b.move('b', b.e);

	a.g.e = a.e;
	delete a.e;
	b.move('e', b.g);

	a.d = a.g.e.b.d;
	delete a.g.e.b.d;
	b.g.e.b.move('d', b);

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};