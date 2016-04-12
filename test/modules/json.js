var tomes = require('../..');
var Tome = tomes.Tome;

// test for https://github.com/Wizcorp/node-tomes/issues/44

exports.testJsonStringify = function (test) {
	var t = Tome.conjure({ hello: 1 });
	test.strictEqual(JSON.stringify(t), '{"hello":1}');
	test.strictEqual(JSON.stringify(t, null, '\t'), '{\n\t"hello": 1\n}');

	t = Tome.conjure({ hello: { world: { foo: 1 } } });
	test.strictEqual(JSON.stringify(t), '{"hello":{"world":{"foo":1}}}');
	test.strictEqual(JSON.stringify(t, null, '\t'), '{\n\t"hello": {\n\t\t"world": {\n\t\t\t"foo": 1\n\t\t}\n\t}\n}');

	test.done();
};
