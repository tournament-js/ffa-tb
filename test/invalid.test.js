var FfaTb = require('..')
  , test = require('bandage');

test('invalidsThrow', function *(t) {
  var logCatch = {
    error: function () {
      t.pass('got error log from construct');
    }
  };

  t.plan(5); // 2x2 + 1
  var reason = 'number of players must be at least 2';
  var reg = new RegExp('Cannot construct FfaTb: ' + reason);
  var createCatch = function *() {
    return new FfaTb(1, { log: logCatch });
  };
  yield t.throws(createCatch, reg, 'create with invalid params throws with the reason');
  t.equal(FfaTb.invalid(1), reason, '.invalid returns reason');

  // same again, but dont configure logs
  var createErr = function *() {
    return new FfaTb(1); // logs to stderr
  };
  yield t.throws(createErr, reg, 'create with invalid params throws with the reason');
  t.equal(FfaTb.invalid(1), reason, '.invalid returns reason');
});

// verify all scores can be caught by specifying
test('scoring logs', function *(t) {
  var logCatch = {
    error: function () {
      t.pass('got error log from scoring');
    }
  };
  t.plan(2*3 + 3); // 2 times amounts of fail scores + misc
  var ffaOpts = { sizes: [4, 4], advancers: [2], limit: 2, log: logCatch };
  var trn = new FfaTb(8, ffaOpts);
  // fail score in FFA round
  trn.score(trn.matches[0].id, ['a']);
  // score it so we get a TB
  trn.score(trn.matches[0].id, [1,1,1,1]);
  trn.score(trn.matches[1].id, [4,3,2,1]);
  trn.createNextStage();
  // TB round
  t.ok(trn.inTieBreaker(), 'in tb');
  // score invalid
  trn.score(trn.matches[0].id, ['a']);
  // score and proceed to FFA R2
  trn.score(trn.matches[0].id, [4,3,2,1]);
  trn.createNextStage();
  t.ok(trn.inFFA() && trn.inFinal(), 'in final ffa');
  // score invalid
  trn.score(trn.matches[0].id, ['a']);
  // complete
  trn.score(trn.matches[0].id, [4,3,2,1]);
  trn.complete();
  t.ok(trn.isDone(), 'done now');
});
