<template>
  <div class="space-y-4 animate-in fade-in duration-500">
    
    <!-- Hero Section (Skromni) -->
    <div class="bg-white rounded border border-slate-200 p-6 relative overflow-hidden flex items-center justify-between">
      <div class="absolute top-0 left-0 w-full h-1 bg-[#1e88e5]"></div>
      <div class="relative z-10 flex items-center gap-5">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
            <span class="material-icons text-3xl">verified_user</span>
        </div>
        <div>
            <h2 class="text-lg font-bold text-slate-800 tracking-tight">
                Xush kelibsiz, {{ userStore.user?.firstname || 'Foydalanuvchi' }}!
            </h2>
            <p class="text-slate-500 text-[13px] font-medium mt-0.5">
                {{ userStore.user?.role === 'Admin' ? 'EduTest Portal: Tizim administratorining nazorat paneli.' : (userStore.user?.role === 'Teacher' ? 'EduTest Portal: O\'quv jarayoni va testlar nazorati.' : 'EduTest Portal: O\'quv natijalari va test topshirish bo\'limi.') }}
            </p>
        </div>
      </div>
      <div class="hidden md:block">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest border px-3 py-1 rounded bg-slate-50">Portal ruxsati: {{ userStore.user?.role || 'User' }}</span>
      </div>
    </div>

    <!-- Stats Grid (Compact) -->
    <div v-if="userStore.user?.role !== 'Student'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :class="portalSettingsStore.compactCards ? 'gap-3' : 'gap-4'">
      <div v-for="stat in stats" :key="stat.title" 
           class="rounded bg-white border border-slate-200 hover:border-blue-300 transition-all group"
           :class="portalSettingsStore.compactCards ? 'p-4' : 'p-5'">
        <div class="flex items-center gap-4">
          <div :class="`${portalSettingsStore.compactCards ? 'w-9 h-9' : 'w-10 h-10'} rounded ${stat.color} flex items-center justify-center text-white shrink-0 opacity-80 group-hover:opacity-100 transition-opacity` ">
            <span class="material-icons text-xl">{{ stat.icon }}</span>
          </div>
          <div>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-tight block">{{ stat.title }}</span>
            <span class="font-black text-slate-800" :class="portalSettingsStore.compactCards ? 'text-xl' : 'text-2xl'">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Focus Overview -->
    <div v-if="userStore.user?.role === 'Student'" class="mt-6 space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div @click="$router.push('/tests')" class="rounded border border-blue-100 bg-white p-5 cursor-pointer hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/60 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <span class="material-icons">assignment</span>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-blue-500">Testlar</span>
          </div>
          <p class="mt-4 text-4xl font-black text-slate-900">{{ apiData.testCount }}</p>
          <p class="mt-1 text-[12px] font-bold text-slate-500">Jami biriktirilgan testlar</p>
        </div>

        <div @click="$router.push('/tests')" class="rounded border border-emerald-100 bg-white p-5 cursor-pointer hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/60 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span class="material-icons">task_alt</span>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Bajarilgan</span>
          </div>
          <p class="mt-4 text-4xl font-black text-slate-900">{{ completedTestsCount }}</p>
          <p class="mt-1 text-[12px] font-bold text-slate-500">Topshirilgan testlar</p>
        </div>

        <div @click="$router.push('/tasks')" class="rounded border border-teal-100 bg-white p-5 cursor-pointer hover:border-teal-300 hover:shadow-lg hover:shadow-teal-100/60 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
              <span class="material-icons">inventory_2</span>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-teal-600">Topshiriqlar</span>
          </div>
          <p class="mt-4 text-4xl font-black text-slate-900">{{ apiData.assignmentCount }}</p>
          <p class="mt-1 text-[12px] font-bold text-slate-500">Jami topshiriqlar</p>
        </div>

        <div @click="$router.push('/tasks')" class="rounded border border-cyan-100 bg-white p-5 cursor-pointer hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-100/60 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <span class="material-icons">done_all</span>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-cyan-600">Yuborilgan</span>
          </div>
          <p class="mt-4 text-4xl font-black text-slate-900">{{ completedAssignmentsCount }}</p>
          <p class="mt-1 text-[12px] font-bold text-slate-500">Bajarilgan topshiriqlar</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">Testlar holati</p>
              <p class="mt-1 text-sm font-bold text-slate-700">{{ completedTestsCount }} bajarilgan / {{ pendingTestsCount }} qolgan</p>
            </div>
            <div class="relative w-20 h-20 rounded-full shrink-0" :style="chartStyle(completedTestsCount, apiData.testCount, '#10b981')">
              <div class="absolute inset-2.5 rounded-full bg-white flex flex-col items-center justify-center border border-emerald-100">
                <span class="text-lg font-black text-emerald-600">{{ percentOf(completedTestsCount, apiData.testCount) }}%</span>
              </div>
            </div>
          </div>
          <div class="mt-4 h-2 rounded bg-slate-100 overflow-hidden">
            <div class="h-full rounded bg-emerald-500" :style="{ width: `${percentOf(completedTestsCount, apiData.testCount)}%` }"></div>
          </div>
        </div>

        <div class="rounded border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">Topshiriqlar holati</p>
              <p class="mt-1 text-sm font-bold text-slate-700">{{ completedAssignmentsCount }} bajarilgan / {{ pendingAssignmentsCount }} qolgan</p>
            </div>
            <div class="relative w-20 h-20 rounded-full shrink-0" :style="chartStyle(completedAssignmentsCount, apiData.assignmentCount, '#06b6d4')">
              <div class="absolute inset-2.5 rounded-full bg-white flex flex-col items-center justify-center border border-cyan-100">
                <span class="text-lg font-black text-cyan-600">{{ percentOf(completedAssignmentsCount, apiData.assignmentCount) }}%</span>
              </div>
            </div>
          </div>
          <div class="mt-4 h-2 rounded bg-slate-100 overflow-hidden">
            <div class="h-full rounded bg-cyan-500" :style="{ width: `${percentOf(completedAssignmentsCount, apiData.assignmentCount)}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="userStore.user?.role === 'Student'" class="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">
      <div class="rounded border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span class="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center material-icons text-lg">assignment_late</span>
            Testlar
          </h3>
          <button @click="$router.push('/tests')" class="text-[11px] font-black text-blue-600 hover:underline">Hammasi</button>
        </div>
        <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Bajarilmagan testlar</p>
        <div v-if="pendingTestsList.length === 0" class="rounded border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[12px] font-bold text-slate-400">
          Bajarilmagan test yo‘q
        </div>
        <div v-else class="space-y-3">
          <div v-for="test in pendingTestsList.slice(0, 3)" :key="test.id" @click="$router.push('/tests')" class="rounded border border-blue-100 bg-blue-50/40 p-4 cursor-pointer hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 transition-all">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="text-[14px] font-black text-slate-900 truncate">{{ test.name }}</h4>
                <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">{{ test.description || 'Izoh kiritilmagan' }}</p>
              </div>
              <span class="shrink-0 rounded bg-blue-600 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">Qolgan</span>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
              <span class="flex items-center gap-1"><span class="material-icons text-sm">timer</span>{{ test.duration }} min</span>
              <span class="flex items-center gap-1"><span class="material-icons text-sm">workspace_premium</span>{{ formatScore(test.maxScore || 100) }} ball</span>
              <span class="flex items-center gap-1"><span class="material-icons text-sm">event</span>{{ formatDate(test.deadline) || 'Muddat ochiq' }}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 border-t border-slate-100 pt-4">
          <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-emerald-600">Bajarilgan testlar</p>
          <div v-if="completedTestsList.length === 0" class="rounded border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[12px] font-bold text-slate-400">
            Hali bajarilgan test yo‘q
          </div>
          <div v-else class="space-y-3">
            <div v-for="result in completedTestsList.slice(0, 3)" :key="result.id" @click="$router.push('/tests')" class="rounded border border-emerald-100 bg-emerald-50/40 p-4 cursor-pointer hover:border-emerald-300 transition-all">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h4 class="truncate text-[14px] font-black text-slate-900">{{ result.TestModel?.name || `Test #${result.testId}` }}</h4>
                  <p class="mt-1 text-[11px] font-bold text-slate-500">{{ formatDate(result.createdAt) }}</p>
                </div>
                <span class="shrink-0 rounded bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">{{ Math.round(result.percentage || 0) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span class="h-8 w-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center material-icons text-lg">inventory_2</span>
            Topshiriqlar
          </h3>
          <button @click="$router.push('/tasks')" class="text-[11px] font-black text-teal-600 hover:underline">Hammasi</button>
        </div>
        <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Bajarilmagan topshiriqlar</p>
        <div v-if="pendingAssignmentsList.length === 0" class="rounded border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[12px] font-bold text-slate-400">
          Bajarilmagan topshiriq yo‘q
        </div>
        <div v-else class="space-y-3">
          <div v-for="assignment in pendingAssignmentsList.slice(0, 3)" :key="assignment.id" @click="$router.push('/tasks')" class="rounded border border-amber-100 bg-amber-50/40 p-4 cursor-pointer hover:border-amber-300 hover:shadow-md hover:shadow-amber-100 transition-all">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="text-[14px] font-black text-slate-900 truncate">{{ assignment.name }}</h4>
                <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">{{ assignment.description || 'Topshiriq tavsifi kiritilmagan' }}</p>
              </div>
              <span class="shrink-0 rounded bg-amber-500 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">Qolgan</span>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
              <span class="flex items-center gap-1"><span class="material-icons text-sm">person</span>{{ assignment.teacher?.firstname }} {{ assignment.teacher?.lastname }}</span>
              <span class="flex items-center gap-1"><span class="material-icons text-sm">workspace_premium</span>{{ formatScore(assignment.maxScore || 100) }} ball</span>
              <span class="flex items-center gap-1"><span class="material-icons text-sm">event</span>{{ formatDate(assignment.deadline) || 'Muddat ochiq' }}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 border-t border-slate-100 pt-4">
          <p class="mb-3 text-[11px] font-black uppercase tracking-widest text-cyan-600">Bajarilgan topshiriqlar</p>
          <div v-if="completedAssignmentsList.length === 0" class="rounded border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[12px] font-bold text-slate-400">
            Hali bajarilgan topshiriq yo‘q
          </div>
          <div v-else class="space-y-3">
            <div v-for="submission in completedAssignmentsList.slice(0, 3)" :key="submission.id" @click="$router.push('/tasks')" class="rounded border border-cyan-100 bg-cyan-50/40 p-4 cursor-pointer hover:border-cyan-300 transition-all">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h4 class="truncate text-[14px] font-black text-slate-900">{{ submission.AssignmentModel?.name || `Topshiriq #${submission.assignmentId}` }}</h4>
                  <p class="mt-1 text-[11px] font-bold text-slate-500">{{ formatDate(submission.createdAt) }}</p>
                </div>
                <span class="shrink-0 rounded bg-cyan-600 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">Yuborilgan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="userStore.user?.role === 'Student'" class="mt-6 rounded border border-slate-200 bg-white p-6">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Fan/Test darajasi</h3>
          <p class="text-[12px] text-slate-500 mt-1">Topshirilgan testlar bo'yicha natijalar diagrammasi</p>
        </div>
        <span class="rounded bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-600">{{ apiData.averageScore || 0 }}% o'rtacha</span>
      </div>

      <div v-if="subjectLevels.length === 0" class="py-10 text-center text-slate-400 text-sm font-bold border border-dashed border-slate-200 rounded">
        Hali topshirilgan test natijalari yo'q
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in subjectLevels" :key="item.id" class="grid grid-cols-1 md:grid-cols-[220px_1fr_90px] gap-3 md:items-center">
          <div>
            <p class="text-[13px] font-bold text-slate-800 truncate">{{ item.name }}</p>
            <p class="text-[10px] font-black uppercase tracking-widest" :class="item.levelClass">{{ item.level }}</p>
          </div>
          <div class="h-4 rounded bg-slate-100 overflow-hidden">
            <div class="h-full rounded transition-all" :class="item.barClass" :style="{ width: `${item.percentage}%` }"></div>
          </div>
          <div class="text-right text-lg font-black text-slate-900">{{ item.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Quick Access Sections (Structured like List) -->
    <div v-if="userStore.user?.role !== 'Student'" class="grid grid-cols-1 lg:grid-cols-3 mt-6" :class="portalSettingsStore.compactCards ? 'gap-3' : 'gap-4'">
      <div @click="$router.push('/tests')" class="bg-white rounded border border-slate-200 flex items-center gap-4 hover:border-blue-400 transition-all cursor-pointer group" :class="portalSettingsStore.compactCards ? 'p-3' : 'p-4'">
        <div class="bg-slate-100 text-blue-600 rounded flex items-center justify-center group-hover:bg-blue-50" :class="portalSettingsStore.compactCards ? 'w-9 h-9' : 'w-10 h-10'">
          <span class="material-icons">assignment</span>
        </div>
        <div>
          <h3 class="text-[14px] font-bold text-slate-800 group-hover:text-blue-600">Testlar bo'limi</h3>
          <p class="text-[11px] text-slate-400">Barcha mavjud testlarni ko'rish</p>
        </div>
      </div>

      <div @click="$router.push('/tasks')" class="bg-white rounded border border-slate-200 flex items-center gap-4 transition-all cursor-pointer group relative overflow-hidden"
           :class="[portalSettingsStore.compactCards ? 'p-3' : 'p-4', portalSettingsStore.highlightAssignments ? 'hover:border-teal-500 border-teal-300 shadow-md shadow-teal-100/70' : 'hover:border-teal-400']">
        <div v-if="portalSettingsStore.highlightAssignments" class="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-teal-400 to-emerald-500"></div>
        <div class="bg-slate-100 text-teal-600 rounded flex items-center justify-center group-hover:bg-teal-50" :class="portalSettingsStore.compactCards ? 'w-9 h-9' : 'w-10 h-10'">
          <span class="material-icons">inventory_2</span>
        </div>
        <div>
          <h3 class="text-[14px] font-bold text-slate-800 group-hover:text-teal-600">Topshiriqlar</h3>
          <p class="text-[11px] text-slate-400">{{ portalSettingsStore.highlightAssignments ? "Yangi vazifalar ajratib ko'rsatilgan" : "Yuborilgan vazifalar nazorati" }}</p>
        </div>
        <span v-if="portalSettingsStore.highlightAssignments" class="ml-auto rounded-full bg-teal-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Fokus</span>
      </div>

      <div @click="$router.push('/analysis')" class="bg-white rounded border border-slate-200 flex items-center gap-4 hover:border-orange-400 transition-all cursor-pointer group" :class="portalSettingsStore.compactCards ? 'p-3' : 'p-4'">
        <div class="bg-slate-100 text-orange-600 rounded flex items-center justify-center group-hover:bg-orange-50" :class="portalSettingsStore.compactCards ? 'w-9 h-9' : 'w-10 h-10'">
          <span class="material-icons">bar_chart</span>
        </div>
        <div>
          <h3 class="text-[14px] font-bold text-slate-800 group-hover:text-orange-600">Statistika</h3>
          <p class="text-[11px] text-slate-400">Umumiy ko'rsatkichlar tahlili</p>
        </div>
      </div>
    </div>

    <!-- New Assignments Section -->
    <div v-if="userStore.user?.role !== 'Student' && pendingRecentAssignments.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2 h-4 bg-teal-500 rounded-full"></span>
                {{ userStore.user?.role === 'Student' ? 'Bajarilmagan topshiriqlar' : 'Oxirgi qo\'shilgan topshiriqlar' }}
            </h3>
            <button @click="$router.push('/tasks')" class="text-[11px] font-bold text-teal-600 hover:underline px-2">Hammasini ko'rish</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :class="portalSettingsStore.compactCards ? 'gap-3' : 'gap-4'">
            <div v-for="(assignment, index) in pendingRecentAssignments.slice(0, 3)" :key="assignment.id"
                @click="$router.push('/tasks')"
                class="bg-gradient-to-br from-teal-50 via-white to-emerald-50 rounded border border-teal-200 transition-all cursor-pointer group relative overflow-hidden"
                :class="[portalSettingsStore.compactCards ? 'p-4' : 'p-6', index === 0 ? 'md:col-span-2 lg:col-span-1 xl:col-span-2 min-h-[170px]' : '', portalSettingsStore.highlightAssignments ? 'ring-1 ring-teal-200 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-100/60' : 'hover:border-teal-400']">
                <div class="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                <div v-if="userStore.user?.role === 'Student'" class="absolute right-4 top-4 rounded-full bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">Bajarilmagan</div>
                <div v-else-if="portalSettingsStore.highlightAssignments" class="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 shadow-sm">Yangi</div>
                <div class="absolute top-0 right-0 p-2 opacity-10">
                    <span class="material-icons text-5xl">inventory_2</span>
                </div>
                <h4 class="font-bold text-slate-800 group-hover:text-teal-700 truncate mb-2" :class="index === 0 ? 'text-xl' : 'text-[14px]'">{{ assignment.name }}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-2 min-h-[32px]">{{ assignment.description || 'Topshiriq tavsifi kiritilmagan' }}</p>
                <div class="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-3">
                    <span class="flex items-center gap-1"><span class="material-icons text-xs">person</span> {{ assignment.teacher?.firstname }} {{ assignment.teacher?.lastname }}</span>
                    <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{{ formatDate(assignment.deadline) || 'Muddat ochiq' }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- New Tests Section -->
    <div v-if="userStore.user?.role !== 'Student' && pendingRecentTests.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2 h-4 bg-blue-500 rounded-full"></span>
                {{ userStore.user?.role === 'Student' ? 'Bajarilmagan testlar' : 'Oxirgi qo\'shilgan testlar' }}
            </h3>
            <button @click="$router.push('/tests')" class="text-[11px] font-bold text-blue-500 hover:underline px-2">Hammasini ko'rish</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :class="portalSettingsStore.compactCards ? 'gap-3' : 'gap-4'">
            <div v-for="(test, index) in pendingRecentTests.slice(0, 3)" :key="test.id" 
                @click="$router.push('/tests')"
                class="bg-gradient-to-br from-blue-50 via-white to-white rounded border border-blue-200 hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden hover:shadow-lg hover:shadow-blue-100/70"
                :class="[portalSettingsStore.compactCards ? 'p-4' : 'p-6', index === 0 ? 'md:col-span-2 lg:col-span-1 xl:col-span-2 min-h-[160px]' : '']">
                <div class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <div class="absolute right-4 top-4 rounded-full bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">{{ userStore.user?.role === 'Student' ? 'Bajarilmagan' : 'Yangi' }}</div>
                <div class="absolute top-0 right-0 p-2 opacity-5">
                    <span class="material-icons text-5xl">assignment</span>
                </div>
                <h4 class="font-bold text-slate-800 group-hover:text-blue-600 truncate mb-1 pr-16" :class="index === 0 ? 'text-xl' : 'text-[14px]'">{{ test.name }}</h4>
                <div class="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span class="flex items-center gap-1"><span class="material-icons text-xs">person</span> {{ test.teacher?.firstname }} {{ test.teacher?.lastname }}</span>
                    <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{{ test.duration }} min</span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { usePortalSettingsStore } from '../stores/portalSettings';
import api from '../api';

const userStore = useUserStore();
const portalSettingsStore = usePortalSettingsStore();
const myResults = ref([]);
const mySubmissions = ref([]);
const apiData = ref({
    testCount: 0,
    userCount: 0,
    studentCount: 0,
    teacherCount: 0,
    resultCount: 0,
    averageScore: 0,
    pendingTaskCount: 0,
    completedTaskCount: 0,
    recentTests: [],
    pendingTests: [],
    assignmentCount: 0,
    submissionCount: 0,
    recentAssignments: [],
    pendingAssignments: []
});

const loadStats = async () => {
    try {
        const isStudent = userStore.user?.role === 'Student';
        const requests = [
            api.get('/tests/stats'),
            api.get('/assignments/stats')
        ];

        if (isStudent) {
            requests.push(api.get('/results/my'), api.get('/assignment-submissions/my'));
        }

        const [testsRes, assignmentsRes, resultsRes, submissionsRes] = await Promise.all(requests);
        apiData.value = {
            ...testsRes.data,
            assignmentCount: assignmentsRes.data?.assignmentCount || 0,
            submissionCount: assignmentsRes.data?.submissionCount || 0,
            recentAssignments: assignmentsRes.data?.recentAssignments || [],
            pendingAssignments: assignmentsRes.data?.pendingAssignments || []
        };

        if (isStudent) {
            myResults.value = resultsRes?.data || [];
            mySubmissions.value = submissionsRes?.data || [];
        }
    } catch (e) {
        console.error('Failed to load stats:', e);
    }
}

const allStats = computed(() => [
  { title: "Jami foydalanuvchilar", value: apiData.value.userCount, icon: 'people', color: 'bg-blue-500', roles: ['Admin'] },
  { title: "O'qituvchilar", value: apiData.value.teacherCount, icon: 'person_search', color: 'bg-indigo-500', roles: ['Admin'] },
  { title: "Talabalar", value: apiData.value.studentCount, icon: 'school', color: 'bg-green-500', roles: ['Admin'] },
  { title: "Menga biriktirilgan testlar", value: apiData.value.testCount, icon: 'assignment', color: 'bg-blue-600', roles: ['Student'] },
  { title: "Menga biriktirilgan topshiriqlar", value: apiData.value.assignmentCount, icon: 'inventory_2', color: 'bg-teal-500', roles: ['Student'] },
  { title: "O'rtacha test balim", value: `${apiData.value.averageScore}%`, icon: 'leaderboard', color: 'bg-orange-500', roles: ['Student'] },
  { title: "Jami testlar", value: apiData.value.testCount, icon: 'assignment', color: 'bg-blue-600', roles: ['Admin', 'Teacher'] },
  { title: 'Topshiriqlar', value: apiData.value.assignmentCount, icon: 'inventory_2', color: 'bg-teal-500', roles: ['Admin', 'Teacher'] },
  { title: "O'rtacha test bali", value: `${apiData.value.averageScore}%`, icon: 'show_chart', color: 'bg-orange-500', roles: ['Admin', 'Teacher'] },
]);

const stats = computed(() => {
    return allStats.value.filter(s => s.roles.includes(userStore.user?.role))
});

const pendingTestsCount = computed(() => Math.max(0, Number(apiData.value.pendingTaskCount || 0)));
const completedTestsCount = computed(() => Math.max(0, Number(apiData.value.completedTaskCount || 0)));
const completedAssignmentsCount = computed(() => Math.max(0, Number(apiData.value.submissionCount || 0)));
const pendingAssignmentsCount = computed(() => Math.max(0, Number(apiData.value.assignmentCount || 0) - completedAssignmentsCount.value));
const solvedTestIds = computed(() => new Set(myResults.value.map(item => Number(item.testId))));
const submittedAssignmentIds = computed(() => new Set(mySubmissions.value.map(item => Number(item.assignmentId))));
const pendingTestsList = computed(() => {
    if (apiData.value.pendingTests?.length) return apiData.value.pendingTests;
    return (apiData.value.recentTests || []).filter(item => !solvedTestIds.value.has(Number(item.id)));
});
const pendingAssignmentsList = computed(() => {
    if (apiData.value.pendingAssignments?.length) return apiData.value.pendingAssignments;
    return (apiData.value.recentAssignments || []).filter(item => !submittedAssignmentIds.value.has(Number(item.id)));
});
const completedTestsList = computed(() => {
    return [...myResults.value].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
});
const completedAssignmentsList = computed(() => {
    return [...mySubmissions.value].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
});
const pendingRecentTests = computed(() => {
    if (userStore.user?.role !== 'Student') return apiData.value.recentTests || [];
    return pendingTestsList.value;
});
const pendingRecentAssignments = computed(() => {
    if (userStore.user?.role !== 'Student') return apiData.value.recentAssignments || [];
    return pendingAssignmentsList.value;
});
const getLevelMeta = (percentage) => {
    if (percentage >= 86) return { level: 'A\'lo', barClass: 'bg-emerald-500', levelClass: 'text-emerald-600' };
    if (percentage >= 71) return { level: 'Yaxshi', barClass: 'bg-blue-500', levelClass: 'text-blue-600' };
    if (percentage >= 56) return { level: 'Qoniqarli', barClass: 'bg-amber-500', levelClass: 'text-amber-600' };
    return { level: 'Past', barClass: 'bg-red-500', levelClass: 'text-red-600' };
};
const subjectLevels = computed(() => {
    return myResults.value.slice(0, 6).map(result => {
        const percentage = Math.round(Number(result.percentage || 0));
        const meta = getLevelMeta(percentage);
        return {
            id: result.id,
            name: result.TestModel?.name || `Test #${result.testId}`,
            percentage,
            ...meta
        };
    });
});

const pendingPercent = (pending, total) => {
    const safeTotal = Number(total || 0);
    if (!safeTotal) return 0;
    return Math.round((Number(pending || 0) / safeTotal) * 100);
};
const percentOf = (value, total) => pendingPercent(value, total);

const chartStyle = (pending, total, color) => {
    const percent = pendingPercent(pending, total);
    return {
        background: `conic-gradient(${color} ${percent * 3.6}deg, #e5e7eb 0deg)`
    };
};

onMounted(loadStats);
onMounted(() => portalSettingsStore.load(userStore.user?.id));

const formatDate = (d) => d ? new Date(d).toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12: false }) : ''
const formatScore = (value) => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
}
</script>

<style scoped>
.animate-in {
    animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
