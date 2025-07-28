import React, { useState, useEffect } from 'react'
import { Person } from './types'
import { sampleData } from './data/sampleData'
import './App.css'

function App() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [filters, setFilters] = useState({
    categories: [] as string[],
    countries: [] as string[],
    timeRange: { start: -800, end: 2000 }
  })
  const [showFilters, setShowFilters] = useState(false)

  // Получаем уникальные категории и страны
  const allCategories = [...new Set(sampleData.map(p => p.category))]
  const allCountries = [...new Set(sampleData.map(p => p.country))]

  // Функция фильтрации данных
  const filteredData = sampleData.filter(person => {
    // Фильтр по категориям (если выбраны категории)
    if (filters.categories.length > 0 && !filters.categories.includes(person.category)) {
      return false
    }
    
    // Фильтр по странам (если выбраны страны)
    if (filters.countries.length > 0 && !filters.countries.includes(person.country)) {
      return false
    }
    
    // Фильтр по временному диапазону
    if (person.birthYear < filters.timeRange.start || person.deathYear > filters.timeRange.end) {
      return false
    }
    
    return true
  })

  // Отслеживаем скролл
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Вычисляем реальный диапазон лет из отфильтрованных данных
  const minYear = Math.min(...filteredData.map(p => p.birthYear))
  const maxYear = Math.max(...filteredData.map(p => p.deathYear))
  const totalYears = maxYear - minYear

  // Настройки масштаба
  const pixelsPerYear = 3 // 3 пикселя на год
  const timelineWidth = totalYears * pixelsPerYear

  // Функция для вычисления позиции в пикселях
  const getPosition = (year: number) => {
    return ((year - minYear) / totalYears) * timelineWidth
  }

  // Функция для вычисления ширины полоски в пикселях
  const getWidth = (birthYear: number, deathYear: number) => {
    return ((deathYear - birthYear) / totalYears) * timelineWidth
  }

  // Генерируем границы веков
  const generateCenturyBoundaries = () => {
    const boundaries = []
    const startCentury = Math.floor(minYear / 100) * 100
    const endCentury = Math.ceil(maxYear / 100) * 100
    
    for (let year = startCentury; year <= endCentury; year += 100) {
      // Включаем границу, если она попадает в диапазон данных или является границей века
      if (year <= maxYear) {
        boundaries.push(year)
      }
    }
    return boundaries
  }

  const centuryBoundaries = generateCenturyBoundaries()

  // Функция для получения цвета века
  const getCenturyColor = (year: number) => {
    const colors = [
      '#FFE5E5', // Светло-красный
      '#E5F3FF', // Светло-голубой
      '#E5FFE5', // Светло-зеленый
      '#FFF2E5', // Светло-оранжевый
      '#F0E5FF', // Светло-фиолетовый
      '#E5FFFF', // Светло-бирюзовый
      '#FFFFE5', // Светло-желтый
      '#FFE5F0', // Светло-розовый
    ]
    
    const centuryIndex = Math.floor((year - minYear) / 100)
    return colors[centuryIndex % colors.length]
  }

  // Функция для конвертации в римские цифры
  const toRomanNumeral = (num: number): string => {
    const romanNumerals = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ]

    let result = ''
    let remaining = Math.abs(num)

    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral
        remaining -= value
      }
    }

    return num < 0 ? `-${result}` : result
  }

  // Функция для получения номера века
  const getCenturyNumber = (year: number): number => {
    if (year < 0) {
      // Для отрицательных лет: -1 до -100 = 1 век до н.э., -101 до -200 = 2 век до н.э.
      return Math.floor((Math.abs(year) - 1) / 100) + 1
    } else if (year === 0) {
      // Год 0 не существует в исторической хронологии
      return 1
    } else {
      // Для положительных лет: 1-100 = 1 век, 101-200 = 2 век и т.д.
      return Math.floor((year - 1) / 100) + 1
    }
  }

  // Алгоритм размещения полосок на строках
  const calculateRowPlacement = (people: Person[]) => {
    const rows: Person[][] = []
    
    people.forEach(person => {
      let placed = false
      
      // Проверяем каждую существующую строку
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex]
        let canPlaceInRow = true
        
        // Проверяем, не пересекается ли с кем-то в этой строке
        for (const existingPerson of row) {
          if (
            (person.birthYear <= existingPerson.deathYear && person.deathYear >= existingPerson.birthYear) ||
            (existingPerson.birthYear <= person.deathYear && existingPerson.deathYear >= person.birthYear)
          ) {
            canPlaceInRow = false
            break
          }
        }
        
        // Если можно разместить в этой строке
        if (canPlaceInRow) {
          rows[rowIndex].push(person)
          placed = true
          break
        }
      }
      
      // Если не удалось разместить в существующих строках, создаем новую
      if (!placed) {
        rows.push([person])
      }
    })
    
    return rows
  }

  // Получаем размещение по строкам
  const rowPlacement = calculateRowPlacement(filteredData)

  return (
    <div className="app">
      <header 
        className={`app-header ${isScrolled ? 'scrolled' : ''}`}
        style={{
          padding: isScrolled ? '0.5rem 1.5rem' : '1rem 1.5rem',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: isScrolled ? '1.5rem' : '2rem',
              margin: 0,
              transition: 'font-size 0.3s ease'
            }}>
              Chronoline
            </h1>
            {!isScrolled && (
              <p style={{ 
                fontSize: '0.9rem', 
                opacity: 0.8, 
                margin: '0.25rem 0 0 0',
                transition: 'opacity 0.3s ease'
              }}>
                Временные линии исторических личностей
              </p>
            )}
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.5rem 1rem',
                background: showFilters ? '#e74c3c' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
            <div style={{ 
              fontSize: '0.8rem', 
              opacity: 0.7,
              textAlign: 'right',
              minWidth: '200px'
            }}>
              <div>Диапазон: {minYear} - {maxYear} гг.</div>
              <div>Строк: {rowPlacement.length} | Масштаб: {pixelsPerYear}px/год</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Панель фильтров */}
      {showFilters && (
        <div style={{
          background: 'white',
          borderBottom: '1px solid #ddd',
          padding: '1rem 1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Фильтр по категориям */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Категории ({filteredData.length} из {sampleData.length})
              </h4>
              <div style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, categories: allCategories }))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    marginRight: '0.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  Выбрать все
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  Снять все
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allCategories.map(category => (
                  <label key={category} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            categories: [...prev.categories, category]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            categories: prev.categories.filter(c => c !== category)
                          }))
                        }
                      }}
                    />
                    <span style={{ color: getCategoryColor(category), fontWeight: 'bold' }}>
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Фильтр по странам */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Страны
              </h4>
              <div style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, countries: allCountries }))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    marginRight: '0.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  Выбрать все
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, countries: [] }))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  Снять все
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allCountries.map(country => (
                  <label key={country} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(country)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            countries: [...prev.countries, country]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            countries: prev.countries.filter(c => c !== country)
                          }))
                        }
                      }}
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Фильтр по времени */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Временной диапазон
              </h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                    От:
                  </label>
                  <input
                    type="number"
                    value={filters.timeRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, start: parseInt(e.target.value) || -800 }
                    }))}
                    style={{
                      width: '80px',
                      padding: '0.25rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                    До:
                  </label>
                  <input
                    type="number"
                    value={filters.timeRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, end: parseInt(e.target.value) || 2000 }
                    }))}
                    style={{
                      width: '80px',
                      padding: '0.25rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка сброса фильтров */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => setFilters({
                categories: [],
                countries: [],
                timeRange: { start: -800, end: 2000 }
              })}
              style={{
                padding: '0.5rem 1rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Сбросить все фильтры
            </button>
          </div>
        </div>
      )}
      
      <main className="app-main">
        {/* Временная линия на весь экран */}
        <div style={{ 
          position: 'relative', 
          height: showFilters ? 'calc(100vh - 300px)' : 'calc(100vh - 120px)', // Адаптивная высота
          background: '#fafafa',
          overflow: 'auto',
          padding: '1rem 0'
        }}>


          {/* Разноцветная заливка веков */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${rowPlacement.length * 60 + 200}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}>
            {centuryBoundaries.map((year, index) => {
              const nextYear = centuryBoundaries[index + 1] || (year + 100)
              const startPos = getPosition(year)
              const endPos = getPosition(nextYear)
              const width = endPos - startPos
              const centerPos = startPos + width / 2
              // Вычисляем век на основе центра года в столетии
              const centerYear = year + 50
              const centuryNumber = getCenturyNumber(centerYear)
              // Для отрицательных веков добавляем знак минус
              const isNegativeCentury = year < 0
              const romanNumeral = isNegativeCentury ? `-${toRomanNumeral(Math.abs(centuryNumber))}` : toRomanNumeral(centuryNumber)
              
              return (
                <div key={`century-bg-${year}`} style={{
                  position: 'absolute',
                  left: `${startPos}px`,
                  width: `${width}px`,
                  height: '100%',
                  background: getCenturyColor(year),
                  opacity: 0.3,
                  zIndex: 1
                }}>
                  {/* Римская цифра века в центре */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.4)',
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'none',
                    zIndex: 2,
                    fontFamily: 'serif'
                  }}>
                    {romanNumeral}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Границы веков на всю высоту */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${rowPlacement.length * 60 + 200}px`,
            pointerEvents: 'none',
            zIndex: 5
          }}>
            {centuryBoundaries.map((year) => (
              <div key={`century-line-${year}`} style={{
                position: 'absolute',
                left: `${getPosition(year)}px`,
                width: '2px',
                height: '100%',
                background: 'linear-gradient(to bottom, #e74c3c 0%, #e74c3c 20%, rgba(231, 76, 60, 0.3) 100%)',
                zIndex: 5
              }} />
            ))}
          </div>

          {/* Полоски жизни */}
          <div style={{ 
            position: 'relative',
            width: `${timelineWidth}px`,
            height: `${rowPlacement.length * 60 + 60}px`, // Динамическая высота
            zIndex: 10
          }}>
            {rowPlacement.map((row, rowIndex) => (
              <div key={rowIndex} style={{
                position: 'relative',
                height: '60px',
                marginBottom: '10px'
              }}>
                {row.map((person) => (
                  <div
                    key={person.id}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: `${getPosition(person.birthYear)}px`,
                      width: `${getWidth(person.birthYear, person.deathYear)}px`,
                      height: '40px',
                      background: getCategoryColor(person.category),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      minWidth: '60px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'
                      setHoveredPerson(person)
                      setMousePosition({ x: e.clientX, y: e.clientY })
                      setTimeout(() => setShowTooltip(true), 300)
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)'
                      e.currentTarget.style.borderColor = 'transparent'
                      setHoveredPerson(null)
                      setShowTooltip(false)
                    }}
                    onMouseMove={(e) => {
                      setMousePosition({ x: e.clientX, y: e.clientY })
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                      <span>{person.name}</span>
                      <span style={{ fontSize: '11px', opacity: 0.9 }}>
                        {person.birthYear} - {person.deathYear}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>


              </main>

        {/* Всплывающее окно с информацией */}
        {hoveredPerson && showTooltip && (
          <div style={{
            position: 'fixed',
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 10}px`,
            background: 'white',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxWidth: '300px',
            minWidth: '250px',
            border: `2px solid ${getCategoryColor(hoveredPerson.category)}`,
            pointerEvents: 'none',
            opacity: 0,
            transform: 'translateY(10px)',
            animation: 'tooltipFadeIn 0.2s ease-out forwards'
          }}>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              color: getCategoryColor(hoveredPerson.category),
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              {hoveredPerson.name}
            </h3>
            
            <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>
                {hoveredPerson.birthYear} - {hoveredPerson.deathYear}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                <span style={{ color: getCategoryColor(hoveredPerson.category), fontWeight: 'bold' }}>
                  {hoveredPerson.category}
                </span> • {hoveredPerson.country}
              </p>
              <p style={{ margin: '0.5rem 0', fontStyle: 'italic', opacity: 0.8 }}>
                {hoveredPerson.description}
              </p>
              
              <div style={{ marginTop: '0.75rem' }}>
                <strong style={{ fontSize: '0.8rem' }}>Основные достижения:</strong>
                <ul style={{ 
                  margin: '0.25rem 0 0 0', 
                  paddingLeft: '1rem',
                  fontSize: '0.8rem'
                }}>
                  {hoveredPerson.achievements.slice(0, 3).map((achievement, index) => (
                    <li key={index} style={{ marginBottom: '0.1rem' }}>
                      {achievement}
                    </li>
                  ))}
                  {hoveredPerson.achievements.length > 3 && (
                    <li style={{ fontStyle: 'italic', opacity: 0.7 }}>
                      и еще {hoveredPerson.achievements.length - 3}...
                    </li>
                  )}
                </ul>
              </div>
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

export default App 