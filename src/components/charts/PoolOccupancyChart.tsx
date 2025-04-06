import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePoolData, HourlyOccupancySummary } from '@/utils/processData';
import DaySelector from '@/components/ui/DaySelector';
import { getValidHours } from '@/constants/time';

interface PoolOccupancyChartProps {
  selectedWeekId: string;
}

const PoolOccupancyChart: React.FC<PoolOccupancyChartProps> = ({ selectedWeekId }) => {
  const { t } = useTranslation(['charts', 'common']);
  const { hourlySummary, loading, error } = usePoolData(selectedWeekId);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const validHours = getValidHours(selectedDay);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  // Create a map of all hours with their data
  const hourlyData: HourlyOccupancySummary[] = validHours.map(hour => {
    const data = hourlySummary.find(item => item.day === selectedDay && item.hour === hour);
    return data || {
      day: selectedDay,
      hour,
      minOccupancy: 0,
      maxOccupancy: 0,
      averageOccupancy: 0,
      maximumOccupancy: 0,
      utilizationRate: 0,
      remainingCapacity: 0,
      date: new Date()
    };
  });
  
  // Find the maximum value for scaling the bars
  const maxValue = Math.max(...hourlyData.map(item => Math.max(item.averageOccupancy, item.maximumOccupancy)));

  // Format data for Recharts
  const chartData = hourlyData.map(item => ({
    hour: `${item.hour}:00`,
    average: item.averageOccupancy,
    maximum: item.maximumOccupancy
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('charts:title')}</h2>
      
      {/* Day selector */}
      <DaySelector
        selectedDay={selectedDay}
        onChange={setSelectedDay}
      />
      
      {/* Chart */}
      <div className="mt-8 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              label={{ value: t('charts:axis.hour'), position: 'bottom', offset: -8 }}
            />
            <YAxis 
              label={{ value: t('charts:axis.occupancy'), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="maximum" name={t('charts:legend.maximum')} fill="#9CA3AF" />
            <Bar dataKey="average" name={t('charts:legend.average')} fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary statistics */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hourlyData.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">{item.hour}:00</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm">{t('charts:stats.averageOccupancy')}: <span className="font-medium">{item.averageOccupancy}</span></p>
              <p className="text-sm">{t('charts:stats.maximumOccupancy')}: <span className="font-medium">{item.maximumOccupancy}</span></p>
              <p className="text-sm">{t('charts:stats.utilizationRate')}: <span className="font-medium">{item.utilizationRate}%</span></p>
              <p className="text-sm">{t('charts:stats.availableSpots')}: <span className="font-medium">{item.remainingCapacity}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolOccupancyChart;