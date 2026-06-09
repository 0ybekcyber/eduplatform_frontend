<template>
    <div class="space-y-4 animate-in fade-in duration-500">
        
        <!-- Header Section (Skromni Design) -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded border border-slate-200">
            <div>
                <h1 class="text-lg font-bold text-slate-800">
                    {{ userStore.user?.role === 'Student' ? 'Mening testlarim' : 'Testlar boshqaruvi' }}
                </h1>
                <p class="text-slate-500 text-[12px] mt-0.5">Tizimdagi barcha faol testlar ro'yxati (Jami: {{ filteredTests.length }})</p>
            </div>
            
            <button v-if="userStore.user?.role !== 'Student'" @click="openCreateModal" 
                class="flex items-center gap-2 px-4 py-2 bg-[#1e88e5] text-white rounded text-[12px] font-bold hover:bg-[#1565c0] transition-all shadow-sm active:scale-95">
                <span class="material-icons text-lg">add</span>
                <span>Yangi test yaratish</span>
            </button>
        </div>

        <!-- Tests List Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center gap-4 text-slate-400 col-span-full">
                <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                <span class="text-[11px] font-medium uppercase tracking-wider">Yuklanmoqda...</span>
            </div>

            <div v-else-if="filteredTests.length === 0" class="py-20 flex flex-col items-center justify-center bg-white rounded border border-slate-200 col-span-full text-center">
                <span class="material-icons text-3xl text-slate-100 mb-2">find_in_page</span>
                <p class="text-slate-400 text-sm font-bold">Ma'lumotlar topilmadi</p>
            </div>

            <!-- Test Card (HEMIS Style) -->
            <div v-for="(test, index) in filteredTests" :key="test.id" 
                class="bg-white rounded border border-slate-200 flex flex-col hover:border-blue-400 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden group">
                
                <!-- Status Accent (Top) -->
                <div class="h-1 w-full"
                    :class="[
                        userStore.user?.role === 'Student' && hasSolved(test.id) ? 'bg-emerald-500' : 
                        isDeadlinePassed(test.deadline) ? 'bg-rose-500' : 'bg-[#1e88e5]'
                    ]">
                </div>

                <div class="p-4 flex flex-col h-full">
                    <!-- Date & Badge -->
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tight"
                            :class="isDeadlinePassed(test.deadline) ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'">
                            {{ isDeadlinePassed(test.deadline) ? 'Yakunlangan' : 'Faol' }}
                        </span>
                        <div class="flex items-center gap-1 text-slate-400">
                             <span class="material-icons text-[14px]">calendar_today</span>
                             <span class="text-[10px] font-medium">{{ formatDate(test.deadline) }}</span>
                        </div>
                    </div>

                    <h3 class="text-[14px] font-bold text-slate-800 leading-snug mb-2 line-clamp-2 h-10 group-hover:text-[#1e88e5] transition-colors">
                        {{ test.name }}
                    </h3>

                    <p class="text-[11px] text-slate-400 line-clamp-1 mb-4 italic">
                        {{ test.description || 'Izohsiz' }}
                    </p>

                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100/50">
                            <span class="material-icons text-[14px] opacity-40">timer</span>
                            <span>{{ test.duration }} min</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100/50">
                            <span class="material-icons text-[14px] opacity-40">list_alt</span>
                            <span>{{ getVisibleQuestionCount(test) }} ta savol</span>
                        </div>
                        <div v-if="test.isBankRandomized" class="col-span-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-100">
                            <span class="material-icons text-[14px] opacity-60">shuffle</span>
                            <span>{{ test.bankSubject }} bazasidan har talabaga aralash random</span>
                        </div>
                        <div class="col-span-2 flex items-center gap-1.5 text-[11px] text-blue-600 bg-blue-50 p-1.5 rounded border border-blue-100">
                            <span class="material-icons text-[14px] opacity-60">workspace_premium</span>
                            <span>{{ formatScore(test.maxScore || 100) }} ballik test</span>
                        </div>
                    </div>

                    <!-- Student Results Area -->
                    <div v-if="userStore.user?.role === 'Student' && hasSolved(test.id)" 
                        class="p-2.5 bg-emerald-50 rounded border border-emerald-100 mb-4 flex items-center justify-between">
                        <span class="text-[10px] font-bold text-emerald-700 uppercase">Natija:</span>
                        <span class="text-[13px] font-black text-slate-800">
                            {{ formatScore(getSolvedData(test.id)?.earnedScore ?? ((getSolvedData(test.id)?.percentage || 0) * (test.maxScore || 100) / 100)) }}/{{ formatScore(test.maxScore || 100) }} ball
                            <span class="text-[10px] text-slate-400 font-bold ml-1">({{ Math.round(getSolvedData(test.id)?.percentage || 0) }}%)</span>
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="mt-auto pt-3 border-t border-slate-100 flex gap-2">
                        <template v-if="userStore.user?.role !== 'Student'">
                            <button @click="openResultsModal(test)" 
                                class="flex-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold hover:bg-slate-200 transition-all">
                                Natijalar
                            </button>
                            <button @click="openEditModal(test)" 
                                class="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-amber-100 hover:text-amber-600 border border-slate-100 transition-all">
                                <span class="material-icons text-[18px]">edit</span>
                            </button>
                            <button @click="confirmDelete(test)" 
                                class="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-red-100 hover:text-red-600 border border-slate-100 transition-all">
                                <span class="material-icons text-[18px]">delete_outline</span>
                            </button>
                        </template>
                        <template v-else>
                            <button v-if="hasSolved(test.id)" @click="viewDetail(getSolvedData(test.id)?.id)" 
                                class="w-full py-1.5 bg-white border border-slate-200 text-slate-600 rounded text-[11px] font-bold hover:bg-slate-50 transition-all">
                                Batafsil
                            </button>
                            <button v-else @click="startSolving(test)" :disabled="isDeadlinePassed(test.deadline)" 
                                class="flex-1 py-1.5 bg-[#1e88e5] text-white rounded text-[11px] font-bold hover:bg-[#1565c0] transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200">
                                {{ isDeadlinePassed(test.deadline) ? "Muddati o'tgan" : "Topshirish" }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Full Screen Interface -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showModal" class="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col overflow-hidden">
                    <!-- Header -->
                    <div class="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                        <div class="flex items-center gap-4">
                            <button @click="closeModal" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                <span class="material-icons text-xl">arrow_back</span>
                            </button>
                            <h3 class="text-sm font-bold text-slate-800">{{ editing.id ? 'Testni Tahrirlash' : 'Yangi Test Yaratish' }}</h3>
                        </div>
                        <div class="flex gap-2">
                            <button @click="closeModal" class="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded transition-all">Bekor qilish</button>
                            <button @click="submitForm" class="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:bg-blue-700 transition-all">Saqlash</button>
                        </div>
                    </div>

                    <!-- Page Content -->
                    <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <!-- Left: Settings -->
                        <div class="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-6 custom-scrollbar shrink-0">
                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Test Nomi</label>
                                <input v-model="editing.name" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder="Masalan: Ona tili fanidan test..." />
                            </div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Tavsif (Ixtiyoriy)</label>
                                <textarea v-model="editing.description" rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder="Test haqida qisqacha ma'lumot..."></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Davomiyligi</label>
                                    <div class="relative">
                                        <input v-model="editing.duration" type="number" class="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:bg-white focus:border-blue-500" />
                                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold uppercase">Daq</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Test bali</label>
                                    <input v-model.number="editing.maxScore" type="number" min="1" step="0.1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:bg-white focus:border-blue-500" />
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Muddati</label>
                                    <input v-model="editing.deadline" type="datetime-local" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:bg-white focus:border-blue-500" />
                                </div>
                            </div>

                            <div class="h-px bg-slate-100"></div>

                            <div>
                                <label class="block text-[11px] font-bold text-slate-400 uppercase mb-2">Fakultet va Guruhlar</label>
                                <div class="space-y-4">
                                    <!-- Faculties Checkbox List -->
                                    <div class="space-y-2">
                                        <p class="text-[10px] font-bold text-slate-500">Fakultetlarni tanlang:</p>
                                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                                            <label v-for="f in faculties" :key="f.id" class="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer group/item">
                                                <input type="checkbox" :value="f.id" v-model="editing.facultyIds" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <span class="text-xs font-medium text-slate-600 group-hover/item:text-blue-600">{{ f.name }}</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <!-- Groups Checkbox List -->
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <p class="text-[10px] font-bold text-slate-500">Guruhlarni tanlang:</p>
                                            <button v-if="groupsOfSelectedFaculties.length > 0" @click="selectAllGroups" type="button" class="text-[9px] font-bold text-blue-500 hover:underline px-1">Barchasini tanlash</button>
                                        </div>
                                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                                            <div v-if="groupsOfSelectedFaculties.length === 0" class="py-4 text-center">
                                                <p class="text-[10px] text-slate-400 italic">Avval fakultetni tanlang</p>
                                            </div>
                                            <label v-for="g in groupsOfSelectedFaculties" :key="g.id" class="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer group/item">
                                                <input type="checkbox" :value="g.id" v-model="editing.groupIds" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <span class="text-xs font-medium text-slate-600 group-hover/item:text-blue-600">{{ g.name }}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Students Checkbox List -->
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <p class="text-[10px] font-bold text-slate-500">O'quvchilarni tanlang:</p>
                                            <button v-if="studentsOfSelectedGroups.length > 0" @click="selectAllStudents" type="button" class="text-[9px] font-bold text-blue-500 hover:underline px-1">Barchasini tanlash</button>
                                        </div>
                                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                                            <div v-if="studentsOfSelectedGroups.length === 0" class="py-4 text-center">
                                                <p class="text-[10px] text-slate-400 italic">Avval guruhni tanlang</p>
                                            </div>
                                            <label v-for="student in studentsOfSelectedGroups" :key="student.id" class="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer group/item">
                                                <input type="checkbox" :value="student.id" v-model="editing.studentIds" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <span class="text-xs font-medium text-slate-600 group-hover/item:text-blue-600">{{ student.firstname }} {{ student.lastname }}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Questions -->
                        <div class="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                            <div class="max-w-4xl mx-auto space-y-6">
                                <div class="flex items-center justify-between">
                                    <h4 class="text-sm font-bold text-slate-700">Savollar ({{ editing.questions.length }})</h4>
                                    <div class="flex gap-2">
                                        <label class="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer">
                                            Excel Yuklash
                                            <input type="file" @change="handleExcelUpload" accept=".xlsx, .xls" class="hidden" />
                                        </label>
                                        <button @click="addQuestion" type="button" class="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[11px] font-bold hover:bg-blue-100 transition-colors">Savol Qo'shish</button>
                                    </div>
                                </div>

                                <!-- Excel Hint -->
                                <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                                    <div class="flex-1 space-y-1">
                                        <p class="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Format Yo'riqnomasi</p>
                                        <p class="text-[11px] text-slate-500 leading-relaxed">
                                            A: Savol matni, B-E: Variantlar, F: To'g'ri javob matni.
                                        </p>
                                    </div>
                                    <button @click="downloadSampleExcel" type="button" class="text-[10px] font-bold text-blue-500 hover:underline">Namunani yuklab olish</button>
                                </div>

                                <div class="p-4 bg-white border border-blue-100 rounded-lg shadow-sm space-y-3">
                                    <div class="flex items-start justify-between gap-3">
                                        <div>
                                            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Fan bazasidan test tuzish</p>
                                            <p class="text-[11px] text-slate-500 mt-1">Fan va savollar sonini belgilang. Har bir talabaga shu bazadan alohida random savollar tushadi.</p>
                                        </div>
                                        <button @click="$router.push('/test-bank')" type="button" class="text-[10px] font-bold text-blue-500 hover:underline">Bazani boshqarish</button>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
                                        <select v-model="selectedBankSubject" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:bg-white focus:border-blue-500">
                                            <option value="">Fan bazasini tanlang</option>
                                            <option v-for="subject in questionBankSubjects" :key="subject.subject" :value="subject.subject">
                                                {{ subject.subject }} - {{ subject.count }} ta
                                            </option>
                                        </select>
                                        <input v-model.number="bankQuestionCount" type="number" min="1" :max="selectedBankSubjectCount || 1000" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:bg-white focus:border-blue-500" placeholder="Soni" />
                                        <button @click="fillQuestionsFromBank" :disabled="bankLoading" type="button" class="px-4 py-2 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800 transition-colors disabled:opacity-60">
                                            {{ bankLoading ? 'Sozlanmoqda...' : 'Random rejimni yoqish' }}
                                        </button>
                                    </div>
                                    <div v-if="editing.isBankRandomized" class="rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
                                        {{ editing.bankSubject }} bazasidan har bir talabaga {{ editing.bankQuestionCount }} ta aralash random savol beriladi. Savollar imkon qadar takrorlanmaydi, baza yetmasa oz qismi qayta ishlatiladi.
                                    </div>
                                </div>

                                <div class="grid gap-4 pb-20">
                                    <div v-for="(q, index) in editing.questions" :key="index" class="p-6 bg-white border border-slate-200 rounded-lg shadow-sm relative group/q">
                                        <button @click="removeQuestion(index)" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                                            <span class="material-icons text-lg">delete</span>
                                        </button>
                                        
                                        <div class="space-y-4">
                                            <div class="flex gap-3">
                                                <span class="shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">{{ index + 1 }}</span>
                                                <textarea v-model="q.text" rows="2" class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded text-sm focus:bg-white outline-none transition-all" placeholder="Savol matni..."></textarea>
                                            </div>
                                            
                                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                                                <div v-for="(opt, optIdx) in 4" :key="optIdx" class="relative">
                                                    <input v-model="q.options[optIdx]" 
                                                        @input="q.correctAnswerIndex === optIdx ? q.correctAnswer = q.options[optIdx] : null"
                                                        class="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded text-xs focus:bg-white outline-none" :placeholder="'Variant ' + (optIdx + 1)" />
                                                    <div class="absolute inset-y-0 left-3 flex items-center">
                                                        <input type="radio" :name="'correct_'+index" :value="q.options[optIdx]" 
                                                            @change="q.correctAnswerIndex = optIdx"
                                                            v-model="q.correctAnswer" class="w-4 h-4 text-blue-600 border-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="editing.questions.length === 0" class="py-20 text-center bg-white border border-dashed border-slate-200 rounded-lg">
                                        <p class="text-xs text-slate-400 font-medium">Savollar qo'shilmagan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- Detailed Result View -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="detailView" class="fixed inset-0 z-[9999] bg-[#F1F5F9] flex flex-col overflow-hidden">
                    <div class="px-8 py-4 bg-white border-b border-slate-200 text-[11px] font-black text-slate-400 flex items-center justify-between uppercase tracking-[0.2em] print-hidden">
                        <div class="flex items-center gap-3">
                            <div class="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                            Bosh sahifa <span class="text-slate-300">/</span> {{ detailView.TestModel?.name }}
                        </div>
                        <button @click="detailView = null; testResultsView = null" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                            <span class="material-icons text-lg">close</span>
                        </button>
                    </div>

                <div class="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar">
                    <div id="printable-content" class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 pb-20">
                        <!-- Questions List -->
                        <div class="flex-1 space-y-8">
                            <div class="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-200/60 overflow-hidden relative">
                                <div class="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                                <h3 class="text-3xl font-black text-slate-800 mb-2 relative z-10">{{ detailView.TestModel?.name }}</h3>
                                <p class="text-slate-400 font-bold relative z-10 uppercase tracking-widest text-xs">Test natijalari hisoboti</p>
                            </div>

                            <div v-for="(q, idx) in detailQuestions" :key="q.id || idx" 
                                class="bg-white border border-slate-200/60 rounded-[2rem] p-8 lg:p-10 space-y-6 shadow-sm hover:border-blue-100 transition-colors group">
                                <h4 class="text-xl font-black text-slate-800 leading-snug flex gap-4">
                                    <span class="text-blue-200 group-hover:text-blue-500 transition-colors">{{ (idx + 1).toString().padStart(2, '0') }}</span>
                                    {{ displayQuestionText(q.text) }}
                                </h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div v-for="opt in q.options" :key="opt" 
                                        class="p-4 px-6 rounded-2xl flex items-center gap-4 text-sm font-bold border-2 transition-all relative overflow-hidden"
                                        :class="getAnswerStyle(q, opt)">
                                        <span class="material-icons text-lg shrink-0">
                                            {{ getAnswerIcon(q, opt) }}
                                        </span>
                                        <span class="relative z-10">{{ opt }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar Info -->
                        <div class="w-full lg:w-96 shrink-0 space-y-6">
                            <div class="bg-white border border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-[2rem] overflow-hidden sticky top-0 transition-all">
                                <div class="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h5 class="text-xs font-black text-slate-800 uppercase tracking-widest">Natijalar Varog'i</h5>
                                    <span class="material-icons text-blue-600">verified</span>
                                </div>
                                <div class="divide-y divide-slate-50 text-[13px] font-bold text-slate-700">
                                    <div class="p-5 px-10 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Test</span><span class="text-right">{{ detailView.TestModel?.name }}</span></div>
                                    <div class="p-5 px-10 bg-slate-50/30 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Talaba</span><span class="uppercase text-right">{{ detailView.student?.lastname }} {{ detailView.student?.firstname }}</span></div>
                                    <div class="p-5 px-10 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Fakultet</span><span class="text-right">{{ detailView.student?.FacultyModel?.name || 'Kiritilmagan' }}</span></div>
                                    <div class="p-5 px-10 bg-slate-50/30 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Guruh</span><span class="text-right">{{ detailView.student?.GroupModel?.name || 'Kiritilmagan' }}</span></div>
                                    <div class="p-5 px-10 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Vaqt</span><span>{{ formatDate(detailView.startTime) }}</span></div>
                                    <div class="p-5 px-10 bg-slate-50/30 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">To'g'ri</span><span class="text-emerald-600">{{ detailView.score }} / {{ detailView.totalQuestions || detailQuestions.length }}</span></div>
                                    <div class="p-5 px-10 flex justify-between gap-4"><span class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Ball</span><span class="text-blue-600">{{ formatScore(detailView.earnedScore ?? ((detailView.percentage || 0) * (detailView.TestModel?.maxScore || 100) / 100)) }} / {{ formatScore(detailView.TestModel?.maxScore || 100) }}</span></div>
                                    <div class="p-8 px-10 flex justify-between items-center bg-blue-600 text-white">
                                        <span class="font-black text-[10px] uppercase tracking-widest">Umumiy Ball</span>
                                        <span class="text-4xl font-black tracking-tighter">{{ detailView.percentage }}%</span>
                                    </div>
                                </div>
                                <div class="p-8">
                                    <button @click="downloadPdf" :disabled="isDownloadingPdf" class="w-full py-5 bg-[#1E293B] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all print-hidden disabled:opacity-60 disabled:cursor-wait">
                                        {{ isDownloadingPdf ? 'PDF tayyorlanmoqda...' : 'PDF yuklab olish' }}
                                    </button>
                                </div>
                            </div>
                            <button @click="detailView = null; testResultsView = null" 
                                class="w-full py-5 bg-white text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all print-hidden">
                                Orqaga qaytish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </transition>
        </Teleport>

        <!-- Teacher Results Table Modal -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="testResultsView" class="fixed inset-0 z-[9999] bg-[#F1F5F9] flex flex-col overflow-hidden">
                    <div class="px-8 py-5 bg-white border-b border-slate-200 text-[11px] font-black text-slate-400 flex justify-between items-center uppercase tracking-[0.2em]">
                        <div class="flex items-center gap-3">
                            <div class="w-1.5 h-4 bg-purple-600 rounded-full"></div>
                            Barcha natijalar <span class="text-slate-300">/</span> {{ testResultsView.name }}
                        </div>
                        <button @click="testResultsView = null" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all cursor-pointer">
                            <span class="material-icons text-xl">close</span>
                        </button>
                    </div>
                
                <div class="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar">
                    <div class="max-w-5xl mx-auto pb-20">
                        <div class="pb-10 mb-10 border-b border-slate-200 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                             <div>
                                <h3 class="text-4xl font-black text-slate-800 tracking-tight">{{ testResultsView.name }}</h3>
                                <p class="text-slate-500 font-medium mt-2">Ushbu testni topshirgan barcha talabalar natijalari yig'indisi</p>
                             </div>
                             <div class="flex items-center gap-4">
                                <div class="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topshirganlar</p>
                                    <p class="text-2xl font-black text-slate-800">{{ viewingResults.length }} <span class="text-slate-300">ta</span></p>
                                </div>
                             </div>
                        </div>
                        
                        <div v-if="resultsLoading" class="flex flex-col items-center justify-center py-40 gap-6 text-slate-300">
                             <div class="relative w-12 h-12">
                                <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div class="absolute inset-0 border-4 border-t-purple-600 rounded-full animate-spin"></div>
                             </div>
                             <span class="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400">Natijalar olinmoqda</span>
                        </div>
                        <div v-else-if="viewingResults.length === 0" class="flex flex-col items-center justify-center py-32 text-slate-400 space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                             <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <span class="material-icons text-5xl opacity-20">group_off</span>
                             </div>
                             <p class="font-black uppercase text-xs tracking-widest">Hozircha natijalar mavjud emas</p>
                        </div>
                        <div v-else class="grid grid-cols-1 gap-4">
                            <div v-for="res in viewingResults" :key="res.id" @click="viewDetail(res.id)" 
                                class="flex items-center justify-between p-8 bg-white rounded-[2rem] border border-slate-200/60 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group">
                                <div class="flex items-center gap-8">
                                    <div class="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all text-2xl shadow-inner">
                                        {{ res.student?.lastname?.[0] }}{{ res.student?.firstname?.[0] }}
                                    </div>
                                    <div>
                                        <p class="font-black text-2xl text-slate-800 group-hover:text-blue-600 transition-colors">{{ res.student?.lastname }} {{ res.student?.firstname }}</p>
                                        <div class="flex items-center gap-4 mt-2 flex-wrap">
                                            <p class="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                <span class="material-icons text-xs">phone</span> {{ res.student?.phone || 'Kiritilmagan' }}
                                            </p>
                                            <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <p class="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                <span class="material-icons text-xs">apartment</span> {{ res.student?.FacultyModel?.name || 'Fakultet yo`q' }}
                                            </p>
                                            <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <p class="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                <span class="material-icons text-xs">groups</span> {{ res.student?.GroupModel?.name || 'Guruh yo`q' }}
                                            </p>
                                            <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <p class="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                                <span class="material-icons text-xs">calendar_today</span> {{ formatDate(res.createdAt) }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right flex items-center gap-12">
                                    <div class="flex flex-col items-end">
                                        <p class="text-4xl font-black text-blue-600 tracking-tighter">{{ res.percentage }}%</p>
                                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{{ res.score }} / {{ res.totalQuestions }} TO'G'RI</p>
                                        <p class="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">{{ formatScore(res.earnedScore ?? ((res.percentage || 0) * (testResultsView?.maxScore || 100) / 100)) }} / {{ formatScore(testResultsView?.maxScore || 100) }} BALL</p>
                                    </div>
                                    <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <span class="material-icons">chevron_right</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </transition>
        </Teleport>

        <!-- Delete Confirm -->
        <Teleport to="body">
            <transition name="modal">
                <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
                    <div class="relative bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center animate-modal">
                        <div class="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span class="material-icons text-4xl">delete_forever</span>
                        </div>
                    <h3 class="text-2xl font-black text-slate-800 tracking-tight">O'chirib yuborilsinmi?</h3>
                    <p class="text-slate-500 font-medium text-sm mt-2">Bu testni o'chirib yuborsangiz, barcha natijalar ham o'chib ketadi.</p>
                    <div class="flex gap-4 mt-10">
                        <button @click="showDeleteModal = false" class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Yo'q</button>
                        <button @click="deleteTest" class="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200">Ha, o'chirilsin</button>
                    </div>
                </div>
            </div>
            </transition>
        </Teleport>

        <!-- Solving Interface -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="solving && !showResult" class="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col overflow-hidden">
                <!-- Header -->
                <div class="px-6 py-3 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                    <div class="flex flex-col">
                        <h2 class="text-sm font-bold text-slate-800">{{ solving.name }}</h2>
                        <p class="text-[10px] text-slate-400 font-medium">{{ solving.questions?.length }} ta savol</p>
                    </div>
                    
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Qolgan vaqt:</span>
                            <span class="text-lg font-bold tabular-nums" :class="timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700'">
                                {{ formatTime(timeLeft) }}
                            </span>
                        </div>
                        <div class="h-4 w-px bg-slate-200"></div>
                        <button @click="finishSolving" class="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors">
                            Yakunlash
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50/50 custom-scrollbar flex">
                    <div class="max-w-2xl mx-auto w-full flex flex-col gap-4">
                        
                        <!-- Progress info -->
                        <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-bold text-slate-500">Savol {{ activeQuestionIndex + 1 }} / {{ solving.questions?.length }}</span>
                                <span class="text-[10px] font-bold text-slate-400">{{ Math.round((answers.filter(a => a !== null).length / solving.questions?.length) * 100) }}% Bajarildi</span>
                            </div>
                            
                            <div class="flex flex-wrap gap-1.5">
                                <button v-for="(qListItem, idx) in solving.questions" :key="idx" 
                                    @click="activeQuestionIndex = idx"
                                    class="w-7 h-7 rounded font-bold text-[10px] flex items-center justify-center transition-all border"
                                    :class="[
                                        activeQuestionIndex === idx ? 'border-blue-500 bg-blue-500 text-white' : 
                                        answers[idx] !== null ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                                    ]">
                                    {{ idx + 1 }}
                                </button>
                            </div>
                        </div>

                        <!-- Question card -->
                        <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
                            <h3 class="text-sm font-bold text-slate-700 leading-relaxed mb-6">
                                {{ activeQuestionIndex + 1 }}. {{ displayQuestionText(currentQuestion.text) }}
                            </h3>
                            
                            <div class="grid gap-2">
                                <label v-for="(opt, optIndex) in currentQuestion.options" :key="optIndex" 
                                    class="p-3 px-4 rounded-lg flex items-center gap-3 text-slate-600 border transition-all cursor-pointer hover:bg-slate-50"
                                    :class="answers[activeQuestionIndex] === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'">
                                    
                                    <div class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                                        :class="answers[activeQuestionIndex] === opt ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'">
                                        <div v-if="answers[activeQuestionIndex] === opt" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                                    </div>
                                    <input type="radio" :name="'curr_q_' + activeQuestionIndex" :value="opt" v-model="answers[activeQuestionIndex]" class="hidden" />
                                    <span class="text-sm font-medium leading-tight">{{ opt }}</span>
                                </label>
                            </div>
                            
                            <!-- Nav buttons -->
                            <div class="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                                <button @click="activeQuestionIndex--" :disabled="activeQuestionIndex === 0" 
                                    class="text-[11px] font-bold py-2 px-4 rounded transition-all"
                                    :class="activeQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50'">
                                    Oldingi
                                </button>
                                
                                <div class="flex gap-2">
                                    <button v-if="activeQuestionIndex < solving.questions?.length - 1" @click="activeQuestionIndex++" 
                                        class="bg-blue-600 text-white text-[11px] font-bold py-2 px-6 rounded hover:bg-blue-700 transition-all">
                                        Keyingi
                                    </button>
                                    
                                    <button v-else @click="finishSolving" 
                                        class="bg-emerald-600 text-white text-[11px] font-bold py-2 px-6 rounded hover:bg-emerald-700 transition-all">
                                        Testni yakunlash
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </transition>
        </Teleport>

        <!-- Solving Result Screen -->
        <Teleport to="body">
            <transition name="modal">
                <div v-if="showResult" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"></div>
                <div class="relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] bg-white p-7 text-center shadow-2xl animate-modal sm:p-8 lg:p-10">
                    <!-- Background decoration -->
                    <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                    <div class="absolute -top-24 -left-24 w-44 h-44 bg-blue-50 rounded-full opacity-50"></div>
                    <div class="absolute -bottom-24 -right-24 w-44 h-44 bg-emerald-50 rounded-full opacity-50"></div>

                    <div class="relative z-10">
                        <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-emerald-100 bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-200/20">
                            <span class="material-icons text-4xl">emoji_events</span>
                        </div>
                        <h3 class="mb-1 text-3xl font-black tracking-tight text-slate-800">Tabriklaymiz!</h3>
                        <p class="mb-7 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Siz testni muvaffaqiyatli yakunladingiz</p>
                        
                        <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">To'g'ri javoblar</p>
                                <p class="text-3xl font-black text-slate-800">{{ score }} <span class="text-slate-300 text-lg">/ {{ solving?.questions?.length }}</span></p>
                            </div>
                            <div class="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Umumiy foiz</p>
                                <p class="text-3xl font-black text-blue-600">{{ solving?.questions?.length ? Math.round((score / solving.questions.length) * 100) : 0 }}%</p>
                            </div>
                            <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                                <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Hisoblangan ball</p>
                                <p class="text-3xl font-black text-emerald-600">{{ formatScore(solving?.questions?.length ? ((score / solving.questions.length) * (solving?.maxScore || 100)) : 0) }} <span class="text-emerald-300 text-lg">/ {{ formatScore(solving?.maxScore || 100) }}</span></p>
                            </div>
                        </div>
                        
                        <button @click="showResult = false; solving = null; loadData()" 
                            class="mx-auto block w-full max-w-xl rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98]">
                            Natijalarni saqlash va yopish
                        </button>
                    </div>
                </div>
            </div>
            </transition>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import api from '../api'
import { useUserStore } from '../stores/user'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const userStore = useUserStore()
const tests = ref([])
const faculties = ref([])
const groups = ref([])
const students = ref([])
const myResults = ref([])
const isLoading = ref(true)
const isDownloadingPdf = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const modalHistoryActive = ref(false)
const selectedBankSubject = ref('')
const bankQuestionCount = ref(null)
const bankLoading = ref(false)
const questionBankStats = ref({ count: 0, testCount: 0, subjects: [] })

const detailView = ref(null)
const testResultsView = ref(null)
const viewingResults = ref([])
const resultsLoading = ref(false)

const solving = ref(null)
const activeQuestionIndex = ref(0)
const answers = ref([])
const startTime = ref(null)
const timeLeft = ref(0)
const timer = ref(null)
const showResult = ref(false)
const score = ref(0)

const editing = ref({
    name: '',
    description: '',
    duration: 25,
    maxScore: 100,
    facultyIds: [],
    groupIds: [],
    studentIds: [],
    deadline: '',
    isBankRandomized: false,
    bankSubject: null,
    bankQuestionCount: null,
    questions: []
})

const deletingTest = ref(null)

const currentQuestion = computed(() => solving.value?.questions?.[activeQuestionIndex.value] || {})
const detailQuestions = computed(() => {
    const savedAnswers = Array.isArray(detailView.value?.answers) ? detailView.value.answers : []
    const answersWithQuestions = savedAnswers
        .filter(answer => answer.questionText)
        .map(answer => ({
            id: answer.questionId,
            text: answer.questionText,
            options: answer.options || [],
            correctAnswer: answer.correctAnswer
        }))

    return answersWithQuestions.length
        ? answersWithQuestions
        : (detailView.value?.TestModel?.questions || [])
})
const questionBankSubjects = computed(() => questionBankStats.value.subjects || [])
const selectedBankSubjectCount = computed(() => {
    return questionBankSubjects.value.find(item => item.subject === selectedBankSubject.value)?.count || 0
})

const displayQuestionText = (text) => {
    return (text || '').toString().replace(/^\s*\d+[\).\-\s]+/, '').trim()
}

const getVisibleQuestionCount = (test) => {
    return test?.isBankRandomized
        ? Number(test.bankQuestionCount || 0)
        : (test?.questions?.length || 0)
}

const loadData = async () => {
    isLoading.value = true
    try {
        const [testsRes, facultiesRes, groupsRes] = await Promise.all([
            api.get('/tests'),
            api.get('/faculties'),
            api.get('/groups'),
        ])
        tests.value = testsRes.data
        faculties.value = facultiesRes.data
        groups.value = groupsRes.data

        if (userStore.user?.role !== 'Student') {
            const usersRes = await api.get('/users')
            students.value = usersRes.data.filter(user => user.role === 'Student')
            await loadQuestionBankStats()
        } else {
            students.value = []
        }

        // Load student results separately so test loading isn't blocked by errors
        if (userStore.user?.role === 'Student') {
            try {
                const myResultsRes = await api.get('/results/my')
                myResults.value = myResultsRes.data
            } catch (e) {
                console.warn('[Tests] Could not load my results:', e.message)
                myResults.value = []
            }
        }
    } catch (e) { console.error(e) } 
    finally { setTimeout(() => isLoading.value = false, 400) }
}

const loadQuestionBankStats = async () => {
    try {
        const res = await api.get('/tests/question-bank/stats')
        questionBankStats.value = res.data || { count: 0, testCount: 0, subjects: [] }
        if (!selectedBankSubject.value && questionBankStats.value.subjects?.length) {
            selectedBankSubject.value = questionBankStats.value.subjects[0].subject
        }
    } catch (e) {
        questionBankStats.value = { count: 0, testCount: 0, subjects: [] }
    }
}

const filteredTests = computed(() => {
    if (userStore.user?.role !== 'Student') return tests.value
    
    const parseIds = (val) => {
        if (!val) return []
        if (Array.isArray(val)) return val.map(Number).filter(n => !isNaN(n) && n > 0)
        if (typeof val === 'string' && val.startsWith('[')) {
            try { return JSON.parse(val).map(Number).filter(n => !isNaN(n) && n > 0) } catch (e) { return [] }
        }
        const num = Number(val)
        return (!isNaN(num) && num > 0) ? [num] : []
    }

    const studentFacultyId = userStore.user?.facultyId ? Number(userStore.user.facultyId) : null
    const studentGroupId = userStore.user?.groupId ? Number(userStore.user.groupId) : null

    console.log('[Tests] Student facultyId:', studentFacultyId, 'groupId:', studentGroupId)
    console.log('[Tests] Total tests:', tests.value.length)

    return tests.value.filter(t => {
        const testFaculties = parseIds(t.facultyIds)
        const testGroups = parseIds(t.groupIds)
        const testStudents = parseIds(t.studentIds)
        
        const hasFaculties = testFaculties.length > 0
        const hasGroups = testGroups.length > 0
        const hasStudents = testStudents.length > 0

        // Agar test hech qanday fakultet/guruhga bog'lanmagan bo'lsa — barcha uchun ochiq
        if (!hasFaculties && !hasGroups && !hasStudents) return true

        // Fakultet tekshiruvi: agar talabaning fakulteti yo'q bo'lsa va test fakultetga bog'langan bo'lsa — ko'rsatilmaydi
        const sameStudent = !hasStudents || testStudents.includes(Number(userStore.user.id))
        const sameFaculty = !hasFaculties || (studentFacultyId !== null && testFaculties.includes(studentFacultyId))
        
        // Guruh tekshiruvi: agar talabaning guruhi yo'q bo'lsa va test guruhga bog'langan bo'lsa — ko'rsatilmaydi
        const sameGroup = !hasGroups || (studentGroupId !== null && testGroups.includes(studentGroupId))
        
        console.log(`[Tests] Test "${t.name}": faculties=${JSON.stringify(testFaculties)}, groups=${JSON.stringify(testGroups)}, sameFaculty=${sameFaculty}, sameGroup=${sameGroup}`)
        
        return sameStudent && sameFaculty && sameGroup
    })
})

const groupsOfSelectedFaculties = computed(() => {
    if (!editing.value.facultyIds || editing.value.facultyIds.length === 0) return []
    const selectedIds = editing.value.facultyIds.map(Number)
    return groups.value.filter(g => selectedIds.includes(Number(g.facultyId)))
})

const studentsOfSelectedGroups = computed(() => {
    const selectedGroupIds = (editing.value.groupIds || []).map(Number)
    if (selectedGroupIds.length === 0) return []
    return students.value.filter(student => selectedGroupIds.includes(Number(student.groupId)))
})

// Watcher to clean up selected groups if their faculty is deselected
watch(() => editing.value.facultyIds, (newVal) => {
    if (newVal) {
        const selectedFacultyIds = newVal.map(Number)
        editing.value.groupIds = editing.value.groupIds.filter(id => {
            const group = groups.value.find(g => g.id === Number(id))
            return group && selectedFacultyIds.includes(Number(group.facultyId))
        })
        editing.value.studentIds = (editing.value.studentIds || []).filter(id => {
            const student = students.value.find(item => item.id === Number(id))
            return student && editing.value.groupIds.map(Number).includes(Number(student.groupId))
        })
    }
}, { deep: true })

watch(() => editing.value.groupIds, (newVal) => {
    const selectedGroupIds = (newVal || []).map(Number)
    editing.value.studentIds = (editing.value.studentIds || []).filter(id => {
        const student = students.value.find(item => item.id === Number(id))
        return student && selectedGroupIds.includes(Number(student.groupId))
    })
}, { deep: true })

const selectAllGroups = () => {
    editing.value.groupIds = groupsOfSelectedFaculties.value.map(g => g.id)
}

const selectAllStudents = () => {
    editing.value.studentIds = studentsOfSelectedGroups.value.map(student => student.id)
}

const hasSolved = (testId) => myResults.value.some(r => r.testId === testId)
const getSolvedData = (testId) => myResults.value.find(r => r.testId === testId)

const shuffleItems = (items = []) => {
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

const prepareTestForStudent = (test) => {
    const randomized = JSON.parse(JSON.stringify(test))
    randomized.questions = shuffleItems(randomized.questions || []).map(question => ({
        ...question,
        options: shuffleItems(question.options || [])
    }))
    return randomized
}

const viewDetail = async (resultId) => {
    try {
        const res = await api.get(`/results/${resultId}`)
        detailView.value = res.data
        testResultsView.value = null
    } catch (e) { alert('Ma\'lumotni yuklashda xatolik!') }
}

const openResultsModal = async (test) => {
    testResultsView.value = test
    resultsLoading.value = true
    try {
        const res = await api.get(`/results/test/${test.id}`)
        viewingResults.value = res.data
    } finally { resultsLoading.value = false }
}

const startSolving = async (test) => {
    if (!getVisibleQuestionCount(test)) return alert('Savollar topilmadi!')
    try {
        const res = await api.get(`/tests/${test.id}/attempt`)
        solving.value = prepareTestForStudent(res.data)
    } catch (err) {
        return alert(err.response?.data?.message || 'Test savollarini yuklashda xatolik yuz berdi.')
    }
    activeQuestionIndex.value = 0
    answers.value = new Array(solving.value.questions.length).fill(null)
    timeLeft.value = (test.duration || 60) * 60
    startTime.value = new Date().toISOString()
    
    timer.value = setInterval(() => {
        if (timeLeft.value > 0) timeLeft.value--
        else finishSolving()
    }, 1000)
}

const finishSolving = async () => {
    clearInterval(timer.value)
    let correct = 0
    const studentAnswers = solving.value.questions.map((q, idx) => {
        const studentAns = (answers.value[idx] || '').toString().trim()
        const correctAns = (q.correctAnswer || '').toString().trim()
        
        // Case insensitive and trim-safe comparison
        const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase()
        
        if (isCorrect) correct++
        
        return {
            questionId: q.id,
            bankQuestionId: q.bankQuestionId || null,
            questionText: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            answer: answers.value[idx],
            isCorrect
        }
    })
    
    score.value = correct
    try {
        await api.post('/results', {
            testId: solving.value.id,
            score: score.value,
            totalQuestions: solving.value.questions.length,
            startTime: startTime.value,
            endTime: new Date().toISOString(),
            answers: studentAnswers
        })
        showResult.value = true
    } catch (e) { alert(e.response?.data?.message); solving.value = null }
}

const getAnswerStyle = (q, opt) => {
    const studentAns = detailView.value.answers.find(a => a.questionId?.toString() === q.id?.toString())
    if (!studentAns) return 'bg-white border-slate-100 text-slate-500'

    const optStr = (opt || '').toString().trim().toLowerCase()
    const studentAnsStr = (studentAns.answer || '').toString().trim().toLowerCase()

    if (studentAnsStr === optStr) {
        return studentAns.isCorrect ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#1B5E20]' : 'bg-[#FFEBEE] border-[#EF5350] text-[#B71C1C]'
    }
    
    return 'bg-white border-slate-100 text-slate-500'
}

const getAnswerIcon = (q, opt) => {
    const studentAns = detailView.value.answers.find(a => a.questionId?.toString() === q.id?.toString())
    if (!studentAns) return 'radio_button_unchecked'

    const optStr = (opt || '').toString().trim().toLowerCase()
    const studentAnsStr = (studentAns.answer || '').toString().trim().toLowerCase()

    if (studentAnsStr === optStr) {
        return studentAns.isCorrect ? 'check_circle' : 'cancel'
    }
    
    return 'radio_button_unchecked'
}

const openCreateModal = () => { 
    editing.value = { 
        name: '', 
        description: '', 
        duration: 25, 
        maxScore: 100,
        facultyIds: [], 
        groupIds: [], 
        studentIds: [],
        deadline: '', 
        isBankRandomized: false,
        bankSubject: null,
        bankQuestionCount: null,
        questions: [] 
    }
    selectedBankSubject.value = ''
    bankQuestionCount.value = null
    openModal()
}

const openEditModal = (test) => {
    // Ids ni obyektlarga aylantirish
    const parseIds = (val) => {
        if (!val) return []
        if (Array.isArray(val)) return val.map(Number).filter(n => !isNaN(n) && n > 0)
        if (typeof val === 'string' && val.startsWith('[')) {
            try { return JSON.parse(val).map(Number).filter(n => !isNaN(n) && n > 0) } catch (e) { return [] }
        }
        const num = Number(val)
        return (!isNaN(num) && num > 0) ? [num] : []
    }

    const facultyIds = parseIds(test.facultyIds)
    const groupIds = parseIds(test.groupIds)
    const studentIds = parseIds(test.studentIds)

    editing.value = { 
        ...test, 
        maxScore: test.maxScore || 100,
        deadline: test.deadline ? new Date(test.deadline).toISOString().slice(0, 16) : '', 
        questions: test.questions ? JSON.parse(JSON.stringify(test.questions)).map(q => {
            q.correctAnswerIndex = q.options.findIndex(o => o === q.correctAnswer)
            return q
        }) : [],
        facultyIds: facultyIds,
        groupIds: groupIds,
        studentIds: studentIds,
        isBankRandomized: !!test.isBankRandomized,
        bankSubject: test.bankSubject || null,
        bankQuestionCount: test.bankQuestionCount || null
    }
    selectedBankSubject.value = test.bankSubject || ''
    bankQuestionCount.value = test.bankQuestionCount || null
    openModal()
}

const openModal = () => {
    showModal.value = true

    if (!modalHistoryActive.value && window.history?.pushState) {
        window.history.pushState({ testEditorOpen: true }, '', window.location.href)
        modalHistoryActive.value = true
    }
}

const closeModal = () => {
    if (modalHistoryActive.value && window.history) {
        window.history.back()
        return
    }

    showModal.value = false
}

const closeModalFromHistory = () => {
    if (!modalHistoryActive.value) return
    modalHistoryActive.value = false
    showModal.value = false
}

const handleBrowserBack = () => {
    closeModalFromHistory()
}

const addQuestion = () => editing.value.questions.push({ text: '', options: ['', '', '', ''], correctAnswer: '', correctAnswerIndex: -1 })
const removeQuestion = (idx) => editing.value.questions.splice(idx, 1)

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
        const correctIdx = opts.findIndex(o => o.toLowerCase() === correctText.toLowerCase())

        if (opts.length < 2 || !correctText || correctIdx === -1) return null

        return {
            text: row[0].toString().trim(),
            options: opts,
            correctAnswer: opts[correctIdx],
            correctAnswerIndex: correctIdx
        }
    }).filter(q => q !== null)
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

const handleExcelUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    try {
        const newQuestions = await readExcelFile(file)
        if (newQuestions.length === 0) return alert('Excel faylda yaroqli savollar topilmadi.')
        editing.value.questions = [...editing.value.questions, ...newQuestions]
        event.target.value = ''
    } catch (err) {
        console.error(err)
        alert('Excel faylni o\'qishda xatolik yuz berdi.')
    }
}

const fillQuestionsFromBank = async () => {
    const count = Number(bankQuestionCount.value)
    if (!selectedBankSubject.value) return alert('Fan bazasini tanlang!')
    if (!count || count <= 0) return alert('Bazadan olinadigan savollar sonini kiriting!')
    bankLoading.value = true
    try {
        const res = await api.get('/tests/question-bank/random', { params: { count, subject: selectedBankSubject.value } })
        const randomQuestions = res.data?.questions || []
        editing.value.questions = randomQuestions
        editing.value.isBankRandomized = true
        editing.value.bankSubject = selectedBankSubject.value
        editing.value.bankQuestionCount = count
        await loadQuestionBankStats()
    } catch (err) {
        alert(err.response?.data?.message || 'Bazadan savollarni olishda xatolik yuz berdi.')
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
    XLSX.writeFile(workbook, "test_namuna.xlsx")
}

const submitForm = async () => {
    if (!editing.value.name) return alert('Test nomini kiriting!')
    if (!Number(editing.value.maxScore) || Number(editing.value.maxScore) <= 0) return alert('Test bali 0 dan katta bo\'lishi kerak!')
    if (selectedBankSubject.value && Number(bankQuestionCount.value)) {
        editing.value.isBankRandomized = true
        editing.value.bankSubject = selectedBankSubject.value
        editing.value.bankQuestionCount = Number(bankQuestionCount.value)
    }
    if (editing.value.isBankRandomized) {
        if (!editing.value.bankSubject || !Number(editing.value.bankQuestionCount)) {
            return alert('Fan bazasi va har bir talabaga beriladigan savollar sonini belgilang!')
        }
    } else if (editing.value.questions.length === 0) {
        return alert('Kamida bitta savol qo\'shing!')
    }
    
    // String bo'lib kelsa filterlash va numberga o'tkazish
    editing.value.facultyIds = (editing.value.facultyIds || []).map(Number).filter(n => !isNaN(n))
    editing.value.groupIds = (editing.value.groupIds || []).map(Number).filter(n => !isNaN(n))
    editing.value.studentIds = (editing.value.studentIds || []).map(Number).filter(n => !isNaN(n))

    try {
        if (editing.value.id) await api.patch(`/tests/${editing.value.id}`, editing.value)
        else await api.post('/tests', editing.value)
        closeModal(); loadData()
    } catch (e) { alert('Saqlashda xatolik!') }
}

const confirmDelete = (test) => { deletingTest.value = test; showDeleteModal.value = true }
const deleteTest = async () => {
    try { await api.delete(`/tests/${deletingTest.value.id}`); showDeleteModal.value = false; loadData() }
    catch (e) { alert('O\'chirishda xatolik!') }
}

const sanitizeFileName = (value) => {
    return (value || 'test-natijasi')
        .toString()
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 90)
}

const getStudentAnswer = (question) => {
    return detailView.value?.answers?.find(a => a.questionId?.toString() === question.id?.toString())
}

const downloadPdf = async () => {
    if (!detailView.value || isDownloadingPdf.value) return

    isDownloadingPdf.value = true

    try {
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 14
        const maxWidth = pageWidth - (margin * 2)
        let y = margin

        const ensurePage = (needed = 10) => {
            if (y + needed <= pageHeight - margin) return
            pdf.addPage()
            y = margin
        }

        const writeText = (text, x = margin, options = {}) => {
            const size = options.size || 10
            const style = options.style || 'normal'
            const color = options.color || [15, 23, 42]
            const width = options.width || maxWidth
            const lineGap = options.lineGap || 5

            pdf.setFont('helvetica', style)
            pdf.setFontSize(size)
            pdf.setTextColor(...color)

            const lines = pdf.splitTextToSize((text || '').toString(), width)
            ensurePage(lines.length * lineGap)
            pdf.text(lines, x, y)
            y += lines.length * lineGap
        }

        const drawInfoRow = (label, value) => {
            ensurePage(8)
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(9)
            pdf.setTextColor(100, 116, 139)
            pdf.text(label, margin, y)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(15, 23, 42)
            pdf.text((value || '-').toString(), margin + 45, y)
            y += 7
        }

        const result = detailView.value
        const test = result.TestModel || {}
        const studentName = `${result.student?.lastname || ''} ${result.student?.firstname || ''}`.trim()
        const earnedScore = result.earnedScore ?? ((result.percentage || 0) * (test.maxScore || 100) / 100)

        pdf.setFillColor(30, 41, 59)
        pdf.rect(0, 0, pageWidth, 30, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(17)
        pdf.text(test.name || 'Test natijalari', margin, 14)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Test natijalari hisoboti', margin, 22)
        y = 42

        writeText('Umumiy ma\'lumotlar', margin, { size: 13, style: 'bold', lineGap: 7 })
        drawInfoRow('Talaba', studentName)
        drawInfoRow('Fakultet', result.student?.FacultyModel?.name || 'Kiritilmagan')
        drawInfoRow('Guruh', result.student?.GroupModel?.name || 'Kiritilmagan')
        drawInfoRow('Vaqt', formatDate(result.startTime))
        drawInfoRow('To\'g\'ri javob', `${result.score} / ${result.totalQuestions || detailQuestions.value.length || 0}`)
        drawInfoRow('Ball', `${formatScore(earnedScore)} / ${formatScore(test.maxScore || 100)}`)
        drawInfoRow('Foiz', `${Math.round(result.percentage || 0)}%`)

        y += 5
        writeText('Savollar va javoblar', margin, { size: 13, style: 'bold', lineGap: 8 })

        ;(detailQuestions.value || []).forEach((question, index) => {
            const answer = getStudentAnswer(question)
            const statusText = answer?.isCorrect ? 'To\'g\'ri' : 'Noto\'g\'ri'

            ensurePage(22)
            pdf.setFillColor(answer?.isCorrect ? 232 : 255, answer?.isCorrect ? 245 : 235, answer?.isCorrect ? 233 : 238)
            pdf.roundedRect(margin, y - 4, maxWidth, 9, 1.5, 1.5, 'F')
            writeText(`${index + 1}. ${displayQuestionText(question.text)}`, margin + 2, { size: 10.5, style: 'bold', width: maxWidth - 4, lineGap: 5.5 })

            ;(question.options || []).forEach((option, optIndex) => {
                const marker = String.fromCharCode(65 + optIndex)
                const isStudent = (answer?.answer || '').toString().trim().toLowerCase() === (option || '').toString().trim().toLowerCase()
                const isCorrect = (question.correctAnswer || '').toString().trim().toLowerCase() === (option || '').toString().trim().toLowerCase()
                const prefix = isCorrect ? '[To\'g\'ri]' : (isStudent ? '[Tanlangan]' : `[${marker}]`)
                const color = isCorrect ? [22, 101, 52] : (isStudent ? [185, 28, 28] : [51, 65, 85])
                writeText(`${prefix} ${option}`, margin + 6, { size: 9.5, color, width: maxWidth - 10, lineGap: 5 })
            })

            writeText(`Talaba javobi: ${answer?.answer || 'Javob berilmagan'}`, margin + 6, { size: 9.5, width: maxWidth - 10, lineGap: 5 })
            writeText(`Holat: ${statusText}`, margin + 6, { size: 9.5, style: 'bold', color: answer?.isCorrect ? [22, 101, 52] : [185, 28, 28], lineGap: 6 })
            y += 3
        })

        const fileStudentName = `${detailView.value?.student?.lastname || ''}_${detailView.value?.student?.firstname || ''}`.trim()
        const testName = detailView.value?.TestModel?.name || 'test-natijasi'
        pdf.save(`${sanitizeFileName(`${testName}_${fileStudentName}`)}.pdf`)
    } catch (err) {
        console.error(err)
        alert('PDF yuklab olishda xatolik yuz berdi.')
    } finally {
        isDownloadingPdf.value = false
    }
}

const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
const isDeadlinePassed = (d) => d ? new Date(d) < new Date() : false
const formatDate = (d) => d ? new Date(d).toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''
const formatScore = (value) => {
    const num = Number(value || 0)
    return Number.isInteger(num) ? num.toString() : num.toFixed(1).replace(/\.0$/, '')
}

onMounted(() => {
    loadData()
    window.addEventListener('popstate', handleBrowserBack)
})

onBeforeUnmount(() => {
    window.removeEventListener('popstate', handleBrowserBack)
})
</script>

<style scoped>
@keyframes modal { from { opacity: 0; transform: scale(0.95) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.animate-modal { animation: modal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
/* Multiselect Premium Styling */
.custom-multiselect :deep(.multiselect__tags) {
    @apply bg-slate-50 border-slate-200 rounded min-h-[40px] pt-2;
}
.custom-multiselect :deep(.multiselect__input) {
    @apply bg-transparent text-sm placeholder:text-slate-400;
}
.custom-multiselect :deep(.multiselect__placeholder) {
    @apply text-slate-400 text-sm mb-0;
}
.custom-multiselect :deep(.multiselect__single) {
    @apply bg-transparent text-sm font-medium text-slate-700 mb-0;
}
.custom-multiselect :deep(.multiselect__tag) {
    @apply bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md px-2 py-1 mb-1 mr-1;
}
.custom-multiselect :deep(.multiselect__tag-icon:hover) {
    @apply bg-blue-700 text-white;
}
.custom-multiselect :deep(.multiselect__content-wrapper) {
    @apply border-slate-200 shadow-xl rounded-lg mt-1 z-[10000];
}
.custom-multiselect :deep(.multiselect__option--highlight) {
    @apply bg-blue-600;
}
.custom-multiselect :deep(.multiselect__option--selected) {
    @apply bg-emerald-50 text-emerald-700 font-bold;
}
.custom-multiselect :deep(.multiselect__option--selected.multiselect__option--highlight) {
    @apply bg-emerald-600 text-white;
}
</style>

<style>
@media print {
    body * {
        visibility: hidden !important;
    }
    #printable-content, #printable-content * {
        visibility: visible !important;
    }
    #printable-content {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: transparent !important;
        box-shadow: none !important;
    }
    .print-hidden, .print-hidden * {
        display: none !important;
        visibility: hidden !important;
    }
    /* Expand scrollable areas for print */
    #printable-content .overflow-y-auto {
        overflow: visible !important;
        max-height: none !important;
    }
}
</style>
