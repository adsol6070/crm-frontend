import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './getLeadReportOnTime.module.css';
import useGetLeadReportsOnTime from './getLeadReportOnTime';
import ReactApexChart from 'react-apexcharts';
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval } from 'date-fns';
import { chartStyle } from '@/utils';
import { useThemeContext } from '@/common';

interface GetLeadReportOnTimeProps {
  start: Date;
  end: Date;
  barColor: string;
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea';
}

const GetLeadReportOnTime: React.FC<GetLeadReportOnTimeProps> = ({ start, end, barColor, chartType }) => {
  const { settings } = useThemeContext();
  const [startDate, setStartDate] = useState<Date | undefined>(start);
  const [endDate, setEndDate] = useState<Date | undefined>(end);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

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
    console.log("date ", startDate, endDate)
    if (isStart) {
      setStartDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)) : undefined);
    } else {
      setEndDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)) : undefined);
    }
  };

  const getDateIntervals = (start: Date, end: Date) => {
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    if (diffDays <= 7) {
      return eachDayOfInterval({ start, end }).map(date => format(date, 'EEEE'));
    } else if (diffDays <= 30) {
      return eachWeekOfInterval({ start, end }).map(date => `Week ${format(date, 'I')}`);
    } else if (diffDays <= 365) {
      return eachMonthOfInterval({ start, end }).map(date => format(date, 'MMM yyyy'));
    } else {
      return eachYearOfInterval({ start, end }).map(date => format(date, 'yyyy'));
    }
  };

  const categories = startDate && endDate ? getDateIntervals(startDate, endDate) : [];
  const data = report.map((item: any) => parseInt(item.lead_count, 10));

  const totalLeads = data.reduce((acc, count) => acc + count, 0);
  const percentages = data.map(count => Math.round((count / totalLeads) * 100));

  const totalPercent = percentages.reduce((acc, percent) => acc + percent, 0);
  if (totalPercent !== 100) {
    const difference = 100 - totalPercent;
    percentages[percentages.length - 1] += difference;
  }

  const flatColors = ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#1abc9c', '#9b59b6', '#f1c40f', '#34495e', '#16a085', '#f39c12'];

  const chartData = {
    series: chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'rangeBar' || chartType === 'rangeArea'
      ? [{
          name: 'Leads Count',
          data
        }]
      : percentages,
    options: {
      chart: {
        type: chartType,
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: chartType === 'bar'
        ? {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              endingShape: 'rounded'
            },
          }
        : chartType === 'radialBar'
        ? {
            radialBar: {
              hollow: {
                size: '70%',
              },
            },
          }
        : {},
      dataLabels: {
        enabled: chartType === 'pie' || chartType === 'donut',
        formatter: function (val: number, opts: any) {
          return `${opts.w.globals.labels[opts.seriesIndex]}: ${val}%`;
        }
      },
      stroke: chartType === 'line' || chartType === 'area'
        ? {
            show: true,
            width: 2,
            curve: 'smooth'
          }
        : chartType === 'bar'
        ? {
            show: true,
            width: 2,
            colors: ['transparent']
          }
        : {},
      xaxis: chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'rangeBar' || chartType === 'rangeArea'
        ? {
            categories,
          }
        : {},
      yaxis: chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'rangeBar' || chartType === 'rangeArea'
        ? {
            title: {
              text: 'Leads Count'
            }
          }
        : {},
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number, opts: any) {
            return chartType === 'pie' || chartType === 'donut'
              ? `${opts.w.globals.labels[opts.seriesIndex]}: ${val} leads`
              : `${val} leads`;
          }
        }
      },
      labels: chartType === 'pie' || chartType === 'donut' || chartType === 'radialBar' ? categories : [],
      title: {
        text: 'Leads Created Per Day',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
      },
      colors: chartType === 'pie' || chartType === 'donut' ? flatColors : [barColor],
      legend: {
        position: 'bottom',
        labels: {
          colors: isDarkMode ? '#fff' : '#333',
          useSeriesColors: false
        }
      },
    }
  };

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
      </div>
      <div style={chartStyle(settings.theme === "dark")}>
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type={chartType} 
          height={350} 
        />
      </div>
    </div>
  );
};

export default GetLeadReportOnTime;
