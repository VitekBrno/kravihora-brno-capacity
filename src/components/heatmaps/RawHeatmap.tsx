import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolData } from '@/utils/processData';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';

interface RawHeatmapProps {
  selectedWeekId: string;
}

const getColorForOccupancy = (range: { min: number; max: number }): string => {
  if (range.max === 0) return 'bg-gray-100';
  if (range.max < 25) return 'bg-green-100';
  if (range.max < 33) return 'bg-green-300';
  if (range.max < 42) return 'bg-yellow-300';
  if (range.max < 52) return 'bg-orange-400';
  return 'bg-red-500';
};

const RawHeatmap: React.FC<RawHeatmapProps> = ({ selectedWeekId }) => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { hourlySummary, loading, error } = usePoolData(selectedWeekId);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  // Create a map for quick lookup of average occupancy
  const occupancyMap: Record<string, Record<number, { min: number; max: number }>> = {};
  
  // Initialize with empty data
  DAYS.forEach(day => {
    occupancyMap[day] = {};
    HOURS.forEach(hour => {
      occupancyMap[day][hour] = { min: 0, max: 0 };
    });
  });
  
  // Fill in the data we have
  hourlySummary.forEach(item => {
    if (occupancyMap[item.day] && HOURS.includes(item.hour)) {
      occupancyMap[item.day][item.hour] = {
        min: item.minOccupancy,
        max: item.maxOccupancy
      };
    }
  });
  
  const getCellData = (day: string, hour: number) => {
    const range = occupancyMap[day][hour];
    const displayText = range.min === range.max ? 
      (range.min > 0 ? `${range.min}` : '') : 
      `${range.min}-${range.max}`;
    
    return {
      color: getColorForOccupancy(range),
      displayText,
      title: t('heatmaps:raw.tooltip', {
        day: t(`common:days.${day.toLowerCase()}`),
        hour,
        min: range.min,
        max: range.max
      })
    };
  };

  const LEGEND_ITEMS = [
    { color: 'bg-gray-100 border border-gray-300', label: t('heatmaps:raw.legend.labels.empty') },
    { color: 'bg-green-100', label: t('heatmaps:raw.legend.labels.veryLow') },
    { color: 'bg-green-300', label: t('heatmaps:raw.legend.labels.low') },
    { color: 'bg-yellow-300', label: t('heatmaps:raw.legend.labels.medium') },
    { color: 'bg-orange-400', label: t('heatmaps:raw.legend.labels.high') },
    { color: 'bg-red-500', label: t('heatmaps:raw.legend.labels.veryHigh') }
  ];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t('heatmaps:raw.title')}</h2>
      
      <HeatmapGrid
        days={DAYS}
        hours={HOURS}
        getCellData={getCellData}
      />
      
      <HeatmapLegend
        title={t('heatmaps:raw.legend.title')}
        items={LEGEND_ITEMS}
      />
    </div>
  );
};

export default RawHeatmap;