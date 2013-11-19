var FFA = require('ffa');
var TieBreaker = require('tiebreaker');
var Dynamic = require('dynamic-tournament');

function DynamicFFA(numPlayers, opts) {
  this.numPlayers = numPlayers;
  opts = FFA.defaults(numPlayers, opts);
  var invReason = FFA.invalid(numPlayers, opts);
  if (invReason !== null) {
    console.error("Invalid %d player DynamicFFA with opts=%j rejected",
      numPlayers, opts
    );
    throw new Error("Cannot construct DynamicFFA: " + invReason);
  }
  var ffa0 = new FFA(this.numPlayers, { sizes: [opts.sizes[0]] });
  this.opts = opts;
  this.ffaIdx = 0;
  Dynamic.call(this, ffa0);
}
DynamicFFA.idString = function (id) {
  return [id.t, id.s, id.r, id.m].join('-');
}
Dynamic.inherit(DynamicFFA, Dynamic);

/*
DynamicFFA.configure({
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

// NB: don't need _verify (no extra restrictions)
// NB: don't need progress (all done via _createNext)

DynamicFFA.prototype._createNext = function () {
  // if need tiebreaker (can happen from both tournaments) tiebreak
  var adv = this.opts.advancers[this.ffaIdx] * this._trn.matches.length;
  // NB: we keep tiebreaking until there's nothing to tiebreak
  // and we will only need within breakers here because of how `adv` works in FFA
  var tb = TieBreaker.from(this._trn, adv, { nonStrict: true });
  console.log('making new stage:', tb.matches.length ? 'tiebreaker' : 'new ffa round');

  if (tb.matches.length > 0) {
    return tb; // we needed to tiebreak :(
  }
  var nextSize = this.opts.sizes[this.ffaIdx+1];
  if (nextSize) {
    this.ffaIdx += 1;
    return new FFA(adv, { sizes: [nextSize] });
  }
};


// TODO: results - how the fuck

module.exports = DynamicFFA;
