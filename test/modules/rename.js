'use strict';

var Tome = require('../..').Tome;

exports.testRename = function (test) {
	test.expect(2);

	var a, b, c, diff;

	a = { b: { c: 1 }, d: { e: 1} };
	b = Tome.conjure(a);
	c = Tome.conjure(a);

	a.b.d = a.b.c;
	delete a.b.c;

	b.b.rename('c', 'd');

	diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.deepEqual(b, c);

	test.done();
};

exports.testRenameDel = function (test) {
	test.expect(2);

	var a, b, c;

	a = { b: { c: 1 }, d: { e: 1} };
	b = Tome.conjure(a);
	c = Tome.conjure(a);

	b.on('readable', function () {
		var diff = b.read();
		c.merge(diff);
	});

	a.b.d = a.b.c;
	delete a.b.c;

	b.b.rename('c', 'd');

	delete a.b.d;
	b.b.del('d');



	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};

exports.testRenameOver = function (test) {
	test.expect(2);

	var a, b, c, diff;

	a = { b: { c: 1 }, d: { e: 1} };
	b = Tome.conjure(a);
	c = Tome.conjure(a);

	a.d = a.b;
	delete a.b;

	b.rename('b', 'd');

	diff = b.read();
	c.merge(diff);

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.deepEqual(b, c);

	test.done();
};
