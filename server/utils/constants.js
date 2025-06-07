

export const TIME_PERIODS = [
    { 
      id: 'recent', 
      name: 'Recent', 
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 过去一年
      end: new Date() 
    },
    { 
      id: '1-2-years', 
      name: '1-2 Years Ago', 
      start: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '3-5-years', 
      name: '3-5 Years Ago', 
      start: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: '5+', 
      name: '5+ Years Ago', 
      start: new Date(0), // 所有过去时间
      end: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000) 
    },
  ];