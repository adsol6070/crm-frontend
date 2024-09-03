import { useEffect, useState } from "react";
import { reportsApi } from "@/common";

const useGetCardsData = () => {
	const [cardsData, setCardsData] = useState<any>({})
	const [loading, setLoading] = useState<boolean>(true)

	const getCardsData = async () => {
		try {
			const response = await reportsApi.getCardsData();
			setCardsData(response)
		} catch (error) {
			console.error('Error fetching cards data', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getCardsData();
	}, [])

	const data = [{
		title: 'Total Lead',
		count: cardsData.leadsCount,
		icon: 'ri-team-line',
		variant: 'text-bg-pink',
	},
	{
		title: 'Total Blogs',
		count: cardsData.blogsCount,
		icon: 'ri-file-list-line',
		variant: 'text-bg-purple',
	},
	{
		title: 'Total Users',
		count: cardsData.usersCount,
		icon: 'ri-user-line',
		variant: 'text-bg-info',
	},
	{
		title: 'CRS Saved Scores',
		count: cardsData.scoresCount,
		icon: 'ri-calculator-line',
		variant: 'text-bg-primary',
	}]

	return { data, loading }
};

export default useGetCardsData;
