const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// Get all branches (for admin) or only published (for public)
router.get('/', async (req, res) => {
  try {
    const { publishedOnly } = req.query;
    let query = {};
    if (publishedOnly === 'true') {
      query.isPublished = true;
    }
    const branches = await Branch.find(query).sort({ createdAt: -1 });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching branches' });
  }
});

// Create a new branch
router.post('/', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name || !address || !phone) {
      return res.status(400).json({ error: 'Name, address, and phone are required' });
    }
    const branch = new Branch({ name, address, phone });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating branch' });
  }
});

// Update branch (e.g. toggle isPublished)
router.put('/:id', async (req, res) => {
  try {
    const { isPublished } = req.body;
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    
    if (isPublished !== undefined) branch.isPublished = isPublished;
    await branch.save();
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating branch' });
  }
});

// Delete a branch
router.delete('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting branch' });
  }
});

module.exports = router;
