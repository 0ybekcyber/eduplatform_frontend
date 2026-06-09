<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-4 rounded border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-800">Hisobotlar</h1>
        <p class="mt-1 text-[12px] text-slate-500">
          Testlar, topshiriqlar, o'quvchilar va o'qituvchilar bo'yicha aniq jamlanma.
        </p>
        <p v-if="reports.generatedAt" class="mt-1 text-[11px] font-bold text-slate-400">
          Yangilangan vaqt: {{ formatDate(reports.generatedAt) }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button @click="loadReports" class="inline-flex items-center gap-2 rounded bg-slate-100 px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-200">
          <span class="material-icons text-base">refresh</span>
          Yangilash
        </button>
        <button @click="exportCurrentCsv" class="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-blue-700">
          <span class="material-icons text-base">download</span>
          CSV yuklash
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="rounded border border-slate-200 bg-white py-20 text-center text-sm font-bold text-slate-400">
      Hisobotlar yuklanmoqda...
    </div>

    <template v-else>
      <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in summaryCards" :key="card.label" class="rounded border border-slate-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{{ card.label }}</p>
              <p class="mt-2 text-2xl font-black text-slate-900">{{ card.value }}</p>
              <p class="mt-1 text-[11px] text-slate-500">{{ card.caption }}</p>
            </div>
            <span class="material-icons rounded bg-slate-50 p-2 text-slate-400">{{ card.icon }}</span>
          </div>
        </div>
      </section>

      <div class="flex flex-wrap gap-2 rounded border border-slate-200 bg-white p-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="inline-flex items-center gap-2 rounded px-4 py-2 text-[12px] font-black transition-all"
          :class="activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'"
        >
          <span class="material-icons text-base">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div class="rounded border border-slate-200 bg-white">
        <div class="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-sm font-black text-slate-800">{{ currentTitle }}</h2>
            <p class="mt-1 text-[11px] text-slate-400">{{ filteredRows.length }} ta yozuv</p>
          </div>
              <div class="relative w-full md:w-80">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-200">search1</span>
            <input v-model="search" class="w-full rounded border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white" placeholder=" Yangi qidirish..." />
          </div>
          <div class="relative w-full md:w-80">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-300">search</span>
            <input v-model="search" class="w-full rounded border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white" placeholder="Qidirish..." />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-[12px]">
            <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th v-for="column in currentColumns" :key="column.key" class="whitespace-nowrap px-4 py-3">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="filteredRows.length === 0">
                <td :colspan="currentColumns.length" class="px-4 py-12 text-center font-bold text-slate-400">Ma'lumot topilmadi</td>
              </tr>
              <tr v-for="row in filteredRows" :key="`${activeTab}-${row.id}`" class="hover:bg-slate-50">
                <td v-for="column in currentColumns" :key="column.key" class="whitespace-nowrap px-4 py-3 text-slate-600">
                  <span :class="column.strong ? 'font-black text-slate-800' : ''">{{ formatCell(row, column) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../api'

const isLoading = ref(true)
const activeTab = ref('tests')
const search1 = ref('')
const search = ref('')
const reports = ref({
  generatedAt: null,
  summary: {},
  tests: [],
  assignments: [],
  teachers: [],
  students: []
})

const tabs = [
  { key: 'tests', label: 'Testlar', icon: 'assignment' },
  { key: 'assignments', label: 'Topshiriqlar', icon: 'inventory_2' },
  { key: 'teachers', label: "O'qituvchilar", icon: 'co_present' },
  { key: 'students', label: "O'quvchilar", icon: 'school' }
]

const columns = {
  tests: [
    { key: 'name', label: 'Test nomi', strong: true },
    { key: 'teacherName', label: "O'qituvchi" },
    { key: 'questionCount', label: 'Savollar' },
    { key: 'assignedStudents', label: 'Biriktirilgan' },
    { key: 'completedCount', label: 'Topshirgan' },
    { key: 'pendingCount', label: 'Topshirmagan' },
    { key: 'completionPercent', label: 'Bajarilish %', suffix: '%' },
    { key: 'averagePercent', label: "O'rtacha %", suffix: '%' },
    { key: 'averageScore', label: "O'rtacha ball" },
    { key: 'deadline', label: 'Muddat', type: 'date' }
  ],
  assignments: [
    { key: 'name', label: 'Topshiriq nomi', strong: true },
    { key: 'teacherName', label: "O'qituvchi" },
    { key: 'assignedStudents', label: 'Biriktirilgan' },
    { key: 'submittedCount', label: 'Yuborgan' },
    { key: 'pendingCount', label: 'Yubormagan' },
    { key: 'gradedCount', label: 'Baholangan' },
    { key: 'ungradedCount', label: 'Baholanmagan' },
    { key: 'submissionPercent', label: 'Yuborish %', suffix: '%' },
    { key: 'averageGrade', label: "O'rtacha baho" },
    { key: 'deadline', label: 'Muddat', type: 'date' }
  ],
  teachers: [
    { key: 'name', label: "O'qituvchi", strong: true },
    { key: 'role', label: 'Rol' },
    { key: 'phone', label: 'Telefon' },
    { key: 'testsCount', label: 'Testlar' },
    { key: 'questionsCount', label: 'Savollar' },
    { key: 'testResultsCount', label: 'Test natijalari' },
    { key: 'averageTestPercent', label: "O'rtacha test %", suffix: '%' },
    { key: 'assignmentsCount', label: 'Topshiriqlar' },
    { key: 'assignmentSubmissionsCount', label: 'Javoblar' },
    { key: 'gradedSubmissionsCount', label: 'Baholangan' },
    { key: 'averageAssignmentGrade', label: "O'rtacha baho" }
  ],
  students: [
    { key: 'name', label: "O'quvchi", strong: true },
    { key: 'facultyName', label: 'Fakultet' },
    { key: 'groupName', label: 'Guruh' },
    { key: 'assignedTestsCount', label: 'Testlar' },
    { key: 'completedTestsCount', label: 'Topshirgan test' },
    { key: 'pendingTestsCount', label: 'Qolgan test' },
    { key: 'averageTestPercent', label: "O'rtacha test %", suffix: '%' },
    { key: 'assignedAssignmentsCount', label: 'Topshiriqlar' },
    { key: 'submittedAssignmentsCount', label: 'Yuborgan' },
    { key: 'pendingAssignmentsCount', label: 'Qolgan' },
    { key: 'averageAssignmentGrade', label: "O'rtacha baho" }
  ]
}

const loadReports = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/reports/admin')
    reports.value = res.data || reports.value
  } catch (e) {
    alert(e.response?.data?.message || 'Hisobotlarni yuklashda xatolik yuz berdi')
  } finally {
    isLoading.value = false
  }
}

const summaryCards = computed(() => {
  const summary = reports.value.summary || {}
  return [
    { label: 'Testlar', value: summary.testsCount || 0, caption: `${summary.testResultsCount || 0} ta natija`, icon: 'assignment' },
    { label: 'Topshiriqlar', value: summary.assignmentsCount || 0, caption: `${summary.assignmentSubmissionsCount || 0} ta javob`, icon: 'inventory_2' },
    { label: "O'quvchilar", value: summary.studentsCount || 0, caption: 'Tizimdagi studentlar', icon: 'school' },
    { label: "O'qituvchilar", value: summary.teachersCount || 0, caption: 'Test/topshiriq yaratuvchilar', icon: 'co_present' }
  ]
})

const currentColumns = computed(() => columns[activeTab.value] || [])
const currentRows = computed(() => reports.value[activeTab.value] || [])
const currentTitle = computed(() => tabs.find(tab => tab.key === activeTab.value)?.label || 'Hisobot')

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return currentRows.value
  return currentRows.value.filter(row => JSON.stringify(row).toLowerCase().includes(q))
})

const formatDate = (value) => value ? new Date(value).toLocaleString('uz-UZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}) : '-'

const formatCell = (row, column) => {
  const value = row[column.key]
  if (column.type === 'date') return formatDate(value)
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') {
    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '')
    return `${formatted}${column.suffix || ''}`
  }
  return `${value}${column.suffix || ''}`
}

const exportCurrentCsv = () => {
  const header = currentColumns.value.map(column => column.label)
  const rows = filteredRows.value.map(row => currentColumns.value.map(column => formatCell(row, column)))
  const csv = [header, ...rows]
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `hisobot-${activeTab.value}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

watch(activeTab, () => {
  search.value = ''
})

onMounted(loadReports)
</script>
