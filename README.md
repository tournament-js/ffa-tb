# FFA-TB
[![npm status](http://img.shields.io/npm/v/ffa-tb.svg)](https://www.npmjs.org/package/ffa-tb)
[![build status](https://secure.travis-ci.org/clux/ffa-tb.svg)](http://travis-ci.org/clux/ffa-tb)
[![dependency status](https://david-dm.org/clux/ffa-tb.svg)](https://david-dm.org/clux/ffa-tb)
[![coverage status](http://img.shields.io/coveralls/clux/ffa-tb.svg)](https://coveralls.io/r/clux/ffa-tb)

A [free-for-all](https://github.com/clux/ffa) style tournament, but with [tiebreakers](https://github.com/clux/tiebreaker) in between each round to ensure we can pick out the designated number of advancers unambiguously each round. It is an implementation of [tourney](https://github.com/clux/tourney).

It is a pointless abstraction if you are modelling a game/sport in which match level ties cannot occur, but for when that's not true - or if you are providing a tiebreaking resolution outside an actual match - then this will provide the glue needed.

## Usage
Use like `FFA`, but watch for stages. What follows is a comprehensive stage-by-stage example.

### Creation
All the constructor arguments are identical to [FFA](https://github.com/clux/ffa).
This example will follow a three round tournament with 16 players in round one, 8 in round two, and 4 in round three. The top 2 from each match (match sizes always 4) will proceed to the next round, and we have additionally asked for an unambiguous top 2 from the final.

```js
var FfaTb = require('ffa-tb');
var trn = new FfaTb(16, { sizes: [4, 4, 4], advancers: [2, 2], limit: 2 });
```

### Scoring Stages
Each stage is scored in turn. First round is the quarter finals:

```js
trn.inFFA(); // true
trn.matches
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 5, 12, 16 ] },
  { id: { s: 1, r: 1, m: 2 }, p: [ 2, 6, 11, 15 ] },
  { id: { s: 1, r: 1, m: 3 }, p: [ 3, 7, 10, 14 ] },
  { id: { s: 1, r: 1, m: 4 }, p: [ 4, 8, 9, 13 ] } ]

trn.matches.forEach(m => {
  trn.score(m.id, m.id.m === 3 ? [4,3,3,1]: [4,3,2,1]); // tie match 3
});
```

This will complete the first stage, but not the entire tourney:

```js
trn.stageDone(); // true
trn.isDone(); // false - two more ffa rounds to go
trn.createNextStage(); // true - must createNextStage when stageDone && !isDone
```

Creating next stage will update state, and now we are in a tiebreaker round to resolve match 3:

```js
trn.inTieBreaker(); // true
trn.matches;
[ { id: { s: 3, r: 1, m: 1 }, p: [ 7, 10 ] } ] // 2nd placers from match 3 must be resolved
trn.score(trn.matches[0].id, [0,1]);

trn.stageDone() && !trn.isDone(); // true
trn.createNextStage(); // true - intermediate tiebreaker stage over
```

This made for a short stage (and typically tiebreakers are short), so we are now back to the FFA part, in round 2, the semifinals:

```js
trn.inFFA(); // true
trn.inFinal(); // false - these are the semis
trn.matches;
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 3, 6, 10 ] }, // player 10 won tiebreaker
  { id: { s: 1, r: 1, m: 2 }, p: [ 2, 4, 5, 8 ] } ]

trn.matches.forEach(m => {
  trn.score(m.id, [4,3,2,1]); // score without ties
});

trn.stageDone() && !trn.isDone(); // true
trn.createNextStage(); // true - advance to round 3
```

This round did not have any tiebreakers, so we skip any tiebreaker stages after round 2 and go straight to the final:

```js
trn.inFFA() && trn.inFinal(); // true - in last round, and we're in FFA
trn.matches
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 2, 3, 4 ] } ] // top seeds won their semis

trn.score(trn.matches[0].id, [1,1,1,1]); // complete tie in final

trn.stageDone() && !trn.isDone(); // true - need to tiebreak final (limit set to 2)
trn.createNextStage(); // true
```

Because we had set `limit`, we are now forced to replay the final in a tiebreaker:

```js
trn.inTieBreaker() && trn.inFinal(); // true
// matches is complete replay of final - full tie
trn.matches
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 2, 3, 4 ] } ]

trn.score(trn.matches[0].id, [1,1,1,0]); // tie slightly less
trn.stageDone() && !trn.isDone(); // true - need to tiebreak final better
trn.createNextStage(); // true
```

This goes on if things do not resolve, but we did at least knock out player 4:

```js
trn.inTieBreaker() && trn.inFinal(); // true
trn.matches;
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 2, 3 ] } ]
trn.score(trn.matches[0].id, [1,1,0])); // tied for 1st place
trn.stageDone() && trn.isDone(); // true - we don't need to break the top 2
```

This is actually sufficient. Note that we have a tie for 1st place, but we can pick out our top 2, which is all we asked of `limit`. If you wanted the top 2, then split these two, you would really have an extra FFA round with 2 players and have `limit` at 1.

At any rate, this example is over, let's lock it down so no one comes around later and messes with the final state:

```js
trn.complete();
```

## Tiebreaker algorithm
See [tiebreaker module](https://github.com/clux/tiebreaker). We will break the smallest cluster necessary to determine the top `n` players where `n` is the current advancers number or the `limit` in the final round.

Since we have established that we can play matches with more than 2 players, tiebreakers are `simple`, meaning they will make a single multiple  player match which is a subset of the previous match. This is different from default behaviour in [groupstage tiebreakers](https://github.com/clux/groupstage-tb) which actually require subgroups when there are multi-way ties.

## Modelling and tiebreaker matches
In most cases, tiebreaker matches resolve most conflicts with modelling, and maps nicely onto the physical world. However, sometimes this is not true:

Suppose a match tied, but external factors (not present in the map score) actually decided who broke. For such a situation you have two options:

 1. Use tiebreaker round as model only

I.e. fill in the tiebreaker match with enough external information (pretend it was an actual match) to indicate to tournament who clearly won.

 2. Lie to FFA and encapsulate external information in original map score

This way, since you never actually intend to play physical tiebreaker matches, you can just use [FFA](https://npmjs.org/ffa) directly.

Both of these solutions are fine, and it comes to you how much data you want.

### Modelling Examples
#### Football
Football/soccer never really presents a physical tiebreaker match, but it certainly does tiebreak.
Overtime rounds and penalty shootouts can all be viewed as individual tiebreaker matches, or you can just look at the grand total goal sum as the final score.

Whichever you want to use for a football tournament would depend on the information you want. Since the goals are pretty much perfectly the match score, you could easily just not use tiebreaker since the game itself has a way of resolving ties.

However, if you want a way to model the individual parts of the tiebreaking resolution, it could be useful (but note that this can more easily be done with metadata outside tournament structures).

#### Quake FFA
Say you stick 10 players in a deatmatch server and want to take the pick the top 5. When the match is over, it is over. If there's a tie between 5th, 6th, and 7th, then extending the match would be unfair to the top 4 that clearly should proceed. In this case a tiebreaker match where these three players play another round of FFA is really the perfect fit.

Given the perfect fit of model and physical reality of the situation, this is were this module shines over plain `FFA`.

You could technically still choose not to model this inside the module, and present an amalgamated final score that combine the score the tiebreaker yourself; i.e. if the scores were `[10,9,8,7,6,6,6,3,2,1]` and the tie resolver `[3,2,1]`, you could just score the match as `[10,9,8,7,6,5,4,3,2,1]` and gloss over the details.

Doing so would be a little silly though. This module will formalize manual tiebreaking processes, provide transparency, and can limit the time needed for organizers to work out this kind of stuff.

## Installation
Install from npm:

```bash
$ npm install ffa-tb
```

## License
MIT-Licensed. See LICENSE file for details.
