import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        role: (state) => state.user?.role || 'Guest',
        isAdmin: (state) => state.user?.role === 'Admin',
        isAgent: (state) => state.user?.role === 'User',
    },
    actions: {
        setUser(userData) {
            if (userData) {
                if (userData.token) {
                    this.user = userData.user || userData;
                    this.token = userData.token;
                    localStorage.setItem('token', this.token);
                } else {
                    this.user = { ...this.user, ...userData };
                }
                localStorage.setItem('user', JSON.stringify(this.user));
            } else {
                this.user = null;
                this.token = null;
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});
