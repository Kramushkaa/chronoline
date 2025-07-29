import React, { useState, useEffect } from 'react'
import { Person } from './types'
import { sampleData } from './data/sampleData'
import './App.css'

// Компонент выпадающего фильтра
const FilterDropdown = ({ 
  title, 
  items, 
  selectedItems, 
  onSelectionChange, 
  getItemColor,
  icon
}: {
  title: string
  items: string[]
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
  getItemColor?: (item: string) => string
  icon?: React.ReactNode
}) => {
  const isActive = selectedItems.length > 0
  
  return (
    <div className="filter-dropdown">
      <button 
        className={`filter-btn ${isActive ? 'active' : ''}`}
        style={{ minWidth: '150px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {icon}
        {title} {isActive && `(${selectedItems.length})`}
      </button>
      <div className="filter-dropdown-content">
        <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(139, 69, 19, 0.3)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange(items)
            }}
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
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange([])
            }}
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
        {items.map(item => (
          <label key={item} className="filter-checkbox" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={(e) => {
                e.stopPropagation()
                if (e.target.checked) {
                  onSelectionChange([...selectedItems, item])
                } else {
                  onSelectionChange(selectedItems.filter(i => i !== item))
                }
              }}
            />
            <span style={{ 
              color: getItemColor ? getItemColor(item) : '#f4e4c1',
              fontWeight: getItemColor ? 'bold' : 'normal'
            }}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Компонент панели фильтров
const FilterPanel = ({ 
  filters, 
  setFilters, 
  allCategories, 
  allCountries 
}: {
  filters: {
    categories: string[]
    countries: string[]
    timeRange: { start: number; end: number }
  }
  setFilters: React.Dispatch<React.SetStateAction<{
    categories: string[]
    countries: string[]
    timeRange: { start: number; end: number }
  }>>
  allCategories: string[]
  allCountries: string[]
}) => {
  // Состояние для полей ввода годов
  const [yearInputs, setYearInputs] = useState({
    start: filters.timeRange.start.toString(),
    end: filters.timeRange.end.toString()
  })

  // Функция для применения фильтра по году
  const applyYearFilter = (field: 'start' | 'end', value: string) => {
    const numValue = parseInt(value) || (field === 'start' ? -800 : 2000)
    setFilters(prev => ({
      ...prev,
      timeRange: { ...prev.timeRange, [field]: numValue }
    }))
  }

  // Функция для обработки нажатия Enter
  const handleYearKeyPress = (field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyYearFilter(field, e.currentTarget.value)
      // Переводим фокус на следующий элемент
      const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll('input')
      if (inputs) {
        const currentIndex = Array.from(inputs).indexOf(e.currentTarget)
        const nextInput = inputs[currentIndex + 1] as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      }
    }
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

  // Функция для сброса всех фильтров
  const resetAllFilters = () => {
    setFilters({
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 }
    })
    setYearInputs({
      start: '-800',
      end: '2000'
    })
  }

  return (
    <div className="filters-panel" style={{
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginLeft: 'auto',
      zIndex: 10001
    }}>
      <FilterDropdown
        title="Род деятельности"
        items={allCategories}
        selectedItems={filters.categories}
        onSelectionChange={(categories) => setFilters(prev => ({ ...prev, categories }))}
        getItemColor={getCategoryColor}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        }
      />
      <FilterDropdown
        title="Страна происхождения"
        items={allCountries}
        selectedItems={filters.countries}
        onSelectionChange={(countries) => setFilters(prev => ({ ...prev, countries }))}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        }
      />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', color: '#f4e4c1' }}>
            От:
          </label>
          <input
            type="number"
            value={yearInputs.start}
            onChange={(e) => setYearInputs(prev => ({ ...prev, start: e.target.value }))}
            onBlur={(e) => applyYearFilter('start', e.target.value)}
            onKeyPress={(e) => handleYearKeyPress('start', e)}
            style={{
              width: '80px',
              padding: '0.5rem',
              border: '2px solid #8b4513',
              borderRadius: '4px',
              background: 'rgba(44, 24, 16, 0.8)',
              color: '#f4e4c1',
              fontSize: '0.8rem'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', color: '#f4e4c1' }}>
            До:
          </label>
          <input
            type="number"
            value={yearInputs.end}
            onChange={(e) => setYearInputs(prev => ({ ...prev, end: e.target.value }))}
            onBlur={(e) => applyYearFilter('end', e.target.value)}
            onKeyPress={(e) => handleYearKeyPress('end', e)}
            style={{
              width: '80px',
              padding: '0.5rem',
              border: '2px solid #8b4513',
              borderRadius: '4px',
              background: 'rgba(44, 24, 16, 0.8)',
              color: '#f4e4c1',
              fontSize: '0.8rem'
            }}
          />
        </div>
        <button
          onClick={resetAllFilters}
          className="filter-btn"
          style={{ background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          Сбросить
        </button>
      </div>
    </div>
  )
}

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

  // Получаем уникальные категории и страны
  const allCategories = [...new Set(sampleData.map(p => p.category))]
  const allCountries = [...new Set(sampleData.map(p => p.country))]

  // Порядок категорий для группировки
  const categoryOrder = [
    'Философ',
    'Ученый', 
    'Писатель',
    'Поэт',
    'Художник',
    'Композитор',
    'Политик',
    'Архитектор'
  ]

  // Функция для получения приоритета категории
  const getCategoryPriority = (category: string) => {
    return categoryOrder.indexOf(category)
  }

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
    
    // Фильтр по временному диапазону - человек попадает, если хотя бы 1 год жизни попадает в период
    const personLifespan = person.deathYear - person.birthYear + 1
    const hasOverlap = person.birthYear <= filters.timeRange.end && person.deathYear >= filters.timeRange.start
    if (!hasOverlap) {
      return false
    }
    
    return true
  }).sort((a, b) => {
    // Сначала сортируем по категориям
    const categoryDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category)
    if (categoryDiff !== 0) {
      return categoryDiff
    }
    // Затем по году рождения
    return a.birthYear - b.birthYear
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
      'rgba(255, 107, 107, 0.1)', // Светло-красный
      'rgba(78, 205, 196, 0.1)', // Светло-голубой
      'rgba(150, 206, 180, 0.1)', // Светло-зеленый
      'rgba(255, 234, 167, 0.1)', // Светло-оранжевый
      'rgba(221, 160, 221, 0.1)', // Светло-фиолетовый
      'rgba(120, 219, 255, 0.1)', // Светло-бирюзовый
      'rgba(255, 255, 229, 0.1)', // Светло-желтый
      'rgba(255, 229, 240, 0.1)', // Светло-розовый
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

  // Алгоритм размещения полосок на строках с полной группировкой по категориям
  const calculateRowPlacement = (people: Person[]) => {
    const rows: Person[][] = []
    const categoryGroups: { [key: string]: Person[] } = {}
    
    // Группируем людей по категориям
    people.forEach(person => {
      if (!categoryGroups[person.category]) {
        categoryGroups[person.category] = []
      }
      categoryGroups[person.category].push(person)
    })
    
    // Обрабатываем каждую категорию в заданном порядке
    categoryOrder.forEach(category => {
      if (categoryGroups[category]) {
        const categoryPeople = categoryGroups[category]
        const categoryRows: Person[][] = []
        
        // Размещаем людей данной категории в отдельные строки
        categoryPeople.forEach(person => {
          let placed = false
          
          // Проверяем каждую существующую строку для этой категории
          for (let rowIndex = 0; rowIndex < categoryRows.length; rowIndex++) {
            const row = categoryRows[rowIndex]
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
              categoryRows[rowIndex].push(person)
              placed = true
              break
            }
          }
          
          // Если не удалось разместить в существующих строках, создаем новую
          if (!placed) {
            categoryRows.push([person])
          }
        })
        
        // Добавляем строки данной категории к общему списку
        rows.push(...categoryRows)
        
        // Добавляем пустую строку для визуального разделения (кроме последней категории)
        if (category !== categoryOrder[categoryOrder.length - 1]) {
          rows.push([])
        }
      }
    })
    
    return rows
  }

  // Получаем размещение по строкам
  const rowPlacement = calculateRowPlacement(filteredData)

  // Вычисляем общую высоту с учетом пустых строк
  const totalHeight = rowPlacement.reduce((height, row) => {
    return height + (row.length === 0 ? 20 : 70) // 20px для пустых строк, 70px для обычных (60px + 10px margin)
  }, 0)

  // Функция для создания разделителей категорий
  const createCategoryDividers = () => {
    const dividers: { category: string; rowIndex: number }[] = []
    let currentCategory = ''
    let currentRowIndex = 0
    
    rowPlacement.forEach((row, rowIndex) => {
      if (row.length > 0) {
        const firstPersonInRow = row[0]
        if (firstPersonInRow.category !== currentCategory) {
          if (currentCategory !== '') {
            dividers.push({ category: currentCategory, rowIndex: currentRowIndex })
          }
          currentCategory = firstPersonInRow.category
          currentRowIndex = rowIndex
        }
      }
    })
    
    // Добавляем последнюю категорию
    if (currentCategory !== '') {
      dividers.push({ category: currentCategory, rowIndex: currentRowIndex })
    }
    
    return dividers
  }

  const categoryDividers = createCategoryDividers()

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

  // Функция для определения темного цвета по категории
  const getCategoryColorDark = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Философ': '#e55a5a',
      'Художник': '#3db8b0',
      'Писатель': '#3ba3bd',
      'Поэт': '#82baa0',
      'Ученый': '#e6d395',
      'Композитор': '#c78cc7',
      'Политик': '#84c4b4',
      'Изобретатель': '#e5c65d'
    }
    return colors[category] || '#7f8c8d'
  }

  // Функция для определения приглушённого цвета по категории
  const getCategoryMutedColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Философ': '#b97a6b',
      'Художник': '#6b9b97',
      'Писатель': '#7a8bb9',
      'Поэт': '#7a9b7a',
      'Ученый': '#b9b17a',
      'Композитор': '#a17ab9',
      'Политик': '#7ab9b1',
      'Изобретатель': '#b9a97a',
      'Архитектор': '#b9a27a'
    }
    return colors[category] || '#a8926a'
  }

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
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative'
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

          {/* Фильтры прямо в шапке */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            allCategories={allCategories}
            allCountries={allCountries}
          />
        </div>
      </header>
      
      <main className="app-main">
        {/* Временная линия на весь экран */}
        <div className="timeline-container" style={{ 
          position: 'relative', 
          height: 'calc(100vh - 140px)',
          overflow: 'auto',
          padding: '1rem 0 2rem 0'
        }}>

          {/* Разноцветная заливка веков */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 200}px`,
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
                  <div className="century-label" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'rgba(244, 228, 193, 0.6)',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
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
            height: `${totalHeight + 200}px`,
            pointerEvents: 'none',
            zIndex: 5
          }}>
            {centuryBoundaries.map((year) => (
              <div key={`century-line-${year}`} style={{
                position: 'absolute',
                left: `${getPosition(year)}px`,
                width: '2px',
                height: '100%',
                background: 'linear-gradient(to bottom, #cd853f 0%, #cd853f 20%, rgba(205, 133, 63, 0.3) 100%)',
                zIndex: 5
              }} />
            ))}
          </div>

          {/* Разделители категорий */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 200}px`,
            pointerEvents: 'none',
            zIndex: 8
          }}>
            {categoryDividers.map((divider, index) => (
              <div key={`category-divider-${divider.category}`} style={{
                position: 'absolute',
                top: `${divider.rowIndex * 60 - 5}px`,
                left: '0',
                width: '100%',
                height: '10px',
                background: `linear-gradient(to right, transparent 0%, ${getCategoryColor(divider.category)} 20%, ${getCategoryColor(divider.category)} 80%, transparent 100%)`,
                opacity: 0.6,
                zIndex: 8
              }}>
                <div className="category-label" style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: getCategoryColor(divider.category),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  zIndex: 9
                }}>
                  {divider.category}
                </div>
              </div>
            ))}
          </div>

          {/* Полоски жизни */}
          <div style={{ 
            position: 'relative',
            width: `${timelineWidth}px`,
            height: `${totalHeight + 60}px`,
            zIndex: 10
          }}>
            {rowPlacement.map((row, rowIndex) => (
              <div key={rowIndex} style={{
                position: 'relative',
                height: row.length === 0 ? '20px' : '60px',
                marginBottom: row.length === 0 ? '0px' : '10px'
              }}>
                {row.map((person) => (
                  <React.Fragment key={person.id}>
                    {/* Годы жизни над полоской */}
                        <span style={{
      position: 'absolute',
      left: `${getPosition(person.birthYear)}px`,
      top: 0,
      fontSize: '11px',
      color: 'rgba(244, 228, 193, 0.6)',
      fontStyle: 'italic',
      fontWeight: 400,
      transform: 'translateY(-12px)'
    }}>{person.birthYear}</span>
    <span style={{
      position: 'absolute',
      left: `${getPosition(person.birthYear) + getWidth(person.birthYear, person.deathYear)}px`,
      top: 0,
      fontSize: '11px',
      color: 'rgba(244, 228, 193, 0.6)',
      fontStyle: 'italic',
      fontWeight: 400,
      transform: 'translate(-100%, -12px)'
    }}>{person.deathYear}</span>
                    <div
                      className="life-bar"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: `${getPosition(person.birthYear)}px`,
                        width: `${getWidth(person.birthYear, person.deathYear)}px`,
                        height: '40px',
                        background: `linear-gradient(135deg, ${getCategoryMutedColor(person.category)} 0%, #6a5a3a 100%)`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minWidth: '60px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        border: '1.5px solid #a8926a',
                        opacity: 0.95
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                        setHoveredPerson(person)
                        setMousePosition({ x: e.clientX, y: e.clientY })
                        setTimeout(() => setShowTooltip(true), 300)
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        setHoveredPerson(null)
                        setShowTooltip(false)
                      }}
                      onMouseMove={(e) => {
                        setMousePosition({ x: e.clientX, y: e.clientY })
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span>{person.name}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Всплывающее окно с информацией */}
      {hoveredPerson && showTooltip && (
        <div className="tooltip" style={{ 
          position: 'fixed',
          left: `${mousePosition.x + 15}px`,
          top: `${mousePosition.y - 10}px`,
          padding: '1rem',
          zIndex: 1000,
          maxWidth: '300px',
          minWidth: '250px',
          color: '#f4e4c1',
          pointerEvents: 'none',
          opacity: 0,
          transform: 'translateY(10px) scale(0.95)',
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

export default App 