import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sunshineAPI, storyAPI } from '../services/api';
import { BookOpen, Sparkles, Upload, AlertCircle } from 'lucide-react';

const StoryGenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sunshineId = searchParams.get('sunshine');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(sunshineId || '');
  const [fear, setFear] = useState('');
  const [tone, setTone] = useState('whimsical');
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [photosPreviews, setPhotosPreviews] = useState([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await sunshineAPI.listProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalPhotos([...additionalPhotos, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotosPreviews([...photosPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const newPhotos = additionalPhotos.filter((_, i) => i !== index);
    const newPreviews = photosPreviews.filter((_, i) => i !== index);
    setAdditionalPhotos(newPhotos);
    setPhotosPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfile) {
      setError('Please select a Sunshine profile');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let storyData;
      
      if (additionalPhotos.length > 0) {
        // Use enhanced generation with photos
        const formData = new FormData();
        formData.append('sunshine_id', selectedProfile);
        formData.append('fear_or_challenge', fear);
        formData.append('tone', tone);
        
        additionalPhotos.forEach(photo => {
          formData.append('additional_photos', photo);
        });
        
        storyData = await storyAPI.generateEnhancedStory(formData);
      } else {
        // Use regular generation
        storyData = await storyAPI.generateStory({
          sunshine_id: selectedProfile,
          fear_or_challenge: fear,
          tone: tone
        });
      }
      
      // Navigate to story view with the new story ID
      navigate(`/stories/${storyData.id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate story');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Generate a New Story</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Profile Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Sunshine Profile *
          </label>
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            required
          >
            <option value="">Choose a profile...</option>
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name} (Age {profile.age})
              </option>
            ))}
          </select>
          {profiles.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No profiles found. <button
                type="button"
                onClick={() => navigate('/sunshines/create')}
                className="text-yellow-600 hover:text-yellow-700 underline"
              >
                Create one first
              </button>
            </p>
          )}
        </div>

        {/* Fear or Challenge */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fear or Challenge to Address *
          </label>
          <textarea
            value={fear}
            onChange={(e) => setFear(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            rows="3"
            placeholder="What challenge should the story help with? (e.g., fear of the dark, first day of school, making new friends...)"
            required
          />
        </div>

        {/* Story Tone */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Tone
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'whimsical', label: 'Whimsical', icon: '✨' },
              { value: 'adventurous', label: 'Adventurous', icon: '🚀' },
              { value: 'calming', label: 'Calming', icon: '🌙' },
              { value: 'funny', label: 'Funny', icon: '😄' }
            ].map(option => (
              <label
                key={option.value}
                className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                  tone === option.value
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={tone === option.value}
                  onChange={(e) => setTone(e.target.value)}
                  className="sr-only"
                />
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Photos */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Photos (Optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload photos of family members, pets, or special objects to include in the story
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {photosPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            
            <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-gray-400" />
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !selectedProfile}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Story
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Creating a personalized story just for your sunshine...</p>
            <p className="mt-1">This may take up to 30 seconds</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default StoryGenerator;