var fs = require('fs');

try {
	fs.mkdirSync('tmp');
} catch (e) {
	// It's ok to fail sometimes.
}

var tomeFile = fs.readFileSync('index.js');
fs.writeFileSync('tmp/index.js', tomeFile);

var TomeA = require('../..').Tome;
var TomeB = require('../../tmp').Tome;

exports.crossTomeIsTome = function (test) {
	test.expect(2);

	var data = [ 'a', 'b', 0, 1, null ];
	var a = TomeA.conjure(data);
	var b = TomeB.conjure(data);

	test.strictEqual(true, TomeA.isTome(b)); // 1
	test.strictEqual(true, TomeB.isTome(a)); // 2

	test.done();
};

fs.unlinkSync('tmp/index.js');
fs.rmdirSync('tmp');