import React, { useState } from 'react';

interface TimeFilterProps {
  onFilterChange: (filters: { days: string[]; time: string }[]) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<{ days: string[]; time: string }[]>([
    { days: [], time: 'anytime' }
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const handleDayToggle = (filterIndex: number, day: string) => {
    setFilters(prev => {
      const newFilters = [...prev];
      const currentDays = newFilters[filterIndex].days;
      if (currentDays.includes(day)) {
        newFilters[filterIndex].days = currentDays.filter(d => d !== day);
      } else {
        newFilters[filterIndex].days = [...currentDays, day];
      }
      return newFilters;
    });
  };

  const handleTimeChange = (filterIndex: number, time: string) => {
    setFilters(prev => {
      const newFilters = [...prev];
      newFilters[filterIndex].time = time;
      return newFilters;
    });
  };

  const handleAddFilter = () => {
    setFilters(prev => [...prev, { days: [], time: 'anytime' }]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters([{ days: [], time: 'anytime' }]);
    onFilterChange([{ days: [], time: 'anytime' }]);
  };

  return (
    <div className="time-filter">
      <button 
        className="filter-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filter-icon">⏰</span>
        Filter by Time
        {filters.some(f => f.days.length > 0) && (
          <span className="filter-badge">{filters.reduce((acc, f) => acc + f.days.length, 0)}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          {filters.map((filter, index) => (
            <div key={index} className="filter-table">
              <div className="filter-header">
                <h4>Time Filter {index + 1}</h4>
                {index > 0 && (
                  <button 
                    className="remove-filter-btn"
                    onClick={() => handleRemoveFilter(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="filter-section">
                <h5>Days</h5>
                <div className="day-buttons">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      className={`day-button ${filter.days.includes(day) ? 'selected' : ''}`}
                      onClick={() => handleDayToggle(index, day)}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h5>Time of Day</h5>
                <div className="time-buttons">
                  {['morning', 'afternoon', 'evening', 'anytime'].map(time => (
                    <button
                      key={time}
                      className={`time-button ${filter.time === time ? 'selected' : ''}`}
                      onClick={() => handleTimeChange(index, time)}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="filter-actions">
            <button className="add-filter-btn" onClick={handleAddFilter}>
              Add Another Time Filter
            </button>
            <div className="filter-buttons">
              <button className="clear-button" onClick={handleClear}>
                Clear All
              </button>
              <button className="apply-button" onClick={handleApply}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeFilter; 