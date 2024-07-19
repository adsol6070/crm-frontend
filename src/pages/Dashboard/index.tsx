import { Col, Row } from 'react-bootstrap';
import Statistics from './getCardsData/Statistics';
import { PageBreadcrumb } from '@/components';
import useGetCardsData from './getCardsData/useGetcardsData';
import LeadStatusReport from './getLeadStatusReport/index';
import LeadSourceReport from './getLeadSourceReport/index';
import GetLeadReportOnTime from './getLeadReportOnTime/index';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const Dashboard = () => {
	const { data: cardData } = useGetCardsData();
	const startHalf = subMonths(new Date(), 6);
	const endHalf = new Date();
	const startWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start of the current week (Monday)
	const endWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
	const startQuarter = subMonths(new Date(), 3);
	const endQuarter = new Date();

	return (
		<>
			<PageBreadcrumb title="Welcome!" subName="Dashboards" />
			<Row>
				{(cardData || []).map((item, idx) => (
					<Col xxl={3} sm={6} key={idx}>
						<Statistics
							title={item.title}
							count={item.count}
							icon={item.icon}
							variant={item.variant}
						/>
					</Col>
				))}
			</Row>

			<Row className='my-1'>
				<LeadStatusReport />
				<LeadSourceReport />
				<Col md={4}>
					<h5>Weekly Report</h5>
					<GetLeadReportOnTime start={startWeek} end={endWeek} barColor={"#3b4158"} chartType="bar" />
				</Col>
			</Row>
			<Row className='my-2'>
				<Col md={4}>
					<h5>Monthly Report</h5>
					<GetLeadReportOnTime start={startOfMonth(new Date())} end={endOfMonth(new Date())} barColor={"#546E7A"} chartType="bar" />
				</Col>
				<Col md={4}>
					<h5>Half Yearly Report</h5>
					<GetLeadReportOnTime start={startHalf} end={endHalf} barColor={"#54557a"} chartType="donut" />
				</Col>
				<Col md={4}>
					<h5>Yearly Report</h5>
					<GetLeadReportOnTime start={startOfYear(new Date())} end={endOfYear(new Date())} barColor={"#547a68"} chartType="area" />
				</Col>
			</Row>
		</>
	);
};

export default Dashboard;
