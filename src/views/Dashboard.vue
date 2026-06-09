<template>
  <div class="app-shell flex h-screen font-inter overflow-hidden transition-colors">

    <!-- SIDEBAR (HEMIS STYLE DARK) -->
    <aside
      class="app-sidebar w-[260px] flex flex-col h-full z-50 transition-all duration-300 shadow-xl shadow-black/10 shrink-0"
      :class="[isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0', isMobile ? 'fixed' : 'relative']"
    >
      <!-- BRAND LOGO -->
      <div class="h-16 flex items-center px-5 text-white shrink-0 border-b border-white/10" :style="{ background: themeStore.isDark ? 'linear-gradient(135deg, #172033 0%, #0a1220 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-white/[0.12] mr-3">
          <span class="material-icons text-[18px]">school</span>
        </div>
        <span class="text-[14px] font-bold tracking-tight uppercase">EduTest Portal</span>
      </div>

      <!-- NAVIGATION MENU -->
      <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 custom-sidebar-scroll">
        <router-link
          v-for="item in filteredMenuItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 px-3.5 py-2.5 rounded transition-all duration-200"
          :class="[
            $route.path === item.path
              ? 'bg-white/[0.12] text-white font-medium border-l-[3px] border-[var(--app-brand-2)] shadow-sm'
              : 'text-[var(--app-sidebar-text)] hover:bg-white/[0.08] hover:text-white'
          ]"
        >
          <span class="material-icons text-[19px]" :class="$route.path === item.path ? 'text-[var(--app-brand-2)]' : 'text-[var(--app-sidebar-text)] group-hover:text-white'">
            {{ item.icon }}
          </span>
          <span class="text-[12px] font-bold uppercase tracking-tight">{{ languageStore.t(item.labelKey) }}</span>
        </router-link>
      </nav>

      <!-- LOGOUT AT BOTTOM -->
      <div class="p-4 mt-auto border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <button @click="logout" class="flex items-center gap-3 px-4 py-2 text-[var(--app-sidebar-text)] hover:text-white hover:bg-white/10 rounded-xl transition-all w-full text-[12px] font-bold uppercase group">
          <span class="material-icons text-[18px] group-hover:scale-110 transition-transform">logout</span>
          {{ languageStore.t('logout') }}
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
      
      <!-- TOP NAVIGATION BAR -->
      <header class="app-header h-14 px-5 flex items-center justify-between z-30 sticky top-0 backdrop-blur-xl transition-colors">
          <!-- Left side: Breadcrumbs -->
          <div class="flex items-center gap-4">
              <button 
                v-if="isMobile"
                @click="toggleSidebar" 
                class="app-surface-soft p-2 rounded-xl border focus:outline-none"
              >
                <span class="material-icons">menu</span>
              </button>

              <div class="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                <span class="material-icons text-sm">home</span>
                <span class="cursor-pointer transition-colors hover:text-cyan-500">{{ languageStore.t('home') }}</span>
                <span v-if="$route.path !== '/home'" class="flex items-center gap-2">
                    <span class="material-icons text-xs">chevron_right</span>
                    <span class="text-slate-600">{{ getCurrentPageLabel }}</span>
                </span>
              </div>
          </div>

          <!-- Right side: User info & notifications -->
          <div class="flex items-center gap-5">
              <div class="flex items-center gap-4 border-r border-slate-200 pr-4">
                <!-- Notifications -->
                <div ref="notificationRef" class="relative group cursor-pointer p-1" @click.stop="toggleNotifications">
                  <span class="material-icons text-slate-400 group-hover:text-blue-500 transition-colors text-xl">notifications</span>
                  <span v-if="unseenNotificationCount > 0" class="absolute top-0 right-0 min-w-[16px] h-4 px-1 bg-blue-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white">{{ unseenNotificationCount }}</span>
                  
                  <!-- Dropdown -->
                  <div v-if="showNotifDropdown" @click.stop class="app-surface absolute right-0 mt-3 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div class="app-surface-soft px-5 py-4 border-b flex justify-between items-center">
                        <span class="text-[11px] font-black text-slate-800 uppercase tracking-widest">{{ languageStore.t('notifications') }}</span>
                        <button @click="markNotificationsSeen" class="text-[10px] text-blue-500 font-bold hover:underline">{{ languageStore.t('markRead') }}</button>
                    </div>
                    <div class="max-h-80 overflow-y-auto custom-sidebar-scroll">
                        <div v-if="notifications.length === 0" class="p-8 text-center app-text-muted">
                            <span class="material-icons text-4xl opacity-10 mb-2">notifications_none</span>
                            <p class="text-[11px] font-bold uppercase tracking-tight">{{ languageStore.t('noMessages') }}</p>
                        </div>
                        <div v-for="(notif, i) in notifications" :key="notif.id || i" class="p-4 border-b transition-colors flex gap-3 relative"
                          :class="notif.isNew ? 'border-blue-100 bg-blue-50 hover:bg-blue-100/70' : 'border-slate-100 hover:bg-slate-50'">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                              :class="notif.isNew ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'">
                                <span class="material-icons text-sm">{{ notif.icon || 'info' }}</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                  <p class="text-[11px] font-bold leading-tight" :class="notif.isNew ? 'text-blue-700' : 'text-slate-600'">{{ notif.title }}</p>
                                  <span v-if="notif.isNew" class="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">{{ languageStore.t('new') }}</span>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-1">{{ notif.time }}</p>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              <button @click="themeStore.toggleTheme()" class="flex items-center gap-2 border px-3 py-2 text-[10px] font-black uppercase tracking-tight transition-all" :class="themeStore.isDark ? 'border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'">
                <span class="material-icons text-sm">{{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}</span>
                <span>{{ themeStore.isDark ? languageStore.t('lightMode') : languageStore.t('darkMode') }}</span>
              </button>
              <div class="relative" ref="languageRef">
                <button @click.stop="toggleLanguageMenu" class="flex items-center gap-2 text-[10px] font-black app-text-muted uppercase cursor-pointer hover:text-blue-500 transition-colors tracking-tight">
                  <span>{{ languageStore.currentLanguage.label }}</span>
                  <span class="material-icons text-sm">expand_more</span>
                </button>
                <div v-if="showLanguageMenu" @click.stop class="app-surface absolute right-0 mt-3 w-40 overflow-hidden rounded-xl border shadow-xl z-50">
                  <button
                    v-for="language in languages"
                    :key="language.code"
                    @click="setLanguage(language.code)"
                    class="flex w-full items-center justify-between px-4 py-3 text-left text-[12px] font-bold transition-colors hover:bg-slate-50"
                    :class="languageStore.locale === language.code ? 'text-blue-600 bg-blue-50' : 'text-slate-600'"
                  >
                    <span>{{ language.label }}</span>
                    <span>{{ language.short }}</span>
                  </button>
                </div>
              </div>
              </div>
              
              <div class="flex items-center gap-3">
                  <div class="flex flex-col text-right">
                      <span class="text-[11px] font-bold text-slate-700 uppercase leading-none">
                        {{ userStore.user?.firstname }} {{ userStore.user?.lastname }}
                        <template v-if="!userStore.user?.firstname">Portal Admin</template>
                      </span>
                      <span class="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">
                        {{ userStore.user?.role || languageStore.t('administrator') }}
                      </span>
                  </div>
                  <div class="app-surface-soft w-8 h-8 rounded flex items-center justify-center border overflow-hidden shrink-0 shadow-sm relative group">
                      <img v-if="userStore.user?.image" :src="userStore.user?.image" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold">
                        {{ (userStore.user?.firstname || 'A').charAt(0).toUpperCase() }}
                      </div>
                  </div>
              </div>
          </div>
      </header>

      <transition name="fade">
        <div v-if="showNewNotificationToast" class="fixed right-6 top-20 z-[80] w-80 rounded-xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <span class="material-icons text-lg">notifications_active</span>
            </div>
            <div class="min-w-0">
              <p class="text-[13px] font-black text-slate-800">{{ languageStore.t('newNotificationTitle') }}</p>
              <p class="mt-1 text-[11px] leading-5 text-slate-500">{{ languageStore.t('newNotificationBody') }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- CONTENT VIEW -->
      <main class="flex-1 overflow-y-auto scroll-smooth transition-colors flex flex-col" :class="themeStore.isDark ? 'bg-slate-950' : 'bg-[var(--app-bg-soft)]'">
        <div class="flex-1 p-4 lg:p-5">
          <div class="mx-auto w-full max-w-[1600px]">
            <transition name="fade" mode="out-in">
              <router-view />
            </transition>
          </div>
        </div>

        <footer class="sticky bottom-0 z-20 shrink-0 border-t app-border px-5 py-3 text-[12px] shadow-[0_-1px_3px_rgba(15,23,42,0.04)]"
          :class="themeStore.isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700'">
          <span><strong>{{ languageStore.t('version') }}</strong> 1.0.0 / <strong>{{ languageStore.t('date') }}</strong> {{ footerDateTime }}</span>
        </footer>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useUserStore } from '../stores/user';
import { useThemeStore } from '../stores/theme';
import { usePortalSettingsStore } from '../stores/portalSettings';
import { useLanguageStore, languages } from '../stores/language';
import api from '../api';

const userStore = useUserStore();
const themeStore = useThemeStore();
const portalSettingsStore = usePortalSettingsStore();
const languageStore = useLanguageStore();
const isSidebarOpen = ref(true); 
const isMobile = ref(false);
const notificationRef = ref(null);
const languageRef = ref(null);
const showNotifDropdown = ref(false);
const showLanguageMenu = ref(false);
const notifications = ref([]);
const unseenNotificationCount = ref(0);
const showNewNotificationToast = ref(false);
const footerDateTime = ref('');

let footerClock = null;
let notificationClock = null;
let notificationToastTimer = null;

const NOTIFICATION_STORAGE_PREFIXES = ['seen_notifications_', 'known_notifications_'];

const updateFooterDateTime = () => {
    footerDateTime.value = new Date().toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

const getSeenNotificationsKey = () => `seen_notifications_${userStore.user?.id || 'guest'}`;
const getKnownNotificationsKey = () => `known_notifications_${userStore.user?.id || 'guest'}`;

const normalizeNotificationIds = (ids) => {
    return [...new Set((ids || []).map(id => id?.toString()).filter(Boolean))];
};

const getStoredIds = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? normalizeNotificationIds(value) : [];
    } catch (e) {
        return [];
    }
};

const uniqueNotifications = (items) => {
    const seen = new Set();
    return items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
};

const markNotificationsSeen = () => {
    const currentIds = normalizeNotificationIds(notifications.value.map(item => item.id));
    const seenIds = normalizeNotificationIds([...getStoredIds(getSeenNotificationsKey()), ...currentIds]);
    const knownIds = normalizeNotificationIds([...getStoredIds(getKnownNotificationsKey()), ...currentIds]);
    localStorage.setItem(getSeenNotificationsKey(), JSON.stringify(seenIds));
    localStorage.setItem(getKnownNotificationsKey(), JSON.stringify(knownIds));
    notifications.value = notifications.value.map(item => ({ ...item, isNew: false }));
    unseenNotificationCount.value = 0;
    showNewNotificationToast.value = false;
    if (notificationToastTimer) clearTimeout(notificationToastTimer);
};

const showNotificationToast = () => {
    showNewNotificationToast.value = true;
    if (notificationToastTimer) clearTimeout(notificationToastTimer);
    notificationToastTimer = setTimeout(() => {
        showNewNotificationToast.value = false;
    }, 5000);
};

const loadNotifications = async () => {
    if (userStore.user?.role === 'Student') {
        try {
            const previousUnseenCount = unseenNotificationCount.value;
            const [testsRes, assignmentsRes] = await Promise.all([
                api.get('/tests/stats'),
                api.get('/assignments/stats')
            ]);
            const testNotifications = (testsRes.data?.recentTests || []).map(t => ({
                id: `test-${t.id}`,
                title: `${languageStore.t('newTest')}: ${t.name}`,
                createdAt: t.createdAt || new Date().toISOString(),
                time: new Date(t.createdAt || Date.now()).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }),
                icon: 'new_releases'
            }));
            const assignmentNotifications = (assignmentsRes.data?.recentAssignments || []).map(a => ({
                id: `assignment-${a.id}`,
                title: `${languageStore.t('newAssignment')}: ${a.name}`,
                createdAt: a.createdAt || new Date().toISOString(),
                time: new Date(a.createdAt || Date.now()).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }),
                icon: 'inventory_2'
            }));
            const nextNotifications = uniqueNotifications([...assignmentNotifications, ...testNotifications])
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const knownKey = getKnownNotificationsKey();
            const storedKnown = localStorage.getItem(knownKey);
            const seenIds = getStoredIds(getSeenNotificationsKey());
            const knownIds = storedKnown ? getStoredIds(knownKey) : seenIds;
            const nextCurrentIds = normalizeNotificationIds(nextNotifications.map(item => item.id));
            const hasNewArrival = nextCurrentIds.some(id => !knownIds.includes(id));

            notifications.value = nextNotifications.map(item => ({ ...item, isNew: !seenIds.includes(item.id?.toString()) }));
            unseenNotificationCount.value = notifications.value.filter(item => item.isNew).length;
            localStorage.setItem(knownKey, JSON.stringify(normalizeNotificationIds([...knownIds, ...nextCurrentIds])));

            if (hasNewArrival && unseenNotificationCount.value > previousUnseenCount) {
                showNotificationToast();
            }
        } catch (e) {
            console.error('Failed to load notifications');
        }
    } else {
        notifications.value = [
            { title: languageStore.t('welcomeNotification'), time: languageStore.t('now'), icon: "how_to_reg" }
        ];
    }
};

const toggleNotifications = () => {
    showNotifDropdown.value = !showNotifDropdown.value;
};

const closeNotificationsOnOutsideClick = (event) => {
    if (!showNotifDropdown.value) return;
    if (notificationRef.value?.contains(event.target)) return;
    showNotifDropdown.value = false;
};

const toggleLanguageMenu = () => {
    showLanguageMenu.value = !showLanguageMenu.value;
};

const setLanguage = (locale) => {
    languageStore.setLocale(locale);
    showLanguageMenu.value = false;
    loadNotifications();
};

const closeLanguageOnOutsideClick = (event) => {
    if (!showLanguageMenu.value) return;
    if (languageRef.value?.contains(event.target)) return;
    showLanguageMenu.value = false;
};

const menuItems = [
  { path: '/home', labelKey: 'home', icon: 'grid_view' },
  { path: '/user', labelKey: 'users', icon: 'people_outline', adminOnly: true },
  { path: '/structure', labelKey: 'structure', icon: 'account_tree', adminOnly: true },
  { path: '/tests', labelKey: 'tests', icon: 'assignment' },
  { path: '/test-bank', labelKey: 'testBank', icon: 'storage', staffOnly: true },
  { path: '/tasks', labelKey: 'tasks', icon: 'inventory_2' },
  { path: '/analysis', labelKey: 'analysis', icon: 'bar_chart' },
  { path: '/reports', labelKey: 'reports', icon: 'summarize', adminOnly: true },
  { path: '/settings', labelKey: 'settings', icon: 'settings' },
];

const filteredMenuItems = computed(() => {
    return menuItems.filter(item => {
        if (item.adminOnly) return userStore.user?.role === 'Admin'
        if (item.staffOnly) return userStore.user?.role !== 'Student'
        return true
    })
})

const getCurrentPageLabel = computed(() => {
    const path = window.location.pathname;
    const activeRoute = menuItems.find(item => item.path === path || path.includes(item.path));
    return activeRoute ? languageStore.t(activeRoute.labelKey) : languageStore.t('page');
})

function logout() {
    if (confirm(languageStore.t('confirmLogout'))) {
        const rememberedLogin = {
            rememberMe: localStorage.getItem('rememberMe'),
            savedEmail: localStorage.getItem('savedEmail'),
            savedPassword: localStorage.getItem('savedPassword'),
        };
        const rememberedNotifications = {};
        Object.keys(localStorage).forEach((key) => {
            if (NOTIFICATION_STORAGE_PREFIXES.some(prefix => key.startsWith(prefix))) {
                rememberedNotifications[key] = localStorage.getItem(key);
            }
        });

        localStorage.clear();
        sessionStorage.clear();

        if (rememberedLogin.rememberMe === 'true') {
            localStorage.setItem('rememberMe', rememberedLogin.rememberMe);
            if (rememberedLogin.savedEmail) localStorage.setItem('savedEmail', rememberedLogin.savedEmail);
            if (rememberedLogin.savedPassword) localStorage.setItem('savedPassword', rememberedLogin.savedPassword);
        }
        Object.entries(rememberedNotifications).forEach(([key, value]) => {
            if (value) localStorage.setItem(key, value);
        });

        userStore.$reset();
        window.location.reload();
    }
}

function checkMobile() {
    isMobile.value = window.innerWidth < 1024;
    if (!isMobile.value) isSidebarOpen.value = true;
    else isSidebarOpen.value = false;
}

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

onMounted(() => {
    portalSettingsStore.load(userStore.user?.id);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('click', closeNotificationsOnOutsideClick);
    document.addEventListener('click', closeLanguageOnOutsideClick);
    loadNotifications();
    notificationClock = setInterval(loadNotifications, 30000);
    updateFooterDateTime();
    footerClock = setInterval(updateFooterDateTime, 1000);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobile);
    document.removeEventListener('click', closeNotificationsOnOutsideClick);
    document.removeEventListener('click', closeLanguageOnOutsideClick);
    if (footerClock) clearInterval(footerClock);
    if (notificationClock) clearInterval(notificationClock);
    if (notificationToastTimer) clearTimeout(notificationToastTimer);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.font-inter {
    font-family: 'Inter', sans-serif;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.custom-sidebar-scroll::-webkit-scrollbar {
    width: 4px;
}
.custom-sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}
.custom-sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
}
</style>
