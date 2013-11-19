var DFFA = require('../');
var test = require('tap').test;

test("forwarding 16 [4,4,4,4]", function (t) {
  var d = new DFFA(16, { sizes: [4, 4, 4, 4], advancers: [3, 2, 2] });
  t.ok(!d.stageComplete(), 'need to play first round');

  var expR1 = [
    { id: { s: 1, r: 1, m: 1, t: 1 }, p: [ 1, 5, 12, 16 ] },
    { id: { s: 1, r: 1, m: 2, t: 1 }, p: [ 2, 6, 11, 15 ] },
    { id: { s: 1, r: 1, m: 3, t: 1 }, p: [ 3, 7, 10, 14 ] },
    { id: { s: 1, r: 1, m: 4, t: 1 }, p: [ 4, 8, 9, 13 ] }
  ];
  // score s.t. no tiebreakers necessary this round
  // NB: can use .matches here, but not deceptive why this works...
  d.matches.forEach(function (m, i) {
    d.score(m.id, [4,4,4,1]);
    expR1[i].m = [4,4,4,1]; // ensure scores get saved when using .currentStage()
  });

  t.deepEqual(d.currentStage(), expR1, "first stage is all 16 players");

  t.ok(d.stageComplete(), 'can start next stage now');
  d.createNextStage();
  t.ok(!d.stageComplete(), 'need ot play second round');

  var expR2 = [
    { id: { s: 1, r: 1, m: 1, t: 2 }, p: [ 1, 4, 9, 12 ] },
    { id: { s: 1, r: 1, m: 2, t: 2 }, p: [ 2, 5, 8, 11 ] },
    { id: { s: 1, r: 1, m: 3, t: 2 }, p: [ 3, 6, 7, 10 ] }
  ];
  t.deepEqual(d.currentStage(), expR2, "current stage gets the top 3*16/4 pls");

  d.currentStage().forEach(function (m) {
    d.score(m.id, [4,3,3,1]); // this should cause tiebreakers between 2nds and 3rds
  });

  t.ok(d.stageComplete(), 'can start next stage now');
  d.createNextStage();

  // know this is sufficient to verify it's a TB because 1st placers not present
  var expR3Tb = [
    { id : { t: 3, s: 1, r: 1, m: 1 }, p : [4,9] },
    { id : { t: 3, s: 2, r: 1, m: 1 }, p : [5,8] },
    { id : { t: 3, s: 3, r: 1, m: 1 }, p : [6,7] }
  ];
  t.deepEqual(d.currentStage(), expR3Tb, "current stage is a tiebreaker");
  t.ok(!d.stageComplete(), 'need to play the TB');

  d.currentStage().forEach(function (m) {
    d.score(m.id, [2,2]); // should ensure another tiebreaker - nothing resolved
  });
  t.ok(d.stageComplete(), 'tiebreaker done - albeit unsatisfactory');
  d.createNextStage();
  t.ok(!d.stageComplete(), 'need to re-play the TB');
  var expR4Tb = expR3Tb.map(function (m) {
    m.id.t += 1;
    return m;
  })
  t.deepEqual(d.currentStage(), expR4Tb, "essentially same matches as R3");

  d.currentStage().forEach(function (m) {
    d.score(m.id, [2,1]); // resolve ties now
  });
  t.ok(d.stageComplete(), 'tiebreaker done - satisfactory');
  d.createNextStage();

  t.ok(!d.stageComplete(), 'need to play FFA semis');
  var expR5 = [
    { id: { t: 5, s: 1, r: 1, m: 1 }, p: [ 1, 3, 6 ] },
    { id: { t: 5, s: 1, r: 1, m: 2 }, p: [ 2, 4, 5 ] },
  ];
  t.deepEqual(d.currentStage(), expR5, "3rd FFA round");

  d.currentStage().forEach(function (m, i) {
    d.score(m.id, [3,3,1]); // top 2 progresses
  });
  t.ok(d.stageComplete(), 'FFA R3 done');
  d.createNextStage();
  t.ok(!d.stageComplete(), 'need to play FFA final');

  t.deepEqual(d.currentStage(), [{
    id: { t: 6, s: 1, r: 1, m: 1 }, p: [1,2,3,4]
  }], "final match contains the top 4");

  var f = d.currentStage()[0];
  d.score(f.id, [4,3,2,1]);
  t.ok(d.stageComplete(), "final FFA complete");

  // TODO: somehow check that we can not create another stage here..

  t.end();
});
