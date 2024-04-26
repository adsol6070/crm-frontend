import React from 'react'
import { Route, Routes } from 'react-router-dom'

// All layouts containers
import DefaultLayout from '../Layouts/Default'
import VerticalLayout from '../Layouts/Vertical'
import HorizontalLayout from '../Layouts/Horizontal'

import {
	authProtectedFlattenRoutes,
	publicProtectedFlattenRoutes,
} from './index'
import { ThemeSettings, useThemeContext } from '../common/context'
import PrivateRoute from './PrivateRoute'
interface IRoutesProps {}

const AllRoutes = (props: IRoutesProps) => {
	const { settings } = useThemeContext()

	const Layout =
		settings.layout.type === ThemeSettings.layout.type.vertical
			? VerticalLayout
			: HorizontalLayout
	return (
		<React.Fragment>
			<Routes>
				<Route>
					{publicProtectedFlattenRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={
								<DefaultLayout {...props}>{route.element}</DefaultLayout>
							}
							key={idx}
						/>
					))}
				</Route>

				{authProtectedFlattenRoutes.map((route, idx) => (
					<Route
						key={idx}
						path={route.path}
						element={<PrivateRoute roles={route.roles} />}>
						<Route
							path=""
							element={<Layout {...props}>{route.element}</Layout>}
						/>
					</Route>
				))}
			</Routes>
		</React.Fragment>
	)
}

export default AllRoutes
