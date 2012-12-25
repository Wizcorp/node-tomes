var tomes = require('../../tomes');

var Tome = tomes.Tome;

exports.testDiffSimpleString = function (test) {
	test.expect(12);

	var bReadableCount = 0;
	var cReadableCount = 0;
	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	// these pauses will go away...

	b.pause();
	c.pause();

	b.on('readable', function () {
		bReadableCount += 1;
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 5
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { assign: 'fdsa' }, 'expected diff to be { assign: \'fdsa\' }'); // 6
			c.merge(diff);
		}
	});

	c.on('readable', function () {
		cReadableCount += 1;
		test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 2, 7
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { assign: 'fdsa' }, 'expected diff to be { assign: \'fdsa\' }'); // 8
		}
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 4

	a = 'fdsa';
	b.assign('fdsa');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.strictEqual(JSON.stringify(b), JSON.stringify(c)); // 10

	test.strictEqual(bReadableCount, 2, 'expected b to emit readable 2 times.'); // 11
	test.strictEqual(cReadableCount, 2, 'expected c to emit readable 2 times.'); // 12

	test.done();
};

exports.testDiffStringToNumber = function (test) {
	test.expect(6);

	var a = 'asdf';
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(b), JSON.stringify(c));
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

	b.pause();
	c.pause();

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(b), JSON.stringify(c));
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

	b.pause();
	c.pause();

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(b), JSON.stringify(c));
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

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { _c: { _d: { _e: { assign: 100 } } } } } });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { _c: { _d: { _e: { assign: 100 } } } } } });
		}
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

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { assign: { l: 100 } } } });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: {  assign: { l: 100 } } } });
		}
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

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { del: 'b' } });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: {  del: 'b' } });
		}
	});

	delete a.a.b;
	b.a.del('b');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffArraySort = function (test) {
	test.expect(30);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { rename: [ { o: 9, n: 1 }, { o: 4, n: 2 }, { o: 5, n: 3 }, { o: 1, n: 4 }, { o: 6, n: 5 }, { o: 2, n: 6 }, { o: 8, n: 7 }, { o: 3, n: 8 }, { o: 10, n: 9 }, { o: 7, n: 10 } ] });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { rename: [ { o: 9, n: 1 }, { o: 4, n: 2 }, { o: 5, n: 3 }, { o: 1, n: 4 }, { o: 6, n: 5 }, { o: 2, n: 6 }, { o: 8, n: 7 }, { o: 3, n: 8 }, { o: 10, n: 9 }, { o: 7, n: 10 } ] });
		}
	});

	a.sort();
	b.sort();

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__);
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__);
	}
	test.done();
};

exports.testDiffArrayShift = function (test) {
	test.expect(29);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { "shift": 1 });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { "shift": 1 });
		}
	});

	test.equal(a.shift(), b.shift());

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__);
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__);
	}
	test.done();
};

exports.testDiffRename = function (test) {
	test.expect(8);

	var a = { a: { b: { c: { d: { e: 7 }, f: 8 }, g: 9 }, h: 10 }, i: 11, j: 12, k: 13 };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { rename: [ { o: 'c', n: 'z' } ] } } });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { _a: { _b: { rename: [ { o: 'c', n: 'z' } ] } } });
		}
	});

	a.a.b.z = a.a.b.c;
	delete a.a.b.c;
	b.a.b.rename('c', 'z');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testDiffPush = function (test) {
	test.expect(38);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { push: [ 10, 11, 12, 13 ] });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { push: [ 10, 11, 12, 13 ] });
		}
	});

	a.push(10, 11, 12, 13);
	b.push(10, 11, 12, 13);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__);
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__);
	}

	test.done();
};

exports.testDiffUnshift = function (test) {
	test.expect(38);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { unshift: [ 10, 11, 12, 13 ] });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { unshift: [ 10, 11, 12, 13 ] });
		}
	});

	a.unshift(10, 11, 12, 13);
	b.unshift(10, 11, 12, 13);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__);
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__);
	}

	test.done();
};

exports.testDiffSplice = function (test) {
	test.expect(30);

	var a = [ 0, 5, 6, 8, 2, 3, 6, undefined, 7, 0, 9];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
		var diff = b.read();
		if (diff) {
			test.deepEqual(diff, { splice: [ 3, 2, 12, 13 ] });
			c.consume(diff);
		}
	});

	c.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(c));
		var diff = c.read();
		if (diff) {
			test.deepEqual(diff, { splice: [ 3, 2, 12, 13 ] });
		}
	});

	a.splice(3, 2, 12, 13);
	b.splice(3, 2, 12, 13);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	for (var i = 0, len = b.length; i < len; i += 1) {
		test.strictEqual(i, b[i].__key__);
	}

	for (i = 0, len = c.length; i < len; i += 1) {
		test.strictEqual(i, c[i].__key__);
	}

	test.done();
};

exports.testDiffMove = function (test) {
	test.expect(3);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.consume(diff);
		}
	});

	b.b.move('c', b.d.e);

	test.strictEqual(JSON.stringify(b), JSON.stringify(c));
	test.strictEqual(b.d.e.c.__parent__, b.d.e);
	test.strictEqual(c.d.e.c.__parent__, c.d.e);

	test.done();
};

exports.testDiffMoveArray = function (test) {
	test.expect(3);

	var a = [ 0, 1, 2, 3, 4];
	var b = Tome.conjure(a);
	var c = Tome.conjure(a);

	b.pause();
	c.pause();

	b.on('readable', function () {
		var diff = b.read();
		if (diff) {
			c.consume(diff);
		}
	});

	b.move(0, 4);

	test.strictEqual(JSON.stringify(b), JSON.stringify(c));
	test.strictEqual(b[4].__key__, 4);
	test.strictEqual(c[4].__key__, 4);

	test.done();
};
