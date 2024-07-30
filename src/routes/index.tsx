import React from 'react'
import { Route, RouteProps } from 'react-router-dom'

// components
import PrivateRoute from './PrivateRoute'

// lazy load all the views

// auth
const Login = React.lazy(() => import('../pages/auth/Login'))
const Register = React.lazy(() => import('../pages/auth/Register'))
const OrganizationRegister = React.lazy(() => import('../pages/auth/Organization'))
const Logout = React.lazy(() => import('../pages/auth/Logout'))
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'))
const LockScreen = React.lazy(() => import('../pages/auth/LockScreen'))

// // dashboard
const Dashboard = React.lazy(() => import('../pages/Dashboard'))

// // pages
const ProfilePages = React.lazy(() => import('../pages/Profile/'))
const InvoicePages = React.lazy(() => import('../pages/other/Invoice'))
const FAQPages = React.lazy(() => import('../pages/other/FAQ'))
const PricingPages = React.lazy(() => import('../pages/other/Pricing'))
const MaintenancePages = React.lazy(() => import('../pages/other/Maintenance'))
const StarterPages = React.lazy(() => import('../pages/other/Starter'))
const ContactListPages = React.lazy(() => import('../pages/other/ContactList'))
const TimelinePages = React.lazy(() => import('../pages/other/Timeline'))

// Express Entry 
const CalculateCRS = React.lazy(() => import('../pages/CalculateCRS/Calculate'))
const ListCRSscores = React.lazy(() => import('../pages/CalculateCRS/ListResults'))

// blogs
const AddBlog = React.lazy(() => import('../pages/blogs/Create'))
const BlogList = React.lazy(() => import('../pages/blogs/List'))
const BlogEdit = React.lazy(() => import('../pages/blogs/Edit'))
const ReadBlog = React.lazy(() => import('../pages/blogs/Readblog'))
const AddCategory = React.lazy(() => import('../pages/blogs/AddCategory'))

// leads
const AddLead = React.lazy(() => import('../pages/leads/Create'))
const ListLead = React.lazy(() => import('../pages/leads/List'))
const ReadLead = React.lazy(() => import('../pages/leads/Read'))
const EditLead = React.lazy(() => import('../pages/leads/Update'))
const AddLeadDocument = React.lazy(() => import('../pages/leads/DocumentChecklist'))
const AddVisaCategory = React.lazy(() => import('../pages/leads/AddVisaCategory'))
const LeadNotes = React.lazy(() => import('../pages/leads/LeadNotes/'))
const Formqr = React.lazy(() => import('../pages/leads/Formqr/'))
const CreateLeadForm = React.lazy(() => import('../pages/PublicLeadCreate/Create/'))
const AddVisaChecklist = React.lazy(() => import('../pages/leads/AddChecklist'))

// // users
const UserList = React.lazy(() => import('../pages/user/List'))
const CreateUser = React.lazy(() => import('../pages/user/Create'))
const EditUser = React.lazy(() => import('../pages/user/Update'))
const UserRoles = React.lazy(() => import('../pages/user/Roles'))

const Chats = React.lazy(() => import('../pages/apps/Chat'))

// // error
const Error404 = React.lazy(() => import('../pages/error/Error404'))
const Error404Alt = React.lazy(() => import('../pages/error/Error404Alt'))
const Error500 = React.lazy(() => import('../pages/error/Error500'))

export interface RoutesProps {
	path: RouteProps['path']
	name?: string
	element?: RouteProps['element']
	route?: any
	exact?: boolean
	icon?: string
	header?: string
	roles?: string[]
	children?: RoutesProps[]
}

// dashboards
const dashboardRoutes: RoutesProps = {
	path: '/admin',
	name: 'Dashboards',
	icon: 'home',
	header: 'Navigation',
	children: [
		{
			path: '/',
			name: 'Root',
			element: <Dashboard />,
			route: PrivateRoute,
		},
		{
			path: '/dashboard',
			name: 'Dashboard',
			element: <Dashboard />,
			route: PrivateRoute,
		},
	],
}

// pages
const customPagesRoutes = {
	path: '/pages',
	name: 'Pages',
	icon: 'pages',
	header: 'Custom',
	children: [
		{
			path: '/pages/Profile',
			name: 'Profile',
			element: <ProfilePages />,
			// roles: ['superAdmin'],
			route: PrivateRoute,
		},
		{
			path: '/pages/invoice',
			name: 'Invoice',
			element: <InvoicePages />,
			route: PrivateRoute,
		},
		{
			path: '/pages/faq',
			name: 'FAQ',
			element: <FAQPages />,
			route: PrivateRoute,
		},
		{
			path: '/pages/pricing',
			name: 'Pricing',
			element: <PricingPages />,
			route: PrivateRoute,
		},
		{
			path: '/pages/starter',
			name: 'Starter Page',
			element: <StarterPages />,
			route: PrivateRoute,
		},
		{
			path: '/pages/contact-list',
			name: 'Contact List',
			element: <ContactListPages />,
			route: PrivateRoute,
		},
		{
			path: '/pages/timeline',
			name: 'Timeline',
			element: <TimelinePages />,
			route: PrivateRoute,
		},
		{
			path: 'pages/error-404-alt',
			name: 'Error - 404-alt',
			element: <Error404Alt />,
			route: PrivateRoute,
		},
	],
}

// Blog Routes
const blogRoutes = {
	path: '/blogs',
	name: 'Blogs',
	icon: 'pages',
	header: 'Custom',
	children: [
		{
			path: '/blog/add-blog',
			name: 'Add Blog',
			element: <AddBlog />,
			route: PrivateRoute,
		},
		{
			path: '/blog/add-category',
			name: 'Add Category',
			element: <AddCategory />,
			route: PrivateRoute,
		},
		{
			path: '/blog/list',
			name: 'Blog List',
			element: <BlogList />,
			route: PrivateRoute,
		},
		{
			path: '/blog/read/:blogId',
			name: 'Blog Read',
			element: <ReadBlog />,
			route: PrivateRoute,
		},
		{
			path: '/blog/edit/:blogId',
			name: 'Blog Edit',
			element: <BlogEdit />,
			route: PrivateRoute,
		},
	],
}
// Lead Routes
const leadRoutes = {
	path: '/leads',
	name: 'Leads',
	icon: 'pages',
	header: 'Custom',
	children: [
		{
			path: '/leads/formqr',
			name: 'Form QR',
			element: <Formqr />,
			route: PrivateRoute,
		},
		{
			path: '/leads/add-lead',
			name: 'Add Lead',
			element: <AddLead />,
			route: PrivateRoute,
		},
		{
			path: '/leads/list-leads',
			name: 'List Lead',
			element: <ListLead />,
			route: PrivateRoute,
		},
		{
			path: '/leads/lead-addVisaChecklist',
			name: 'Add Document Checklists',
			element: <AddVisaChecklist />,
			route: PrivateRoute,
		},
		{
			path: '/leads/lead-visaCategory',
			name: 'Add Visa Category',
			element: <AddVisaCategory />,
			route: PrivateRoute,
		},
		{
			path: '/lead/read/:leadId',
			name: 'Lead Read',
			element: <ReadLead />,
			route: PrivateRoute,
		},
		{
			path: '/lead/edit/:leadId',
			name: 'Lead Update',
			element: <EditLead />,
			route: PrivateRoute,
		},
		{
			path: '/lead/addDocument/:leadId',
			name: 'Add Lead Document',
			element: <AddLeadDocument />,
			route: PrivateRoute,
		},
		{
			path: '/lead/leadNotes/:leadId',
			name: 'Add Lead Notes',
			element: <LeadNotes />,
			route: PrivateRoute,
		},
	],
}

// Express Entry Routes
const expressEntryRoutes = {
	path: '/calculateCRS',
	name: 'Calculate CRS',
	icon: 'pages',
	header: 'Custom',
	children: [
		{
			path: '/calculateCRS/calculate',
			name: 'Calculate',
			element: <CalculateCRS />,
			route: PrivateRoute,
		},
		{
			path: '/calculateCRS/listResults',
			name: 'Saved Results',
			element: <ListCRSscores />,
			route: PrivateRoute,
		},
	],
}

// Admin Routes
const adminRoutes = {
	path: '/users',
	name: 'Users',
	icon: 'users',
	header: 'Custom',
	children: [
		{
			path: '/user/create',
			name: 'Create User',
			element: <CreateUser />,
			route: PrivateRoute,
			roles: ['superAdmin', 'admin'],
		},
		{
			path: '/user/list',
			name: 'User List',
			element: <UserList />,
			route: PrivateRoute,
			roles: ['superAdmin', 'admin'],
		},
		{
			path: '/user/edit/:userId',
			name: 'Edit User',
			element: <EditUser />,
			route: PrivateRoute,
			roles: ['superAdmin', 'admin'],
		},
		{
			path: '/user/roles',
			name: 'Manage Roles',
			element: <UserRoles />,
			route: PrivateRoute,
			roles: ['superAdmin', 'admin'],
		},
	],
}

// auth
const authRoutes: RoutesProps[] = [
	{
		path: '/auth/login',
		name: 'Login',
		element: <Login />,
		route: Route,
	},
	{
		path: '/auth/register',
		name: 'Register',
		element: <Register />,
		route: Route,
	},
	{
		path: '/auth/Organization',
		name: 'Organization',
		element: <OrganizationRegister />,
		route: Route,
	},
	{
		path: '/auth/logout',
		name: 'Logout',
		element: <Logout />,
		route: Route,
	},
	{
		path: '/auth/forgot-password',
		name: 'Forgot Password',
		element: <ForgotPassword />,
		route: Route,
	},
	{
		path: '/auth/reset-password',
		name: 'Reset Password',
		element: <ResetPassword />,
		route: Route,
	},
	{
		path: '/auth/lock-screen',
		name: 'Lock Screen',
		element: <LockScreen />,
		route: Route,
	},
]
const chatRoutes = {
	path: '/chats',
	name: 'Chats',
	icon: 'chats',
	header: 'Custom',
	children: [
		{
			path: '/chat',
			name: 'Chats',
			element: <Chats />,
			route: PrivateRoute,
			roles: ['superAdmin', 'admin'],
		},
	],
}

// public routes
const otherPublicRoutes = [
	{
		path: '*',
		name: 'Error - 404',
		element: <Error404 />,
		route: Route,
	},
	{
		path: 'pages/error-404',
		name: 'Error - 404',
		element: <Error404 />,
		route: Route,
	},
	{
		path: 'pages/error-500',
		name: 'Error - 500',
		element: <Error500 />,
		route: Route,
	},
	{
		path: '/pages/maintenance',
		name: 'Maintenance',
		element: <MaintenancePages />,
		route: Route,
	},
	{
		path: '/pages/createLead',
		name: 'Create Lead',
		element: <CreateLeadForm />,
		route: Route,
	},
]

// flatten the list of all nested routes
const flattenRoutes = (routes: RoutesProps[]) => {
	let flatRoutes: RoutesProps[] = []

	routes = routes || []
	routes.forEach((item: RoutesProps) => {
		flatRoutes.push(item)
		if (typeof item.children !== 'undefined') {
			flatRoutes = [...flatRoutes, ...flattenRoutes(item.children)]
		}
	})
	return flatRoutes
}

// All routes
const authProtectedRoutes = [
	dashboardRoutes,
	blogRoutes,
	chatRoutes,
	leadRoutes,
	expressEntryRoutes,
	adminRoutes,
	customPagesRoutes,
]
const publicRoutes = [...authRoutes, ...otherPublicRoutes]

const authProtectedFlattenRoutes = flattenRoutes([...authProtectedRoutes])
const publicProtectedFlattenRoutes = flattenRoutes([...publicRoutes])
export {
	publicRoutes,
	authProtectedRoutes,
	authProtectedFlattenRoutes,
	publicProtectedFlattenRoutes,
}
