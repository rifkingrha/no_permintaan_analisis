import { createRouter, createWebHistory } from 'vue-router';
import DashboardHome from '../views/DashboardHome.vue';
import NoAnalisisPage from '../views/NoAnalisisPage.vue';
import ListNoAnalisisPage from '../views/ListNoAnalisisPage.vue';
import AccessLevelPage from '../views/AccessLevelPage.vue';
import MasterList from "../views/MasterList.vue";
import UserAccountPage from "../views/UserAccountPage.vue";
import ProfilePage from '../views/ProfilePage.vue';
import AuditTrailsPage from '../views/AuditTrailsPage.vue';


const routes = [
	{
		path: '/',
		name: 'home',
		component: NoAnalisisPage,
		meta: { title: 'Home', requiresAuth: true  },
	},
	{
		path: '/list/no_analisis',
		name: 'list-noanalisis',
		component: ListNoAnalisisPage,
		meta: { title: 'List No Analisis', requiresAuth: true  },
	},
	{
		path: '/preview',
		name: 'componentsPreview',
		// Lazy-loaded route
		component: () => import('@/views/PreviewView.vue'),
		meta: { title: 'Components Preview' },
	},
	{
		// 404 fallback
		path: '/:pathMatch(.*)*',
		name: 'notFound',
		component: () => import('@/views/NotFoundView.vue'),
		meta: { title: '404 Not Found' },
	},
	{
		path: "/:master(mst_department|mst_jenis_check|mst_jenis_sampel|mst_reason)",
		name: "master-list",
		component: MasterList,
		meta: { requiresAuth: true, title: 'Master Data Management'}
	},
	{
		path: '/access-level',
		name: 'AcessLevel',
		component: AccessLevelPage,
		meta: { title: 'Access Level Management', requiresAuth: true  },
  	},
	{
		path: '/user-account',
		name: 'UserAccount',
		component: UserAccountPage,
		meta: { title: 'User Account Management', requiresAuth: true },
	},
	{
		path: '/profile',
		name: 'ProfileSettings',
		component: ProfilePage,
		meta: { title: 'Profile Settings', requiresAuth: true },
	},
	{
		path: '/audittrails',
		name: 'Audittrails',
		component: AuditTrailsPage,
		meta: { hideSidebar: true, requiresAuth: true }
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('../views/LoginPage.vue'),
		meta: { hideSidebar: true } // Use this flag to hide your sidebar in App.vue
	}
];
export default routes;
