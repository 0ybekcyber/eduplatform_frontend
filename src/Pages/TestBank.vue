<template>
    <div class="space-y-4 animate-in fade-in duration-500">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded border border-slate-200">
            <div>
                <h1 class="text-lg font-bold text-slate-800">Testlar bazasi</h1>
                <p class="text-slate-500 text-[12px] mt-0.5">Fanlar bo'yicha Excel savollar bazasini boshqarish.</p>
            </div>
            <button @click="$router.push('/tests')" 
                class="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded text-[12px] font-bold hover:bg-slate-200 transition-all shadow-sm active:scale-95">
                <span class="material-icons text-lg">assignment</span>
                <span>Testlarga o'tish</span>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded border border-slate-200 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami testlar</p>
                <p class="mt-2 text-3xl font-black text-slate-800">{{ questionBankStats.testCount || 0 }}</p>
            </div>
            <div class="bg-white rounded border border-slate-200 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bazadagi savollar</p>
                <p class="mt-2 text-3xl font-black text-blue-600">{{ questionBankStats.count || 0 }}</p>
            </div>
            <div class="bg-white rounded border border-slate-200 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fan bazalari</p>
                <p class="mt-2 text-3xl font-black text-emerald-600">{{ questionBankSubjects.length }}</p>
            </div>
        </div>

        <section class="bg-white rounded border border-slate-200 overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 class="text-sm font-bold text-slate-800">Excel orqali bazaga yuklash</h2>
                    <p class="text-[12px] text-slate-500 mt-0.5">Yuklanayotgan savollar qaysi fan bazasiga tegishli ekanini fan nomi orqali belgilang.</p>
                </div>
                <button @click="downloadSampleExcel" type="button" class="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[11px] font-bold hover:bg-blue-100 transition-colors">
                    <span class="material-icons text-base">download</span>
                    Namuna Excel
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0">
                <div class="p-5 border-b lg:border-b-0 lg:border-r border-slate-100 space-y-4">
                    <div>
                        <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Fan nomi</label>
                        <input v-model="bankUploadSubject" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder="Masalan: Matematika" />
                    </div>
                    <label class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[12px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer" :class="bankLoading ? 'opacity-60 pointer-events-none' : ''">
                        <span class="material-icons text-lg">upload_file</span>
                        {{ bankLoading ? 'Yuklanmoqda...' : 'Excelni bazaga yuklash' }}
                        <input type="file" @change="handleBankExcelUpload" accept=".xlsx, .xls" class="hidden" />
                    </label>
                    <p class="text-[11px] text-slate-500 leading-relaxed">
                        Format: A ustun savol, B-E variantlar, F to'g'ri javob. Kamida 2 ta variant va to'g'ri javob matni bo'lishi kerak.
                    </p>
                </div>

                <div class="p-5">
                    <div v-if="isLoading" class="min-h-48 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <span class="text-[11px] font-medium uppercase tracking-wider">Yuklanmoqda...</span>
                    </div>
                    <div v-else-if="questionBankSubjects.length === 0" class="h-full min-h-48 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded bg-slate-50/60">
                        <span class="material-icons text-3xl text-slate-300 mb-2">storage</span>
                        <p class="text-sm font-bold text-slate-500">Hali fan bazasi yaratilmagan</p>
                        <p class="text-[11px] text-slate-400 mt-1">Fan nomini kiriting va Excel yuklang.</p>
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <div v-for="subject in questionBankSubjects" :key="subject.subject"
                            class="text-left p-4 rounded border border-slate-200 bg-slate-50">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="text-sm font-black text-slate-800 truncate">{{ subject.subject }}</p>
                                    <p class="text-[11px] text-slate-500 mt-1">Ushbu fan bazasidagi savollar</p>
                                </div>
                                <span class="material-icons text-lg text-blue-500">storage</span>
                            </div>
                            <p class="mt-4 text-2xl font-black text-blue-600">{{ subject.count }} <span class="text-[11px] text-slate-400 font-bold">ta</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import api from '../api'

const isLoading = ref(true)
const bankLoading = ref(false)
const bankUploadSubject = ref('')
const questionBankStats = ref({ count: 0, testCount: 0, subjects: [] })

const questionBankSubjects = computed(() => questionBankStats.value.subjects || [])

const loadQuestionBankStats = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/tests/question-bank/stats')
        questionBankStats.value = res.data || { count: 0, testCount: 0, subjects: [] }
    } catch (e) {
        questionBankStats.value = { count: 0, testCount: 0, subjects: [] }
    } finally {
        isLoading.value = false
    }
}

const parseExcelQuestions = (arrayBuffer) => {
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    const rows = jsonData.slice(1)

    return rows.map(row => {
        if (!row[0]) return null
        const opts = [
            (row[1] || '').toString().trim(),
            (row[2] || '').toString().trim(),
            (row[3] || '').toString().trim(),
            (row[4] || '').toString().trim()
        ].filter(Boolean)
        const correctText = (row[5] || '').toString().trim()
        const correctIdx = opts.findIndex(option => option.toLowerCase() === correctText.toLowerCase())

        if (opts.length < 2 || !correctText || correctIdx === -1) return null

        return {
            text: row[0].toString().trim(),
            options: opts,
            correctAnswer: opts[correctIdx],
            correctAnswerIndex: correctIdx
        }
    }).filter(Boolean)
}

const readExcelFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            resolve(parseExcelQuestions(e.target.result))
        } catch (err) {
            reject(err)
        }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
})

const handleBankExcelUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    const subject = bankUploadSubject.value.trim()
    if (!subject) {
        event.target.value = ''
        return alert('Avval fan nomini kiriting!')
    }

    bankLoading.value = true
    try {
        const questions = await readExcelFile(file)
        if (questions.length === 0) return alert('Excel faylda bazaga saqlash uchun yaroqli savollar topilmadi.')
        const res = await api.post('/tests/question-bank/import', { subject, questions })
        await loadQuestionBankStats()
        alert(`${subject} fan bazasiga ${res.data?.imported || questions.length} ta savol saqlandi.`)
        event.target.value = ''
    } catch (err) {
        console.error(err)
        alert(err.response?.data?.message || 'Savollarni bazaga yuklashda xatolik yuz berdi.')
    } finally {
        bankLoading.value = false
    }
}

const downloadSampleExcel = () => {
    const data = [
        ["Savol", "Variant 1", "Variant 2", "Variant 3", "Variant 4", "To'g'ri javob"],
        ["O'zbekiston poytaxti qayer?", "Samarqand", "Buxoro", "Toshkent", "Xiva", "Toshkent"],
        ["Vite nima?", "Frontend build tool", "Ma'lumotlar bazasi", "Operatsion tizim", "Design pattern", "Frontend build tool"]
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Savollar")
    XLSX.writeFile(workbook, "test_baza_namuna.xlsx")
}

onMounted(loadQuestionBankStats)
</script>
