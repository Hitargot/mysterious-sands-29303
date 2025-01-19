import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const PieChart = ({ data }) => {
  const chartData = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [data.approved, data.rejected, data.pending],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f', '#f57c00'],
      },
    ],
  };

  return (
    <div className="pie-chart-container">
      <h3>Transaction Status Distribution</h3>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
