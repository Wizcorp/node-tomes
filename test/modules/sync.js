var Tome = require('../..').Tome;

exports.testSync = function (test) {
    test.expect(1);

    // initial arrays
    var a = [{ y: 'orange'}];
    var b = [{ y: 'orange'}];
    // tomes
    var t1 = Tome.conjure(a);
    var t2 = Tome.conjure(b);
    // change t1
    t1.push( { z: 'blue'} );
    // sync change to t2
    t1.sync(t2);
    // expect both to be equal still
    test.strictEqual(JSON.stringify(t1), JSON.stringify(t2)); // 1

    test.done();
};

exports.testSyncAll = function(test) {
    test.expect(1);

    // initial arrays
    var a = [{ y: 'orange'}];
    var b = [{ y: 'orange'}];
    // tomes
    var t1 = Tome.conjure(a);
    var t2 = Tome.conjure(b);
    // change t1
    t1.push( { z: 'blue'} );
    t1.push( { x: 'red' } );

    // sync change to t2
    t1.syncAll(t2);
    // expect both to be equal still
    test.strictEqual(JSON.stringify(t1), JSON.stringify(t2)); // 1

    test.done();
};

exports.testSyncString = function(test) {
    test.expect(1);

    // initial strings
    var a = '';
    var b = '';
    // tomes
    var t1 = Tome.conjure(a);
    var t2 = Tome.conjure(b);
    // change t1
    t1.assign('blue');
    // sync change to t2
    t1.sync(t2);
    // expect both to be equal still
    test.strictEqual(JSON.stringify(t1), JSON.stringify(t2)); // 1

    test.done();

};