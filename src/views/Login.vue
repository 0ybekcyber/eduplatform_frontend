<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const router = useRouter();

// State
const rememberMe = ref(localStorage.getItem('rememberMe') === 'true');
const email = ref(rememberMe.value ? (localStorage.getItem('savedEmail') || '') : '');
const password = ref(rememberMe.value ? (localStorage.getItem('savedPassword') || '') : '');
const errorMessage = ref('');
const loading = ref(false);
const showPassword = ref(false);
const showForgotPasswordModal = ref(false);

// Actions
const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

const login = async () => {
    // Reset error
    errorMessage.value = '';

    if (!email.value || !password.value) {
        errorMessage.value = "Iltimos, barcha maydonlarni to'ldiring.";
        return;
    }

    loading.value = true;
    
    try {
        const response = await api.post('users/login', {
            email: email.value,
            password: password.value,
        });

        userStore.setUser(response.data);

        if (rememberMe.value) {
            localStorage.setItem('savedEmail', email.value);
            localStorage.setItem('savedPassword', password.value);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPassword');
            localStorage.removeItem('rememberMe');
        }

        router.push('/home');
    } catch (error) {
        console.error(error);
        errorMessage.value = error.response?.data?.message || 'Email yoki parol noto‘g‘ri';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <!-- Modal (Forgot Password) -->
    <transition name="modal">
        <div v-if="showForgotPasswordModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div @click="showForgotPasswordModal = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
            
            <!-- Modal Content -->
            <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center scale-100 transform transition-all">
                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons">contact_support</span>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Kirishda muammomi?</h3>
                <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                    Xavfsizlik nuqtai nazaridan, parolni tiklash yoki loginni aniqlash uchun <strong>Platforma Administratori</strong> yoki o'quv bo'limiga murojaat qiling.
                </p>
                <button @click="showForgotPasswordModal = false"
                    class="w-full py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                    Tushunarli
                </button>
            </div>
        </div>
    </transition>

    <!-- Main Login Layout -->
    <div class="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-inter p-4 relative overflow-hidden">
        
        <!-- Decorative Background Elements (Educational style) -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div class="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl"></div>
            <div class="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-100/40 blur-3xl"></div>
        </div>

        <div class="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-slate-100 p-8 md:p-10 z-10 animate-fade-in-up">
            
            <!-- Logo Section -->
            <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-5">
                    <span class="material-icons text-3xl">school</span>
                </div>
                <h2 class="text-2xl font-extrabold text-slate-800 tracking-tight">EduPlatform</h2>
                <p class="text-slate-500 text-sm mt-2 font-medium">O'qishni davom ettirish uchun tizimga kiring</p>
            </div>

            <!-- Error Alert -->
            <transition name="shake">
                <div v-if="errorMessage" class="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6">
                    <span class="material-icons text-lg mt-0.5">error_outline</span>
                    <span>{{ errorMessage }}</span>
                </div>
            </transition>

            <form @submit.prevent="login" class="space-y-6">
                
                <!-- Email Input -->
                <div class="space-y-2">
                    <label class="block text-sm font-semibold text-slate-700 ml-1">Email manzili</label>
                    <div class="relative group">
                        <span class="material-icons absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xl">email</span>
                        <input 
                            v-model="email" 
                            type="email"
                            class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                            placeholder="admin@edutest.uz" 
                            required 
                        />
                    </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-2">
                    <div class="flex justify-between items-center ml-1">
                        <label class="block text-sm font-semibold text-slate-700">Maxfiy parol</label>
                    </div>
                    <div class="relative group">
                        <span class="material-icons absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xl">vpn_key</span>
                        <input 
                            :type="showPassword ? 'text' : 'password'" 
                            v-model="password"
                            class="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                            placeholder="••••••••" 
                            required 
                        />
                        <!-- Show/Hide Toggle -->
                        <button 
                            type="button" 
                            @click="togglePassword"
                            class="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                        >
                            <span class="material-icons text-xl">
                                {{ showPassword ? 'visibility_off' : 'visibility' }}
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Remember Me & Forgot -->
                <div class="flex items-center justify-between pt-1">
                    <label class="flex items-center space-x-2.5 cursor-pointer group">
                        <div class="relative flex items-center">
                            <input type="checkbox" v-model="rememberMe" 
                                class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-500" />
                            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-90">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </span>
                        </div>
                        <span class="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Eslab qolish</span>
                    </label>
                    <button type="button" @click="showForgotPasswordModal = true" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all">
                        Parolni unutdingizmi?
                    </button>
                </div>

                <!-- Submit Button -->
                <button 
                    type="submit"
                    class="w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    :disabled="loading"
                >
                    <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-base">{{ loading ? "Kirish kutilmoqda..." : "Tizimga kirish" }}</span>
                </button>
            </form>
            
            <!-- Footer -->
            <div class="mt-10 text-center">
                <p class="text-xs text-slate-400 font-medium tracking-wide uppercase">© 2026 EduPlatform. Ta'lim va rivojlanish sari.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Entry Animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Modal Animation */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.9) translateY(10px);
}

/* Shake Animation for Error */
.shake-enter-active {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
