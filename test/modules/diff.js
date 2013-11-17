var Tome = require('../..').Tome;

exports.testDiffSimpleString = function (test) {
	test.expect(2);

	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);
	
	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});
	
	a = 'fdsa';
	b.assign('fdsa');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 2

	test.done();
};

exports.testDiffStringToNumber = function (test) {
	test.expect(4);

	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 2

	a = 1;
	b.assign(1);

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 4

	test.done();
};

exports.testDiffStringToObject = function (test) {
	test.expect(4);

	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 2

	a = { foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 };
	b.assign({ foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 });

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 4

	test.done();
};

exports.testDiffObjectToString = function (test) {
	test.expect(5);

	var a = { foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 3
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 2

	a = 'asdf';
	b.assign('asdf');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 5

	test.done();
};

exports.testDiffSubObjectAssign = function (test) {
	test.expect(2);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.a.b.c.d.e = 100;
	b.a.b.c.d.e.assign(100);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 1
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 2

	test.done();
};

exports.testDiffSubObjectSet = function (test) {
	test.expect(2);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.a.b = { l: 100 };
	b.a.set('b', { l: 100 });

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 1
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 2

	test.done();
};

exports.testDiffDel = function (test) {
	test.expect(2);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	delete a.a.b;
	b.a.del('b');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 1
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 2

	test.done();
};

exports.testDiffArraySort = function (test) {
	test.expect(24);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.sort();
	b.sort();

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 1 - 11
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 12 - 22
	}

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 23
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 24

	test.done();
};

exports.testDiffArrayShift = function (test) {
	test.expect(22);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	test.equal(a.shift(), b.shift()); // 1
	test.equal(a.shift(), b.shift()); // 2

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 3-11
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 12-20
	}

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 21
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 22

	test.done();
};

exports.testDiffRename = function (test) {
	test.expect(2);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.a.b.z = a.a.b.c;
	delete a.a.b.c;
	b.a.b.rename('c', 'z');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffPush = function (test) {
	test.expect(32);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.push(10, 11, 12, 13);
	b.push(10, 11, 12, 13);

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 1-15
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 16-30
	}

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 31
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 32

	test.done();
};

exports.testDiffUnshift = function (test) {
	test.expect(32);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.unshift(10, 11, 12, 13);
	b.unshift(10, 11, 12, 13);

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 1-15
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 16-30
	}

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 31
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 32

	test.done();
};

exports.testDiffSplice = function (test) {
	test.expect(24);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.splice(3, 2, 12, 13);
	b.splice(3, 2, 12, 13);

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 1-11
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 12-22
	}

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b))); // 23
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c))); // 24

	test.done();
};

exports.testDiffHide = function (test) {
	test.expect(2);

	var a = [ { foo: 0, bar: 1 } ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	delete a[0].foo;
	a[0].bar += 1;

	b[0].foo.inc().inc().inc().inc().set('hi', 0).hide();
	b[0].bar.inc();

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffRenameCombine = function (test) {
	test.expect(2);

	var a = [ { foo: 0, bar: 1 } ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a[0].boo = 8;
	a[0].bar += 1;
	a[0].foo = a[0].bar;
	delete a[0].bar;

	b[0].foo.inc().inc().inc().inc().set('hi', 0);
	b[0].rename('foo', 'too');
	b[0].too.assign(7);
	b[0].bar.inc();
	b[0].rename('too', 'boo');
	b[0].boo.inc();
	b[0].rename('bar', 'foo');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffCombineMultiDel = function (test) {
	test.expect(2);

	var a = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(b);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	delete a.a;
	delete a.b;
	delete a.c;
	delete a.d;

	b.del('a');
	b.del('b');
	b.del('c');
	b.del('d');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffCombinePushPop = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.push([ 5, 6 ]);
	a.push(7);
	a.pop();
	a.push(8);
	a.pop();
	a.pop();
	a.pop();
	a.pop();
	a.push(1);

	b.push([ 5, 6 ]);
	b.push(7);
	b.pop();
	b.push(8);
	b.pop();
	b.pop();
	b.pop();
	b.pop();
	b.push(1);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffCombineAssignDelAssign = function (test) {
	test.expect(2);

	var a = { foo: 'bar' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.foo = 'test';
	delete a.foo;
	a.foo = 'boo';

	b.foo.assign('test');
	b.del('foo');
	b.set('foo', 'boo');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffCombineSetAssign = function (test) {
	test.expect(2);

	var a = {};
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.foo = 'test';
	a.foo = 'boo';

	b.set('foo', 'test');
	b.foo.assign('boo');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffCombinePushAssign = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.push(9);
	a[5] = 100;
	a.pop();
	a.push(6);

	b.push(9);
	b[5].assign(100);
	b.pop();
	b.push(6);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffCombineUnshift = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.unshift(9);
	a[0] = 100;
	a.pop();
	a.unshift(6);

	b.unshift(9);
	b[0].assign(100);
	b.pop();
	b.unshift(6);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffMultiSet = function (test) {
	test.expect(2);

	var a = { };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.a = 1;
	b.set('a', 1);

	a.b = 2;
	b.set('b', 2);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffOverwrite = function (test) {
	test.expect(2);

	var a = { bob: 'shirt', sam: 'pants' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.bob = a.sam;
	delete a.sam;
	b.rename('sam', 'bob');

	a.sam = a.bob;
	delete a.bob;
	b.rename('bob', 'sam');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffRenameDelete = function (test) {
	test.expect(2);

	var a = { a: 1, b: 1 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.x = a.a;
	delete a.a;
	b.rename('a', 'x');

	delete a.x;
	b.del('x');

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffReverse = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4, 5 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(b);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.reverse();
	b.reverse();

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));
	
	test.done();
};

exports.testDiffReverseAssign = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4, 5 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(b);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.reverse();
	b.reverse();

	a[0] = 10;
	b[0].assign(10);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffAssignReverse = function (test) {
	test.expect(2);

	var a = [ 0, 1, 2, 3, 4, 5 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a[0] = 10;
	b[0].assign(10);
	
	a.reverse();
	b.reverse();

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));
	
	test.done();
};

exports.testDiffSwapTwice = function (test) {
	test.expect(2);

	var a = { a: 1, b: 2, c: 3, d: 4 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	var temp = a.a;
	a.a = a.b;
	a.b = temp;
	b.swap('a', b.b);

	temp = a.c;
	a.c = a.d;
	a.d = temp;
	b.swap('c', b.d);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffSwapMove = function (test) {
	test.expect(2);

	var a = { a: 1, b: 2, c: 3, d: 4 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	var temp = a.a;
	a.a = a.b;
	a.b = temp;
	b.swap('a', b.b);

	temp = a.c;
	a.c = a.d;
	a.d = temp;
	b.swap('c', b.d);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};

exports.testDiffIsDirty = function (test) {
	test.expect(3);

	var a = { a: 1, b: 1, c: 1, d: 1, e: 1 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.b.assign(2);
	b.b.assign(3);
	b.b.assign(4);

	a.b = 4;

	var dirtyCount = 0;

	while (b.isDirty()) {
		dirtyCount += 1;
		var diff = b.read();
		c.merge(diff);
	}

	test.strictEqual(dirtyCount, 3);
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(c)));

	test.done();
};