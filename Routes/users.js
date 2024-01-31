const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.get('/', authController.protect, userController.getAllUsers);
router
  .route('/:id')
  .delete(
    // authController.protect,
    // authController.restrictTo('admin'),
    userController.deleteUser,
  )
  .patch(userController.updateUser)
  .get(userController.getUser);

module.exports = router;
