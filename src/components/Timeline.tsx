import React, { useRef, useEffect, useState } from 'react'
import { Person, TimelineProps } from '../types'
import './Timeline.css'

const Timeline: React.FC<TimelineProps> = ({ data, timeRange }) => {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const totalYears = timeRange.end - timeRange.start
  const pixelsPerYear = 10 // 10 пикселей на год

  const getPosition = (year: number) => {
    return ((year - timeRange.start) / totalYears) * 100
  }

  const getWidth = (birthYear: number, deathYear: number) => {
    return ((deathYear - birthYear) / totalYears) * 100
  }

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(selectedPerson?.id === person.id ? null : person)
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current) {
      setSelectedPerson(null)
    }
  }

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
        {/* Временные метки */}
        <div className="timeline-markers">
          {Array.from({ length: Math.floor(totalYears / 100) + 1 }, (_, i) => {
            const year = timeRange.start + i * 100
            if (year <= timeRange.end) {
              return (
                <div 
                  key={year}
                  className="timeline-marker"
                  style={{ left: `${getPosition(year)}%` }}
                >
                  <span className="marker-year">{year}</span>
                </div>
              )
            }
            return null
          })}
        </div>

        {/* Полоски жизни */}
        <div className="timeline-lifespans">
          {data.map((person, index) => (
            <div
              key={person.id}
              className={`lifespan-bar ${selectedPerson?.id === person.id ? 'selected' : ''}`}
              style={{
                top: `${index * 60 + 20}px`,
                left: `${getPosition(person.birthYear)}%`,
                width: `${getWidth(person.birthYear, person.deathYear)}%`,
                backgroundColor: getCategoryColor(person.category)
              }}
              onClick={() => handlePersonClick(person)}
            >
              <div className="person-info">
                <span className="person-name">{person.name}</span>
                <span className="person-years">
                  {person.birthYear} - {person.deathYear}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Панель с детальной информацией */}
      {selectedPerson && (
        <div className="person-details">
          <h3>{selectedPerson.name}</h3>
          <p className="person-description">{selectedPerson.description}</p>
          <div className="person-meta">
            <span className="category">{selectedPerson.category}</span>
            <span className="country">{selectedPerson.country}</span>
          </div>
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
  )
}

// Функция для определения цвета по категории
const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Философ': '#FF6B6B',
    'Художник': '#4ECDC4',
    'Писатель': '#45B7D1',
    'Поэт': '#96CEB4',
    'Ученый': '#FFEAA7',
    'Композитор': '#DDA0DD',
    'Политик': '#98D8C8',
    'Изобретатель': '#F7DC6F'
  }
  return colors[category] || '#95A5A6'
}

export default Timeline 