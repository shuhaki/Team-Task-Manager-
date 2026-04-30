const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email role')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner or member
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const { name, description } = req.body;
    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });
    
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (Owner only)
router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to add members' });
    }

    const { email } = req.body;
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (Owner only)
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to remove members' });
    }

    project.members = project.members.filter(
      m => m.toString() !== req.params.userId
    );
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
