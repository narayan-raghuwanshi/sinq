// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Annotator {
  id: number;
  name: string;
  start_time: string | null;
}

interface AnnotatorWithTimer extends Annotator {
  remainingTime: string;
  status: 'available' | 'on_time' | 'late';
}

export default function AnnotatorTimer() {
  const [annotators, setAnnotators] = useState<AnnotatorWithTimer[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch annotators on component mount
  // Replace the useEffect hook at the top of your component
  useEffect(() => {
    fetchAnnotators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnotators(prev => prev.map(updateAnnotatorTimer));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnnotators = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/annotators');
      const data: Annotator[] = await response.json();
      setAnnotators(data.map(updateAnnotatorTimer));
      setError('');
    } catch (err) {
      setError('Failed to fetch annotators');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateAnnotatorTimer = (annotator: Annotator): AnnotatorWithTimer => {
    if (!annotator.start_time) {
      return {
        ...annotator,
        remainingTime: '',
        status: 'available'
      };
    }

    const startTime = new Date(annotator.start_time);
    const now = new Date();
    const elapsed = now.getTime() - startTime.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const remainingMs = twentyFourHours - elapsed;

    if (remainingMs <= 0) {
      return {
        ...annotator,
        remainingTime: '00:00:00',
        status: 'late'
      };
    }

    // Calculate remaining time
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return {
      ...annotator,
      remainingTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      status: elapsed < twentyFourHours ? 'on_time' : 'late'
    };
  };

  const addAnnotator = async () => {
    if (!newName.trim()) return;

    try {
      const response = await fetch('/api/annotators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        setNewName('');
        fetchAnnotators();
      } else {
        throw new Error('Failed to add annotator');
      }
    } catch (err) {
      setError('Failed to add annotator');
      console.error(err);
    }
  };

  const deleteAnnotator = async (id: number) => {
    try {
      const response = await fetch(`/api/annotators?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAnnotators();
      } else {
        throw new Error('Failed to delete annotator');
      }
    } catch (err) {
      setError('Failed to delete annotator');
      console.error(err);
    }
  };

  const startTimer = async (id: number) => {
    try {
      const response = await fetch(`/api/annotators/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        fetchAnnotators();
      } else {
        throw new Error('Failed to start timer');
      }
    } catch (err) {
      setError('Failed to start timer');
      console.error(err);
    }
  };

  const resetTimer = async (id: number) => {
    try {
      const response = await fetch(`/api/annotators/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        fetchAnnotators();
      } else {
        throw new Error('Failed to reset timer');
      }
    } catch (err) {
      setError('Failed to reset timer');
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'on_time': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-medium text-gray-700">Loading annotators...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Annotation Tracker</h1>
          <p className="text-gray-600">Manage annotators and track their deadlines</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Annotator Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Annotator</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter annotator name"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addAnnotator}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Annotators List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Annotators</h2>
          </div>

          {annotators.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No annotators found</div>
              <div className="text-gray-400 text-sm">Add an annotator to get started</div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {annotators.map((annotator) => (
                <li key={annotator.id} className="px-6 py-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div>
                        <h3 className="font-medium text-gray-900">{annotator.name}</h3>
                        <div className="mt-1 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(annotator.status)}`}>
                            {annotator.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {annotator.status === 'available' ? (
                        <button
                          onClick={() => startTimer(annotator.id)}
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 whitespace-nowrap"
                        >
                          Start Timer
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-gray-700 font-medium">Time Remaining:</span>
                            <span className={`text-xl font-mono font-bold ${annotator.status === 'late' ? 'text-red-600' : 'text-green-600'}`}>
                              {annotator.remainingTime}
                            </span>
                          </div>

                          <button
                            onClick={() => resetTimer(annotator.id)}
                            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 whitespace-nowrap"
                          >
                            Reset Timer
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => deleteAnnotator(annotator.id)}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Available - Timer not started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">On Time - Within 24h deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Late - Deadline passed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Reset Timer - Stop and clear timer</span>
          </div>
        </div>
      </div>
    </div>
  );
}