var FFA = require('ffa');
var TieBreaker = require('tiebreaker');
var Tourney = require('tourney');

var FfaTb = Tourney.sub('FfaTb', function (opts, init) {
  this.ffaStage = 1;
  this.sizes = opts.sizes;
  var ffaOpts = { sizes: [opts.sizes[0]] };
  if (opts.log) {
    ffaOpts.log = opts.log;
  }
  init(new FFA(this.numPlayers, ffaOpts));
  this.splits = [this.matches.length];
});

FfaTb.configure({
  defaults: FFA.defaults,
  invalid: FFA.invalid
});

// ------------------------------------------------------------------
// Stage identifiers
// ------------------------------------------------------------------

FfaTb.prototype.inFFA = function () {
  return this.getName(1) === 'FFA';
};

FfaTb.prototype.inTieBreaker = function () {
  return this.getName(1) === 'TieBreaker';
};

FfaTb.prototype.inFinal = function () {
  return !this.sizes[this.ffaStage];
};

// ------------------------------------------------------------------
// Expected methods
// ------------------------------------------------------------------

FfaTb.prototype._mustPropagate = function (stg, inst, opts) {
  // regardless of current instance type:
  // only stop if last ffa round played and we no longer need tiebreaking
  return !this.inFinal() ||
         (opts.limit && TieBreaker.isNecessary(inst, opts.limit));
};

FfaTb.prototype._createNext = function (stg, inst, opts) {
  // only called when _mustPropagate && stageComplete
  // regardless of current instance type: if we need tiebreaking tiebreak:
  var adv = this.inFinal() ? opts.limit :
    opts.advancers[this.ffaStage-1] * this.splits[this.ffaStage-1];
  // keep trying to tiebreak because if it works - we have to do it:

  if (TieBreaker.isNecessary(inst, adv)) {
    var tbOpts = { nonStrict: true, log: this._opts.log };
    return TieBreaker.from(inst, adv, tbOpts);
  }

  // phew - can actually proceed to next ffaStage now
  var nextSize = this.sizes[this.ffaStage];
  // nextSize is defined because _mustPropagate => !inFinal
  this.ffaStage += 1;
  var ffa = FFA.from(inst, adv, { sizes: [nextSize], log: this._opts.log });
  this.splits.push(ffa.matches.length); // keep track so we can work out next adv
  return ffa;
};

FfaTb.prototype._proxyRes = function () {
  return this.inTieBreaker(); // TieBreaker returns modified FFA results
};

FfaTb.prototype._updateRes = function (r, prev) {
  // when moving between stages, add previous results
  r.wins += prev.wins;
  r.for += prev.for;
  r.against += prev.against;
  // TODO: what to do about .gpos?
};

// ------------------------------------------------------------------

module.exports = FfaTb;
