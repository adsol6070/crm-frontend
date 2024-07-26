import useGetBlogPosts from "@/pages/blogs/List/useBlogList";
import { useLeadList } from "@/pages/leads/List/useLeadList";
import { useUserList } from "../../user/List/useUserList";
import { useResultList } from "../../CalculateCRS/ListResults/useListResults";

const useGetCardsData = () => {
    const { blogPosts } = useGetBlogPosts();
    const { leadRecords } = useLeadList();
	const { userRecords } = useUserList();
	const { resultRecords } = useResultList()

    const data = [{
		title: 'Total Lead',
		count: leadRecords.length,
		icon: 'ri-team-line',
		variant: 'text-bg-pink',
	},
	{
		title: 'Total Blogs',
		count: blogPosts.length,
		icon: 'ri-file-list-line',
		variant: 'text-bg-purple',
	},
	{
		title: 'Total Users',
		count: userRecords.length,
		icon: 'ri-user-line',
		variant: 'text-bg-info',
	},
	{
		title: 'CRS Saved Scores',
		count: resultRecords.length,
		icon: 'ri-calculator-line',
		variant: 'text-bg-primary',
	}]

    return { data }
};

export default useGetCardsData;
