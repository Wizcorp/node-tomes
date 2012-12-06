var tomes = require('../../tomes');

var Tome = tomes.Tome;

exports.testDiffsSimpleString = function (test) {
	test.expect(6);

	var a = 'asdf';
	var b = Tome.scribe(a);
	var c = Tome.scribe(a);

	b.on('diff', function (diff) {
		c.batch(diff);
	});

	c.on('signal', function (cVal) {
		test.strictEqual(JSON.stringify(b), JSON.stringify(cVal));
	});

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	a = 'fdsa';
	b.assign('fdsa');

	test.strictEqual(JSON.stringify(a), JSON.stringify(b));
	test.strictEqual(JSON.stringify(b), JSON.stringify(c));

	test.done();
};
