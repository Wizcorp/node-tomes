var Tome = require('../..').Tome;

exports.testSnapshot = function (test) {
	var a = { hello: { world: 5 } };
	var b = Tome.conjure(a);
	var c = { hello: { world: 6 } };
	var d = { hello: { world: 7 } };

	b.hello.world.inc();

	var snapshot = b.takeSnapshot();
	var snapshot2 = b.takeSnapshot();

	// consequtive snapshots should be equal

	test.deepEqual(snapshot2, snapshot);

	// check the state of the snapshot

	test.deepEqual(snapshot.content, c);
	test.strictEqual(snapshot.version, 2);
	test.strictEqual(snapshot.diff.length, 1);

	// check the state of the tome

	test.strictEqual(b.__dirty__, 2);
	test.strictEqual(b.hello.__dirty__, 2);
	test.strictEqual(b.hello.world.__dirty__, 2);
	test.strictEqual(b.__version__, 2);
	test.strictEqual(b.__diff__.length, 1);
	test.deepEqual(Tome.unTome(b), c);

	// change the tome

	b.hello.world.inc();

	// check the new state of the tome

	test.strictEqual(b.__dirty__, 3);
	test.strictEqual(b.hello.__dirty__, 3);
	test.strictEqual(b.hello.world.__dirty__, 3);
	test.strictEqual(b.__version__, 3);
	test.strictEqual(b.__diff__.length, 2);
	test.deepEqual(Tome.unTome(b), d);

	// apply the snapshot (rollback)

	b.restoreSnapshot(snapshot);

	// check the state of the tome (should be back to when we first checked it)

	test.strictEqual(b.__dirty__, 2);
	test.strictEqual(b.hello.__dirty__, 2);
	test.strictEqual(b.hello.world.__dirty__, 2);
	test.strictEqual(b.__version__, 2);
	test.strictEqual(b.__diff__.length, 1);
	test.deepEqual(Tome.unTome(b), c);

	test.done();
};
