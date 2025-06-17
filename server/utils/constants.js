

export const TIME_PERIODS = [
  { 
    id: 'past-day', 
    name: 'Past Day', 
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 过去一天
    end: new Date() 
  },
  { 
    id: 'past-week', 
    name: 'Past Week', 
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 过去一周
    end: new Date(Date.now() - 24 * 60 * 60 * 1000) 
  },
  { 
    id: 'past-month', 
    name: 'Past Month', 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 过去一月
    end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
  },
  { 
    id: 'over-one-month', 
    name: 'One Month Ago', 
    start: new Date(0), // 所有过去时间
    end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 半年前（约182天）
  },
];