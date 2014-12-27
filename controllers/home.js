/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};

exports.nochat = function(req, res) {
  res.render('nochat', {
    title: 'No Chat'
  });
};
