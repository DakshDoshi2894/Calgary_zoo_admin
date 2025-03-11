'use client';
import { useState, useEffect } from 'react';
import Image from "next/image";
import { db } from '../firebase';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [activeTab, setActiveTab] = useState('checked-out');
  const [checkedOutItems, setCheckedOutItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Current time for comparisons
  const currentTime = new Date().toISOString();

  // Helper to format dates
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  // Fetch data from Firestore
  useEffect(() => {
    setLoading(true);
    
    // Create a real-time listener for checked out items
    const q = query(collection(db, "inventory"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      setCheckedOutItems(items);
      
      // Filter for overdue items
      const overdue = items.filter(item => item.dueTime < currentTime);
      setOverdueItems(overdue);
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory items:", error);
      setLoading(false);
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calgary Zoo Inventory Management
          </h1>
          <div className="flex items-center">
            <Image
              src="/vercel.svg"
              alt="Calgary Zoo"
              width={32}
              height={32}
              className="mr-2 dark:invert"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Admin Panel</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('checked-out')}
                  className={`${
                    activeTab === 'checked-out'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Checked Out Items ({checkedOutItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`${
                    activeTab === 'overdue'
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overdue Items ({overdueItems.length})
                </button>
              </nav>
            </div>

            {/* Item Table */}
            {((activeTab === 'checked-out' && checkedOutItems.length > 0) || 
              (activeTab === 'overdue' && overdueItems.length > 0)) && (
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Item Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Checked Out By
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Department
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Checked Out Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Due Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {(activeTab === 'checked-out' ? checkedOutItems : overdueItems).map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {item.checkedOutBy}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {item.department}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {formatDateTime(item.timestamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {formatDateTime(item.dueTime)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.dueTime < currentTime ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Overdue
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Active
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for no items */}
            {(activeTab === 'checked-out' && checkedOutItems.length === 0) || 
             (activeTab === 'overdue' && overdueItems.length === 0) ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === 'checked-out' ? 'No items are currently checked out.' : 'No items are currently overdue.'}
                </p>
              </div>
            ) : null}
          </>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 Calgary Zoo
          </p>
        </div>
      </footer>
    </div>
  );
}