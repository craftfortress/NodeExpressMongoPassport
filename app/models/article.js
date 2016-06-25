'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const notify = require('../mailer');

// const Imager = require('imager');
// const config = require('../../config');
// const imagerConfig = require(config.root + '/config/imager.js');

const Schema = mongoose.Schema;

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',');

const getTagsGames = tagsGames => tagsGames.join(',');
const setTagsGames = tagsGames => tagsGames.split(',');

const getseeking = seeking => seeking.join(',');
const setseeking = seeking => seeking.split(',');

const getmaps = maps => maps.join(',');
const setmaps = maps => maps.split(',');

const getclans = clans => clans.join(',');
const setclans = clans => clans.split(',');

const getachievements = achievements => achievements.join(',');
const setachievements = achievements => achievements.split(',');

const getcompetitions = competitions => competitions.join(',');
const setcompetitions = competitions => competitions.split(',');

const getplatform = platform => platform.join(',');
const setplatform = platform => platform.split(',');

const getyear = year => year.join(',');
const setyear = year => year.split(',');

const getregion = region => region.join(',');
const setregion = region => region.split(',');

const getcountry = country => country.join(',');
const setcountry = country => country.split(',');

const getsex = sex => sex.join(',');
const setsex = sex => sex.split(',');























/**
 * Article Schema
 */

const ArticleSchema = new Schema({
  title: { type : String, default : 'Entry', trim : true },
  body: { type : String, default : 'Entry', trim : true },

  contact: { type : String, default : '', trim : true },

  antics: { type : String, default : '', trim : true },

  user: { type : Schema.ObjectId, ref : 'User' },
  comments: [{
    body: { type : String, default : '' },
    user: { type : Schema.ObjectId, ref : 'User' },
      
    createdAt: { type : Date, default : Date.now }
  }],
  tags: { type: [], get: getTags, set: setTags },
  tagsGames: { type: [], get: getTagsGames, set: setTagsGames },

  maps: { type: [], get: getmaps, set: setmaps },


  seeking: { type: [], get: getseeking, set: setseeking },

  clans: { type: [], get: getclans, set: setclans},
  
  achievements: { type: [], get: getachievements, set: setachievements },

  competitions: { type: [], get: getcompetitions, set: setcompetitions },

  platform: { type: [], get: getplatform, set: setplatform },

  year: { type: [], get: getyear, set: setyear },

  region: { type: [], get: getregion, set: setregion},

  country: { type: [], get: getcountry, set: setcountry},

  sex: { type: [], get: getsex, set: setsex},


  image: {
    cdnUri: String,
    files: []
  },
  createdAt  : { type : Date, default : Date.now }
});

/**
 * Validations
 */

ArticleSchema.path('title').required(true, 'Article title cannot be blank');
ArticleSchema.path('body').required(true, 'Article body cannot be blank');

/**
 * Pre-remove hook
 */

ArticleSchema.pre('remove', function (next) {
  // const imager = new Imager(imagerConfig, 'S3');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'article');

  next();
});

/**
 * Methods
 */

ArticleSchema.methods = {

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @api private
   */

  uploadAndSave: function (image) {
    
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();

    /*
    if (images && !images.length) return this.save();
    const imager = new Imager(imagerConfig, 'S3');

    imager.upload(images, function (err, cdnUri, files) {
      if (err) return cb(err);
      if (files.length) {
        self.image = { cdnUri : cdnUri, files : files };
      }
      self.save(cb);
    }, 'article');
    */
  },

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @api private
   */

  addComment: function (user, comment) {
    this.comments.push({
      body: comment.body,
      user: user._id
    });

    if (!this.user.email) this.user.email = 'email@product.com';

    notify.comment({
      article: this,
      currentUser: user,
      comment: comment.body
    });

    return this.save();
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function (commentId) {
    const index = this.comments
      .map(comment => comment.id)
      .indexOf(commentId);

    if (~index) this.comments.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save();
  }
};

/**
 * Statics
 */

ArticleSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({ _id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec();
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Article', ArticleSchema);
