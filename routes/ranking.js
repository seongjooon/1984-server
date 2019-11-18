const express = require('express');
const router = express.Router();
const Ranking = require('../models/ranking');

router.post('/', async (req, res, next) => {
  try {
    const rankingData = {
      nickname: req.body.nickname,
      score: req.body.score
    };

    await new Ranking(rankingData).save();
    res.send({ result: 'ok', rankingData });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
