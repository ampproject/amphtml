const router = require('express').Router();

router.use('/form/post/success', function (req, res) {
  delete req.query.__amp_source_origin;
  res.json({
    name: 'John Miller',
    interests: [{title: 'Football'}, {title: 'Basketball'}, {title: 'Writing'}],
  });
});

router.use('/date-picker/config.json', (_req, res) => {
  /**
   * @param {Date} date
   * @return {string}
   */
  function getISO8601Date(date) {
    const year = date.toLocaleString('en-US', {year: 'numeric'});
    const month = date.toLocaleString('en-US', {month: '2-digit'});
    const day = date.toLocaleString('en-US', {day: '2-digit'});
    return `${year}-${month}-${day}`;
  }

  const date = new Date();
  const nextWeek = new Date(new Date(date).setDate(date.getDate() + 7));
  const twoWeeks = new Date(new Date(date).setDate(date.getDate() + 14));

  const blocked = [getISO8601Date(nextWeek), getISO8601Date(twoWeeks)];

  res.json({
    blocked,
  });
});

module.exports = router;
