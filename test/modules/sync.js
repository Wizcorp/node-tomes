var Tome = require('../..').Tome;

exports.testSync = function (test) {
	test.expect(5);

	var a = [{ x: 1 }];
	var b = [{ x: 1 }];

	var sourceTome = Tome.conjure(a);
	var targetTome = Tome.conjure(b);

	sourceTome.push( { y: 2 } );
	sourceTome.push( { z: 3 } );

	sourceTome.sync(targetTome);

	test.strictEqual(targetTome[1].y.valueOf(), 2); // 1
	test.ok(targetTome.length == 2); // 2

	sourceTome.sync(targetTome, function(diff) {
		test.strictEqual(diff.val[0].z, 3);
	});

	test.strictEqual(targetTome[2].z.valueOf(), 3); // 3
	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome)); // 4

	test.done();
};

exports.testSyncAll = function (test) {
	test.expect(4);

	var a = [{ x: 1 }];
	var b = [{ x: 1 }];

	var sourceTome = Tome.conjure(a);
	var targetTome = Tome.conjure(b);

	sourceTome.push( { y: 1 } );
	sourceTome.push( { k: 1 } );

	sourceTome.sync(targetTome, true, function(diff) {
		test.strictEqual(diff.length, 2);
		test.strictEqual(diff[0].val[0].y, 1);
		test.strictEqual(diff[1].val[0].k, 1);
	});

	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome));

	test.done();
};

exports.testSyncTo = function (test) {
	test.expect(2);

	var a = [{ x: 1 }];
	var b = [{ x: 1 }];

	var sourceTome = Tome.conjure(a);
	var targetTome = Tome.conjure(b);

	sourceTome.syncTo(targetTome);

	targetTome.on('readable', function () {
		test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome)); // 1, 2
	});

	sourceTome.push( { y: 1 } );
	sourceTome.push( { y: 2 } );

	test.done();
};

exports.testSyncToMulti = function (test) {
	test.expect(4);

	var a = [{ x: 1 }];
	var b = [{ x: 1 }];
	var c = [{ x: 1 }];

	var sourceTome = Tome.conjure(a);
	var targetTome1 = Tome.conjure(b);
	var targetTome2 = Tome.conjure(c);

	sourceTome.syncTo([targetTome1, targetTome2]);

	targetTome1.on('readable', function () {
		test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome1)); // 1, 2
	});

	targetTome2.on('readable', function () {
		test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome2)); // 3, 4
	});

	sourceTome.push( { y: 1 } );
	sourceTome.push( { y: 2 } );

	test.done();
};

exports.testSyncMulti = function (test) {
	test.expect(2);

	var a = [{ x: 1 }];
	var b = [{ x: 1 }];
	var c = [{ x: 1 }];

	var sourceTome = Tome.conjure(a);
	var targetTome1 = Tome.conjure(b);
	var targetTome2 = Tome.conjure(c);

	sourceTome.push( { y: 1 } );

	sourceTome.sync([targetTome1, targetTome2]);

	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome1));
	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome2));

	test.done();
};

exports.testSyncNumber = function (test) {
	var a = 42;
	var b = 24;

	var sourceTome = Tome.conjure(a);
	var targetTome = Tome.conjure(b);

	sourceTome.assign(b);
	sourceTome.assign(a);

	sourceTome.sync(targetTome, true);

	test.strictEqual(targetTome.valueOf(), a);
	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome));

	test.done();
};

exports.testSyncString = function (test) {
	var a = "test string a";
	var b = "test string b";

	var sourceTome = Tome.conjure(a);
	var targetTome = Tome.conjure(b);

	sourceTome.assign(b);
	sourceTome.assign(a);

	sourceTome.sync(targetTome, true);

	test.strictEqual(targetTome.valueOf(), a);

	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome));

	test.done();
};

exports.testSyncBoolean = function (test) {
	var a = true;
	var b = false;

	var sourceTome = Tome.conjure(a);
	var targetTome = Tome.conjure(b);

	sourceTome.assign(b);

	sourceTome.sync(targetTome);

	test.strictEqual(targetTome.valueOf(), b);

	test.strictEqual(JSON.stringify(sourceTome), JSON.stringify(targetTome));

	test.done();
};