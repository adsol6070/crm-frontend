export interface MenuItemTypes {
	key: string
	label: string
	isTitle?: boolean
	icon?: string
	url?: string
	badge?: {
		variant: string
		text: string
	}
	parentKey?: string
	target?: string
	children?: MenuItemTypes[]
	roles?: string[]
}

const MENU_ITEMS: MenuItemTypes[] = [
	{
		key: 'Main',
		label: 'Main',
		isTitle: true,
	},
	{
		key: 'dashboard',
		label: 'Dashboards',
		isTitle: false,
		url: '/',
		icon: 'ri-dashboard-3-line',
		badge: {
			variant: 'success',
			text: '9+',
		},
	},
	{
		key: 'blogs',
		label: 'Blogs',
		isTitle: false,
		icon: 'ri-newspaper-line',
		children: [
			{
				key: 'blogs-AddBlog',
				label: 'Add Blog',
				url: '/blog/add-blog',
				parentKey: 'blogs',
			},
			{
				key: 'blogs-AddCategory',
				label: 'Add Category',
				url: '/blog/add-category',
				parentKey: 'blogs',
			},
			{
				key: 'blogs-BlogList',
				label: 'Blog List',
				url: '/blog/list',
				parentKey: 'blogs',
			},
		],
	},
	{
		key: 'admin',
		label: 'Admins',
		isTitle: false,
		icon: 'ri-admin-line',
		roles: ['superAdmin'],
		children: [
			{
				key: 'admin-CreateAdmin',
				label: 'Create Admin',
				url: '/admin/create',
				parentKey: 'admin',
			},
			{
				key: 'admin-ManageUsers',
				label: 'Admin List',
				url: '/admin/list',
				parentKey: 'admin',
			},
			{
				key: 'admin-ManageRoles',
				label: 'Manage Roles',
				url: '/admin/manage-roles',
				parentKey: 'admin',
			},
			{
				key: 'admin-Settings',
				label: 'Settings',
				url: '/admin/settings',
				parentKey: 'admin',
			},
		],
	},
]

const HORIZONTAL_MENU_ITEMS: MenuItemTypes[] = [
	{
		key: 'dashboard',
		icon: 'ri-dashboard-3-line',
		label: 'Dashboards',
		isTitle: true,
		children: [
			{
				key: 'dashboard',
				label: 'Dashboard',
				url: '/',
				parentKey: 'dashboard',
			},
		],
	},

	{
		key: 'ui',
		icon: 'ri-stack-line',
		label: 'Components',
		isTitle: true,
		children: [
			{
				key: 'base1',
				label: 'Base UI 1',
				parentKey: 'ui',
				children: [
					{
						key: 'ui-accordions',
						label: 'Accordions',
						url: '/ui/accordions',
						parentKey: 'base1',
					},
					{
						key: 'ui-alerts',
						label: 'Alerts',
						url: '/ui/alerts',
						parentKey: 'base1',
					},
					{
						key: 'ui-avatars',
						label: 'Avatars',
						url: '/ui/avatars',
						parentKey: 'base1',
					},
					{
						key: 'ui-badges',
						label: 'Badges',
						url: '/ui/badges',
						parentKey: 'base1',
					},
					{
						key: 'ui-breadcrumb',
						label: 'Breadcrumb',
						url: '/ui/breadcrumb',
						parentKey: 'base1',
					},
					{
						key: 'ui-buttons',
						label: 'Buttons',
						url: '/ui/buttons',
						parentKey: 'base1',
					},
					{
						key: 'ui-cards',
						label: 'Cards',
						url: '/ui/cards',
						parentKey: 'base1',
					},
					{
						key: 'ui-carousel',
						label: 'Carousel',
						url: '/ui/carousel',
						parentKey: 'base1',
					},
					{
						key: 'ui-dropdowns',
						label: 'Dropdowns',
						url: '/ui/dropdowns',
						parentKey: 'base1',
					},
					{
						key: 'ui-embed-video',
						label: 'Embed Video',
						url: '/ui/embed-video',
						parentKey: 'base1',
					},
					{
						key: 'ui-grid',
						label: 'Grid',
						url: '/ui/grid',
						parentKey: 'base1',
					},
					{
						key: 'ui-list-group',
						label: 'List Group',
						url: '/ui/list-group',
						parentKey: 'base1',
					},
					{
						key: 'ui-links',
						label: 'Links',
						url: '/ui/links',
						parentKey: 'base1',
					},
				],
			},
			{
				key: 'base2',
				label: 'Base UI 2',
				parentKey: 'ui',
				children: [
					{
						key: 'ui-modals',
						label: 'Modals',
						url: '/ui/modals',
						parentKey: 'base2',
					},
					{
						key: 'ui-notifications',
						label: 'Notifications',
						url: '/ui/notifications',
						parentKey: 'base2',
					},
					{
						key: 'ui-offcanvas',
						label: 'Offcanvas',
						url: '/ui/offcanvas',
						parentKey: 'base2',
					},
					{
						key: 'ui-placeholders',
						label: 'Placeholders',
						url: '/ui/placeholders',
						parentKey: 'base2',
					},
					{
						key: 'ui-pagination',
						label: 'Pagination',
						url: '/ui/pagination',
						parentKey: 'base2',
					},
					{
						key: 'ui-popovers',
						label: 'Popovers',
						url: '/ui/popovers',
						parentKey: 'base2',
					},
					{
						key: 'ui-progress',
						label: 'Progress',
						url: '/ui/progress',
						parentKey: 'base2',
					},

					{
						key: 'ui-spinners',
						label: 'Spinners',
						url: '/ui/spinners',
						parentKey: 'base2',
					},
					{
						key: 'ui-tabs',
						label: 'Tabs',
						url: '/ui/tabs',
						parentKey: 'base2',
					},
					{
						key: 'ui-tooltips',
						label: 'Tooltips',
						url: '/ui/tooltips',
						parentKey: 'base2',
					},
					{
						key: 'ui-typography',
						label: 'Typography',
						url: '/ui/typography',
						parentKey: 'base2',
					},
					{
						key: 'ui-utilities',
						label: 'Utilities',
						url: '/ui/utilities',
						parentKey: 'base2',
					},
				],
			},
			{
				key: 'extended',
				label: 'Extended UI',
				parentKey: 'ui',
				children: [
					{
						key: 'extended-portlets',
						label: 'Portlets',
						url: '/extended-ui/portlets',
						parentKey: 'extended',
					},
					{
						key: 'extended-scrollbar',
						label: 'Scrollbar',
						url: '/extended-ui/scrollbar',
						parentKey: 'extended',
					},
					{
						key: 'extended-range-slider',
						label: 'Range Slider',
						url: '/extended-ui/range-slider',
						parentKey: 'extended',
					},
				],
			},
			{
				key: 'forms',
				label: 'Forms',
				parentKey: 'ui',
				children: [
					{
						key: 'forms-basic-elements',
						label: 'Basic Elements',
						url: '/ui/forms/basic-elements',
						parentKey: 'forms',
					},
					{
						key: 'forms-form-advanced',
						label: 'Form Advanced',
						url: '/ui/forms/form-advanced',
						parentKey: 'forms',
					},
					{
						key: 'forms-validation',
						label: 'Form Validation',
						url: '/ui/forms/validation',
						parentKey: 'forms',
					},
					{
						key: 'forms-wizard',
						label: 'Form Wizard',
						url: '/ui/forms/wizard',
						parentKey: 'forms',
					},
					{
						key: 'forms-file-uploads',
						label: 'File Uploads',
						url: '/ui/forms/file-uploads',
						parentKey: 'forms',
					},
					{
						key: 'forms-editors',
						label: 'Form Editors',
						url: '/ui/forms/editors',
						parentKey: 'forms',
					},
					{
						key: 'forms-image-crop',
						label: 'Image Crop',
						url: '/ui/forms/image-crop',
						parentKey: 'forms',
					},
					{
						key: 'forms-editable',
						label: 'Editable',
						url: '/ui/forms/editable',
						parentKey: 'forms',
					},
				],
			},
			{
				key: 'charts',
				label: 'Charts',
				isTitle: false,
				children: [
					{
						key: 'apex-charts',
						label: 'Apex Charts',
						url: '/charts/apex-charts',
						parentKey: 'charts',
					},
					{
						key: 'chartjs-charts',
						label: 'ChartJS',
						url: '/charts/chartjs',
						parentKey: 'charts',
					},
					{
						key: 'Sparkline-charts',
						label: 'Sparkline Charts',
						url: '/charts/sparkline-charts',
						parentKey: 'charts',
					},
				],
			},
			{
				key: 'tables',
				label: 'Tables',
				isTitle: false,
				children: [
					{
						key: 'tables-basic',
						label: 'Basic Tables',
						url: '/ui/tables/basic-tables',
						parentKey: 'tables',
					},
					{
						key: 'tables-data',
						label: 'Data Tables',
						url: '/ui/tables/data-tables',
						parentKey: 'tables',
					},
				],
			},
			{
				key: 'icons',
				label: 'Icons',
				isTitle: false,
				children: [
					{
						key: 'icons-remix',
						label: 'Remix icons',
						url: '/ui/icons/remix-icons',
						parentKey: 'icons',
					},
					{
						key: 'icons-Bootstrap',
						label: 'Bootstrap icons',
						url: '/ui/icons/Bootstrap-icons',
						parentKey: 'icons',
					},
					{
						key: 'icons-Material Icons',
						label: 'Material Design Icons',
						url: '/ui/icons/Material-icons',
						parentKey: 'icons',
					},
				],
			},
			{
				key: 'maps',
				label: 'Maps',
				isTitle: false,
				children: [
					{
						key: 'maps-google-maps',
						label: 'Google maps',
						url: '/ui/maps/google-maps',
						parentKey: 'maps',
					},
					{
						key: 'maps-vector-maps',
						label: 'Vector maps',
						url: '/ui/maps/vector-maps',
						parentKey: 'maps',
					},
				],
			},
		],
	},
]

export { MENU_ITEMS, HORIZONTAL_MENU_ITEMS }
