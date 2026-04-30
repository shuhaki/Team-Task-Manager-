import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../utils/api';
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  ListTodo,
  Loader2,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Team Task Manager
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats?.stats?.totalProjects || 0}
            icon={<FolderKanban className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Todo Tasks"
            value={stats?.stats?.todoTasks || 0}
            icon={<ListTodo className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard
            title="In Progress"
            value={stats?.stats?.inProgressTasks || 0}
            icon={<Clock className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Completed"
            value={stats?.stats?.doneTasks || 0}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overdue Tasks */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Overdue Tasks ({stats?.stats?.overdueTasks || 0})
              </h2>
            </div>
            {stats?.overdueTasks?.length > 0 ? (
              <div className="space-y-3">
                {stats.overdueTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.project?.name}
                        </p>
                      </div>
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No overdue tasks. Great job!
              </p>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Tasks
              </h2>
            </div>
            {stats?.recentTasks?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.project?.name}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No tasks yet. Create a project to get started!
              </p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/projects"
            className="card hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Projects
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create and manage your projects
              </p>
            </div>
          </Link>

          <Link
            to="/tasks"
            className="card hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ListTodo className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Tasks
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and update your tasks
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusClasses = {
    todo: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    'in-progress': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    done: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  };

  const statusLabels = {
    todo: 'Todo',
    'in-progress': 'In Progress',
    done: 'Done',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
};

export default Dashboard;
