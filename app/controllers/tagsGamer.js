'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Article = mongoose.model('Article');

/**
 * List items tagged with a tag
 */

exports.index = async(function* (req, res) {
    console.log(" >>>>" + req.params.tagsGamer);
  const criteria = { tags:   req.params.tagsGamer};
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const limit = 30;
  const options = {
    limit: limit,
    page: page,
    criteria: criteria
  };

  const articles = yield Article.list(options);
  const count = yield Article.count(criteria);

  res.render('articles/index', {
    title: 'Articles tagged ' + req.params.tagsGamer,
    articles: articles,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

