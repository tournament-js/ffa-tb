var FFA = require('ffa');
var TieBreaker = require('tiebreaker');
var Tourney = require('tourney');
var $ = require('autonomy');

var FfaTb = Tourney.sub('FfaTb', function (opts, initParent) {
  this.ffaStage = 1;
  this.adv = opts.advancers;
  this.sizes = opts.sizes;
  this.limit = opts.limit;
  initParent(new FFA(this.numPlayers, { sizes: [opts.sizes[0]] }));
  this.splits = [this.matches.length];
});

FfaTb.configure({
  defaults: FFA.defaults,
  invalid: FFA.invalid
});

//------------------------------------------------------------------
// Stage identifiers
//------------------------------------------------------------------

FfaTb.prototype.inFFA = function () {
  return this._inst.name === 'FFA';
};

FfaTb.prototype.inTieBreaker = function () {
  return this._inst.name === 'TieBreaker';
};

FfaTb.prototype.inFinal = function () {
  return !this.sizes[this.ffaStage];
};

//------------------------------------------------------------------
// Expected methods
//------------------------------------------------------------------

FfaTb.prototype._mustPropagate = function () {
  // regardless of current instance type:
  // only stop if last ffa round played and we no longer need tiebreaking
  return !this.inFinal() ||
         (this.limit && TieBreaker.isNecessary(this._inst, this.limit));
};

FfaTb.prototype._createNext = function () {
  // only called when _mustPropagate && stageComplete
  // regardless of current instance type: if we need tiebreaking tiebreak:
  var adv = this.inFinal() ? this.limit :
    this.adv[this.ffaStage-1] * this.splits[this.ffaStage-1] ;
  // keep trying to tiebreak because if it works - we have to do it:

  if (TieBreaker.isNecessary(this._inst, adv)) {
    return TieBreaker.from(this._inst, adv, { nonStrict: true });
  }

  // phew - can actually proceed to next ffaStage now
  var nextSize = this.sizes[this.ffaStage];
  // know nextSize is defined because:
  // a) FFA.invalid didn't stop us
  // b) _mustPropagate was true => inFinal is false (otherwise would have made tb)
  this.ffaStage += 1;
  var ffa = FFA.from(this._inst, adv, { sizes: [nextSize] });
  this.splits.push(ffa.matches.length); // keep track so we can work out next adv
  return ffa;
};

//------------------------------------------------------------------
// Overrides
//------------------------------------------------------------------
// TODO: isn't this kind of what we want as default for Tourney?

/**
 * just forwards on FFA results, but keeps the eliminated players where they were
 * knocked out, thus mimicing normal FFA elimination results.
 * TieBreaker results modify 
 */
var resultEntry = function (res, p) {
  return $.firstBy(function (r) {
    return r.seed === p;
  }, res);
};
FfaTb.prototype.results = function () {
  var currRes = this._inst.results();
  // _oldRes maintained as results from previous stage(s)
  var knockedOutResults = this._oldRes.filter(function (r) {
    // players not in current stage exist in previous results below
    return !resultEntry(currRes, r.seed);
  });

  if (this.inTieBreaker()) {
    return currRes; // TieBreaker modifies complete FFA results
  }

  // TODO: what to do about .gpos?
  var oldRes = this._oldRes;
  return currRes.map(function (r) {
    var old = resultEntry(oldRes, r.seed);
    if (old) {
      // add up previous results for players still in the tourney
      r.wins += old.wins;
      r.for += old.for;
      r.against += old.against;
    }
    return r;
  }).concat(knockedOutResults); // leave knocked out results as is
};

//------------------------------------------------------------------

module.exports = FfaTb;
