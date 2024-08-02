import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './getLeadReportOnTime.module.css';
import useGetLeadReportsOnTime from './getLeadReportOnTime';
import ReactApexChart from 'react-apexcharts';
import { format, eachMonthOfInterval, startOfMonth } from 'date-fns';
import { chartStyle } from '@/utils';
import { useThemeContext } from '@/common';

interface GetLeadReportOnTimeProps {
  barColor: string;
}

const GetLeadCustomRangeReportOnTime: React.FC<GetLeadReportOnTimeProps> = ({ barColor }) => {
  const { settings } = useThemeContext();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie' | 'donut'>('area');

  const { report } = useGetLeadReportsOnTime(
    startDate ? startDate.toISOString() : null,
    endDate ? endDate.toISOString() : null
  );

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleDateChange = (date: Date | null, isStart: boolean) => {
    if (isStart) {
      setStartDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)) : undefined);
    } else {
      setEndDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)) : undefined);
    }
  };

  const getDateIntervals = (start: Date, end: Date) => {
    return eachMonthOfInterval({ start, end }).map(monthStart => 
      format(monthStart, 'MMM yyyy')
    );
  };

  useEffect(() => {
    if (startDate && endDate) {
      processChartData(report, startDate, endDate);
    }
  }, [report, startDate, endDate, chartType]); // Include chartType in dependencies

  const processChartData = (data: any[], start: Date, end: Date) => {
    const filteredData = data.filter(d => new Date(d.date) >= start && new Date(d.date) <= end);
    const groupedData = filteredData.reduce((acc, curr) => {
      const monthStart = startOfMonth(new Date(curr.date));
      const monthKey = format(monthStart, 'MMM yyyy');
      acc[monthKey] = (acc[monthKey] || 0) + parseInt(curr.lead_count, 10);
      return acc;
    }, {});

    const categories = getDateIntervals(start, end);
    const seriesData = categories.map(month => groupedData[month] || 0);

    const commonOptions = {
      chart: {
        type: chartType,
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: chartType === 'pie' || chartType === 'donut',
        formatter: function (val: number, opts: any) {
          return `${opts.w.globals.labels[opts.seriesIndex]}: ${val.toFixed(1)}%`;
        }
      },
      stroke: {
        show: true,
        width: 2,
        curve: 'smooth'
      },
      fill: {
        opacity: chartType === 'area' ? 0.5 : 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return `${val} leads`;
          }
        }
      },
      title: {
        text: 'Leads Created Per Month',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
      },
      colors: chartType === 'pie' || chartType === 'donut'
              ? ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#1abc9c', '#9b59b6', '#f1c40f', '#34495e', '#16a085', '#f39c12']
              : [barColor],
      legend: {
        position: 'bottom',
        labels: {
          colors: isDarkMode ? '#fff' : '#333',
          useSeriesColors: false
        }
      },
    };

    if (chartType === 'pie' || chartType === 'donut') {
      setChartData({
        series: seriesData,
        options: {
          ...commonOptions,
          labels: categories,
        }
      });
    } else {
      setChartData({
        series: [{
          name: 'Leads Count',
          data: seriesData
        }],
        options: {
          ...commonOptions,
          xaxis: {
            categories,
          },
          yaxis: {
            title: {
              text: 'Leads Count'
            }
          },
        }
      });
    }
  };

  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        curve: 'smooth'
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: {
          text: 'Leads Count'
        }
      },
      fill: {
        opacity: 0.5
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return `${val} leads`;
          }
        }
      },
      title: {
        text: 'Leads Created Per Month',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
      },
      colors: [barColor],
      legend: {
        position: 'bottom',
        labels: {
          colors: isDarkMode ? '#fff' : '#333',
          useSeriesColors: false
        }
      },
    }
  });

  return (
    <div>
      <div className={`${styles.customDatepickerWrapper} ${isDarkMode ? 'dark' : ''}`}>
        <div className={styles.customDatepickerIcon}>
          <DatePicker
            selected={startDate}
            onChange={(date) => handleDateChange(date, true)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select Start Date"
            className={styles.customDatepickerInput}
          />
          <FaCalendarAlt />
        </div>
        <div className={styles.customDatepickerIcon}>
          <DatePicker
            selected={endDate}
            onChange={(date) => handleDateChange(date, false)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="Select End Date"
            className={styles.customDatepickerInput}
          />
          <FaCalendarAlt />
        </div>
        <div className={styles.chartTypeSelector}>
          <label htmlFor="chartType" className={styles.chartTypeLabel}>Chart Type:</label>
          <select id="chartType" value={chartType} onChange={(e) => setChartType(e.target.value as 'area' | 'bar' | 'line' | 'pie' | 'donut')} className={styles.chartTypeDropdown}>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
          </select>
        </div>
      </div>
      <div style={chartStyle(settings.theme === "dark")}>
        <ReactApexChart 
          options={chartData.options} 
          series={startDate && endDate ? chartData.series : chartType === 'pie' || chartType === 'donut' ? [] : [{ name: 'Leads Count', data: [] }]} 
          type={chartType} 
          height={350} 
        />
      </div>
    </div>
  );
};

export default GetLeadCustomRangeReportOnTime;
