var DFFA = require('../');
var test = require('tap').test;

test("forwarding 16 [4,4,4,4]", function (t) {
  var d = new DFFA(16, { sizes: [4, 4, 4, 4], advancers: [3, 2, 2] });
  t.ok(!d.stageComplete(), 'need to play first round');

  var ensureMiddleBoundaries = function (d) {
    t.ok(d.stageComplete(), 'can start next stage now');
    t.ok(!d.isDone(), "dynamic FFA not complete");
    t.ok(d.createNextStage(), "could create next stage");
    t.ok(!d.stageComplete(), 'need to play second round');
  };

  // score s.t. no tiebreakers necessary this round
  // NB: can use .matches here, but not deceptive why this works...
  d.matches.forEach(function (m, i) {
    d.score(m.id, [4,4,4,1]);
  });
  var expR1 = [
    { id: { s: 1, r: 1, m: 1, t: 1 }, p: [ 1, 5, 12, 16 ], m: [4,4,4,1] },
    { id: { s: 1, r: 1, m: 2, t: 1 }, p: [ 2, 6, 11, 15 ], m: [4,4,4,1] },
    { id: { s: 1, r: 1, m: 3, t: 1 }, p: [ 3, 7, 10, 14 ], m: [4,4,4,1] },
    { id: { s: 1, r: 1, m: 4, t: 1 }, p: [ 4, 8,  9, 13 ], m: [4,4,4,1] }
  ]; // do it after scoring once to see we actually get the used matches
  t.deepEqual(d.currentStage(), expR1, "first stage is all 16 players");

  ensureMiddleBoundaries(d);

  var expR2 = [
    { id: { s: 1, r: 1, m: 1, t: 2 }, p: [ 1, 4, 9, 12 ] },
    { id: { s: 1, r: 1, m: 2, t: 2 }, p: [ 2, 5, 8, 11 ] },
    { id: { s: 1, r: 1, m: 3, t: 2 }, p: [ 3, 6, 7, 10 ] }
  ];
  t.deepEqual(d.currentStage(), expR2, "current stage gets the top 3*16/4 pls");

  d.currentStage().forEach(function (m) {
    d.score(m.id, [4,3,3,1]); // this should cause tiebreakers between 2nds and 3rds
  });

  ensureMiddleBoundaries(d);

  // know this is sufficient to verify it's a TB because 1st placers not present
  var expR3Tb = [
    { id : { t: 3, s: 1, r: 1, m: 1 }, p : [4,9] },
    { id : { t: 3, s: 2, r: 1, m: 1 }, p : [5,8] },
    { id : { t: 3, s: 3, r: 1, m: 1 }, p : [6,7] }
  ];
  t.deepEqual(d.currentStage(), expR3Tb, "current stage is a tiebreaker");

  d.currentStage().forEach(function (m) {
    d.score(m.id, [2,2]); // should ensure another tiebreaker - nothing resolved
  });

  ensureMiddleBoundaries(d);

  var expR4Tb = expR3Tb.map(function (m) {
    m.id.t += 1;
    return m;
  })
  t.deepEqual(d.currentStage(), expR4Tb, "essentially same matches as R3");

  d.currentStage().forEach(function (m) {
    d.score(m.id, [2,1]); // resolve ties now
  });

  ensureMiddleBoundaries(d);

  var expR5 = [
    { id: { t: 5, s: 1, r: 1, m: 1 }, p: [ 1, 3, 6 ] },
    { id: { t: 5, s: 1, r: 1, m: 2 }, p: [ 2, 4, 5 ] },
  ];
  t.deepEqual(d.currentStage(), expR5, "3rd FFA round");

  d.currentStage().forEach(function (m, i) {
    d.score(m.id, [3,3,1]); // top 2 progresses
  });

  ensureMiddleBoundaries(d);

  t.deepEqual(d.currentStage(), [{
    id: { t: 6, s: 1, r: 1, m: 1 }, p: [1,2,3,4]
  }], "final match contains the top 4");

  var f = d.currentStage()[0];
  d.score(f.id, [4,3,2,1]); // TODO: what about final round ties? - limits?

  // ensure everthing done
  t.ok(d.stageComplete(), "final FFA complete");
  t.ok(d.isDone(), "dynamic FFA complete");
  t.ok(!d.createNextStage(), "can't create more stages");

  t.end();
});
