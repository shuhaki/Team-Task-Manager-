const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get dashboard stats
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get projects user has access to
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });
    
    const projectIds = projects.map(p => p._id);

    // Total tasks count
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });

    // Tasks by status
    const todoTasks = await Task.countDocuments({ 
      project: { $in: projectIds },
      status: 'todo'
    });
    
    const inProgressTasks = await Task.countDocuments({ 
      project: { $in: projectIds },
      status: 'in-progress'
    });
    
    const doneTasks = await Task.countDocuments({ 
      project: { $in: projectIds },
      status: 'done'
    });

    // Overdue tasks (past due date and not done)
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    });

    // Get overdue task details for display
    const overdueTaskDetails = await Task.find({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    })
    .populate('project', 'name')
    .populate('assignee', 'name email')
    .limit(10)
    .sort({ dueDate: 1 });

    // Recent tasks
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .limit(5)
      .sort({ createdAt: -1 });

    // Projects count
    const totalProjects = projects.length;

    // Team members count
    const memberIds = new Set();
    projects.forEach(p => {
      p.members.forEach(m => memberIds.add(m.toString()));
    });
    const totalMembers = memberIds.size;

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        totalMembers
      },
      overdueTasks: overdueTaskDetails,
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
