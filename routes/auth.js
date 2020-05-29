const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/registerInstructor', authController.registerInstructor);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/createCourse', authController.createCourse);
router.post('/checkout', authController.checkout);
router.post('/updateCourse', authController.updateCourse);

module.exports = router;