var FfaTb = require(process.env.FFATB_COV ? '../ffatb-cov.js' : '../');

exports.forwardingSlowSixteen = function (t) {
  var trn = new FfaTb(16, { sizes: [4, 4, 4, 4], advancers: [3, 2, 2] });
  t.ok(!trn.stageComplete(), 'need to play first round');

  var verifyStageProgression = function () {
    t.ok(trn.stageComplete(), 'can start next stage now');
    t.ok(!trn.isDone(), "dynamic FFA not complete");
    t.ok(trn.createNextStage(), "could create next stage");
    t.ok(!trn.stageComplete(), 'need to play second round');
  };

  // score s.t. no tiebreakers necessary this round
  // NB: can use .matches here, but not deceptive why this works...
  var d1 = trn.currentRound();
  t.ok(!trn.isTieBreakerRound(), "ffa round 1");
  d1.matches.forEach(function (m) {
    d1.score(m.id, [4,4,4,1]);
  });

  t.deepEqual(trn.matches, [], 'no stages copied yet yet');

  var expR1 = [
    { id: { t: 1, p: 1, s: 1, r: 1, m: 1 }, p: [ 1, 5, 12, 16 ], m: [4,4,4,1] },
    { id: { t: 1, p: 1, s: 1, r: 1, m: 2 }, p: [ 2, 6, 11, 15 ], m: [4,4,4,1] },
    { id: { t: 1, p: 1, s: 1, r: 1, m: 3 }, p: [ 3, 7, 10, 14 ], m: [4,4,4,1] },
    { id: { t: 1, p: 1, s: 1, r: 1, m: 4 }, p: [ 4, 8,  9, 13 ], m: [4,4,4,1] }
  ]; // do it after scoring once to see we actually get the used matches

  verifyStageProgression();

  t.deepEqual(trn.matches, expR1, "first stage copied into global matches array");

  var d2 = trn.currentRound();
  t.ok(!trn.isTieBreakerRound(), "ffa round 2");
  var expR2 = [
    { id: { s: 1, r: 1, m: 1 }, p: [ 1, 4, 9, 12 ] },
    { id: { s: 1, r: 1, m: 2 }, p: [ 2, 5, 8, 11 ] },
    { id: { s: 1, r: 1, m: 3 }, p: [ 3, 6, 7, 10 ] }
  ];
  t.deepEqual(d2.matches, expR2, "current stage gets the top 3*16/4 pls");

  d2.matches.forEach(function (m) {
    d2.score(m.id, [4,3,3,1]); // causes tiebreakers between 2nds and 3rds
  });

  verifyStageProgression();

  t.equal(trn.matches.length, expR1.length + expR2.length, "round 2 copied in");
  expR2.forEach(function (m) {
    m.id.t = 2;
    m.id.p = 1;
    m.m = [4,3,3,1];
  });
  t.deepEqual(trn.matches.slice(expR1.length), expR2, "r2 matches extended in d");


  // know this is sufficient to verify it's a TB because 1st placers not present
  var expR3Tb = [
    { id : { s: 1, r: 1, m: 1 }, p : [4,9] },
    { id : { s: 2, r: 1, m: 1 }, p : [5,8] },
    { id : { s: 3, r: 1, m: 1 }, p : [6,7] }
  ];
  var d3 = trn.currentRound();
  t.ok(trn.isTieBreakerRound(), "tb round 1");
  t.deepEqual(d3.matches, expR3Tb, "current stage is a tiebreaker");

  d3.matches.forEach(function (m) {
    d3.score(m.id, [2,2]); // should ensure another tiebreaker - nothing resolved
  });

  verifyStageProgression();

  var d4 = trn.currentRound();
  t.ok(trn.isTieBreakerRound(), "tb round 2");
  t.deepEqual(d4.matches, expR3Tb, "r4TB === r3TB");

  d4.matches.forEach(function (m) {
    d4.score(m.id, [2,1]); // resolve ties now
  });

  verifyStageProgression();

  var expR5 = [
    { id: { s: 1, r: 1, m: 1 }, p: [ 1, 3, 6 ] },
    { id: { s: 1, r: 1, m: 2 }, p: [ 2, 4, 5 ] },
  ];
  var d5 = trn.currentRound();
  t.ok(!trn.isTieBreakerRound(), "ffa round 3");
  t.deepEqual(d5.matches, expR5, "3rd FFA round matches");

  d5.matches.forEach(function (m) {
    d5.score(m.id, [3,3,1]); // top 2 progresses
  });

  verifyStageProgression();


  var d6 = trn.currentRound();
  t.ok(!trn.isTieBreakerRound(), "ffa round 4");
  t.deepEqual(d6.matches, [{
    id: { s: 1, r: 1, m: 1 },
    p: [1,2,3,4]
  }], "final match contains the top 4");

  var f = d6.matches[0];
  d6.score(f.id, [4,3,2,1]); // TODO: what about final round ties? - limits?

  // ensure everthing done
  t.ok(trn.stageComplete(), "final FFA complete");
  t.ok(trn.isDone(), "dynamic FFA complete");
  t.ok(!trn.createNextStage(), "can't create more stages");

  t.deepEqual(trn.matches[trn.matches.length-1].id, { t: 6, p: 1, s: 1, r: 1, m: 1 }
    , "final match copied in correct location"
  );

  t.done();
};
