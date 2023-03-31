const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Recipe = require('../models/Recipe')

// @desc    Show add page
// @route   GET /recipes/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('recipes/add')
})

// @desc    Process add form
// @route   POST /recipes
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Recipe.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all recipes
// @route   GET /recipes
router.get('/', ensureAuth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('recipes/index', {
      recipes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single recipe
// @route   GET /recipe/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id).populate('user').lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user._id != req.user.id && recipe.status == 'private') {
      res.render('error/404')
    } else {
      res.render('recipes/show', {
        recipe,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /recipes/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
    }).lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
      res.redirect('/recipes')
    } else {
      res.render('recipes/edit', {
        recipe,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update recipe
// @route   PUT /recipes/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id).lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
      res.redirect('/recipes')
    } else {
      recipe = await Recipe.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete recipe
// @route   DELETE /recipe/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id).lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
      res.redirect('/recipes')
    } else {
      await Recipe.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User recipes
// @route   GET /recipes/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const recipes = await Recipe.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('recipes/index', {
      recipes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//@desc Search recipe by title
//@route GET /recipe/search/:query
router.get('/search/:query', ensureAuth, async (req, res) => {
  try{
      const recipes = await Recipe.find({title: new RegExp(req.query.query,'i'), status: 'public'})
      .populate('user')
      .sort({ createdAt: 'desc'})
      .lean()
     res.render('recipes/index', { recipes })
  } catch(err){
      console.log(err)
      res.render('error/404')
  }
})


module.exports = router