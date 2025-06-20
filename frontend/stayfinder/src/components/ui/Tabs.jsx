import { useState } from 'react';

export default function Tabs({ tabs, onTabChange, activeTab: propActiveTab }) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  
  // Use prop activeTab if provided, otherwise use internal state
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;

  const handleTabChange = (tabId) => {
    if (propActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange(tabId);
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}