<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,_#fff7ed_0%,_#ffffff_45%,_#f8fafc_100%)] p-6 lg:p-8">
      <div class="absolute -left-10 top-8 h-32 w-32 rounded-full bg-orange-100/70 blur-2xl"></div>
      <div class="absolute right-8 top-8 h-24 w-24 rounded-full bg-amber-100/70 blur-xl"></div>
      <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="text-[11px] font-black uppercase tracking-[0.35em] text-orange-700">Sozlamalar Markazi</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">Profil, ko‘rinish va ish uslubini bir joydan boshqaring</h1>
          <p class="mt-3 text-sm leading-6 text-slate-600">Bu bo‘lim akkauntingiz ma’lumotlari bilan birga portal ichidagi kundalik tajribangizni ham qulay boshqarish uchun yig‘ildi.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div v-for="pill in summaryPills" :key="pill.label" class="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{{ pill.label }}</p>
            <p class="mt-2 text-base font-black text-slate-800">{{ pill.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Profil</p>
            <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">Akkaunt ma'lumotlari</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-500">Saqlanadi</span>
        </div>

        <div class="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div class="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div class="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-inner">
              <img v-if="profile.image" :src="profile.image" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-5xl font-black text-slate-500">
                {{ initials }}
              </div>
            </div>

            <label class="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-300 bg-orange-50 px-4 py-4 text-[12px] font-black text-orange-700 hover:bg-orange-100">
              <span class="material-icons text-base">photo_camera</span>
              <span>Rasm yangilash</span>
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
            </label>

            <button v-if="profile.image" @click="profile.image = ''" class="mt-3 w-full rounded-2xl bg-slate-100 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-200">
              Rasmni olib tashlash
            </button>

            <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Ko‘rinish</p>
              <div class="mt-3 flex gap-2">
                <button v-for="accent in accents" :key="accent.name" @click="portalSettings.accent = accent.name" class="flex-1 rounded-xl border px-3 py-3 text-xs font-black transition-all" :class="portalSettings.accent === accent.name ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'">
                  {{ accent.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ism</span>
                <input v-model="profile.firstname" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white" />
              </label>
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Familiya</span>
                <input v-model="profile.lastname" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white" />
              </label>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Email</span>
                <input v-model="profile.email" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white" />
              </label>
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Telefon</span>
                <input v-model="profile.phone" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white" />
              </label>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Jins</span>
                <select v-model="profile.gender" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white">
                  <option value="Erkak">Erkak</option>
                  <option value="Ayol">Ayol</option>
                </select>
              </label>
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Yangi parol</span>
                <input v-model="profile.password" type="password" placeholder="Ixtiyoriy" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white" />
              </label>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Fakultet ID</span>
                <input :value="profile.facultyId || 'Biriktirilmagan'" disabled class="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
              </label>
              <label class="block">
                <span class="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Guruh ID</span>
                <input :value="profile.groupId || 'Biriktirilmagan'" disabled class="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
              </label>
            </div>

            <div class="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-black text-slate-800">Profilni saqlash</p>
                <p class="mt-1 text-xs text-slate-500">O‘zgarishlar akkauntingizda yangilanadi va keyingi kirishda ham saqlanadi.</p>
              </div>
              <button @click="saveProfile" :disabled="isSavingProfile" class="rounded-2xl bg-slate-900 px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-slate-800 disabled:opacity-60">
                {{ isSavingProfile ? 'Saqlanmoqda' : 'Saqlash' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-6">
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Portal Rejimi</p>
            <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">Shaxsiy preferensiyalar</h2>
          </div>

          <div class="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-black text-slate-800">Kunduzgi va tungi rejim</p>
                <p class="mt-1 text-xs text-slate-500">Butun portal ko‘rinishini bir tugma bilan almashtiradi.</p>
              </div>
              <button @click="themeStore.toggleTheme()" class="rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all" :class="themeStore.isDark ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : 'bg-slate-900 text-white hover:bg-slate-800'">
                {{ themeStore.isDark ? 'Kunduzgi rejim' : 'Tungi rejim' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import { usePortalSettingsStore } from '../stores/portalSettings'

const userStore = useUserStore()
const themeStore = useThemeStore()
const portalSettingsStore = usePortalSettingsStore()
const isSavingProfile = ref(false)
const profile = ref({ firstname: '', lastname: '', email: '', role: 'Student', phone: '', facultyId: null, groupId: null, image: '', gender: 'Erkak', password: '' })
const portalSettings = computed({
  get: () => portalSettingsStore.settings,
  set: (value) => portalSettingsStore.update(value, userStore.user?.id)
})
const accents = [{ name: 'sun', label: 'Sun' }, { name: 'ocean', label: 'Ocean' }, { name: 'forest', label: 'Forest' }]
const summaryPills = computed(() => [
  { label: 'Foydalanuvchi', value: `${profile.value.firstname || ''} ${profile.value.lastname || ''}`.trim() || 'Profil' },
  { label: 'Rol', value: profile.value.role || 'User' },
  { label: 'Accent', value: portalSettings.value.accent }
])
const initials = computed(() => `${(profile.value.firstname || 'U')[0] || 'U'}${(profile.value.lastname || 'S')[0] || 'S'}`.toUpperCase())
const loadProfile = async () => {
  try {
    const res = await api.get('/users/whoami')
    profile.value = {
      firstname: res.data.firstname || '',
      lastname: res.data.lastname || '',
      email: res.data.email || '',
      role: res.data.role || 'Student',
      phone: res.data.phone || '',
      facultyId: res.data.facultyId || null,
      groupId: res.data.groupId || null,
      image: res.data.image || '',
      gender: res.data.gender || 'Erkak',
      password: ''
    }
  } catch (e) {
    console.error('Failed to load profile:', e)
  }
}

const loadPortalSettings = () => {
  portalSettingsStore.load(userStore.user?.id)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { profile.value.image = e.target.result }
  reader.readAsDataURL(file)
}

const saveProfile = async () => {
  isSavingProfile.value = true
  try {
    const payload = {
      firstname: profile.value.firstname,
      lastname: profile.value.lastname,
      email: profile.value.email,
      role: profile.value.role,
      password: profile.value.password || '',
      phone: profile.value.phone,
      facultyId: profile.value.facultyId,
      groupId: profile.value.groupId,
      image: profile.value.image || '',
      gender: profile.value.gender
    }
    const userId = userStore.user?.id
    const res = await api.patch(`/users/id/${userId}`, payload)
    userStore.setUser({ ...userStore.user, ...res.data })
    profile.value.password = ''
    alert('Profil muvaffaqiyatli saqlandi')
  } catch (e) {
    alert(e.response?.data?.message || 'Profilni saqlashda xatolik yuz berdi')
  } finally {
    isSavingProfile.value = false
  }
}

onMounted(async () => {
  await loadProfile()
  loadPortalSettings()
})
</script>
