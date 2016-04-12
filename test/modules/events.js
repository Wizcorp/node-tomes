var tomes = require('../..');
var Tome = tomes.Tome;

// test for https://github.com/Wizcorp/node-tomes/issues/44

function noop() {}

exports.testNodeEvents = function (test) {
	var t = Tome.conjure('hello world');
	t.on('readable', noop);
	test.strictEqual(JSON.stringify(t, null, '\t'), '"hello world"');
	t.set('hello', []);
	test.strictEqual(JSON.stringify(t, null, '\t'), '{\n\t"hello": []\n}');
	t.on('readable', noop);
	test.strictEqual(JSON.stringify(t, null, '\t'), '{\n\t"hello": []\n}');
	test.done();
};
