'use client';

import { useState } from 'react';

interface Suggestion {
  text: string;
  provider: string;
}

export default function EmailComposer() {
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<'groq' | 'mistral' | 'qwen'>('groq');

  const generateSuggestions = async () => {
    if (!subject && !emailBody) {
      setError('Please enter at least a subject or email content');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          emailBody,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      const suggestionsList = data.suggestions.map((text: string) => ({
        text,
        provider: data.provider,
      }));

      setSuggestions(suggestionsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestionText: string) => {
    setEmailBody(suggestionText);
    setSuggestions([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Email Composer with AI Suggestions
        </h1>

        {/* Provider Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as typeof provider)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="groq">Groq (Llama 3.3) - FREE</option>
            <option value="mistral">Mistral AI - FREE</option>
            <option value="qwen">Qwen 3 (30B) - FREE</option>
          </select>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Email Body */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Body
          </label>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Type your email or get AI suggestions..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateSuggestions}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {loading ? 'Generating...' : 'Get AI Suggestions'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Suggestions Panel */}
      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            AI Suggestions
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              (Powered by {suggestions[0]?.provider})
            </span>
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                onClick={() => applySuggestion(suggestion.text)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Suggestion {index + 1}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {suggestion.text}
                    </p>
                  </div>
                  <button className="ml-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}