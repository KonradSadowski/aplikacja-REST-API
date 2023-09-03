const express = require('express')
const router = express.Router()
const controller = require('../controller')
const passport = require('../middleware/auth')
const middleware = require('../middleware/auth')

// routes for contacts
router.get('/contacts', middleware, controller.get)

router.get('/contacts/:id', middleware, controller.getById)

router.post('/contacts', middleware, controller.create)

router.put('/contacts/:id', middleware, controller.update)

router.patch('/contacts/:id/favorite', middleware, controller.updateFavorite)

router.delete('/contacts/:id', middleware, controller.remove)

// routes for users
router.post('/users/signup', controller.signUp)

router.post('/users/login', controller.logIn)

router.get('/users/logout', middleware, controller.logOut)

router.get('/users/current', middleware, controller.currentUser)

module.exports = router
