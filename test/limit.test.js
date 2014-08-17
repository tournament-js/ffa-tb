var FfaTb = require(process.env.FFATB_COV ? '../ffatb-cov.js' : '../');

exports.singleMatchLimits = function (t) {
  // without limits single-match final
  var tourney1 = new FfaTb(4, { sizes: [4] });
  var ffa1 = tourney1.currentRound();
  ffa1.score(ffa1.matches[0].id, [2,2,2,2]);
  t.deepEqual(ffa1.rawPositions(ffa1.results()),
    [ [ [1,2,3,4], [], [], [] ] ],
    'full tied final'
  );
  t.ok(ffa1.isDone(), 'ffa1 is done');
  t.ok(tourney1.isDone(), 'therefore tourney1 is done');

  // with limits single-match final
  var tourney1lim = new FfaTb(4, { sizes: [4], limit: 2 });
  var ffa1lim = tourney1lim.currentRound();
  ffa1lim.score(ffa1lim.matches[0].id, [2,2,2,2]); // score s.t. tiebreaker necessary
  t.ok(ffa1lim.isDone(), 'ffa1lim is done');
  t.ok(!tourney1lim.isDone(), 'but tourney1lim is NOT done');

  t.done();
};

exports.multiMatchLimits = function (t) {
  // without limits multi-match final
  var tourney2 = new FfaTb(4, { sizes: [2] });
  var ffa2 = tourney2.currentRound();
  ffa2.score(ffa2.matches[0].id, [2,2]);
  ffa2.score(ffa2.matches[1].id, [1,1]);
  t.deepEqual(ffa2.rawPositions(ffa2.results()),
    [ [[1,4],[]], [[2,3],[]] ],
    'full tied multi final'
  );
  t.ok(ffa2.isDone(), 'ffa2 is done');
  t.ok(tourney2.isDone(), 'therefore tourney2 is done');

  // with limits multi-match final
  var tourney2lim = new FfaTb(4, { sizes: [2], limit: 2 });
  var ffa2lim = tourney2lim.currentRound();
  ffa2lim.score(ffa2lim.matches[0].id, [2,2]);
  ffa2lim.score(ffa2lim.matches[1].id, [2,2]);
  t.ok(ffa2lim.isDone(), 'ffa2lim is done');
  t.ok(!tourney2lim.isDone(), 'but tourney2lim is NOT done');

  t.done();
};
