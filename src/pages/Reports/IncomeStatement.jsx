// src/pages/Reports/IncomeStatement.jsx
import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import IncomeStatementChart from '../../components/IncomeStatementChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function IncomeStatement() {
  const {
    bars, currentBar, setCurrentBar,
    report, fetchReport, loading, error
  } = useContext(AppContext);

  const [dates, setDates] = useState({
    from: new Date().toISOString().slice(0,10),
    to:   new Date().toISOString().slice(0,10),
  });
  const [showHeader, setShowHeader] = useState(false);
  const reportRef = useRef();

  const fmtNumber = num =>
    num != null
      ? num.toLocaleString('en-US', { minimumFractionDigits: 2 })
      : '0.00';

  const pad = n => String(n).padStart(2, '0');
  const fmtDate = iso => {
    const d = new Date(iso);
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  };

  const currentBarName =
    currentBar === 'all'
      ? 'All Bars'
      : bars.find(b => b._id === currentBar)?.name || '—';

  const handleFetch = () => fetchReport(dates.from, dates.to);

  const downloadPDF = async () => {
    setShowHeader(true);
    await new Promise(r => setTimeout(r, 100));
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    setShowHeader(false);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p','mm','a4');
    const props = pdf.getImageProperties(imgData);
    const w = pdf.internal.pageSize.getWidth() - 20;
    const h = (props.height * w) / props.width;
    pdf.addImage(imgData,'PNG',10,10,w,h);
    pdf.save(`Income-Statement_${fmtDate(dates.from)}_to_${fmtDate(dates.to)}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Income Statement</h1>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:w-auto flex flex-col">
          <label className="text-sm mb-1">Bar</label>
          <select
            value={currentBar}
            onChange={e => setCurrentBar(e.target.value)}
            className="w-full sm:w-auto border rounded px-2 py-1"
          >
            <option value="all">All Bars</option>
            {bars.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        {['from','to'].map(key => (
          <div key={key} className="w-full sm:w-auto flex flex-col">
            <label className="text-sm mb-1">
              {key.charAt(0).toUpperCase()+key.slice(1)}
            </label>
            <input
              type="date"
              value={dates[key]}
              onChange={e => setDates(d=>({...d,[key]:e.target.value}))}
              className="w-full sm:w-auto border rounded px-2 py-1"
            />
          </div>
        ))}

        <button
          onClick={handleFetch}
          disabled={loading.report}
          className="w-full sm:w-auto bg-pink-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading.report ? 'Loading…' : 'Generate'}
        </button>

        {report && (
          <button
            onClick={downloadPDF}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download PDF
          </button>
        )}
      </div>

      {error.report && (
        <p className="text-red-600">{error.report}</p>
      )}

      {report && (
        <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Printable Header */}
          {showHeader && (
            <div className="flex flex-col sm:flex-row justify-between border-b pb-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Bar:</h2>
                <p className="text-lg">{currentBarName}</p>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <h2 className="text-xl font-semibold">Period:</h2>
                <p className="text-lg">
                  {fmtDate(dates.from)} – {fmtDate(dates.to)}
                </p>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Opening Stock', report.openingStock],
              ['Purchases',     report.purchases],
              ['Closing Stock', report.closingStock],
              ['Revenue',       report.revenue],
              ['COGS',          report.cogs],
              ['Gross Profit',  report.grossProfit],
              ['Expenses',      report.expenses],
              ['Net Profit',    report.netProfit],
            ].map(([label, val]) => (
              <div key={label} className="p-4 border rounded bg-gray-50">
                <h4 className="text-sm font-medium text-gray-600">{label}</h4>
                <p className="mt-1 text-xl font-semibold text-gray-800">
                  ${fmtNumber(val)}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="w-full">
            <IncomeStatementChart data={report} />
          </div>

          {/* By-Product Section */}
          <h3 className="text-lg font-medium">Sales &amp; Profit by Product</h3>

          {/* Table view on md+ */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full text-left text-sm border border-gray-300 shadow-sm">
              <thead className="bg-green-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 border-b">Product</th>
                  <th className="px-4 py-3 border-b">Qty Sold</th>
                  <th className="px-4 py-3 border-b">Sales Amt</th>
                  <th className="px-4 py-3 border-b">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.byProduct.map((row, i) => (
                  <tr key={row.productId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-b">{row.productName}</td>
                    <td className="px-4 py-2 border-b">{row.salesQty}</td>
                    <td className="px-4 py-2 border-b">${fmtNumber(row.salesAmt)}</td>
                    <td className="px-4 py-2 border-b">${fmtNumber(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card view on small */}
          <div className="md:hidden space-y-4">
            {report.byProduct.map(row => (
              <div
                key={row.productId}
                className="border rounded-lg p-4 bg-gray-50 break-words"
              >
                <p className="font-semibold">{row.productName}</p>
                <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                  <div>
                    <span className="font-medium">Qty Sold:</span> {row.salesQty}
                  </div>
                  <div>
                    <span className="font-medium">Sales Amt:</span> ${fmtNumber(row.salesAmt)}
                  </div>
                  <div>
                    <span className="font-medium">Profit:</span> ${fmtNumber(row.profit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
