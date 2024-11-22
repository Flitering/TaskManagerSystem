import React, { useEffect, useState } from 'react';
import ReportService from '../services/ReportService';

function ReportsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    ReportService.getTaskStatistics()
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке отчётов:', error);
      });
  }, []);

  return (
    <div>
      <h2>Отчёты</h2>
      {stats ? (
        <ul>
          <li>Всего задач: {stats.total_tasks}</li>
          <li>Новые задачи: {stats.new_tasks}</li>
          <li>Задачи в процессе: {stats.in_progress_tasks}</li>
          <li>Завершенные задачи: {stats.completed_tasks}</li>
        </ul>
      ) : (
        <p>Загрузка данных...</p>
      )}
    </div>
  );
}

export default ReportsPage;