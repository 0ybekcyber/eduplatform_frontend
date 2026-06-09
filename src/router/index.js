import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';
import Login from '../views/Login.vue';
import App from '../views/Dashboard.vue'; // 👈 Your layout wrapper
import api from '../api'
// Page Components
import Home from '../Pages/Home.vue';
import User from '../Pages/User.vue'
import Structure from '../Pages/Structure.vue'
import Tests from '../Pages/Tests.vue'
import TestBank from '../Pages/TestBank.vue'
import Tasks from '../Pages/Tasks.vue'
import Analysis from '../Pages/Analysis.vue'
import Reports from '../Pages/Reports.vue'
import Settings from '../Pages/Settings.vue'

const routes = [
    { path: '/login', component: Login },
    {
        path: '/',
        component: App,
        meta: { requiresAuth: true },
        children: [

            { path: 'home', component: Home },

            { path: 'user', component: User },
            { path: 'structure', component: Structure },
            { path: 'tests', component: Tests },
            { path: 'test-bank', component: TestBank },
            { path: 'tasks', component: Tasks },
            { path: 'analysis', component: Analysis },
            { path: 'reports', component: Reports },
            { path: 'settings', component: Settings }

        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const token = userStore.token || localStorage.getItem('token');

    if (to.meta.requiresAuth) {
        if (!token) {
            return next('/login');
        }

        try {
            await api.get('/users/check-token'); // <-- backend validates the JWT
            next(); // Valid token, proceed
        } catch (error) {
            userStore.logout(); // Clear token from store/localStorage
            next('/login'); // Invalid/expired token, redirect to login
        }
    } else {
        next(); // Public route
    }
});

export default router;
