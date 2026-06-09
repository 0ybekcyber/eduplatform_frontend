<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fafc_48%,_#ecfeff_100%)] p-6 lg:p-8">
      <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-700">Statistika</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">Portal bo'yicha asosiy raqamlar</h1>
          <p class="mt-3 text-sm leading-6 text-slate-600">Bu sahifada testlar, topshiriqlar, foydalanuvchilar va natijalar bo'yicha eng kerakli ko'rsatkichlar sodda ko'rinishda jamlangan.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="chip in heroChips" :key="chip.label" class="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{{ chip.label }}</p>
            <p class="mt-2 text-xl font-black text-slate-800">{{ chip.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in metricCards" :key="card.title" class="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ card.title }}</p>
            <p class="mt-3 text-3xl font-black tracking-tight text-slate-900">{{ card.value }}</p>
            <p class="mt-2 text-xs leading-5 text-slate-500">{{ card.caption }}</p>
          </div>
          <div :class="card.iconWrap" class="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg">
            <span class="material-icons">{{ card.icon }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Taqqoslash</p>
            <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">Nimalar ko'proq ishlatilmoqda</h2>
          </div>
          <div class="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-500">Hozirgi ma'lumotlar</div>
        </div>
        <div class="space-y-5">
          <div v-for="bar in comparisonBars" :key="bar.label" class="space-y-2">
            <div class="flex items-center justify-between text-sm font-bold text-slate-700">
              <span>{{ bar.label }}</span>
              <span>{{ bar.value }}</span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full transition-all duration-700" :class="bar.color" :style="{ width: `${bar.percent}%` }"></div>
            </div>
            <p class="text-xs text-slate-400">{{ bar.hint }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6">
          <p class="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Qisqa holat</p>
          <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">Bugungi ko'rinish</h2>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="focus in focusCards" :key="focus.title" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{{ focus.title }}</p>
              <span class="material-icons text-slate-300">{{ focus.icon }}</span>
            </div>
            <p class="mt-3 text-2xl font-black tracking-tight text-slate-900">{{ focus.value }}</p>
            <p class="mt-2 text-xs leading-5 text-slate-500">{{ focus.caption }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Yaqin faollik</p>
          <h2 class="mt-2 text-xl font-black tracking-tight text-slate-900">So'nggi qo'shilganlar</h2>
        </div>
        <div class="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{{ recentActivity.length }} ta yozuv</div>
      </div>
      <div class="grid gap-3 lg:grid-cols-2">
        <div v-if="recentActivity.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-bold text-slate-400 lg:col-span-2">Faollik topilmadi</div>
        <div v-for="item in recentActivity" :key="item.id" class="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50">
          <div :class="item.iconWrap" class="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm">
            <span class="material-icons text-[20px]">{{ item.icon }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p class="truncate text-sm font-black text-slate-800">{{ item.title }}</p>
              <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{{ item.time }}</span>
            </div>
            <p class="mt-1 text-xs leading-5 text-slate-500">{{ item.subtitle }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../api'

const userStore = useUserStore()
const testsData = ref({ testCount: 0, userCount: 0, studentCount: 0, teacherCount: 0, resultCount: 0, averageScore: 0, pendingTaskCount: 0, completedTaskCount: 0, recentTests: [] })
const assignmentsData = ref({ assignmentCount: 0, submissionCount: 0, recentAssignments: [] })

const loadData = async () => {
  try {
    const [testsRes, assignmentsRes] = await Promise.all([api.get('/tests/stats'), api.get('/assignments/stats')])
    testsData.value = testsRes.data || testsData.value
    assignmentsData.value = assignmentsRes.data || assignmentsData.value
  } catch (e) {
    console.error('Failed to load analysis data:', e)
  }
}

const heroChips = computed(() => [
  { label: 'Rol', value: userStore.user?.role || 'User' },
  { label: 'Test', value: testsData.value.testCount || 0 },
  { label: 'Topshiriq', value: assignmentsData.value.assignmentCount || 0 },
  { label: 'Javoblar', value: (testsData.value.resultCount || 0) + (assignmentsData.value.submissionCount || 0) }
])

const metricCards = computed(() => [
  { title: 'Jami testlar', value: testsData.value.testCount || 0, caption: 'Talabalarga biriktirilgan yoki tizimda turgan testlar soni.', icon: 'assignment', iconWrap: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { title: 'Jami topshiriqlar', value: assignmentsData.value.assignmentCount || 0, caption: 'Yozma ish yoki fayl orqali topshiriladigan vazifalar soni.', icon: 'inventory_2', iconWrap: 'bg-gradient-to-br from-teal-500 to-emerald-500' },
  { title: 'Yakunlangan testlar', value: testsData.value.completedTaskCount || 0, caption: "Talabalar tomonidan topshirib bo'lingan test natijalari.", icon: 'task_alt', iconWrap: 'bg-gradient-to-br from-emerald-500 to-lime-500' },
  { title: "O'rtacha test bali", value: `${testsData.value.averageScore || 0}%`, caption: "Barcha test natijalari bo'yicha o'rtacha foiz.", icon: 'leaderboard', iconWrap: 'bg-gradient-to-br from-orange-500 to-amber-500' }
])

const comparisonBars = computed(() => {
  const totalWork = (testsData.value.testCount || 0) + (assignmentsData.value.assignmentCount || 0) || 1
  const totalUsers = testsData.value.userCount || 1
  const students = testsData.value.studentCount || 0
  const teachers = testsData.value.teacherCount || 0

  return [
    { label: 'Testlar ulushi', value: `${testsData.value.testCount || 0} ta`, percent: Math.round(((testsData.value.testCount || 0) / totalWork) * 100), color: 'bg-gradient-to-r from-blue-500 to-cyan-500', hint: "Testlar va topshiriqlar ichida testlar qancha joy egallashini ko'rsatadi." },
    { label: 'Topshiriqlar ulushi', value: `${assignmentsData.value.assignmentCount || 0} ta`, percent: Math.round(((assignmentsData.value.assignmentCount || 0) / totalWork) * 100), color: 'bg-gradient-to-r from-teal-500 to-emerald-500', hint: 'Testlar va topshiriqlar ichida yozma yoki faylli vazifalar ulushi.' },
    { label: 'Talabalar ulushi', value: `${students} ta`, percent: Math.round((students / totalUsers) * 100), color: 'bg-gradient-to-r from-violet-500 to-fuchsia-500', hint: 'Barcha foydalanuvchilar ichida talabalar soni.' },
    { label: "O'qituvchilar ulushi", value: `${teachers} ta`, percent: Math.round((teachers / totalUsers) * 100), color: 'bg-gradient-to-r from-amber-500 to-orange-500', hint: "Barcha foydalanuvchilar ichida o'qituvchilar soni." }
  ]
})

const focusCards = computed(() => [
  { title: 'Topshirilmagan testlar', value: testsData.value.pendingTaskCount || 0, caption: 'Talaba hali yakunlamagan yoki muddati tugamagan testlar.', icon: 'bolt' },
  { title: 'Topshiriq javoblari', value: assignmentsData.value.submissionCount || 0, caption: "Topshiriqlar bo'yicha yuborilgan javoblar soni.", icon: 'move_to_inbox' },
  { title: 'Talabalar', value: testsData.value.studentCount || 0, caption: 'Tizimdagi asosiy auditoriya hajmi.', icon: 'school' },
  { title: "O'qituvchilar", value: testsData.value.teacherCount || 0, caption: 'Test va topshiriq yaratadigan foydalanuvchilar.', icon: 'co_present' }
])

const recentActivity = computed(() => {
  const tests = (testsData.value.recentTests || []).map(item => ({ id: `test-${item.id}`, title: item.name, subtitle: `${item.teacher?.firstname || ''} ${item.teacher?.lastname || ''} tomonidan qo'shilgan test`, time: formatDate(item.createdAt), icon: 'assignment', iconWrap: 'bg-gradient-to-br from-blue-500 to-cyan-500', createdAt: item.createdAt }))
  const assignments = (assignmentsData.value.recentAssignments || []).map(item => ({ id: `assignment-${item.id}`, title: item.name, subtitle: `${item.teacher?.firstname || ''} ${item.teacher?.lastname || ''} tomonidan biriktirilgan topshiriq`, time: formatDate(item.createdAt), icon: 'inventory_2', iconWrap: 'bg-gradient-to-br from-teal-500 to-emerald-500', createdAt: item.createdAt }))
  return [...assignments, ...tests].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8)
})

const formatDate = (date) => date ? new Date(date).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Hozir'

onMounted(loadData)
</script>
