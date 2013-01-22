var Tome = require('../../tomes').Tome;

exports.testDiffSimpleString = function (test) {
	test.expect(10);

	var bReadableCount = 0;
	var cReadableCount = 0;
	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		bReadableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
		var diff = b.read();
		test.deepEqual(diff, { assign: 'fdsa' }, 'expected diff to be { assign: \'fdsa\' }'); // 4
		c.merge(diff);
	});

	c.on('readable', function () {
		cReadableCount += 1;
		test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 5
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { assign: 'fdsa' }, 'expected diff to be { assign: \'fdsa\' }'); // 6
		}
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 2

	a = 'fdsa';
	b.assign('fdsa');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 7
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 8

	test.strictEqual(bReadableCount, 1, 'expected b to emit readable 1 time.'); // 9
	test.strictEqual(cReadableCount, 1, 'expected c to emit readable 1 time.'); // 10

	test.done();
};

exports.testDiffStringToNumber = function (test) {
	test.expect(5);

	var a = 'asdf';
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

	a = 1;
	b.assign(1);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 5

	test.done();
};

exports.testDiffStringToObject = function (test) {
	test.expect(5);

	var a = 'asdf';
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

	a = { foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 };
	b.assign({ foo: [], bar: undefined, j: Infinity, k: -Infinity, l: (1 / 0), m: -(1 / 0), n: null, o: Number.MAX_VALUE, p: Number.MIN_VALUE, q: '', r: 7, s: '7', t: 0.00001 });

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 5

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
	test.expect(6);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		test.deepEqual(diff, { _a: { _b: { _c: { _d: { _e: { assign: 100 } } } } } }); // 2
		c.merge(diff);
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		test.deepEqual(diff, { _a: { _b: { _c: { _d: { _e: { assign: 100 } } } } } }); // 4
	});

	a.a.b.c.d.e = 100;
	b.a.b.c.d.e.assign(100);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	test.done();
};

exports.testDiffSubObjectSet = function (test) {
	test.expect(6);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { assign: { l: 100 } } } }); // 2
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: {  assign: { l: 100 } } } }); // 4
		}
	});

	a.a.b = { l: 100 };
	b.a.set('b', { l: 100 });

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	test.done();
};

exports.testDiffDel = function (test) {
	test.expect(6);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { del: [ 'b' ] } }); // 2
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: {  del: [ 'b' ] } }); // 4
		}
	});

	delete a.a.b;
	b.a.del('b');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	test.done();
};

exports.testDiffArraySort = function (test) {
	test.expect(28);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		test.deepEqual(diff, { rename: { '1': { to: 4 }, '2': { to: 6 }, '3': { to: 8 }, '4': { to: 2 }, '5': { to: 3 }, '6': { to: 5 }, '7': { to: 10 }, '8': { to: 7 }, '9': { to: 1 }, '10': { to: 9 } } }); // 2
		c.merge(diff);
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		test.deepEqual(diff, { rename: { '1': { to: 4 }, '2': { to: 6 }, '3': { to: 8 }, '4': { to: 2 }, '5': { to: 3 }, '6': { to: 5 }, '7': { to: 10 }, '8': { to: 7 }, '9': { to: 1 }, '10': { to: 9 } } }); // 4
	});

	a.sort();
	b.sort();

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 7 - 17
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 18 - 28
	}
	test.done();
};

exports.testDiffArrayShift = function (test) {
	test.expect(27);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
		var diff = b.read();
		test.deepEqual(diff, { "shift": [ 1 ] }); // 3
		c.merge(diff);
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 4
		var diff = c.read();
		test.deepEqual(diff, { "shift": [ 1 ] }); // 5
	});

	test.equal(a.shift(), b.shift()); // 1

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 6
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 7

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 8-17
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 18-27
	}
	test.done();
};

exports.testDiffRename = function (test) {
	test.expect(6);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { rename: { c: { to: 'z' } } } } }); // 2
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { rename: { c: { to: 'z' } } } } }); // 4
		}
	});

	a.a.b.z = a.a.b.c;
	delete a.a.b.c;
	b.a.b.rename('c', 'z');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	test.done();
};

exports.testDiffPush = function (test) {
	test.expect(36);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { push: [ 10, 11, 12, 13 ] }); // 2
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { push: [ 10, 11, 12, 13 ] }); // 4
		}
	});

	a.push(10, 11, 12, 13);
	b.push(10, 11, 12, 13);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 7-21
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 22-36
	}

	test.done();
};

exports.testDiffUnshift = function (test) {
	test.expect(36);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { unshift: [ 10, 11, 12, 13 ] }); // 2
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { unshift: [ 10, 11, 12, 13 ] }); // 4
		}
	});

	a.unshift(10, 11, 12, 13);
	b.unshift(10, 11, 12, 13);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 7-21
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 22-36
	}

	test.done();
};

exports.testDiffSplice = function (test) {
	test.expect(28);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { splice: [ 3, 2, 12, 13 ] }); // 2
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c)); // 3
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { splice: [ 3, 2, 12, 13 ] }); // 4
		}
	});

	a.splice(3, 2, 12, 13);
	b.splice(3, 2, 12, 13);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 6

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__); // 7-17
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__); // 18-28
	}

	test.done();
};

exports.testDiffCombine = function (test) {
	test.expect(1);

	var a = [ { foo: 0, bar: 1 } ];
	var b = Tome.conjure(a);

	a[0].foo = 100;
	b[0].foo.inc().inc().inc().inc().set('hi', 0).hide();
	b[0].bar.inc();

	var diff = b.read();
	test.strictEqual(JSON.stringify(diff), '{"_0":{"del":["foo"],"_bar":{"assign":2}}}');

	test.done();
};

exports.testDiffRenameCombine = function (test) {
	test.expect(3);

	var a = [ { foo: 0, bar: 1 } ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

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

	var diff = b.read();
	test.deepEqual(diff, { '_0': { rename: { bar: { to: 'foo' }, foo: { to: 'boo' } }, '_boo': { 'assign': 8 }, '_foo': { assign: 2 } } });

	c.merge(diff);

	// we get out of order so the strings are not equal... so parse em back and do a deep equal.

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(b, c);

	test.done();
};

exports.testDiffCombineMultiDel = function (test) {
	test.expect(3);

	var a = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(b);

	delete a.a;
	delete a.b;
	delete a.c;
	delete a.d;

	b.del('a');
	b.del('b');
	b.del('c');
	b.del('d');

	var diff = b.read();
	test.strictEqual(JSON.stringify(diff), '{"del":["a","b","c","d"]}');

	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffCombinePushPop = function (test) {
	test.expect(11);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

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
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[[5,6]]}');

	b.push(7);
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[[5,6],7]}');
	
	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[[5,6]]}');
	
	b.push(8);
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[[5,6],8]}');
	
	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[[5,6]]}');
	
	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{}');
	
	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{"pop":[1]}');
	
	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{"pop":[1,1]}');
	
	b.push(1);

	var diff = b.read();

	test.strictEqual(JSON.stringify(diff), '{"pop":[1,1],"push":[1]}');

	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffCombineAssignDelAssign = function (test) {
	test.expect(5);

	var a = { foo: 'bar' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.foo = 'test';
	delete a.foo;
	a.foo = 'boo';

	b.foo.assign('test');
	test.strictEqual(JSON.stringify(b.__diff__), '{"_foo":{"assign":"test"}}');

	b.del('foo');
	test.strictEqual(JSON.stringify(b.__diff__), '{"del":["foo"]}');

	b.set('foo', 'boo');

	// Yes, deleting on object and readding it will kill its listeners.

	var diff = b.read();
	test.strictEqual(JSON.stringify(diff), '{"set":{"foo":"boo"}}');

	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffCombineSetAssign = function (test) {
	test.expect(4);

	var a = {};
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.foo = 'test';
	a.foo = 'boo';

	b.set('foo', 'test');
	test.strictEqual(JSON.stringify(b.__diff__), '{"set":{"foo":"test"}}');

	b.foo.assign('boo');

	var diff = b.read();
	test.strictEqual(JSON.stringify(diff), '{"set":{"foo":"boo"}}');

	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffCombinePushAssign = function (test) {
	test.expect(6);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.push(9);
	a[5] = 100;
	a.pop();
	a.push(6);

	b.push(9);
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[9]}');

	b[5].assign(100);
	test.strictEqual(JSON.stringify(b.__diff__), '{"push":[100]}');

	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{}');

	b.push(6);

	var diff = b.read();

	test.strictEqual(JSON.stringify(diff), '{"push":[6]}');

	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffCombineUnshift = function (test) {
	test.expect(6);

	var a = [ 0, 1, 2, 3, 4 ];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.unshift(9);
	a[0] = 100;
	a.pop();
	a.unshift(6);

	b.unshift(9);
	test.strictEqual(JSON.stringify(b.__diff__), '{"unshift":[9]}');

	b[0].assign(100);
	test.strictEqual(JSON.stringify(b.__diff__), '{"unshift":[100]}');

	b.pop();
	test.strictEqual(JSON.stringify(b.__diff__), '{"unshift":[100],"pop":[1]}');

	b.unshift(6);

	var diff = b.read();

	test.strictEqual(JSON.stringify(diff), '{"unshift":[6,100],"pop":[1]}');

	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffMultiSet = function (test) {
	test.expect(4);

	var a = { };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.a = 1;
	b.set('a', 1);

	test.strictEqual(JSON.stringify(b.__diff__), '{"set":{"a":1}}');

	a.b = 2;
	b.set('b', 2);

	test.strictEqual(JSON.stringify(b.__diff__), '{"set":{"a":1,"b":2}}');

	var diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));
	test.done();
};

exports.testDiffOverwrite = function (test) {
	test.expect(6);

	var a = { bob: 'shirt', sam: 'pants' };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.bob = a.sam;
	delete a.sam;
	b.rename('sam', 'bob');

	test.deepEqual(b.__diff__, { rename: { sam: { to: 'bob', over: true } } });
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	a.sam = a.bob;
	delete a.bob;
	b.rename('bob', 'sam');

	test.deepEqual(b.__diff__, { del: [ 'bob' ] });
	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffRenameDelete = function (test) {
	test.expect(5);

	var a = { a: 1, b: 1 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	a.x = a.a;
	delete a.a;

	b.rename('a', 'x');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	delete a.x;

	b.del('x');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.deepEqual(b.__diff__, { del: [ 'a' ] }, JSON.stringify(b.__diff__));

	var diff = b.read();
	c.merge(diff);

	test.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
	test.deepEqual(b, c);

	test.done();
};
