import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function WeeklyReportTable({ weekStart }) {
  const { currentBar, weeklySummary, fetchWeeklySummary, loading, error } = useContext(AppContext);

  useEffect(() => {
    if (currentBar && weekStart) {
      fetchWeeklySummary(currentBar, weekStart);
    }
  }, [currentBar, weekStart]);

  // ...render similar to MonthlyReportTable...
}


