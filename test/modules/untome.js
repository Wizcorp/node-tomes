var trueName = require('rumplestiltskin').trueName;
var Tome = require('../..').Tome;

exports.unTomeNumber = function (test) {
	test.expect(1);

	var a = 1;
	var b = Tome.conjure(a);

	test.strictEqual(trueName(a), trueName(Tome.unTome(b)));

	test.done();
};

exports.unTomeString = function (test) {
	test.expect(1);

	var a = 'the unTome.';
	var b = Tome.conjure(a);

	test.strictEqual(trueName(a), trueName(Tome.unTome(b)));

	test.done();
};

exports.unTomeNull = function (test) {
	test.expect(1);

	var a = null;
	var b = Tome.conjure(a);

	test.strictEqual(trueName(a), trueName(Tome.unTome(b)));

	test.done();
};

exports.unTomeBoolean = function (test) {
	test.expect(1);

	var a = false;
	var b = Tome.conjure(a);

	test.strictEqual(trueName(a), trueName(Tome.unTome(b)));

	test.done();
};

exports.unTomeArray = function (test) {
	test.expect(1);

	var a = [ 0, 1, 2, 'hi', null, undefined, { a: 'nope' } ];
	var b = Tome.conjure(a);

	test.strictEqual(trueName(a), trueName(Tome.unTome(b)));

	test.done();
};

exports.unTomeComplex = function (test) {
	test.expect(1);

	var a = { a: { b: true, c: undefined, d: null, e: [ 0, 1, 'hi', 'cat' ], f: { g: false } } };
	var b = Tome.conjure(a);

	test.strictEqual(trueName(a), trueName(Tome.unTome(b)));

	test.done();
};
