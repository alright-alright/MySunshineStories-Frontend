import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sunshineAPI } from '../services/api';
import { Upload, X, UserPlus, Users, Heart, Sparkles } from 'lucide-react';

const CreateSunshine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'other',
    interests: [],
    personality_traits: [],
    fears_or_challenges: '',
    favorite_things: '',
    family_members: [],
    comfort_items: []
  });
  
  const [photos, setPhotos] = useState([]);
  const [photosPreviews, setPhotosPreviews] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [newTrait, setNewTrait] = useState('');
  const [newFamilyMember, setNewFamilyMember] = useState({ name: '', relation_type: '', age: '' });
  const [newComfortItem, setNewComfortItem] = useState({ name: '', description: '' });

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos([...photos, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotosPreviews([...photosPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photosPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotosPreviews(newPreviews);
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      setFormData({ ...formData, personality_traits: [...formData.personality_traits, newTrait.trim()] });
      setNewTrait('');
    }
  };

  const removeTrait = (index) => {
    setFormData({
      ...formData,
      personality_traits: formData.personality_traits.filter((_, i) => i !== index)
    });
  };

  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relation_type) {
      setFormData({ 
        ...formData, 
        family_members: [...formData.family_members, { ...newFamilyMember }] 
      });
      setNewFamilyMember({ name: '', relation_type: '', age: '' });
    }
  };

  const removeFamilyMember = (index) => {
    setFormData({
      ...formData,
      family_members: formData.family_members.filter((_, i) => i !== index)
    });
  };

  const addComfortItem = () => {
    if (newComfortItem.name) {
      setFormData({ 
        ...formData, 
        comfort_items: [...formData.comfort_items, { ...newComfortItem }] 
      });
      setNewComfortItem({ name: '', description: '' });
    }
  };

  const removeComfortItem = (index) => {
    setFormData({
      ...formData,
      comfort_items: formData.comfort_items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profileData = new FormData();
      
      // Add basic fields
      profileData.append('name', formData.name);
      profileData.append('age', formData.age);
      profileData.append('gender', formData.gender);
      profileData.append('fears_or_challenges', formData.fears_or_challenges);
      profileData.append('favorite_things', formData.favorite_things);
      
      // Add arrays as JSON
      profileData.append('interests', JSON.stringify(formData.interests));
      profileData.append('personality_traits', JSON.stringify(formData.personality_traits));
      profileData.append('family_members', JSON.stringify(formData.family_members));
      profileData.append('comfort_items', JSON.stringify(formData.comfort_items));
      
      // Add photos
      photos.forEach(photo => {
        profileData.append('photos', photo);
      });

      const response = await sunshineAPI.createProfile(profileData);
      navigate('/sunshines');
    } catch (err) {
      setError(err.message || 'Failed to create profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Create Sunshine Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-yellow-500" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
                min="1"
                max="18"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="other">Prefer not to say</option>
                <option value="male">Boy</option>
                <option value="female">Girl</option>
              </select>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-yellow-500" />
            Photos
          </h2>
          
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
                  <X className="w-3 h-3" />
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

        {/* Interests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            Interests & Personality
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add an interest..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center gap-1"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                placeholder="Add a trait..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTrait}
                className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.personality_traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1"
                >
                  {trait}
                  <button
                    type="button"
                    onClick={() => removeTrait(index)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Things</label>
            <textarea
              value={formData.favorite_things}
              onChange={(e) => setFormData({ ...formData, favorite_things: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              rows="2"
              placeholder="Toys, activities, foods, etc."
            />
          </div>
        </div>

        {/* Family Members */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-yellow-500" />
            Family Members
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              value={newFamilyMember.name}
              onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
              placeholder="Name"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <input
              type="text"
              value={newFamilyMember.relation_type}
              onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relation_type: e.target.value })}
              placeholder="Relationship (Mom, Dad, etc.)"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newFamilyMember.age}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, age: e.target.value })}
                placeholder="Age"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addFamilyMember}
                className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {formData.family_members.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>
                  <strong>{member.name}</strong> ({member.relation_type})
                  {member.age && `, Age ${member.age}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeFamilyMember(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comfort Items */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-yellow-500" />
            Comfort Items
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={newComfortItem.name}
              onChange={(e) => setNewComfortItem({ ...newComfortItem, name: e.target.value })}
              placeholder="Item name"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newComfortItem.description}
                onChange={(e) => setNewComfortItem({ ...newComfortItem, description: e.target.value })}
                placeholder="Description (optional)"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addComfortItem}
                className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {formData.comfort_items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>
                  <strong>{item.name}</strong>
                  {item.description && `: ${item.description}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeComfortItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fears or Challenges (Optional)
          </label>
          <textarea
            value={formData.fears_or_challenges}
            onChange={(e) => setFormData({ ...formData, fears_or_challenges: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            rows="3"
            placeholder="Things they're working on overcoming..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sunshines')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSunshine;