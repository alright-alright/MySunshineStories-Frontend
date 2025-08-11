import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Calendar, Heart } from 'lucide-react';
import { sunshineAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SunshineProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await sunshineAPI.listProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await sunshineAPI.deleteProfile(id);
        fetchProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sunshine Profiles</h1>
        <Link
          to="/sunshines/create"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Sunshine</span>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sunshine Profiles Yet</h3>
          <p className="text-gray-600 mb-4">Create profiles for your children to generate personalized stories</p>
          <Link
            to="/sunshines/create"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Create First Profile</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/sunshines/${profile.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{profile.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Age {profile.age || 'unknown'}</span>
                  </div>
                  {profile.favorite_things && (
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>{profile.favorite_things}</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/stories/generate?sunshine=${profile.id}`}
                  className="mt-4 w-full bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 py-2 rounded-lg font-medium hover:shadow transition flex items-center justify-center"
                >
                  Create Story
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SunshineProfiles;