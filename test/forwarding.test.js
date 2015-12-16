var FfaTb = require('..')
  , FFA = require('ffa')
  , TB = require('tiebreaker')
  , tbId = (s, r, m) => new TB.Id(s, r, m, false)
  , $ = require('autonomy')
  , test = require('bandage');

test('forwardingSlowSixteen', function *(t) {
  var ffaOpts = { sizes: [4, 4, 4, 4], advancers: [3, 2, 2], limit: 2 };
  var trn = new FfaTb(16, ffaOpts);
  t.ok(!trn.stageDone(), 'need to play first round');

  var verifyStageProgression = function () {
    t.ok(trn.stageDone(), 'can start next stage now');
    t.ok(!trn.isDone(), 'tourney not complete');
    t.ok(trn.createNextStage(), 'could create next stage');
    t.ok(!trn.stageDone(), 'need to play second round');
  };

  // t1 - FFA (16p)
  t.ok(trn.inFFA() && !trn.inTieBreaker() && !trn.inFinal(), 't1 is FFA');
  var expR1 = new FFA(16, { sizes: [4] }).matches;
  t.deepEqual(trn.matches, expR1, 't1 matches');
  trn.matches.forEach(function (m) {
    t.equal(trn.unscorable(m.id, [4,4,4,1]), null, 'ok to semi tie-score ' + m.id);
    trn.score(m.id, [4,4,4,1]); // no tiebreakers necessary because top 12 go through
  });
  verifyStageProgression();

  // t2 - FFA (12p)
  t.ok(trn.inFFA() && !trn.inTieBreaker() && !trn.inFinal(), 't2 is FFA');
  var expR2 = new FFA(12, { sizes: [4] }).matches;
  t.deepEqual(trn.matches, expR2, 'current stage gets the top 3*16/4 pls');
  trn.matches.forEach(function (m) {
    trn.score(m.id, [4,3,3,1]); // causes tiebreakers between 2nds and 3rds
  });
  verifyStageProgression();

  // t3 - TieBreaker (6p subset of previous 12p - [2nd, 3rd] placers)
  t.ok(!trn.inFFA() && trn.inTieBreaker() && !trn.inFinal(), 't3 is TieBreaker');
  var expR3Tb = [
    { id: tbId(1, 1, 1), p: [4,9] },
    { id: tbId(2, 1, 1), p: [5,8] },
    { id: tbId(3, 1, 1), p: [6,7] }
  ];
  t.deepEqual(trn.matches, expR3Tb, 'current stage is a tiebreaker');
  trn.matches.forEach(function (m) {
    trn.score(m.id, [2,2]); // should ensure another tiebreaker - nothing resolved
  });
  verifyStageProgression();

  // t4 - TieBreaker (6p - same as previous)
  t.ok(!trn.inFFA() && trn.inTieBreaker() && !trn.inFinal(), 't4 is TieBreaker');
  t.deepEqual(trn.matches, expR3Tb, 't4 === t3');
  trn.matches.forEach(function (m) {
    trn.score(m.id, [2,1]); // resolve ties (top 6 in T5)
  });
  verifyStageProgression();

  // t5 - FFA (6p - top 6 as decided by tiebreaker)
  t.ok(trn.inFFA() && !trn.inTieBreaker() && !trn.inFinal(), 't5 is FFA');
  var expR5 = new FFA(6, { sizes: [3] }).matches;
  t.deepEqual(trn.matches, expR5, '3rd FFA round matches');
  trn.matches.forEach(function (m) {
    trn.score(m.id, [3,3,1]); // top 2 progresses
  });
  verifyStageProgression();

  // t6 - FFA (4p)
  t.ok(trn.inFFA() && !trn.inTieBreaker() && trn.inFinal(), 't6 is final FFA');
  var expR6 = new FFA(4, { sizes: [4] }).matches;
  t.deepEqual(trn.matches, expR6, 'final match contains the top 4 seeds');
  trn.score(trn.matches[0].id, [4,3,3,3]); // score s.t. final tiebreaker necessary
  verifyStageProgression();

  // t7 - TieBreaker (3p subset of previous 4p - [2nd, 3rd, 4th] placers)
  t.ok(!trn.inFFA() && trn.inTieBreaker() && trn.inFinal(), 't7 is final TB');
  var expR7Tb = [ { id: tbId(1, 1, 1), p: [2, 3, 4] } ];
  t.deepEqual(trn.matches, expR7Tb, 't7 contains 2nd-4th placers tb');
  t.ok(trn.score(trn.matches[0].id, [3,3,1]), 'score s.t. smaller tb necessary');
  verifyStageProgression();

  // t8 - TieBreaker (2p subset with the top 2 from previous 3p tb)
  t.ok(!trn.inFFA() && trn.inTieBreaker() && trn.inFinal(), 't8 is final TB');
  var expR8Tb = [ { id: tbId(1, 1, 1), p: [2, 3] } ];
  t.deepEqual(trn.matches, expR8Tb, 't8 contains 2nd-3rd placers from t6');
  t.ok(trn.score(trn.matches[0].id, [1,2]), 'score s.t. done');

  // ensure everthing done
  t.ok(trn.stageDone(), 'final FFA complete');
  t.ok(trn.isDone(), 'tourney complete');
  trn.complete();

  // and verify that the top 2 can be unambiguously chosen
  var top2 = trn.results().filter(function (r) {
    return r.pos <= 2;
  });
  t.deepEqual($.pluck('pos', top2), [1,2], 'have two players winning');
  t.deepEqual($.pluck('seed', top2), [1,3], 'seed 3 won the last breaker');

  // verify that we can recreate a tournament at the last state
  var copy = FfaTb.restore(16, ffaOpts, trn.state.slice());
  t.deepEqual(copy.oldMatches, trn.oldMatches, 'restore works');

  // verify that state actually does the right thing
  var copy2 = FfaTb.restore(16, ffaOpts, trn.state.slice(0, -5));
  t.equal(copy2.state.length, copy.state.length-5, 'can restore to any point');
});

test('noLimitNoBreakers', function *(t) {
  var ffaOpts = { sizes: [4, 4], advancers: [1] };
  var trn = new FfaTb(16, ffaOpts);

  trn.matches.forEach(function (m) {
    t.ok(trn.score(m.id, [4,3,2,1]), m.id + ' scored');
  });
  t.ok(trn.stageDone(), 't1 done');

  trn.createNextStage();
  trn.matches.forEach(function (m) {
    t.ok(trn.score(m.id, [4,4,2,2]), m.id + ' scored');
  });

  t.ok(trn.stageDone(), 't2 done');
  t.ok(trn.isDone(), 'tourney done');
  trn.complete();
});
