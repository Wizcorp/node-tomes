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

exports.testArraySignal = function (test) {
	test.expect(3);
	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);
	b.on('signal', function () {
		test.ok(true, 'expected signal');
	});
	test.ok(JSON.stringify(a) === JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayPush = function (test) {
	test.expect(27);
	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);
	b.on('add', function (key, value) {
		if (key !== b.valueOf().length - 1) {
			test.ok(false, 'unexpected add ' + key + ': ' + value);
			return;
		}
		switch (key) {
		case 4:
			test.equal(value, 5, 'expected 5');
			break;
		case 5:
			test.equal(value, 'asdf', 'expected \'asdf\'');
			break;
		case 6:
			test.equal(value, true, 'expected true');
			break;
		case 7:
			test.equal(value.f, true, 'expected true');
			break;
		case 8:
			test.equal(value, null, 'expected null');
			break;
		case 9:
			test.equal(value, undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected add ' + key + ': ' + value);
			break;
		}
	});
	b.on('signal', function (value) {
		switch (value.length) {
		case 4:
			test.equal(value[3], 4, 'expected 4');
			break;
		case 5:
			test.equal(value[4], 5, 'expected 5');
			break;
		case 6:
			test.equal(value[5], 'asdf', 'expected \'asdf\'');
			break;
		case 7:
			test.equal(value[6], true, 'expected true');
			break;
		case 8:
			test.equal(value[7].f, true, 'expected true');
			break;
		case 9:
			test.equal(value[8].valueOf(), null, 'expected null');
			break;
		case 10:
			test.equal(value[9].valueOf(), undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected signal ' + JSON.stringify(value));
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
	test.expect(27);
	var a = [1, 2, 3, 4];
	var b = Tome.conjure(a);
	b.on('add', function (key, value) {
		if (key !== 0) {
			test.ok(false, 'unexpected add ' + key + ': ' + value);
			return;
		}
		switch (b.valueOf().length) {
		case 5:
			test.equal(value, 5, 'expected 5');
			break;
		case 6:
			test.equal(value, 'asdf', 'expected \'asdf\'');
			break;
		case 7:
			test.equal(value, true, 'expected true');
			break;
		case 8:
			test.equal(value.f, true, 'expected true');
			break;
		case 9:
			test.equal(value, null, 'expected null');
			break;
		case 10:
			test.equal(value, undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected add ' + key + ': ' + value);
			break;
		}
	});
	b.on('signal', function (value) {
		switch (value.length) {
		case 4:
			test.equal(value[0], 1, 'expected 1');
			break;
		case 5:
			test.equal(value[0], 5, 'expected 5');
			break;
		case 6:
			test.equal(value[0], 'asdf', 'expected \'asdf\'');
			break;
		case 7:
			test.equal(value[0], true, 'expected true');
			break;
		case 8:
			test.equal(value[0].f, true, 'expected true');
			break;
		case 9:
			test.equal(value[0].valueOf(), null, 'expected null');
			break;
		case 10:
			test.equal(value[0].valueOf(), undefined, 'expected undefined');
			break;
		default:
			test.ok(false, 'unexpected signal ' + JSON.stringify(value));
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
	test.expect(32);
	var a = [true, 'asdf', 4, { f: null }, { f: undefined }, null, undefined, { f: 1 }];
	var b = Tome.conjure(a);
	b.on('del', function (key) {
		if (key === b.valueOf().length) {
			test.ok(true, 'expected signal');
		}
	});
	b.on('signal', function (value) {
		switch (value.length) {
		case 8:
			test.equal(value[7].f.valueOf(), 1, 'expected {f:1}');
			break;
		case 7:
			test.equal(value[6].valueOf(), undefined, 'expected undefined');
			break;
		case 6:
			test.equal(value[5].valueOf(), null, 'expected null');
			break;
		case 5:
			test.equal(value[4].f, undefined, 'expected {f:undefined}');
			break;
		case 4:
			test.equal(value[3].f.valueOf(), null, 'expected {f:null}');
			break;
		case 3:
			test.equal(value[2], 4, 'expected 4');
			break;
		case 2:
			test.equal(value[1], 'asdf', 'expected \'asdf\'');
			break;
		case 1:
			test.equal(value[0], true, 'expected true');
			break;
		case 0:
			test.deepEqual(value.valueOf(), [], 'expected empty array');
			break;
		default:
			test.ok(false, 'unexpected signal');
		}
	});
	test.strictEqual(a.pop().f, b.pop().f.valueOf(), 'expected {f:1}');
	test.strictEqual(a.length, b.length);
	test.strictEqual(a.pop(), b.pop(), 'expected undefined');
	test.strictEqual(a.length, b.length);
	test.strictEqual(a.pop(), b.pop(), 'expected null');
	test.strictEqual(a.pop().f, b.pop().f, 'expected {f:undefined}');
	test.strictEqual(a.pop().f, b.pop().f.valueOf(), 'expected {f:null}');
	test.strictEqual(a.length, b.length);
	test.strictEqual(a.pop(), b.pop(), 'expected 4');
	test.strictEqual(a.pop(), b.pop(), 'expected asdf');
	test.strictEqual(a.pop(), b.pop(), 'expected true');
	test.strictEqual(a.pop(), b.pop(), 'expected undefined');
	test.strictEqual(a.pop(), b.pop(), 'expected undefined');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayShift = function (test) {
	test.expect(32);
	var a = [true, 'asdf', 4, { f: null }, { f: undefined }, null, undefined, { f: 1 }];
	var b = Tome.conjure(a);
	b.on('del', function (key) {
		if (key === 0) {
			test.ok(true, 'expected del');
		}
	});
	b.on('signal', function (value) {
		switch (value.length) {
		case 0:
			test.deepEqual(value.valueOf(), [], 'expected empty array');
			break;
		case 1:
			test.equal(value[0].f.valueOf(), 1, 'expected {f:1}');
			break;
		case 2:
			test.equal(value[0].valueOf(), undefined, 'expected undefined');
			break;
		case 3:
			test.equal(value[0].valueOf(), null, 'expected null');
			break;
		case 4:
			test.equal(value[0].f, undefined, 'expected {f:undefined}');
			break;
		case 5:
			test.equal(value[0].f.valueOf(), null, 'expected {f:null}');
			break;
		case 6:
			test.equal(value[0], 4, 'expected 4');
			break;
		case 7:
			test.equal(value[0], 'asdf', 'expected \'asdf\'');
			break;
		case 8:
			test.equal(value[0], true, 'expected true');
			break;
		default:
			test.ok(false, 'unexpected signal');
		}
	});
	test.equal(a.shift(), b.shift(), 'expected true');
	test.strictEqual(a.length, b.length);
	test.equal(a.shift(), b.shift(), 'expected \'asdf\'');
	test.strictEqual(a.length, b.length);
	test.equal(a.shift(), b.shift(), 'expected 4');
	test.equal(a.shift().f, b.shift().f.valueOf(), 'expected {f:null}');
	test.equal(a.shift().f, b.shift().f, 'expected {f:undefined}');
	test.equal(a.shift(), b.shift(), 'expected null');
	test.equal(a.shift(), b.shift(), 'expected undefined');
	test.strictEqual(a.length, b.length);
	test.equal(a.shift().f, b.shift().f.valueOf(), 'expected {f:1}');
	test.equal(a.shift(), b.shift(), 'expected undefined');
	test.equal(a.shift(), b.shift(), 'expected undefined');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArraySort = function (test) {
	test.expect(8);
	var a = [1, 6, 5, 8, 7, 9, 4, 5, 6, 99];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'sort failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	a.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	b.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	test.strictEqual(a.length, b.length);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'sort failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	a.push('asdf', 'foo', 'bar', 'zebra', 'banana', 'kangaroo');
	b.push('asdf', 'foo', 'bar', 'zebra', 'banana', 'kangaroo');
	a.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	b.sort(function (a, b) { return a.valueOf() - b.valueOf(); });
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'sort failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayMapSqrt = function (test) {
	test.expect(6);
	var a = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 'asdf', true, null, undefined];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	var x = a.map(Math.sqrt);
	var y = b.map(Math.sqrt);
	test.strictEqual(JSON.stringify(x), JSON.stringify(y), 'map failure: ' + JSON.stringify(x) + '!==' + JSON.stringify(y));
	test.strictEqual(x.length, y.length);
	test.strictEqual(Tome.typeOf(x), Tome.typeOf(y));
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayMapParseInt = function (test) {
	test.expect(6);
	var a = ['1', '4', '9', '16', '25', '36', '49', '64', '81', '100', 'asdf', true, null, undefined];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	function returnInt(element) {
		return parseInt(element ? element.valueOf() : element, 10);
	}
	var x = a.map(returnInt);
	var y = b.map(returnInt);
	test.strictEqual(JSON.stringify(x), JSON.stringify(y), 'map failure: ' + JSON.stringify(x) + '!==' + JSON.stringify(y));
	test.strictEqual(x.length, y.length);
	test.strictEqual(Tome.typeOf(x), Tome.typeOf(y));
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayIndexOf = function (test) {
	test.expect(9);
	var a = ['1', '4', '9', '16', '25', '36', '49', '64', '81', '100', 'asdf', true, null, undefined, '49', null, '100'];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(a.indexOf('49'), b.indexOf('49'), 'expected 6');
	test.strictEqual(a.indexOf(null), b.indexOf(null), 'expected 12');
	test.strictEqual(a.indexOf(true), b.indexOf(true), 'expected 11');
	test.strictEqual(a.indexOf(undefined), b.indexOf(undefined), 'expected 13');
	test.strictEqual(a.indexOf('100', 11), b.indexOf('100', 11), 'expected 16');
	test.strictEqual(a.indexOf('not found'), b.indexOf('not found'));
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayLastIndexOf = function (test) {
	test.expect(8);
	var a = ['1', '4', '9', '16', '25', '36', '49', '64', '81', '100', 'asdf', true, null, undefined, '49', null, '100'];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(a.lastIndexOf('49'), b.lastIndexOf('49'), 'expected 14');
	test.strictEqual(a.lastIndexOf(null), b.lastIndexOf(null), 'expected 15');
	test.strictEqual(a.lastIndexOf(true), b.lastIndexOf(true), 'expected 11');
	test.strictEqual(a.lastIndexOf(undefined), b.lastIndexOf(undefined), 'expected 13');
	test.strictEqual(a.lastIndexOf('100', 11), b.lastIndexOf('100', 11), 'expected 16');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArraySlice = function (test) {
	test.expect(11);
	var a = [ { 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.slice(1, 4)), JSON.stringify(b.slice(1, 4)));
	test.strictEqual(a.slice(1, 4).length, b.slice(1, 4).length);
	test.strictEqual(JSON.stringify(a.slice(-1, 2)), JSON.stringify(b.slice(-1, 2)), 'expected []');
	test.strictEqual(a.slice(-1, 2).length, b.slice(-1, 2).length);
	test.strictEqual(JSON.stringify(a.slice(1, -2)), JSON.stringify(b.slice(1, -2)), 'expected ["six",false,[1,2],{},[]]');
	test.strictEqual(a.slice(1, -2).length, b.slice(1, -2).length);
	test.strictEqual(JSON.stringify(a.slice(2)), JSON.stringify(b.slice(2)), 'expected [false,[1,2],{},[],null,null]');
	test.strictEqual(a.slice(2).length, b.slice(2).length);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayConcat = function (test) {
	test.expect(12);
	var a = [ { 1: 2, 3: { 4: 5 } }, 'six', false, [1, 2], {}, [], null, undefined];
	var b = Tome.conjure(a);
	var c = [ 1, 2, 3, 4, 5, 6, [ 7, 8, 9] ];
	var d = { d: 1, e: 'e', f: [ 1, 2, 3, 4]};
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.concat(c)), JSON.stringify(b.concat(c)));
	test.strictEqual(a.concat(c).length, b.concat(c).length);
	test.strictEqual(Array.isArray(a.concat(c)), ArrayTome.isArrayTome(b.concat(c)));
	test.strictEqual(JSON.stringify(a.concat(d)), JSON.stringify(b.concat(d)));
	test.strictEqual(a.concat(d).length, b.concat(d).length);
	test.strictEqual(Array.isArray(a.concat(d)), ArrayTome.isArrayTome(b.concat(d)));
	test.strictEqual(JSON.stringify(a.concat(d, c, a)), JSON.stringify(b.concat(d, c, a)));
	test.strictEqual(a.concat(d, c, a).length, b.concat(d, c, a).length);
	test.strictEqual(Array.isArray(a.concat(d, c, a)), ArrayTome.isArrayTome(b.concat(d, c, a)));
	test.strictEqual(JSON.stringify(a), JSON.stringify(b), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayReduce = function (test) {
	test.expect(5);
	function sum(previousValue, currentValue) {
		return previousValue + currentValue;
	}
	var a = [0, 1, 2, 3, 4, 5];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.reduce(sum)), JSON.stringify(b.reduce(sum)));
	test.strictEqual(a.reduce(sum).length, b.reduce(sum).length);
	test.strictEqual(JSON.stringify(a.reduce(sum, 10)), JSON.stringify(b.reduce(sum, 10)));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayReduceRight = function (test) {
	test.expect(4);
	function sum(previousValue, currentValue) {
		return previousValue + currentValue;
	}
	var a = [0, 1, 2, 3, 4, 5];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.reduceRight(sum)), JSON.stringify(b.reduceRight(sum)));
	test.strictEqual(JSON.stringify(a.reduceRight(sum, 10)), JSON.stringify(b.reduceRight(sum, 10)));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayFilter = function (test) {
	test.expect(5);
	function isBigEnough(element) {
		return (element >= 10);
	}
	var a = [12, 5, 8, 130, 44];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.filter(isBigEnough)), JSON.stringify(b.filter(isBigEnough)));
	test.strictEqual(a.filter(isBigEnough).length, b.filter(isBigEnough).length);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArraySome = function (test) {
	test.expect(5);
	function isBigEnough(element) {
		return (element >= 10);
	}
	var a = [12, 5, 8, 1, 4];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.some(isBigEnough)), JSON.stringify(b.some(isBigEnough)), 'expected true');
	a.shift();
	b.shift();
	test.strictEqual(JSON.stringify(a.some(isBigEnough)), JSON.stringify(b.some(isBigEnough)), 'expected false');
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayEvery = function (test) {
	test.expect(6);
	function isBigEnough(element) {
		return (element >= 10);
	}
	var a = [12, 15, 18, 11, 4];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.every(isBigEnough)), JSON.stringify(b.every(isBigEnough)), 'expected false');
	a.pop();
	b.pop();
	test.strictEqual(JSON.stringify(a.every(isBigEnough)), JSON.stringify(b.every(isBigEnough)), 'expected true');
	a = [];
	b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a.every(isBigEnough)), JSON.stringify(b.every(isBigEnough)), 'expected true');
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArrayForEach = function (test) {
	test.expect(23);
	function inc(element, index, array) {
		test.equal(element, array[index]);
	}
	var a = [12, 15, 18, 11, 4];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	test.strictEqual(JSON.stringify(a.forEach(inc)), JSON.stringify(b.forEach(inc)));
	a.pop();
	b.pop();
	test.strictEqual(JSON.stringify(a.forEach(inc)), JSON.stringify(b.forEach(inc)));
	test.strictEqual(a.length, b.length);
	test.done();
};

exports.testArraySliceSubObjectModify = function (test) {
	test.expect(3);
	var x = { john: { pants: 'blue' } };
	var a = [1, 2, 3, 4, x];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	a.slice(4)[0].john.pants = 'red';
	b.slice(4)[0].john.pants.assign('red');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.done();
};

exports.testArrayFilterSubObjectModify = function (test) {
	test.expect(3);
	function isnotanumber(element) {
		return typeof element.valueOf() !== 'number';
	}
	var x = { john: { pants: 'blue' } };
	var a = [1, 2, 3, 4, x];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	a.filter(isnotanumber)[0].john.pants = 'red';
	b.filter(isnotanumber)[0].john.pants.assign('red');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.done();
};

exports.testArrayConcatSubObjectModify = function (test) {
	test.expect(3);
	var x = { john: { pants: 'blue' } };
	var a = [1, 2, 3, 4, x];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	a.concat([6, 7, 8, 9])[4].john.pants = 'red';
	b.concat([6, 7, 8, 9])[4].john.pants.assign('red');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.done();
};

exports.testArraySubObjectModify = function (test) {
	test.expect(3);
	var a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	var b = Tome.conjure(a);
	var x = a[4];
	var y = b[4];
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	x.john = { shirt: 'red' };
	y.john.assign({ shirt: 'red' });
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.done();
};

exports.testArrayAssign = function (test) {
	test.expect(16);
	var a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	a = 'string';
	b.assign('string');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b));
	a = 1;
	b.assign(1);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b));
	a = true;
	b.assign(true);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b));
	a = { asdf: { asdf: true } };
	b.assign({ asdf: { asdf: true } });
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b));
	a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	b.assign([ 1, 2, 3, 4, { john: { pants: 'blue' } } ]);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a), Tome.typeOf(b));
	test.done();
};

exports.testArraySet = function (test) {
	test.expect(16);
	var a = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	var b = Tome.conjure(a);
	b.on('signal', function (value) {
		test.strictEqual(JSON.stringify(a), JSON.stringify(value), 'JSON.stringify failure: ' + JSON.stringify(a) + '!==' + JSON.stringify(value));
	});
	a[1] = 'string';
	b.set(1, 'string');
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1]));
	a[1] = 1;
	b.set(1, 1);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1]));
	a[1] = true;
	b.set(1, true);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1]));
	a[1] = { asdf: { asdf: true } };
	b.set(1, { asdf: { asdf: true } });
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1]));
	a[1] = [ 1, 2, 3, 4, { john: { pants: 'blue' } } ];
	b.set(1, [ 1, 2, 3, 4, { john: { pants: 'blue' } } ]);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(Tome.typeOf(a[1]), Tome.typeOf(b[1]));
	test.done();
};