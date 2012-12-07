var tomes = require('../../tomes');

var Tome = tomes.Tome,
	ArrayTome = tomes.ArrayTome,
	BooleanTome = tomes.BooleanTome,
	NumberTome = tomes.NumberTome,
	ObjectTome = tomes.ObjectTome,
	ScalarTome = tomes.ScalarTome,
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

exports.testUndefinedCreation = function (test) {
	test.expect(11);
	var a;
	var b = Tome.conjure(a);
	test.strictEqual(a, b); // 1
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.ok(notInstanceOf(b, Tome)); // 3
	test.ok(notInstanceOf(b, ObjectTome)); // 4
	test.ok(notInstanceOf(b, ArrayTome)); // 5
	test.ok(notInstanceOf(b, ScalarTome)); // 6
	test.ok(notInstanceOf(b, BooleanTome)); // 7
	test.ok(notInstanceOf(b, NumberTome)); // 8
	test.ok(notInstanceOf(b, StringTome)); // 9
	test.ok(notInstanceOf(b, NullTome)); // 10
	test.ok(notInstanceOf(b, UndefinedTome)); // 11
	
	test.done();
};

exports.testUndefinedProperty = function (test) {
	test.expect(5);
	var a = { c: undefined };
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.ok(instanceOf(b, Tome)); // 2
	test.ok(instanceOf(b, ObjectTome)); // 3
	test.strictEqual(a.c, b.c); // 4
	test.ok(notInstanceOf(b.c, UndefinedTome)); // 5
	test.done();
};

exports.testUndefinedArrayElements = function (test) {
	test.expect(2);
	var a = new Array(4);
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 2
	test.done();
};

exports.testUndefinedArrayElements2 = function (test) {
	test.expect(2);
	var a = [ undefined, undefined, undefined, undefined ];
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	test.strictEqual(a.hasOwnProperty(0), b.hasOwnProperty(0)); // 2
	test.done();
};


exports.testUndefinedObjectSet = function (test) {
	test.expect(3);
	var a = { c: true };
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	a.c = undefined;
	b.set('c', undefined);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty('c'), b.hasOwnProperty('c')); // 3
	test.done();
};

exports.testUndefinedObjectAssign = function (test) {
	test.expect(2);
	var a = { c: true };
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	a.c = undefined;
	test.throws(function () { b.c.assign(undefined); }, TypeError); // 2
	test.done();
};

exports.testUndefinedStringAssign = function (test) {
	test.expect(2);
	var a = 'a string.';
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	a = undefined;
	test.throws(function () { b.assign(undefined); }, TypeError); // 2
	test.done();
};

exports.testUndefinedStringSet = function (test) {
	test.expect(3);
	var a = 'a string.';
	var b = Tome.conjure(a);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 1
	a.c = undefined;
	b.set('c', undefined);
	test.strictEqual(JSON.stringify(a), JSON.stringify(b)); // 2
	test.strictEqual(a.hasOwnProperty('c'), b.hasOwnProperty('c')); // 3
	test.done();
};