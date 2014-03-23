var FfaTb = require('../');
var test = require('tap').test;

test("results 8 [4,4] without ties", function (t) {
  // without tiebreakers
  var trn = new FfaTb(8, { sizes: [4, 4], advancers: [2] });
  var r1 = trn.currentRound();
  t.ok(r1, "we have round 1");
  t.deepEqual(r1.matches, [
      { id : { s: 1, r: 1, m: 1 }, p: [1,3,6,8] },
      { id : { s: 1, r: 1, m: 2 }, p: [2,4,5,7] }
    ], "r1 matches"
  );
  r1.score(r1.matches[0].id, [4,3,2,1]);
  r1.score(r1.matches[1].id, [4,3,2,1]);

  trn.createNextStage();
  var r2 = trn.currentRound();
  t.deepEqual(r2.matches, [
      { id : { s: 1, r: 1, m: 1 }, p: [1,2,3,4] },
    ], "r2 match"
  );

  r2.score(r2.matches[0].id, [4,3,2,1]);

  var res = trn.results();
  // TODO: that to do about gpos?
  res.forEach(function (r) {
    delete r.gpos;
  });
  t.deepEqual(res, [
      { seed: 1, wins: 2, for: 8, against: 0, pos: 1 }, // 4 in both
      { seed: 2, wins: 1, for: 7, against: 1, pos: 2 }, // 4 + 3
      { seed: 3, wins: 0, for: 5, against: 3, pos: 3 }, // 3 + 2
      { seed: 4, wins: 0, for: 4, against: 4, pos: 4 }, // 3 + 1
      { seed: 5, wins: 0, for: 2, against: 2, pos: 5 }, // 2
      { seed: 6, wins: 0, for: 2, against: 2, pos: 5 }, // 2
      { seed: 7, wins: 0, for: 1, against: 3, pos: 7 }, // 1
      { seed: 8, wins: 0, for: 1, against: 3, pos: 7 }, // 1
    ], "final results"
  );

  t.end();
});

test("results 8 [4,4] with ties", function (t) {
  // without tiebreakers
  var trn = new FfaTb(8, { sizes: [4, 4], advancers: [2] });
  var r1 = trn.currentRound();
  t.ok(r1, "we have round 1");
  t.deepEqual(r1.matches, [
      { id : { s: 1, r: 1, m: 1 }, p: [1,3,6,8] },
      { id : { s: 1, r: 1, m: 2 }, p: [2,4,5,7] }
    ], "r1 matches"
  );
  r1.score(r1.matches[0].id, [4,4,2,2]);
  r1.score(r1.matches[1].id, [4,3,3,1]);

  trn.createNextStage();
  t.ok(trn.isTieBreakerRound(), 'need to break the second match');
  var tb = trn.currentRound();
  t.deepEqual(tb.matches, [
    { id: { s: 2, r: 1, m: 1 }, p: [4,5] }
    ], "tb match"
  );
  t.ok(tb.score(tb.matches[0].id, [2,1]), 'score tb');
  t.ok(tb.isDone(), 'tb is done');
  // NB: scoring should not affect .for and .against
  
  t.ok(trn._ready, 'should be able to create next')
  t.ok(trn.createNextStage(), 'could create next stage');
  var r2 = trn.currentRound();
  t.deepEqual(r2.matches, [
      { id : { s: 1, r: 1, m: 1 }, p: [1,2,3,4] },
    ], "r2 match"
  );

  r2.score(r2.matches[0].id, [4,3,2,1]);

  var res = trn.results();
  // TODO: that to do about gpos?
  res.forEach(function (r) {
    delete r.gpos;
  });

  // scored differently => different results, but tiebreakers does not matter
  t.deepEqual(res, [
      { seed: 1, wins: 2, for: 8, against: 0, pos: 1 }, // 4 in both
      { seed: 2, wins: 1, for: 7, against: 1, pos: 2 }, // 4 + 3
      { seed: 3, wins: 1, for: 6, against: 2, pos: 3 }, // 4 + 2
      { seed: 4, wins: 0, for: 4, against: 4, pos: 4 }, // 3 + 1
      { seed: 5, wins: 0, for: 3, against: 1, pos: 5 }, // 3 - but knocked out
      { seed: 6, wins: 0, for: 2, against: 2, pos: 5 }, // 2
      { seed: 8, wins: 0, for: 2, against: 2, pos: 5 }, // 1 - upgraded in TB
      { seed: 7, wins: 0, for: 1, against: 3, pos: 8 }  // 1
    ], "final results"
  );

  t.end();
});
