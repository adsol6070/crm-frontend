// import { Route, Navigate, RouteProps } from 'react-router-dom'

// // helpers
// import { useAuthContext } from '@/common'

// /**
//  * Private Route forces the authorization before the route can be accessed
//  * @param {*} param0
//  * @returns
//  */

// const PrivateRoute = ({ component: Component, roles, ...rest }: any) => {
// 	const { isAuthenticated } = useAuthContext()
// 	return (
// 		<Route
// 			{...rest}
// 			render={(props: RouteProps) => {
// 				if (!isAuthenticated) {
// 					// not logged in so redirect to login page with the return url
// 					return (
// 						<Navigate
// 							to={{
// 								pathname: '/auth/login',
// 							}}
// 						/>
// 					)
// 				}

// 				// check if route is restricted by role
// 				if (isAuthenticated) {
// 					// role not authorised so redirect to login page
// 					return <Navigate to={{ pathname: '/' }} />
// 				}
// 				// authorised so return component
// 				return <Component {...props} />
// 			}}
// 		/>
// 	)
// }

// export default PrivateRoute

import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../common/context'

interface PrivateRouteProps {
	roles?: string[]
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles }) => {
	const { isAuthenticated, user } = useAuthContext()

	if (!isAuthenticated) {
		return <Navigate to="/auth/login" replace />
	}

	if (roles && !roles.includes(user.role)) {
		// Redirect if user does not have required roles
		return <Navigate to="/" replace />
	}

	return <Outlet /> // Render children routes if authorized
}

export default PrivateRoute
