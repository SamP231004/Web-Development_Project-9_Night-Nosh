const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Owner = require('../models/Owner');
require('dotenv').config();

// Student Registration
router.post('/student/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const student = new Student({ username, password });
    await student.save();
    res.status(201).json({ message: 'Student registered successfully' });
  } 
  catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Username already exists' });
    } 
    else {
      res.status(500).json({ message: err.message });
    }
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const student = await Student.findOne({ username });
    if (!student) {
      console.log('Student not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Password not valid');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Student login successful', token: token }); // Changed to 200
  } 
  catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Owner Registration
router.post('/owner/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const owner = new Owner({ username, password });
    await owner.save();
    res.status(201).json({ message: 'Owner registered successfully' });
  } 
  catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Username already exists' });
    } 
    else {
      res.status(500).json({ message: err.message });
    }
  }
});

// Owner Login
router.post('/owner/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const owner = await Owner.findOne({ username });
    if (!owner) {
      console.log('Owner not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await owner.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Password not valid');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: owner._id, role: 'owner' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Owner login successful', token: token }); // Changed to 200
  }
  catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;