# FFA-TB
[![Build Status](https://secure.travis-ci.org/clux/ffa-tb.png)](http://travis-ci.org/clux/ffa-tb)
[![Dependency Status](https://david-dm.org/clux/ffa-tb.png)](https://david-dm.org/clux/ffa-tb)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

An implementation of [tourney](https://github.com/clux/tourney). This module is basically [FFA](https://github.com/clux/ffa) interspersed with [TieBreaker](https://github.com/clux/tiebreaker) rounds after each FFA round to avoid the artificial advancer limit in the fixed size `FFA` [tournament](https://github.com/clux/tournament).

## Installation
Install locally from npm:

```bash
$ npm install ffa-tb --save
```

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
