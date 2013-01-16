var tomes = require('../../tomes');

var Tome = tomes.Tome,
	ArrayTome = tomes.ArrayTome,
	BooleanTome = tomes.BooleanTome,
	NumberTome = tomes.NumberTome,
	ObjectTome = tomes.ObjectTome,
	StringTome = tomes.StringTome,
	NullTome = tomes.NullTome,
	UndefinedTome = tomes.UndefinedTome;

var instanceOf = function (actual, expected) {
	if (actual instanceof expected) {
		return true;
	}
};

var notInstanceOf = function (actual, expected) {
	if (!(actual instanceof expected)) {
		return true;
	}
};

exports.testArrayCreation = function (test) {
	test.expect(14);
	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);
	test.ok(instanceOf(b, Tome), 'expected Tome');
	test.ok(instanceOf(b, ArrayTome), 'expected ArrayTome');
	test.ok(notInstanceOf(b, BooleanTome), 'expected not BooleanTome');
	test.ok(notInstanceOf(b, NumberTome), 'expected not NumberTome');
	test.ok(notInstanceOf(b, ObjectTome), 'expected not ObjectTome');
	test.ok(notInstanceOf(b, StringTome), 'expected not StringTome');
	test.ok(notInstanceOf(b, NullTome), 'expected not NullTome');
	test.ok(notInstanceOf(b, UndefinedTome), 'expected not UndefinedTome');
	test.ok(Array.isArray(b.valueOf()), 'expected an array');
	test.strictEqual(b.typeOf(), 'array', 'expected array');
	test.equal(a[0], b[0], 'expected 1');
	test.ok(JSON.stringify(a) === JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.ok(Tome.typeOf(a), Tome.typeOf(b));
	test.done();
};

exports.testArrayCreation2 = function (test) {
	test.expect(5);
	var a = [];
	var b = Tome.conjure(a);
	test.ok(JSON.stringify(a) === JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	a[0] = 0;
	b.set(0, 0);
	test.ok(JSON.stringify(a) === JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	a[100] = 100;
	b.set(100, 100);
	test.ok(JSON.stringify(a) === JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.ok(Tome.typeOf(a), Tome.typeOf(b));
	test.done();
};

exports.testArrayJSONStringify = function (test) {
	test.expect(2);
	var a = [{ 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayToString = function (test) {
	test.expect(2);
	var a = [{ 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);
	test.strictEqual(a.toString(), b.toString(), 'toString failure');
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayJoin = function (test) {
	test.expect(4);
	var a = [{ 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);
	test.strictEqual(a.join(), b.join(), 'join failure');
	test.strictEqual(a.join(', '), b.join(', '), 'join failure');
	test.strictEqual(a.join(5), b.join(5), 'join failure');
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayReadable = function (test) {
	test.expect(2);
	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);
	b.on('readable', function () {
		test.ok(false, 'unexpected readable'); // This should not happen.
	});
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayPush = function (test) {
	test.expect(26);

	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);

	b.on('add', function (key) {
		if (key !== b.valueOf().length - 1) {
			test.ok(false, 'unexpected add ' + key);
			return;
		}

		var value = b[key].valueOf();

		switch (key) {
		case 4:
			test.strictEqual(value, 5, 'expected 5');
			break;
		case 5:
			test.strictEqual(value, 'asdf', 'expected \'asdf\'');
			break;
		case 6:
			test.strictEqual(value, true, 'expected true');
			break;
		case 7:
			test.equal(value.f, true, 'expected true');
			break;
		case 8:
			test.strictEqual(value, null, 'expected null');
			break;
		case 9:
			test.strictEqual(value, undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected add ' + key + ': ' + value);
			break;
		}
	});

	b.on('readable', function () {
		switch (b.length) {
		case 5:
			test.equal(b[4], 5, 'expected 5');
			break;
		case 6:
			test.equal(b[5], 'asdf', 'expected \'asdf\'');
			break;
		case 7:
			test.equal(b[6], true, 'expected true');
			break;
		case 8:
			test.equal(b[7].f, true, 'expected true');
			break;
		case 9:
			test.equal(b[8].valueOf(), null, 'expected null');
			break;
		case 10:
			test.equal(b[9].valueOf(), undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected readable: ' + JSON.stringify(b));
		}
	});

	test.equal(JSON.stringify(a), JSON.stringify(b), 'expected ' + JSON.stringify(a));
	test.equal(a.push(5), b.push(5), 'expected 5');
	test.strictEqual(a.length, b.length, 'expected ' + a.length);
	test.equal(a.push('asdf'), b.push('asdf'), 'expected 6');
	test.strictEqual(a.length, b.length, 'expected ' + a.length);
	test.equal(a.push(true), b.push(true), 'expected 7');
	test.equal(a.push({ f: true }), b.push({ f: true }), 'expected 8');
	test.equal(a.push(null), b.push(null), 'expected 9');
	test.equal(a.push(undefined), b.push(undefined), 'expected 10');
	test.strictEqual(a.length, b.length, 'expected ' + a.length);
	test.equal(a.push(), b.push(), 'expected 10');
	test.equal(a.push(), b.push(), 'expected 10');
	test.equal(JSON.stringify(a), JSON.stringify(b), 'expected ' + JSON.stringify(a));
	test.strictEqual(a.length, b.length, 'expected ' + a.length);

	test.done();
};

exports.testArrayUnshift = function (test) {
	test.expect(26);

	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);

	b.on('add', function (key) {
		if (key !== 0) {
			test.ok(false, 'unexpected add ' + key);
			return;
		}
		
		var value = b[key].valueOf();

		switch (b.length) {
		case 5:
			test.strictEqual(value, 5, 'expected 5');
			break;
		case 6:
			test.strictEqual(value, 'asdf', 'expected \'asdf\'');
			break;
		case 7:
			test.strictEqual(value, true, 'expected true');
			break;
		case 8:
			test.equal(value.f, true, 'expected true');
			break;
		case 9:
			test.strictEqual(value, null, 'expected null');
			break;
		case 10:
			test.strictEqual(value, undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected add ' + key + ': ' + value);
			break;
		}
	});

	b.on('readable', function () {
		switch (b.length) {
		case 5:
			test.equal(b[0], 5, 'expected 5');
			break;
		case 6:
			test.equal(b[0], 'asdf', 'expected \'asdf\'');
			break;
		case 7:
			test.equal(b[0], true, 'expected true');
			break;
		case 8:
			test.equal(b[0].f, true, 'expected true');
			break;
		case 9:
			test.equal(b[0].valueOf(), null, 'expected null');
			break;
		case 10:
			test.equal(b[0].valueOf(), undefined);
			break;
		default:
			test.ok(false, 'unexpected readable: ' + JSON.stringify(b));
		}
	});

	test.equal(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.equal(a.unshift(5), b.unshift(5), 'expected 5');
	test.strictEqual(a.length, b.length);
	test.equal(a.unshift('asdf'), b.unshift('asdf'), 'expected 6');
	test.strictEqual(a.length, b.length);
	test.equal(a.unshift(true), b.unshift(true), 'expected 7');
	test.equal(a.unshift({ f: true }), b.unshift({ f: true }), 'expected 8');
	test.equal(a.unshift(null), b.unshift(null), 'expected 9');
	test.equal(a.unshift(undefined), b.unshift(undefined), 'expected 10');
	test.strictEqual(a.length, b.length);
	test.equal(a.unshift(), b.unshift(), 'expected 10');
	test.equal(a.unshift(), b.unshift(), 'expected 10');
	test.equal(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);

	test.done();
};

exports.testArrayPop = function (test) {
	test.expect(31);

	var a = [true, 'asdf', 4, { f: null }, { f: undefined }, null, undefined, { f: 1 }];
	var b = Tome.conjure(a);
	
	b.on('del', function (key) {
		if (key === b.valueOf().length) {
			test.ok(true, 'expected del'); // 2, 6, 10, 13, 16, 19, 22, 26
		}
	});
	
	b.on('readable', function () {
		switch (b.length) {
		case 7:
			test.equal(b[6].valueOf(), undefined, 'expected undefined'); // 3
			break;
		case 6:
			test.equal(b[5].valueOf(), null, 'expected null'); // 7
			break;
		case 5:
			test.equal(b[4].f, undefined, 'expected {f:undefined}'); // 11
			break;
		case 4:
			test.equal(b[3].f.valueOf(), null, 'expected {f:null}'); // 14
			break;
		case 3:
			test.equal(b[2], 4, 'expected 4'); // 17
			break;
		case 2:
			test.equal(b[1], 'asdf', 'expected \'asdf\''); // 20
			break;
		case 1:
			test.equal(b[0], true, 'expected true'); // 23
			break;
		case 0:
			test.deepEqual(b.valueOf(), [], 'expected empty array'); // 27
			break;
		default:
			test.ok(false, 'unexpected readable'); // This should not happen.
		}
	});

	test.strictEqual(a.pop().f, b.pop().f.valueOf(), 'expected {f:1}'); // 1
	test.strictEqual(a.length, b.length); // 4
	test.strictEqual(a.pop(), b.pop(), 'expected undefined'); // 5
	test.strictEqual(a.length, b.length); // 8
	test.strictEqual(a.pop(), b.pop(), 'expected null'); // 9
	test.strictEqual(a.pop().f, b.pop().f, 'expected {f:undefined}'); // 12
	test.strictEqual(a.pop().f, b.pop().f.valueOf(), 'expected {f:null}'); // 15
	test.strictEqual(a.length, b.length); // 18
	test.strictEqual(a.pop(), b.pop(), 'expected 4'); // 19
	test.strictEqual(a.pop(), b.pop(), 'expected asdf'); // 22
	test.strictEqual(a.pop(), b.pop(), 'expected true'); // 25
	test.strictEqual(a.pop(), b.pop(), 'expected undefined'); // 28
	test.strictEqual(a.pop(), b.pop(), 'expected undefined'); // 29
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 30
	test.strictEqual(a.length, b.length); // 31
	
	test.done();
};

exports.testArrayShift = function (test) {
	test.expect(31);

	var a = [true, 'asdf', 4, { f: null }, { f: undefined }, null, undefined, { f: 1 }];
	var b = Tome.conjure(a);
	
	b.on('del', function (key) {
		if (key === 0) {
			test.ok(true, 'expected del'); // 2, 6, 10, 13, 16, 19, 22, 26
		}
	});
	
	b.on('readable', function () {
		switch (b.length) {
		case 0:
			test.deepEqual(b.valueOf(), [], 'expected empty array'); // 27
			break;
		case 1:
			test.equal(b[0].f.valueOf(), 1, 'expected {f:1}'); // 23
			break;
		case 2:
			test.equal(b[0].valueOf(), undefined, 'expected undefined'); // 20
			break;
		case 3:
			test.equal(b[0].valueOf(), null, 'expected null'); // 17
			break;
		case 4:
			test.equal(b[0].f, undefined, 'expected {f:undefined}'); // 14
			break;
		case 5:
			test.equal(b[0].f.valueOf(), null, 'expected {f:null}'); // 11
			break;
		case 6:
			test.equal(b[0], 4, 'expected 4'); // 7
			break;
		case 7:
			test.equal(b[0], 'asdf', 'expected \'asdf\''); // 3
			break;
		default:
			test.ok(false, 'unexpected readable'); // This should not happen.
		}
	});

	test.equal(a.shift(), b.shift(), 'expected true'); // 1
	test.strictEqual(a.length, b.length); // 4
	test.equal(a.shift(), b.shift(), 'expected \'asdf\''); // 5
	test.strictEqual(a.length, b.length); // 8
	test.equal(a.shift(), b.shift(), 'expected 4'); // 9
	test.equal(a.shift().f, b.shift().f.valueOf(), 'expected {f:null}'); // 12
	test.equal(a.shift().f, b.shift().f, 'expected {f:undefined}'); // 15
	test.equal(a.shift(), b.shift(), 'expected null'); // 18
	test.equal(a.shift(), b.shift(), 'expected undefined'); // 21
	test.strictEqual(a.length, b.length); // 24
	test.equal(a.shift().f, b.shift().f.valueOf(), 'expected {f:1}'); // 25
	test.equal(a.shift(), b.shift(), 'expected undefined'); // 28
	test.equal(a.shift(), b.shift(), 'expected undefined'); // 29
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 30
	test.strictEqual(a.length, b.length); // 31

	test.done();
};

exports.testArraySort = function (test) {
	test.expect(7);

	var a = [1, 6, 5, 8, 7, 9, 4, 5, 6, 99];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4, 5
	});
	
	a.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	b.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	
	test.strictEqual(a.length, b.length); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
	
	a.push('asdf', 'foo', 'bar', 'zebra', 'banana', 'kangaroo');
	b.push('asdf', 'foo', 'bar', 'zebra', 'banana', 'kangaroo');

	a.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	b.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 6
	test.strictEqual(a.length, b.length); // 7
	
	test.done();
};

exports.testArrayMapSqrt = function (test) {
	test.expect(5);

	var a = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 'asdf', true, null, undefined];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});
	
	var x = a.map(Math.sqrt);
	var y = b.map(Math.sqrt);
	
	test.strictEqual(JSON.stringify(x), JSON.stringify(y)); // 1
	test.strictEqual(x.length, y.length); // 2
	test.strictEqual(Tome.typeOf(x), Tome.typeOf(y)); // 3
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.strictEqual(a.length, b.length); // 5
	
	test.done();
};

exports.testArrayMapParseInt = function (test) {
	test.expect(5);

	var a = ['1', '4', '9', '16', '25', '36', '49', '64', '81', '100', 'asdf', true, null, undefined];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});
	
	function returnInt(element) {
		return parseInt(element ? element.valueOf() : element, 10);
	}
	
	var x = a.map(returnInt);
	var y = b.map(returnInt);
	
	test.strictEqual(JSON.stringify(x), JSON.stringify(y)); // 1
	test.strictEqual(x.length, y.length); // 2
	test.strictEqual(Tome.typeOf(x), Tome.typeOf(y)); // 3
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 4
	test.strictEqual(a.length, b.length); // 5
	
	test.done();
};

exports.testArrayIndexOf = function (test) {
	test.expect(8);

	var a = ['1', '4', '9', '16', '25', '36', '49', '64', '81', '100', 'asdf', true, null, undefined, '49', null, '100'];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});
	
	test.strictEqual(a.indexOf('49'), b.indexOf('49'), 'expected 6'); // 1
	test.strictEqual(a.indexOf(null), b.indexOf(null), 'expected 12'); // 2
	test.strictEqual(a.indexOf(true), b.indexOf(true), 'expected 11'); // 3
	test.strictEqual(a.indexOf(undefined), b.indexOf(undefined), 'expected 13'); // 4
	test.strictEqual(a.indexOf('100', 11), b.indexOf('100', 11), 'expected 16'); // 5
	test.strictEqual(a.indexOf('not found'), b.indexOf('not found')); // 6
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 7
	test.strictEqual(a.length, b.length); // 8
	
	test.done();
};

exports.testArrayLastIndexOf = function (test) {
	test.expect(7);

	var a = ['1', '4', '9', '16', '25', '36', '49', '64', '81', '100', 'asdf', true, null, undefined, '49', null, '100'];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});
	
	test.strictEqual(a.lastIndexOf('49'), b.lastIndexOf('49'), 'expected 14'); // 1
	test.strictEqual(a.lastIndexOf(null), b.lastIndexOf(null), 'expected 15'); // 2
	test.strictEqual(a.lastIndexOf(true), b.lastIndexOf(true), 'expected 11'); // 3
	test.strictEqual(a.lastIndexOf(undefined), b.lastIndexOf(undefined), 'expected 13'); // 4
	test.strictEqual(a.lastIndexOf('100', 11), b.lastIndexOf('100', 11), 'expected 16'); // 5
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 6
	test.strictEqual(a.length, b.length); // 7
	
	test.done();
};

exports.testArraySlice = function (test) {
	test.expect(10);

	var a = [ { 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});

	test.strictEqual(JSON.stringify(a.slice(1, 4)), JSON.stringify(b.slice(1, 4))); // 1
	test.strictEqual(a.slice(1, 4).length, b.slice(1, 4).length); // 2
	test.strictEqual(JSON.stringify(a.slice(-1, 2)), JSON.stringify(b.slice(-1, 2)), 'expected []'); // 3
	test.strictEqual(a.slice(-1, 2).length, b.slice(-1, 2).length); // 4
	test.strictEqual(JSON.stringify(a.slice(1, -2)), JSON.stringify(b.slice(1, -2)), 'expected ["six",false,[1,2],{},[]]'); // 5
	test.strictEqual(a.slice(1, -2).length, b.slice(1, -2).length); // 6
	test.strictEqual(JSON.stringify(a.slice(2)), JSON.stringify(b.slice(2)), 'expected [false,[1,2],{},[],null,null]'); // 7
	test.strictEqual(a.slice(2).length, b.slice(2).length); // 8
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 9
	test.strictEqual(a.length, b.length); // 10

	test.done();
};

exports.testArrayConcat = function (test) {
	test.expect(11);

	var a = [ { 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);
	var c = [ 1, 2, 3, 4, 5, 6, [ 7, 8, 9] ];
	var d = { d: 1, e: 'e', f: [ 1, 2, 3, 4]};

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});

	test.strictEqual(JSON.stringify(a.concat(c)), JSON.stringify(b.concat(c))); // 1
	test.strictEqual(a.concat(c).length, b.concat(c).length); // 2
	test.strictEqual(Array.isArray(a.concat(c)), ArrayTome.isArrayTome(b.concat(c))); // 3
	test.strictEqual(JSON.stringify(a.concat(d)), JSON.stringify(b.concat(d))); // 4
	test.strictEqual(a.concat(d).length, b.concat(d).length); // 5
	test.strictEqual(Array.isArray(a.concat(d)), ArrayTome.isArrayTome(b.concat(d))); // 6
	test.strictEqual(JSON.stringify(a.concat(d, c, a)), JSON.stringify(b.concat(d, c, a))); // 7
	test.strictEqual(a.concat(d, c, a).length, b.concat(d, c, a).length); // 8
	test.strictEqual(Array.isArray(a.concat(d, c, a)), ArrayTome.isArrayTome(b.concat(d, c, a))); // 9
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 10
	test.strictEqual(a.length, b.length); // 11

	test.done();
};

exports.testArrayReduce = function (test) {
	test.expect(4);

	function sum(previousValue, currentValue) {
		return previousValue + currentValue;
	}
	
	var a = [0, 1, 2, 3, 4, 5];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	});
	
	test.strictEqual(JSON.stringify(a.reduce(sum)), JSON.stringify(b.reduce(sum))); // 1
	test.strictEqual(a.reduce(sum).length, b.reduce(sum).length); // 2
	test.strictEqual(JSON.stringify(a.reduce(sum, 10)), JSON.stringify(b.reduce(sum, 10))); // 3
	test.strictEqual(a.length, b.length); // 4
	
	test.done();
};

exports.testArrayReduceRight = function (test) {
	test.expect(3);

	function sum(previousValue, currentValue) {
		return previousValue + currentValue;
	}
	
	var a = [0, 1, 2, 3, 4, 5];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});
	
	test.strictEqual(JSON.stringify(a.reduceRight(sum)), JSON.stringify(b.reduceRight(sum))); // 1
	test.strictEqual(JSON.stringify(a.reduceRight(sum, 10)), JSON.stringify(b.reduceRight(sum, 10))); // 2
	test.strictEqual(a.length, b.length); // 3
	
	test.done();
};

exports.testArrayFilter = function (test) {
	test.expect(4);

	function isBigEnough(element) {
		return (element >= 10);
	}
	
	var a = [12, 5, 8, 130, 44];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // This should not happen.
	});
	
	test.strictEqual(JSON.stringify(a.filter(isBigEnough)), JSON.stringify(b.filter(isBigEnough))); // 1
	test.strictEqual(a.filter(isBigEnough).length, b.filter(isBigEnough).length); // 2
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 3
	test.strictEqual(a.length, b.length); // 4
	
	test.done();
};

exports.testArraySome = function (test) {
	test.expect(4);

	function isBigEnough(element) {
		return (element >= 10);
	}
	
	var a = [12, 5, 8, 1, 4];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	});
	
	test.strictEqual(JSON.stringify(a.some(isBigEnough)), JSON.stringify(b.some(isBigEnough)), 'expected true'); // 1
	
	a.shift();
	b.shift();
	
	test.strictEqual(JSON.stringify(a.some(isBigEnough)), JSON.stringify(b.some(isBigEnough)), 'expected false'); // 3
	test.strictEqual(a.length, b.length); // 4
	
	test.done();
};

exports.testArrayEvery = function (test) {
	test.expect(5);

	function isBigEnough(element) {
		return (element >= 10);
	}

	var a = [12, 15, 18, 11, 4];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	});

	test.strictEqual(JSON.stringify(a.every(isBigEnough)), JSON.stringify(b.every(isBigEnough)), 'expected false'); // 1

	a.pop();
	b.pop();

	test.strictEqual(JSON.stringify(a.every(isBigEnough)), JSON.stringify(b.every(isBigEnough)), 'expected true'); // 3

	a = [];
	b = Tome.conjure(a);

	test.strictEqual(JSON.stringify(a.every(isBigEnough)), JSON.stringify(b.every(isBigEnough)), 'expected true'); // 4
	test.strictEqual(a.length, b.length); // 5

	test.done();
};

exports.testArrayForEach = function (test) {
	test.expect(22);
	
	function inc(element, index, array) {
		test.equal(element, array[index]);
	}
	
	var a = [12, 15, 18, 11, 4];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 11
	});
	
	test.strictEqual(JSON.stringify(a.forEach(inc)), JSON.stringify(b.forEach(inc))); // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
	
	a.pop();
	b.pop();
	
	test.strictEqual(JSON.stringify(a.forEach(inc)), JSON.stringify(b.forEach(inc))); // 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
	test.strictEqual(a.length, b.length); // 22

	test.done();
};

exports.testArraySliceSubObjectModify = function (test) {
	test.expect(2);

	var x = { john: { pants: 'blue' } };
	var a = [1, 2, 3, 4, x];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});
	
	a.slice(4)[0].john.pants = 'red';
	b.slice(4)[0].john.pants.assign('red');
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	
	test.done();
};

exports.testArrayFilterSubObjectModify = function (test) {
	test.expect(2);
	
	function isnotanumber(element) {
		return typeof element.valueOf() !== 'number';
	}
	
	var x = { john: { pants: 'blue' } };
	var a = [1, 2, 3, 4, x];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});
	
	a.filter(isnotanumber)[0].john.pants = 'red';
	b.filter(isnotanumber)[0].john.pants.assign('red');
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2

	test.done();
};

exports.testArrayConcatSubObjectModify = function (test) {
	test.expect(2);
	
	var x = { john: { pants: 'blue' } };
	var a = [1, 2, 3, 4, x];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});
	
	a.concat([6, 7, 8, 9])[4].john.pants = 'red';
	b.concat([6, 7, 8, 9])[4].john.pants.assign('red');
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	
	test.done();
};

exports.testArraySubObjectModify = function (test) {
	test.expect(2);

	var a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	var b = Tome.conjure(a);
	var x = a[4];
	var y = b[4];
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	});
	
	x.john = { shirt: 'red' };
	y.john.assign({ shirt: 'red' });
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	
	test.done();
};

exports.testArrayAssign = function (test) {
	test.expect(15);

	var a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	var b = Tome.conjure(a);
	
	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4, 7, 10, 13
	});
	
	a = 'string';
	b.assign('string');
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); // 3
	
	a = 1;
	b.assign(1);
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); // 6
	
	a = true;
	b.assign(true);
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 8
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); // 9
	
	a = { asdf: { asdf: true } };
	b.assign({ asdf: { asdf: true } });
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 11
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); // 12
	
	a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	b.assign([ 1, 2, 3, 4, { john: { pants: 'blue' } } ]);
	
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 15
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b)); //15
	
	test.done();
};

exports.testArraySet = function (test) {
	test.expect(15);

	var a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	var b = Tome.conjure(a);

	b.on('readable', function () {
		test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1, 4, 7, 10, 13
	});

	a[1] = 'string';
	b.set(1, 'string');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1])); // 3

	a[1] = 1;
	b.set(1, 1);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 5
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1])); // 6

	a[1] = true;
	b.set(1, true);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 8
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1])); // 9

	a[1] = { asdf: { asdf: true } };
	b.set(1, { asdf: { asdf: true } });

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 11
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1])); // 12

	a[1] = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	b.set(1, [ 1, 2, 3, 4, { john: { pants: 'blue' } } ]);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 14
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1])); // 15

	test.done();
};