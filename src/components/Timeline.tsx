import React, { useRef, useEffect, useState } from 'react';
import { Person, TimelineProps } from '../types';
import { getCategoryColor, getCategoryColorDark } from '../utils/categoryColors';
import './Timeline.css';

interface LifespanBarProps {
  person: Person;
  timeRange: { start: number; end: number };
  totalYears: number;
  pixelsPerYear: number;
  isSelected: boolean;
  onSelect: (person: Person) => void;
  top: number;
}




const LifespanBar: React.FC<LifespanBarProps> = ({
  person,
  timeRange,
  totalYears,
  pixelsPerYear,
  isSelected,
  onSelect,
  top
}) => {
  const getPosition = (year: number) => ((year - timeRange.start) / totalYears) * 100;
  const getWidth = (start: number, end: number) => ((end - start) / totalYears) * 100;

  const hasReign = person.reignStart !== undefined && person.reignEnd !== undefined;
  
  // Получаем достижения
  const achievements = [
    person.achievementYear1,
    person.achievementYear2,
    person.achievementYear3
  ].filter(year => year !== undefined && year !== null);

  return (
    <div
      className={`lifespan-container ${isSelected ? 'selected' : ''} ${hasReign ? 'has-reign' : ''}`}
      style={{ top: `${top}px`, left: `${getPosition(person.birthYear)}%`, width: `${getWidth(person.birthYear, person.deathYear)}%` }}
      onClick={() => onSelect(person)}
    >
        {/* Достижения - отображаем над полоской жизни */}
        {achievements.map((year, index) => (
          <div
            key={index}
            className="achievement-marker"
            style={{
              position: 'absolute',
              top: '-25px',
              left: `${getPosition(year as number)}%`,
              transform: 'translateX(-50%)',
              width: '2px',
              height: '20px',
              backgroundColor: getCategoryColorDark(person.category),
              zIndex: 10
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: getCategoryColorDark(person.category),
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              {year}
            </span>
          </div>
        ))}

        {hasReign && (
            <div className="reign-years">
                <span style={{ color: getCategoryColorDark(person.category) }}>
                    👑 {(person.reignStart as number)} - {person.reignEnd}
                </span>
            </div>
        )}
      <div
        className="lifespan-bar"
        style={{ backgroundColor: getCategoryColor(person.category) }}
      >
        <div className="person-info">
          <span className="person-name">{person.name}</span>
          <span className="person-years">
            {person.birthYear} - {person.deathYear}
          </span>
        </div>
      </div>
      {hasReign && (
        <div
          className="reign-bar"
          style={{
            left: `${getWidth(person.birthYear, person.reignStart as number) / getWidth(person.birthYear, person.deathYear) * 100}%`,
            width: `${getWidth(person.reignStart as number, person.reignEnd as number) / getWidth(person.birthYear, person.deathYear) * 100}%`,
            backgroundColor: getCategoryColorDark(person.category),
            border: `2px solid ${getCategoryColorDark(person.category)}`,
          }}
        ></div>
      )}
    </div>
  );
};


const Timeline: React.FC<TimelineProps> = ({ data, timeRange }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const totalYears = timeRange.end - timeRange.start;
  const pixelsPerYear = 10;

  const getPosition = (year: number) => {
    return ((year - timeRange.start) / totalYears) * 100;
  };

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(selectedPerson?.id === person.id ? null : person);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current) {
      setSelectedPerson(null);
    }
  };
  
  const [personLevels, setPersonLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    const levels: number[][] = [];
    const newPersonLevels: Record<string, number> = {};

    const sortedData = [...data].sort((a, b) => a.birthYear - b.birthYear);

    sortedData.forEach(person => {
      let level = 0;
      while (
        levels[level] &&
        levels[level].some(
          endTime => endTime > person.birthYear
        )
      ) {
        level++;
      }
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(person.deathYear);
      newPersonLevels[person.id] = level;
    });

    setPersonLevels(newPersonLevels);
  }, [data]);


  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Временная линия</h2>
        <div className="timeline-scale">
          <span>{timeRange.start} г.</span>
          <span>{timeRange.end} г.</span>
        </div>
      </div>

      <div
        className="timeline"
        ref={timelineRef}
        onClick={handleTimelineClick}
        style={{
          width: `${totalYears * pixelsPerYear}px`,
          minWidth: '100%'
        }}
      >
        <div className="timeline-markers">
          {Array.from({ length: Math.floor(totalYears / 100) + 1 }, (_, i) => {
            const year = timeRange.start + i * 100;
            if (year <= timeRange.end) {
              return (
                <div
                  key={year}
                  className="timeline-marker"
                  style={{ left: `${getPosition(year)}%` }}
                >
                  <span className="marker-year">{year}</span>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="timeline-lifespans">
          {data.map((person) => (
            personLevels[person.id] !== undefined && (
                <LifespanBar
                key={person.id}
                person={person}
                timeRange={timeRange}
                totalYears={totalYears}
                pixelsPerYear={pixelsPerYear}
                isSelected={selectedPerson?.id === person.id}
                onSelect={handlePersonClick}
                top={personLevels[person.id] * 60 + 20}
                />
            )
          ))}
        </div>
      </div>

      {selectedPerson && (
        <div className="person-details">
          <h3>{selectedPerson.name}</h3>
          <p className="person-description">{selectedPerson.description}</p>
          <div className="person-meta">
            <span className="category">{selectedPerson.category}</span>
            <span className="country">{selectedPerson.country}</span>
          </div>
           {selectedPerson.reignStart && (
             <div style={{ 
               background: `linear-gradient(135deg, ${getCategoryColorDark(selectedPerson.category)}20, ${getCategoryColorDark(selectedPerson.category)}40)`,
               padding: '10px',
               borderRadius: '8px',
               margin: '10px 0',
               border: `2px solid ${getCategoryColorDark(selectedPerson.category)}`
             }}>
               <p style={{ margin: 0, fontWeight: 'bold', color: getCategoryColorDark(selectedPerson.category) }}>
                 👑 Годы правления: {selectedPerson.reignStart} - {selectedPerson.reignEnd}
               </p>
             </div>
           )}
          <div className="achievements">
            <h4>Основные достижения:</h4>
            <ul>
              {selectedPerson.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline; 