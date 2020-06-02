const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/registerInstructor', authController.registerInstructor);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/createCourse', authController.createCourse);
router.post('/checkout', authController.checkout);
router.post('/updateCourse', authController.updateCourse);
router.post('/uploadContent', authController.uploadContent);
router.post('/updateContent', authController.updateContent);
router.post('/search', authController.search);
router.post('/deleteContent', authController.deleteContent);
router.post('/deleteCourse', authController.deleteCourse);

module.exports = router;