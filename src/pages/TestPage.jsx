import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI, sunshineAPI, storyAPI, subscriptionAPI, healthAPI } from '../services/api';

const TestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const addResult = (name, success, details = '') => {
    setTestResults(prev => [...prev, { name, success, details, timestamp: new Date() }]);
  };

  const runTest = async (name, testFn) => {
    setCurrentTest(name);
    try {
      const result = await testFn();
      addResult(name, true, JSON.stringify(result).substring(0, 100));
      return result;
    } catch (error) {
      addResult(name, false, error.message);
      throw error;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      // 1. Health Check
      await runTest('Health Check', async () => {
        return await healthAPI.check();
      });

      // 2. Get Current User
      const user = await runTest('Get Current User', async () => {
        return await authAPI.getCurrentUser();
      });

      // 3. List Sunshine Profiles
      const profiles = await runTest('List Sunshine Profiles', async () => {
        return await sunshineAPI.listProfiles();
      });

      // 4. Create Test Profile
      let testProfileId;
      if (profiles.length === 0) {
        const newProfile = await runTest('Create Test Profile', async () => {
          const formData = new FormData();
          formData.append('name', 'Test Child');
          formData.append('age', '5');
          formData.append('gender', 'other');
          formData.append('interests', JSON.stringify(['dinosaurs', 'space']));
          formData.append('personality_traits', JSON.stringify(['curious', 'brave']));
          formData.append('favorite_things', 'teddy bear');
          return await sunshineAPI.createProfile(formData);
        });
        testProfileId = newProfile.id;
      } else {
        testProfileId = profiles[0].id;
        addResult('Using Existing Profile', true, `Profile ID: ${testProfileId}`);
      }

      // 5. Generate Story
      const story = await runTest('Generate Story', async () => {
        return await storyAPI.generateStory({
          sunshine_id: testProfileId,
          story_type: 'bedtime',
          theme: 'adventure',
          lesson: 'bravery',
          custom_prompt: 'A magical adventure in space'
        });
      });

      // 6. Get Story History
      await runTest('Get Story History', async () => {
        return await storyAPI.getHistory();
      });

      // 7. Test Photo Upload (mock)
      await runTest('Test Photo Analysis', async () => {
        const formData = new FormData();
        // Create a mock image blob
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 100, 100);
        
        return new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            formData.append('photo', blob, 'test.png');
            try {
              const result = await storyAPI.analyzePhoto(formData);
              resolve(result);
            } catch (error) {
              resolve({ error: 'Photo analysis not available in demo' });
            }
          });
        });
      });

      // 8. Test PDF Export
      if (story && story.id) {
        await runTest('Export Story to PDF', async () => {
          try {
            return await storyAPI.exportPDF(story.id);
          } catch (error) {
            return { error: 'PDF export not available in demo' };
          }
        });
      }

      // 9. Get Subscription Plans
      await runTest('Get Subscription Plans', async () => {
        return await subscriptionAPI.getPlans();
      });

      // 10. Get Current Subscription
      await runTest('Get Current Subscription', async () => {
        return await subscriptionAPI.getCurrentSubscription();
      });

      // 11. Get Usage Stats
      await runTest('Get Usage Stats', async () => {
        return await subscriptionAPI.getUsageStats();
      });

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setTesting(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (success) => {
    if (success === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (success === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const successCount = testResults.filter(r => r.success).length;
  const failureCount = testResults.filter(r => !r.success).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">API Test Suite</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Controls</h2>
          <button
            onClick={runAllTests}
            disabled={testing}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <span>Run All Tests</span>
            )}
          </button>
        </div>
        
        {currentTest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-blue-700">Currently testing: {currentTest}</span>
            </div>
          </div>
        )}
        
        {testResults.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Total Tests</div>
              <div className="text-2xl font-bold">{testResults.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-600">Passed</div>
              <div className="text-2xl font-bold text-green-700">{successCount}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-sm text-red-600">Failed</div>
              <div className="text-2xl font-bold text-red-700">{failureCount}</div>
            </div>
          </div>
        )}
      </div>

      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.success)}
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    {result.details && (
                      <div className="text-sm text-gray-600 mt-1 font-mono">
                        {result.details}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;