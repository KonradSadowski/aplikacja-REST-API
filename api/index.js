const express = require('express')
const router = express.Router()
const controller = require('../controller')
const multer = require('../middleware/multer');
const passport = require('../middleware/auth')
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/multer');


// routes for contacts
router.get('/contacts', authMiddleware, controller.get)

router.get('/contacts/:id', authMiddleware, controller.getById)

router.post('/contacts', authMiddleware, controller.create)

router.put('/contacts/:id', authMiddleware, controller.update)

router.patch('/contacts/:id/favorite', authMiddleware, controller.updateFavorite)

router.delete('/contacts/:id', authMiddleware, controller.remove)

// routes for users
router.post('/users/signup', controller.signUp)

router.post('/users/login', controller.logIn)

router.get('/users/logout', authMiddleware, controller.logOut)

router.get('/users/current', authMiddleware, controller.currentUser)

router.patch('/users/avatars', authMiddleware, upload.single('avatar'), controller.updateAvatar);

router.get('/users/verify/:verificationToken', controller.verifyEmail);

router.post('/users/verify', controller.resendVerificationEmail);




module.exports = router
