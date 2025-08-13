import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Book, Users, Star, Heart, Sparkles, BookOpen, 
  Download, Calendar, Clock, Plus, TrendingUp,
  CreditCard, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storyAPI, sunshineAPI, subscriptionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    storiesCount: 0,
    sunshinesCount: 0,
    avgRating: 0,
    minutesRead: 0,
    storiesThisWeek: 0
  });
  const [recentStories, setRecentStories] = useState([]);
  const [sunshines, setSunshines] = useState([]);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [storiesRes, sunshinesRes, usageRes] = await Promise.all([
        storyAPI.getHistory(5, 0),
        sunshineAPI.listProfiles(),
        subscriptionAPI.getUsageStats()
      ]);

      setRecentStories(storiesRes);
      setSunshines(sunshinesRes);
      setUsage(usageRes);

      // Calculate stats
      setStats({
        storiesCount: storiesRes.length,
        sunshinesCount: sunshinesRes.length,
        avgRating: 4.9, // Calculate from actual data
        minutesRead: storiesRes.reduce((acc, story) => acc + (story.reading_time || 5), 0),
        storiesThisWeek: 3 // Calculate from actual dates
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative">
          <h2 className="text-3xl font-bold mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, Sunshine!
          </h2>
          <p className="text-yellow-50 mb-6">Ready to create another magical story today?</p>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/stories/generate"
              className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center space-x-2 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create New Story</span>
            </Link>
            <Link 
              to="/sunshines/create"
              className="bg-white/20 backdrop-blur text-white border-2 border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Sunshine Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Usage Alert */}
      {usage && usage.stories_remaining !== -1 && usage.stories_remaining < 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">
              You have {usage.stories_remaining} {usage.stories_remaining === 1 ? 'story' : 'stories'} left this month
            </p>
            <Link to="/subscription" className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
              Upgrade for more stories →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.storiesCount}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Stories Created</h3>
          <p className="text-xs text-gray-400 mt-1">{stats.storiesThisWeek} this week</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.sunshinesCount}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Sunshine Profiles</h3>
          <p className="text-xs text-gray-400 mt-1">
            {sunshines.slice(0, 3).map(s => s.name).join(', ')}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {usage?.subscription_tier || 'Free'}
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Subscription</h3>
          <p className="text-xs text-gray-400 mt-1">
            {usage?.stories_remaining === -1 ? 'Unlimited' : `${usage?.stories_remaining || 0} stories left`}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.minutesRead}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Minutes Read</h3>
          <p className="text-xs text-gray-400 mt-1">Total reading time</p>
        </div>
      </div>

      {/* Sunshine Profiles Section */}
      {sunshines.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Sunshine Profiles</h3>
            <Link to="/sunshines" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
              Manage All →
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sunshines.slice(0, 3).map((sunshine) => (
                <Link
                  key={sunshine.id}
                  to={`/stories/generate?sunshine=${sunshine.id}`}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-yellow-400 hover:bg-yellow-50 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {sunshine.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{sunshine.name}</h4>
                      <p className="text-sm text-gray-500">Age {sunshine.age || 'unknown'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Stories */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Stories</h3>
          <Link to="/stories" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
            View All →
          </Link>
        </div>
        
        {recentStories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No stories yet</h4>
            <p className="text-gray-600 mb-4">Create your first magical story for your little sunshine!</p>
            <Link
              to="/stories/generate"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Your First Story</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentStories.map((story) => (
              <div key={story.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{story.title || 'Untitled Story'}</h4>
                      {story.child_name && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          {story.child_name}
                        </span>
                      )}
                    </div>
                    {story.fear_or_challenge && (
                      <p className="text-sm text-gray-600 mb-2">{story.fear_or_challenge}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{story.created_at ? new Date(story.created_at).toLocaleDateString() : 'Recently'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{story.reading_time || 5} min read</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/stories/${story.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <BookOpen className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;