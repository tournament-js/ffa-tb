var FfaTb = require(process.env.FFATB_COV ? '../ffatb-cov.js' : '../');

exports.invalidsThrow = function (t) {
  t.expect(2);
  var reason = "number of players must be at least 2";
  try {
    new FfaTb(1);
  }
  catch (e) {
    t.equal(e.message, "Cannot construct FfaTb: " + reason, 'error.message');
  }
  t.equal(FfaTb.invalid(1), reason, ".invalid returns reason");
  t.done();
};

