var FfaTb = require(process.env.FFATB_COV ? '../ffatb-cov.js' : '../');

exports.resultsEightFour = function (t) {
  // without tiebreakers
  var trn = new FfaTb(8, { sizes: [4, 4], advancers: [2] });
  t.deepEqual(trn.matches, [
    { id: { s: 1, r: 1, m: 1 }, p: [1,3,6,8] },
    { id: { s: 1, r: 1, m: 2 }, p: [2,4,5,7] }],
    't1 matches'
  );
  trn.score(trn.matches[0].id, [4,3,2,1]);
  trn.score(trn.matches[1].id, [4,3,2,1]);
  trn.createNextStage();

  // t2 - FFA
  t.ok(trn.inFFA(), 't2 is FFA');
  t.deepEqual(trn.matches, [{id: {s: 1, r: 1, m: 1}, p: [1,2,3,4] }], 't2');
  trn.score(trn.matches[0].id, [4,3,2,1]);

  trn.complete(); // this is done now
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
    { seed: 8, wins: 0, for: 1, against: 3, pos: 7 }],// 1
    'final results'
  );

  t.done();
};

exports.resultsEightFourTies = function (t) {
  // without tiebreakers
  var trn = new FfaTb(8, { sizes: [4, 4], advancers: [2] });
  t.deepEqual(trn.matches, [
    { id: { s: 1, r: 1, m: 1 }, p: [1,3,6,8] },
    { id: { s: 1, r: 1, m: 2 }, p: [2,4,5,7] }],
    't1 matches'
  );
  trn.score(trn.matches[0].id, [4,4,2,2]);
  trn.score(trn.matches[1].id, [4,3,3,1]);
  trn.createNextStage();

  // t2 - 2p TieBreaking t1m2 cluster
  t.ok(trn.inTieBreaker(), 'need to break the second match');
  t.ok(!trn.inFinal(), 'not final round');
  t.deepEqual(trn.matches, [{ id: { s: 2, r: 1, m: 1 }, p: [4,5] }], 'tb match');
  t.ok(trn.score(trn.matches[0].id, [1,2]), 'score tb');
  t.ok(trn.stageDone(), 'tb is done');
  // NB: scoring should not affect .for and .against
  t.ok(trn.createNextStage(), 'could create next stage');

  // t3 - 4p FFA with top 2 from T1M1 + winner of [T1M2, TB]
  t.deepEqual(trn.matches, [{ id: { s: 1, r: 1, m: 1 }, p: [1,2,3,5] }], 't3');
  trn.score(trn.matches[0].id, [4,3,2,1]);

  t.ok(trn.isDone(), 'done');
  trn.complete();

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
    { seed: 5, wins: 0, for: 4, against: 4, pos: 4 }, // 3 + 1
    { seed: 4, wins: 0, for: 3, against: 1, pos: 5 }, // 3 : but knocked out
    { seed: 6, wins: 0, for: 2, against: 2, pos: 5 }, // 2
    { seed: 8, wins: 0, for: 2, against: 2, pos: 5 }, // 2
    { seed: 7, wins: 0, for: 1, against: 3, pos: 8 }],// 1
    'final results'
  );

  t.done();
};
