import { useState } from 'react';
import { FileBarChart, Users, DollarSign, Calendar } from 'lucide-react';
import { Card } from '../../components/ui';
import { AttendanceReports } from './tabs/AttendanceReports';
import { SalaryReports } from './tabs/SalaryReports';
import { EmployeeReports } from './tabs/EmployeeReports';

type TabType = 'attendance' | 'salary' | 'employee';

export function UnifiedReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');

  const tabs = [
    { id: 'attendance' as TabType, label: 'Attendance Reports', icon: Calendar },
    { id: 'salary' as TabType, label: 'Salary Reports', icon: DollarSign },
    { id: 'employee' as TabType, label: 'Employee Reports', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileBarChart className="h-7 w-7 text-primary-600" />
          Reports Center
        </h1>
        <p className="text-gray-600 mt-1">
          View and print attendance, salary, and employee reports
        </p>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      isActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'attendance' && <AttendanceReports />}
          {activeTab === 'salary' && <SalaryReports />}
          {activeTab === 'employee' && <EmployeeReports />}
        </div>
      </Card>
    </div>
  );
}
