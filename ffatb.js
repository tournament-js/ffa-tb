var FFA = require('ffa');
var TieBreaker = require('tiebreaker');
var Tourney = require('tourney');

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
  var ffa0 = new FFA(this.numPlayers, { sizes: [opts.sizes[0]] });
  this.opts = opts;
  this.ffaIdx = 0;
  Tourney.call(this, ffa0);
}
FfaTb.idString = function (id) {
  return [id.t, id.s, id.r, id.m].join('-');
}
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
  return (!this.opts.sizes[this.ffaIdx+1] && this._trn.isDone());
};
FfaTb.prototype._createNext = function () {
  if (this.isDone()) {
    return null;
  }
  // if need tiebreaker (can happen from both tournaments) tiebreak
  var adv = this.opts.advancers[this.ffaIdx] * this._trn.matches.length;
  // NB: we keep tiebreaking until there's nothing to tiebreak
  // and we will only need within breakers here because of how `adv` works in FFA
  var tb = TieBreaker.from(this._trn, adv, { nonStrict: true });

  if (tb.matches.length > 0) {
    return tb; // we needed to tiebreak :(
  }
  var nextSize = this.opts.sizes[this.ffaIdx+1];
  if (nextSize) {
    this.ffaIdx += 1;
    return new FFA(adv, { sizes: [nextSize] });
  }
  return null;
};


// TODO: results - how the fuck

module.exports = FfaTb;
