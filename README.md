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
trn.matches; // contains the one in current stage
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 3, 6, 8 ] },
  { id: { s: 1, r: 1, m: 2 }, p: [ 2, 4, 5, 7 ] } ]
trn.score(trn.matches[0].id, [4,3,2,1]);
trn.score(trn.matches[1].id, [4,3,3,1]);
trn.istageDone(); // true

trn.createNextStage(); // can no longer score previous stage - matches updated
trn.inTieBreaker(); // true

trn.matches; // tiebreaker for hte second match
[ { id: { s: 2, r: 1, m: 1 }, p: [ 4, 5 ] ]
trn.score(trn.matches[0].id, [1,2]); // 5 beats 4 in tiebreaker

trn.stageDone(); // true
trn.createNextStage();
trn.inTieBreaker(); // false
trn.inFFA(); // true

trn.matches; // top 2 from each match in final
[ { id: { s: 1, r: 1, m: 1 }, p: [ 1, 2, 3, 5 ] } ]
```

Standard [Tourney](https://npmjs.org/tourney) API. [TieBreaker](https://npmjs.org/tiebreaker) rounds are interspearsed when necessary and entirely determined by if advancers can be chosen unambiguously. Otherwise, the only differences between [FFA](https://npmjs.org/ffa) is that you need to `createNextStage` occasionally, and that the `matches` array shifts to reflect the current round (and is thus easier to manage).

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
