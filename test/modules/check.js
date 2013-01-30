var Tome = require('../../tomes.js').Tome;

exports.testUndefinedHasProperty = function (test) {
	test.expect(1);

	var a = { a: undefined };
	var b = Tome.conjure(a);

	b.a = 5;

	test.throws(function () { Tome.check(b); });

	test.done();
};
