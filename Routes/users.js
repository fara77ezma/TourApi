const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/forgetPassword', authController.forgetPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); // it will protect all routes comes after it because middleware runs in sequence

router.patch('/updateMyPassword', authController.updatePassword);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/me').get(userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);

router
  .route('/:id')
  .delete(userController.deleteUser)
  .patch(userController.updateUser)
  .get(userController.getUser);

module.exports = router;
