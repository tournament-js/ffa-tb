# FFA-Dynamic
[![Build Status](https://secure.travis-ci.org/clux/ffa-dynamic.png)](http://travis-ci.org/clux/ffa-dynamic)
[![Dependency Status](https://david-dm.org/clux/ffa-dynamic.png)](https://david-dm.org/clux/ffa-dynamic)
[![unstable](http://hughsk.github.io/stability-badges/dist/unstable.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

An implementation of [dynamic-tournament](https://github.com/clux/dynamic-tournament). This module is basically [FFA](https://github.com/clux/ffa) interspersed with [TieBreaker](https://github.com/clux/tiebreaker) rounds between each FFA round to avoid the artificial advancer limit in `FFA`.

## Installation
Install locally from npm:

```bash
$ npm install ffa-dynamic --save
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
