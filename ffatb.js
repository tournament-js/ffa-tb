var FFA = require('ffa');
var TieBreaker = require('tiebreaker');
var Tourney = require('tourney');
var $ = require('autonomy');

// TODO: if limit, set, don't force the limit downwards, but tiebreak the final
// though still enforce limit divisible my number of final matches
function FfaTb(numPlayers, opts) {
  this.numPlayers = numPlayers;
  opts = FFA.defaults(numPlayers, opts);
  // need to make sure we could have created this as a plain FFA with adv limits
  var invReason = FFA.invalid(numPlayers, opts);
  if (invReason !== null) {
    console.error("Invalid %d player FfaTb with opts=%j rejected",
      numPlayers, opts
    );
    throw new Error("Cannot construct FfaTb: " + invReason);
  }
  this._ffaAry = [];
  var ffa0 = new FFA(this.numPlayers, { sizes: [opts.sizes[0]] });
  this._ffaAry.push(ffa0);

  this.opts = opts;
  this.ffaIdx = 0;
  Tourney.call(this, [ffa0]);
}
FfaTb.idString = function (id) {
  return [id.t, id.s, id.r, id.m].join('-');
};
Tourney.inherit(FfaTb, Tourney);

/*
FfaTb.configure({
  defaults: function (np, opts) {
    opts = FFA.defaults(opts);
    // TODO: add own options on top?
    return opts;
  },
  invalid: function (np, opts) {
    var invReason = FFA.invalid(np, opts);
    if (invReason !== null) {
      return invReason;
    }
    // TODO: own rejection reasons here
    return null;
  }
});*/

// TODO: account for final round limit?
FfaTb.prototype.isDone = function () {
  return (!this.opts.sizes[this.ffaIdx+1] && this._trns[0].isDone());
};
FfaTb.prototype._createNext = function () {
  if (this.isDone()) {
    return [];
  }
  // if need tiebreaker (can happen from both tournaments) tiebreak
  var adv = this.opts.advancers[this.ffaIdx] * this._ffaAry[this.ffaIdx].matches.length;
  // NB: we keep tiebreaking until there's nothing to tiebreak
  // and we will only need within breakers here because of how `adv` works in FFA
  var tb = TieBreaker.from(this._trns[0], adv, { nonStrict: true });

  if (tb.matches.length > 0) {
    return [tb]; // we needed to tiebreak :(
  }
  var nextSize = this.opts.sizes[this.ffaIdx+1];
  if (nextSize) {
    this.ffaIdx += 1;
    var nextFfa = FFA.from(this._trns[0], adv, { sizes: [nextSize] });
    this._ffaAry.push(nextFfa);
    return [nextFfa];
  }
  return [];
};

FfaTb.prototype.currentRound = function () {
  var stg = this.currentStage();
  return stg.length && stg[0];
};

FfaTb.prototype.isTieBreakerRound = function () {
  var curr = this.currentRound();
  return curr && curr.name === 'TieBreaker';
};

/**
 * results
 *
 * just forwards on FFA results, but keeps the eliminated players where they were
 * knocked out, thus mimicing normal FFA elimination results.
 * TieBreaker results modify 
 */
var resultEntry = function (res, p) {
  return $.firstBy(function (r) {
    return r.seed === p;
  }, res);
};
Tourney.prototype.results = function () {
  var currRes = this.currentRound().results();
  // _oldRes maintained as results from previous stage(s)
  var knockedOutResults = this._oldRes.filter(function (r) {
    // players not in current stage exist in previous results below
    return !resultEntry(currRes, r.seed);
  });
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


module.exports = FfaTb;
