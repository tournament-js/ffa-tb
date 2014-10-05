# FFA-TB
[![npm status](http://img.shields.io/npm/v/ffa-tb.svg)](https://www.npmjs.org/package/ffa-tb)
[![build status](https://secure.travis-ci.org/clux/ffa-tb.svg)](http://travis-ci.org/clux/ffa-tb)
[![dependency status](https://david-dm.org/clux/ffa-tb.svg)](https://david-dm.org/clux/ffa-tb)
[![coverage status](http://img.shields.io/coveralls/clux/ffa-tb.svg)](https://coveralls.io/r/clux/ffa-tb)
[![unstable](http://img.shields.io/badge/stability-unstable-E5AE13.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

An implementation of [tourney](https://github.com/clux/tourney). This module is basically [FFA](https://github.com/clux/ffa) interspersed with [TieBreaker](https://github.com/clux/tiebreaker) rounds after each FFA round to avoid the artificial advancer limit in the fixed size `FFA` [tournament](https://github.com/clux/tournament).

## Installation
Install locally from npm:

```bash
$ npm install ffa-tb --save
```

## Usage
Use like any other [tourney](https://github.com/clux/tourney), with the initialization parameters being identical to those you'd normally send to [ffa](https://github.com/clux/ffa):

```js
var FfaTb = require('ffa-tb');
var ffaOpts = { sizes: [4, 4], advancers: [2] }; // 8 players, 2 rounds of 4 players each
var trn = new FfaTb(8, ffaOpts);
var r1 = trn.currentRound(); // r1 is a FFA instance
r1.matches;
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 3, 6, 8 ] },
  { id: { s: 1, r: 1, m: 2 }, p: [ 2, 4, 5, 7 ] } ]
r1.score(r1.matches[0].id, [4,3,2,1]);
r1.score(r1.matches[1].id, [4,3,3,1]);
r1.isDone(); // true

trn.createNextStage(); // can no longer score r1
trn.isTieBreakerRound(); // true

var tb = trn.currentRound();
tb.matches; // need to break the second match
[ { id: { s: 2, r: 1, m: 1 }, p: [ 4, 5 ] ]
tb.score(tb.matches[0].id, [1,2]); // 5 beats 4 in tiebreaker

tb.isDone(); // true
trn.createNextStage();
trn.isTieBreakerRound(); // false

var r2 = trn.currentRound();
r2.matches; // top 2 from each match in final
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 2, 3, 5 ] } ]
```

In short, you do need to do a bit of stuff to check what is going on, but ultimately 80% of what you need to do should be familiar [tournament](https://github.com/clux/tournament) API calls. The `FfaTb` class just encapulates the alternation between [TieBreaker](https://github.com/clux/tiebreaker) and [FFA](https://github.com/clux/ffa) rounds, as well as the necessary bookeeping of results between these rounds.

## Running tests
Install development dependencies

```bash
$ npm install
```

Run the tests

```bash
$ npm test
```

## License
MIT-Licensed. See LICENSE file for details.
