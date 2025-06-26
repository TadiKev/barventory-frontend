// src/components/IncomeStatementChart.jsx

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function IncomeStatementChart({ data }) {
  const chartData = {
    labels: ["Revenue","COGS","Gross Profit","Expenses","Net Profit"],
    datasets: [{
      label: "Amount (USD)",
      backgroundColor: ["#4CAF50","#F44336","#2196F3","#FF9800","#9C27B0"],
      data: [
        data.revenue,
        data.cogs,
        data.grossProfit,
        data.expenses,
        data.netProfit
      ],
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `$${ctx.raw.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: v => `$${v.toLocaleString('en-US')}`,
          // reduce font size on small screens
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    },
  };

  return (
    <div className="mx-auto w-full max-w-xs sm:max-w-md md:max-w-lg h-64 sm:h-80 md:h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
}
