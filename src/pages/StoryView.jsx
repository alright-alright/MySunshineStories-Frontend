import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyAPI } from '../services/api';
import { BookOpen, ArrowLeft, Download, Share2, Sparkles, Maximize, X, Play, Video } from 'lucide-react';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isVideoFullScreen, setIsVideoFullScreen] = useState(false);
  
  // Enhanced text formatting function
  const formatStoryContent = (content) => {
    if (!content) return [];
    
    // Step 1: Clean JSON artifacts and escape sequences
    let cleanContent = content
      .replace(/^```json\s*/gi, '') // Remove json code blocks at start
      .replace(/```json/gi, '') // Remove any json markers
      .replace(/```/g, '') // Remove code block markers
      .replace(/^\s*{[^}]*"story":\s*"/s, '') // Remove JSON wrapper if present
      .replace(/"\s*}\s*$/s, '') // Remove closing JSON
      .replace(/\\n/g, '\n') // Convert escaped newlines to real newlines
      .replace(/\\'/g, "'") // Fix escaped single quotes
      .replace(/\\"/g, '"') // Fix escaped double quotes
      .replace(/\\t/g, '  ') // Convert tabs to spaces
      .replace(/\\/g, '') // Remove remaining backslashes
      .trim();
    
    // Step 2: Remove scene references and technical markers
    cleanContent = cleanContent
      .replace(/\*\*Scene \d+:.*?\*\*/gi, '') // Remove **Scene X: Title** markers
      .replace(/Scene \d+:.*?\n/gi, '') // Remove Scene X: markers
      .replace(/In the (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) scene[,:]?\s*/gi, '') // Remove scene references
      .replace(/\(Scene \d+\)/gi, '') // Remove (Scene X) markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/^\s*[-*]\s+/gm, '') // Remove bullet points
      .replace(/\[Scene:.*?\]/gi, '') // Remove [Scene: ...] markers
      .replace(/\{scene:.*?\}/gi, ''); // Remove {scene: ...} markers
    
    // Step 3: Remove any remaining JSON-like structures more aggressively
    cleanContent = cleanContent
      .replace(/^\s*[\[\{].*?[\]\}]\s*$/gm, '') // Remove lines that are just JSON
      .replace(/\{[^}]*\}/g, '') // Remove inline JSON objects
      .replace(/\[[^\]]*\]/g, '') // Remove inline JSON arrays
      .replace(/["']?(title|story|content|scene\d+)["']?\s*:\s*/gi, ''); // Remove JSON keys
    
    // Step 4: Clean up spacing and normalize line breaks
    cleanContent = cleanContent
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks to double
      .replace(/\s{2,}/g, ' ') // Normalize multiple spaces to single
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();
    
    // Step 5: Split into paragraphs more intelligently
    let paragraphs = cleanContent.split(/\n{2,}/);
    
    // If we still have giant paragraphs, split them
    paragraphs = paragraphs.flatMap(para => {
      if (para.length > 400) {
        // Split long paragraphs by sentences
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        const subParagraphs = [];
        let currentPara = '';
        
        sentences.forEach((sentence, index) => {
          const cleanSentence = sentence.trim();
          
          // Skip sentences that are just scene markers
          if (cleanSentence.match(/^(Scene|In the|The scene)/i)) {
            return;
          }
          
          currentPara += cleanSentence + ' ';
          
          // Create new paragraph every 2-3 sentences or at natural breaks
          const isNaturalBreak = cleanSentence.match(/(Once upon|One day|Meanwhile|Later|The next|Finally|In the end|After|Before|Suddenly|Then,)/i);
          const isSentenceBreak = (currentPara.match(/[.!?]/g) || []).length >= 2;
          
          if (isNaturalBreak || isSentenceBreak) {
            if (currentPara.trim()) {
              subParagraphs.push(currentPara.trim());
              currentPara = '';
            }
          }
        });
        
        // Add remaining content
        if (currentPara.trim()) {
          subParagraphs.push(currentPara.trim());
        }
        
        return subParagraphs;
      }
      return [para];
    });
    
    // Step 6: Final cleanup and filtering
    return paragraphs
      .map(p => {
        // Final cleanup of each paragraph
        return p
          .replace(/^\s*["']\s*|\s*["']\s*$/g, '') // Remove leading/trailing quotes
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
      })
      .filter(p => {
        // Remove empty paragraphs, JSON artifacts, and scene markers
        return p && 
               p.length > 20 && // Minimum paragraph length
               !p.match(/^\s*[\{\[\("']/) && // No JSON or quote starts
               !p.match(/^(Scene|In the.*scene)/i) && // No scene markers
               !p.includes('```') && // No code blocks
               !p.match(/^\s*\d+\s*$/) && // No lone numbers
               !p.match(/^["']*\s*:\s*["']*$/); // No lone colons
      });
  };

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const data = await storyAPI.getStory(id);
      
      // DEBUG: Verify field mapping worked
      console.log('✅ Story loaded successfully');
      console.log('✅ Content field exists:', !!data?.content);
      console.log('✅ Content length:', data?.content?.length || 0);
      
      setStory(data);
    } catch (err) {
      setError('Failed to load story');
      console.error('❌ Error fetching story:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Create a downloadable version of the story
    const title = story?.title || 'Untitled Story';
    const content = story?.content || story?.story_text || story?.story || 'Story content not available';
    const sunshineName = story?.sunshine_name || story?.child_name || 'Your Sunshine';
    const createdAt = story?.created_at ? new Date(story.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    
    const storyContent = `${title}\n\n${content}\n\n---\nGenerated for ${sunshineName} on ${createdAt}`;
    const blob = new Blob([storyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    // Add null check to prevent crash
    if (!story) {
      console.error('Cannot share: story not loaded');
      return;
    }
    
    const title = story.title || 'Personalized Story';
    const sunshineName = story.sunshine_name || 'Your Sunshine';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this personalized story for ${sunshineName}!`,
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

      {/* Preview Windows Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Preview Window */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-500" />
              Story Preview
            </h2>
            <button
              onClick={() => setIsFullScreen(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:shadow-md transition flex items-center gap-2 text-sm"
            >
              <Maximize className="w-4 h-4" />
              Full Screen
            </button>
          </div>
          
          {/* Preview Content Box - 400px height as requested */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 overflow-y-auto" style={{ height: '400px' }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{story.title || 'Untitled Story'}</h3>
            <div className="space-y-4 text-gray-700">
              {story?.content ? (
                <>
                  {(() => {
                    const paragraphs = formatStoryContent(story.content);
                    const previewParagraphs = paragraphs.slice(0, 3);
                    
                    return (
                      <>
                        {previewParagraphs.map((paragraph, index) => (
                          <p key={index} className="leading-relaxed text-base mb-4">
                            {paragraph}
                          </p>
                        ))}
                        {paragraphs.length > 3 && (
                          <p className="text-gray-500 italic mt-4">... Continue reading in full screen</p>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <p className="text-gray-500 italic">Story content is loading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Video Preview Window */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Video className="w-5 h-5 text-orange-500" />
              Video Preview
            </h2>
          </div>
          
          {/* Video Preview Box - matching height */}
          <div 
            onClick={() => setIsVideoFullScreen(true)}
            className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition group"
            style={{ height: '400px' }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <Play className="w-10 h-10 text-orange-500 ml-1" />
            </div>
            <p className="mt-4 text-xl font-semibold text-gray-700">Video Coming Soon</p>
            <p className="text-sm text-gray-500 mt-2 text-center">Click to preview the upcoming video feature</p>
          </div>
        </div>
      </div>

      {/* Full Screen Story Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{story.title || 'Untitled Story'}</h2>
              <button
                onClick={() => setIsFullScreen(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-yellow-50 to-white">
              <div className="prose prose-lg max-w-none">
                {story?.content ? (
                  formatStoryContent(story.content).map((paragraph, index) => (
                    <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Story content is loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Video Modal */}
      {isVideoFullScreen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Video Player</h2>
              <button
                onClick={() => setIsVideoFullScreen(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-12 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <Video className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-800">Video Generation Coming Soon</h3>
              <p className="mt-3 text-gray-600 text-center max-w-md">
                We're working on bringing your stories to life with animated videos. 
                This exciting feature will be available soon!
              </p>
              <button
                onClick={() => setIsVideoFullScreen(false)}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Story Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6" />
            <span className="text-sm opacity-90">
              A story for {story.sunshine_name || 'Your Sunshine'}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{story.title || 'Untitled Story'}</h1>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span>Theme: {story.fear_or_challenge || 'General'}</span>
            <span>•</span>
            <span>Tone: {story.tone || 'Whimsical'}</span>
          </div>
        </div>

        {/* Story Illustration - Display with proper fallback */}
        <div className="p-8 bg-gradient-to-b from-yellow-50 to-white">
          {(story.image_urls && story.image_urls[0]) || story.illustration_url ? (
            <img
              src={story.image_urls?.[0] || story.illustration_url}
              alt="Story illustration"
              className="w-full max-w-2xl mx-auto rounded-xl shadow-md object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full max-w-2xl mx-auto rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 p-12 text-center">
              <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Illustration coming soon</p>
            </div>
          )}
        </div>

        {/* Story Text */}
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            {story?.content ? (
              formatStoryContent(story.content).map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">Story content is loading...</p>
            )}
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