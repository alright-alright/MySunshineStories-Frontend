import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyAPI } from '../services/api';
import { BookOpen, ArrowLeft, Download, Share2, Sparkles } from 'lucide-react';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const data = await storyAPI.getStory(id);
      setStory(data);
    } catch (err) {
      setError('Failed to load story');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Create a downloadable version of the story
    const storyContent = `${story.title}\n\n${story.content}\n\n---\nGenerated for ${story.sunshine_name} on ${new Date(story.created_at).toLocaleDateString()}`;
    const blob = new Blob([storyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this personalized story for ${story.sunshine_name}!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Story link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your magical story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Story not found'}</p>
          <button
            onClick={() => navigate('/stories')}
            className="px-6 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Story Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6" />
            <span className="text-sm opacity-90">
              A story for {story.sunshine_name}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span>Theme: {story.fear_or_challenge || 'General'}</span>
            <span>•</span>
            <span>Tone: {story.tone || 'Whimsical'}</span>
          </div>
        </div>

        {/* Story Illustration */}
        {story.illustration_url && (
          <div className="p-8 bg-gradient-to-b from-yellow-50 to-white">
            <img
              src={`${import.meta.env.VITE_API_URL}${story.illustration_url}`}
              alt="Story illustration"
              className="w-full max-w-2xl mx-auto rounded-xl shadow-md"
            />
          </div>
        )}

        {/* Story Text */}
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Story Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Generated on {new Date(story.created_at).toLocaleDateString()}</span>
              </div>
              {story.word_count && (
                <span>{story.word_count} words</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 bg-gray-50 border-t">
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/stories/generate')}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Another Story
            </button>
            <button
              onClick={() => navigate('/stories')}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              View All Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;