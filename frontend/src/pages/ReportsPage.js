import React, { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import ReportService from '../services/ReportService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ReportsPage() {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    ReportService.getTaskStatistics()
      .then((response) => {
        setReportData(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке отчётов:', error);
      });
  }, []);

  return (
    <div>
      <h2>Отчёты</h2>
      {reportData && (
        <Chart
          type="bar"
          data={{
            labels: reportData.labels,
            datasets: [
              {
                label: 'Количество задач',
                data: reportData.values,
                backgroundColor: 'rgba(75,192,192,0.4)',
              },
            ],
          }}
        />
      )}
    </div>
  );
}

export default ReportsPage;