import React from 'react';

interface ServiceSidebarProps {
  trackingCode: string | null;
  userData?: any | null;
}

const ServiceSidebar: React.FC<ServiceSidebarProps> = ({ trackingCode, userData }) => {
  return (
    <div className="w-80 bg-gray-50 h-screen p-6 border-r border-gray-200 flex flex-col text-gray-800">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Service Dashboard</h2>
      </div>
      <div className="space-y-3 mb-10">
        <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600">
          <span>New Booking</span>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Service History</h3>
        <p className="text-xs text-gray-400 italic">Loading...</p>
      </div>
    </div>
  );
};

export default ServiceSidebar;