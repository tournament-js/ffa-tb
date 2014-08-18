var FfaTb = require(process.env.FFATB_COV ? '../ffatb-cov.js' : '../');

exports.singleMatchLimits = function (t) {
  // without limits single-match final
  var trn = new FfaTb(4, { sizes: [4] });
  var ffa = trn.currentRound();
  ffa.score(ffa.matches[0].id, [2,2,2,2]);
  t.deepEqual(ffa.rawPositions(ffa.results()),
    [ [ [1,2,3,4], [], [], [] ] ],
    'full tied final'
  );
  t.ok(ffa.isDone(), 'ffa is done');
  t.ok(trn.isDone(), 'therefore trn is done');

  // with limits single-match final
  var trnlim = new FfaTb(4, { sizes: [4], limit: 2 });
  var ffalim = trnlim.currentRound();
  ffalim.score(ffalim.matches[0].id, [2,2,2,2]); // score s.t. tiebreaker necessary
  t.ok(ffalim.isDone(), 'ffalim is done');
  t.ok(!trnlim.isDone(), 'but trnlim is NOT done');

  t.ok(trnlim.createNextStage(), "could create next");
  t.ok(trnlim.isTieBreakerRound(), "and it's a tiebreaker");
  var tb = trnlim.currentRound();
  t.ok(tb.score(tb.matches[0].id, [2,2,2,1]), 'score tied'); // maintain break
  t.ok(tb.isDone(), "that concludes tb");  
  t.ok(!trnlim.isDone(), "but still tied");
  t.ok(trnlim.createNextStage(), "could create yet another");
  t.ok(trnlim.isTieBreakerRound(), "which is another tiebreaker");

  var tb2 = trnlim.currentRound();
  t.equal(tb2.matches[0].p.length, 3, "less to break in tb2 though");
  tb2.score(tb2.matches[0].id, [1,1,0]); // enough to break limit
  t.ok(tb2.isDone(), 'tb2 done');
  t.ok(trnlim.isDone(), 'fully done now');

  t.done();
};

exports.multiMatchLimits = function (t) {
  // without limits multi-match final
  var trn = new FfaTb(4, { sizes: [2] });
  var ffa = trn.currentRound();
  ffa.score(ffa.matches[0].id, [2,2]);
  ffa.score(ffa.matches[1].id, [1,1]);
  t.deepEqual(ffa.rawPositions(ffa.results()),
    [ [[1,4],[]], [[2,3],[]] ],
    'full tied multi final'
  );
  t.ok(ffa.isDone(), 'ffa is done');
  t.ok(trn.isDone(), 'therefore trn is done');

  // with limits multi-match final
  var trnlim = new FfaTb(4, { sizes: [2], limit: 2 });
  var ffalim = trnlim.currentRound();
  ffalim.score(ffalim.matches[0].id, [2,2]);
  ffalim.score(ffalim.matches[1].id, [2,2]);
  t.ok(ffalim.isDone(), 'ffalim is done');
  t.ok(!trnlim.isDone(), 'but trnlim is NOT done');

  t.ok(trnlim.createNextStage(), "could create next");
  t.ok(trnlim.isTieBreakerRound(), "and it's a tiebreaker");
  
  var tb = trnlim.currentRound();
  t.ok(tb.score(tb.matches[0].id, [2,2]), 'score tied 1'); // maintain break
  t.ok(tb.score(tb.matches[1].id, [2,1]), 'score 2 normal');
  t.ok(tb.isDone(), "that concludes tb");  
  t.ok(!trnlim.isDone(), "but still tied");
  t.ok(trnlim.createNextStage(), "could create yet another");
  t.ok(trnlim.isTieBreakerRound(), "which is another tiebreaker");

  var tb2 = trnlim.currentRound();
  t.equal(tb2.matches.length, 1, 'only one breaker in tb2');
  tb2.score(tb2.matches[0].id, [1,0]);
  t.ok(tb2.isDone(), 'tb2 done');
  t.ok(trnlim.isDone(), 'fully done now');

  t.done();
};
