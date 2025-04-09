import React from 'react';
import { useTranslation } from 'react-i18next';

interface CellData {
  color: string;
  displayText: string;
  title: string;
  extraRow?: {
    text: string;
    fillRatio: number;
  };
}

interface HeatmapGridProps {
  days: string[];
  hours: number[];
  getCellData: (day: string, hour: number) => CellData;
  hasExtraRow?: boolean;
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ days, hours, getCellData, hasExtraRow = false }) => {
  const { t } = useTranslation('common');
  
  const subtitles = [
    t('heatmaps:todayTomorrow.daySubtitle.occupancy'),
    t('heatmaps:todayTomorrow.daySubtitle.lanes')
  ];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Hours header row */}
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          {hours.map(hour => (
            <div key={hour} className="w-12 text-center text-xs font-medium text-gray-600">
              {hour}:00
            </div>
          ))}
          {hasExtraRow && <div className="w-48 flex-shrink-0" />}
        </div>
        
        {/* Days rows */}
        {days.map((day) => (
          <div key={day} className={`flex`}>
            <div className="w-24 py-2 flex-shrink-0 font-medium text-gray-700">
              {t(`days.${day.toLowerCase()}`)}
            </div>
            {hours.map(hour => {
              const { color, displayText, title, extraRow } = getCellData(day, hour);
              return (
                <div key={`${day}-${hour}`} className="w-12 mb-8">
                  <div
                    className={`h-12 border border-gray-200 ${color} hover:opacity-80 transition-opacity flex items-center justify-center`}
                    title={title}
                  >
                    <span className="text-xs font-medium text-gray-700">{displayText}</span>
                  </div>
                  {extraRow && (
                    <div className="h-12 border border-gray-200 relative flex items-center justify-center mb-4">
                      <div 
                        className="absolute bottom-0 bg-blue-400"
                        style={{ 
                          height: `${extraRow.fillRatio * 100}%`,
                          width: '100%'
                        }}
                      />
                      <span className="text-xs font-medium text-gray-700 z-10">{extraRow.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {hasExtraRow && (
              <div className="w-48 flex-shrink-0 font-normal text-gray-500 pl-4">
                <div className="h-12 flex items-center">{subtitles[0]}</div>
                <div className="h-12 flex items-center">{subtitles[1]}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapGrid;