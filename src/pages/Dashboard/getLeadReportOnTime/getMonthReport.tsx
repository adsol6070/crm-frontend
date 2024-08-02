import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './getLeadReportOnTime.module.css';
import useGetLeadReportsOnTime from './getLeadReportOnTime';
import ReactApexChart from 'react-apexcharts';
import { format, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { chartStyle } from '@/utils';
import { useThemeContext } from '@/common';

interface GetLeadReportOnTimeProps {
  start: Date;
  end: Date;
  barColor: string;
}

const GetLeadMonthReportOnTime: React.FC<GetLeadReportOnTimeProps> = ({ start, end, barColor }) => {
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
    if (isStart) {
      setStartDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)) : undefined);
    } else {
      setEndDate(date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)) : undefined);
    }
  };

  const getDateIntervals = (start: Date, end: Date) => {
    return eachWeekOfInterval({ start, end }).map(weekStart => 
      `${format(weekStart, 'MMM dd')} - ${format(endOfWeek(weekStart), 'MMM dd')}`
    );
  };

  useEffect(() => {
    if (startDate && endDate) {
      processChartData(report, startDate, endDate);
    }
  }, [report, startDate, endDate]);

  const processChartData = (data: any[], start: Date, end: Date) => {
    const filteredData = data.filter(d => new Date(d.date) >= start && new Date(d.date) <= end);
    const groupedData = filteredData.reduce((acc, curr) => {
      const weekStart = startOfWeek(new Date(curr.date));
      const weekKey = `${format(weekStart, 'MMM dd')} - ${format(endOfWeek(weekStart), 'MMM dd')}`;
      acc[weekKey] = (acc[weekKey] || 0) + parseInt(curr.lead_count, 10);
      return acc;
    }, {});

    const categories = getDateIntervals(start, end);
    const seriesData = categories.map(week => groupedData[week] || 0);

    setChartData({
      series: [{
        name: 'Leads Count',
        data: seriesData
      }],
      options: {
        chart: {
          type: 'bar',
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
          colors: ['transparent']
        },
        xaxis: {
          categories,
        },
        yaxis: {
          title: {
            text: 'Leads Count'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val: number) {
              return `${val} leads`;
            }
          }
        },
        title: {
          text: 'Leads Created Per Week',
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
  };

  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {}
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
      </div>
      <div style={chartStyle(settings.theme === "dark")}>
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type="bar" 
          height={350} 
        />
      </div>
    </div>
  );
};

export default GetLeadMonthReportOnTime;
