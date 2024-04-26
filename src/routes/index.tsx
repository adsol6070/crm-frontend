import React from 'react'
import { Route, RouteProps } from 'react-router-dom'

// components
import PrivateRoute from './PrivateRoute'

// lazy load all the views

// auth
const Login = React.lazy(() => import('../pages/auth/Login'))
const Register = React.lazy(() => import('../pages/auth/Register'))
const Logout = React.lazy(() => import('../pages/auth/Logout'))
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'))
const LockScreen = React.lazy(() => import('../pages/auth/LockScreen'))

// // dashboard
const Dashboard = React.lazy(() => import('../pages/Dashboard'))

// // pages
const ProfilePages = React.lazy(() => import('../pages/other/Profile/'))
const InvoicePages = React.lazy(() => import('../pages/other/Invoice'))
const FAQPages = React.lazy(() => import('../pages/other/FAQ'))
const PricingPages = React.lazy(() => import('../pages/other/Pricing'))
const MaintenancePages = React.lazy(() => import('../pages/other/Maintenance'))
const StarterPages = React.lazy(() => import('../pages/other/Starter'))
const ContactListPages = React.lazy(() => import('../pages/other/ContactList'))
const TimelinePages = React.lazy(() => import('../pages/other/Timeline'))

// blogs
const AddBlog = React.lazy(() => import('../pages/blogs/Create'))
const BlogList = React.lazy(() => import('../pages/blogs/List'))
const AddCategory = React.lazy(() => import('../pages/blogs/AddCategory'))

// // users
const UserList = React.lazy(() => import('../pages/admin/List'))
const CreateUser = React.lazy(() => import('../pages/admin/Create'))

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
			path: '/pages/profile',
			name: 'Profile',
			element: <ProfilePages />,
			roles: ['user'],
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
			name: 'Create Admin',
			element: <CreateUser />,
			route: PrivateRoute,
			roles: ['superAdmin'],
		},
		{
			path: '/user/list',
			name: 'Admin List',
			element: <UserList />,
			route: PrivateRoute,
			roles: ['superAdmin'],
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
		path: '/auth/lock-screen',
		name: 'Lock Screen',
		element: <LockScreen />,
		route: Route,
	},
]

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
