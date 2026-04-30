const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, status, assigneeId } = req.query;

    // Build query
    let query = {};

    // Get projects user has access to
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });
    
    const projectIds = projects.map(p => p._id);
    query.project = { $in: projectIds };

    if (projectId) {
      query.project = projectId;
    }

    if (status) {
      query.status = status;
    }

    if (assigneeId) {
      query.assignee = assigneeId;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
const { title, description, project, assignee, status, dueDate } = req.body;

    // Handle empty assignee string
    const cleanedAssignee = assignee === '' ? null : assignee;

    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(m => m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not authorized to create tasks in this project' });
    }

const task = await Task.create({
      title,
      description,
      project,
      assignee: cleanedAssignee,
      status: status || 'todo',
      dueDate,
      createdBy: req.user._id
    });

    await task.populate('project', 'name');
    await task.populate('assignee', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name owner members')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project._id);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user has access to the project
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

const { title, description, assignee, status, dueDate } = req.body;

    // Handle empty assignee string
    const cleanedAssignee = assignee === '' ? null : (assignee || task.assignee);

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.assignee = cleanedAssignee;
    task.status = status || task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignee', 'name email');

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user has access to the project
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
