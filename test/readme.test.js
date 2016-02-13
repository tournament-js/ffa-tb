var FfaTb = require('..')
  , FFA = require('ffa')
  , fId = (r, m) => new FFA.Id(r, m)
  , TB = require('tiebreaker')
  , tbId = (s) => new TB.Id(s, 1, 1, true)
  , test = require('bandage');

test('readme', function *(t) {
  var trn = new FfaTb(16, { sizes: [4, 4, 4], advancers: [2, 2], limit: 2 });

  // round 1 - quarter finals
  trn.inFFA(); // true
  t.eq(trn.matches, [
    { id: fId(1, 1), p: [ 1, 5, 12, 16 ] },
    { id: fId(1, 2), p: [ 2, 6, 11, 15 ] },
    { id: fId(1, 3), p: [ 3, 7, 10, 14 ] },
    { id: fId(1, 4), p: [ 4, 8, 9, 13 ] } ],
    'round one is ffa quarter finals'
  );

  trn.matches.forEach(m => {
    trn.score(m.id, m.id.m === 3 ? [4,3,3,1]: [4,3,2,1]); // tie match 3
  });

  t.ok(trn.stageDone(), 'ffa round 1 has been played (but there were ties)');
  t.false(trn.isDone(), 'have two more ffa rounds to go');
  t.ok(trn.createNextStage(), 'must createNextStage when stageDone && !isDone');

  // tiebreakers for R1
  t.ok(trn.inTieBreaker() && !trn.inFinal(), 'in R1 tiebreaker');
  t.eq(trn.matches, [
    { id: tbId(3), p: [ 7, 10 ] } ],
    'tiebreaking only 2 players from match 3'
  );
  trn.score(trn.matches[0].id, [0,1]);

  t.ok(trn.stageDone() && !trn.isDone(), 'only stage done so far');
  t.ok(trn.createNextStage(), 'intermediate tiebreaker stage over');

  // round 2 - semifinals
  t.ok(trn.inFFA() && !trn.inFinal(), 'ffa round 2');
  t.eq(trn.matches, [
    { id: fId(1, 1), p: [ 1, 3, 6, 10 ] },
    { id: fId(1, 2), p: [ 2, 4, 5, 8 ] } ],
    'round 2 are the semis'
  );

  trn.matches.forEach(m => {
    trn.score(m.id, [4,3,2,1]); // score without ties
  });

  t.ok(trn.stageDone() && !trn.isDone(), 'only two stages done so far');
  t.ok(trn.createNextStage(), 'advance to round 3');

  // round 3
  t.ok(trn.inFFA() && trn.inFinal(), 'straight into final round after fast R2');
  t.eq(trn.matches, [
    { id: fId(1, 1), p: [ 1, 2, 3, 4 ] } ],
    'final has top 4'
  );

  t.ok(trn.score(trn.matches[0].id, [1,1,1,1]), 'complete tie in final');

  t.ok(trn.stageDone() && !trn.isDone(), 'need to tiebreak final (limit set to 2)');
  t.ok(trn.createNextStage(), 'generate tiebreakers for final limit');

  // tiebreaker for final
  t.ok(trn.inTieBreaker() && trn.inFinal(), 'still in final, but in a tiebreaker round');
  t.eq(trn.matches, [
    { id: tbId(1), p: [ 1, 2, 3, 4 ] } ],
    'mtach is a complete replay of final'
  );

  t.ok(trn.score(trn.matches[0].id, [1,1,1,0]), 'tie slightly less');
  t.ok(trn.stageDone() && !trn.isDone(), 'need to tiebreak final better');
  t.ok(trn.createNextStage(), 'create another tiebreakers for final limit');

  // tiebreaker for final again
  t.ok(trn.inTieBreaker() && trn.inFinal(), 'still in final and in tiebreaker');
  t.eq(trn.matches, [
    { id: tbId(1), p: [ 1, 2, 3 ] } ],
    'tiebreaker final has one less player'
  );
  t.ok(trn.score(trn.matches[0].id, [1,1,0]), 'tied for 1st place');
  t.ok(trn.stageDone() && trn.isDone(), 'we do not need to break the top 2');

  trn.complete(); // can lock down the tourney now.
});
