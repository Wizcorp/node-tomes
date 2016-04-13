var tomes = require('../..');
var Tome = tomes.Tome;

// test for https://github.com/Wizcorp/node-tomes/issues/44

exports.testTypeChange = function (test) {
	var t = Tome.conjure(3);
	var changes = [];

	t.on('typeChange', function (tome, from, to) {
		changes.push({ from: from, to: to });
	});

	test.strictEqual(JSON.stringify(t), '3');
	test.deepEqual(changes, []);

	t.assign({ hello: 1 });
	test.deepEqual(changes, [{ from: 'number', to: 'object' }]);
	test.strictEqual(JSON.stringify(t), '{"hello":1}');

	// test https://github.com/Wizcorp/node-tomes/issues/48

	t.assign({ hello: 2 });
	test.deepEqual(changes, [{ from: 'number', to: 'object' }]);
	test.strictEqual(JSON.stringify(t), '{"hello":2}');

	test.done();
};
