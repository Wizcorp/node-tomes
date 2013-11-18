var tomes = require('../..');

var Tome = tomes.Tome;

exports.testHide = function (test) {
	test.expect(1);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);

	delete a.b;

	b.b.hide(true);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testHideSignal = function (test) {
	test.expect(1);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);

	delete a.b;

	b.b.hide(true);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));

	test.done();
};

exports.testHideConjure = function (test) {
	test.expect(2);

	var a = { b: { c: 1 }, d: { e: 1} };
	var b = Tome.conjure(a);
	
	b.b.hide(true);

	var c = Tome.conjure(b);

	delete a.b;

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

