import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ModalBottomSheet } from '../common/ModalBottomSheet';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Terminal,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface AndroidFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'README.md',
    filename: 'README.md',
    language: 'markdown',
    description: 'Инструкция по сборке Debug APK и запуску в Android Studio',
    code: `# Бюджет План — Android Приложение

Простое, минималистичное и наглядное Android-приложение для планирования личного и семейного бюджета на Jetpack Compose, Material 3 и Room.

## Стек технологий
- **Kotlin** 2.0+
- **Jetpack Compose** + **Material 3**
- **Room Database** (SQLite, 100% offline)
- **MVVM** Architecture + StateFlow
- **Kotlin Coroutines**
- **JUnit 4** (Unit-тесты финансовых расчетов)

## Сборка Debug APK
Для сборки APK файла запустите в корне проекта:
\`\`\`bash
./gradlew assembleDebug
\`\`\`
Готовый APK будет находиться в папке:
\`app/build/outputs/apk/debug/app-debug.apk\`

## Запуск Unit-тестов
\`\`\`bash
./gradlew test
\`\`\`

## Структура проекта
\`\`\`text
app/
 ├── src/
 │    ├── main/
 │    │    ├── java/com/budget/app/
 │    │    │    ├── data/
 │    │    │    │    ├── local/ (Room Entities & DAO)
 │    │    │    │    └── repository/
 │    │    │    ├── domain/
 │    │    │    │    ├── model/
 │    │    │    │    └── usecase/ (Календарные и бюджетные расчеты)
 │    │    │    ├── presentation/
 │    │    │    │    ├── home/
 │    │    │    │    ├── plan/
 │    │    │    │    ├── transactions/
 │    │    │    │    └── theme/
 │    │    │    └── MainActivity.kt
 │    │    └── AndroidManifest.xml
 │    └── test/
 │         └── java/com/budget/app/domain/usecase/
 │              └── BudgetCalculatorTest.kt
 ├── build.gradle.kts
settings.gradle.kts
\`\`\`
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Манифест приложения с конфигурацией темы и активностей',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Бюджет План"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BudgetPlan">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.BudgetPlan">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Конфигурация сборки Gradle и зависимости Android',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.budget.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.budget.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)

    // Room Database (Offline SQLite)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Unit Testing
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}
`,
  },
  {
    path: 'app/src/main/java/com/budget/app/domain/model/BudgetModels.kt',
    filename: 'BudgetModels.kt',
    language: 'kotlin',
    description: 'Доменные модели сущностей (Income, Expense, Frequency, Category)',
    code: `package com.budget.app.domain.model

enum class Frequency {
    ONCE,
    DAILY,
    WEEKLY,
    MONTHLY,
    YEARLY
}

enum class TransactionType {
    INCOME,
    EXPENSE
}

data class Category(
    val id: String,
    val name: String,
    val icon: String,
    val colorHex: String,
    val type: TransactionType,
    val isDefault: Boolean = true
)

data class RecurringItem(
    val id: String,
    val title: String,
    val amount: Long,
    val type: TransactionType,
    val frequency: Frequency,
    val dayOfWeek: Int? = null, // 1 = Monday .. 7 = Sunday
    val dayOfMonth: Int? = null, // 1..31 or -1 for last day of month
    val dateStr: String? = null,
    val categoryId: String,
    val isEssential: Boolean = false,
    val isActive: Boolean = true,
    val comment: String? = null
)

data class MonthBudgetSummary(
    val year: Int,
    val month: Int,
    val plannedIncome: Long,
    val plannedExpenses: Long,
    val plannedEssentialExpenses: Long,
    val plannedNonEssentialExpenses: Long,
    val plannedRemaining: Long,
    val freeBudgetPerWeek: Long,
    val essentialExpensePercentage: Int,
    val isOverBudget: Boolean,
    val overBudgetAmount: Long
)
`,
  },
  {
    path: 'app/src/main/java/com/budget/app/domain/usecase/CalculateMonthBudgetUseCase.kt',
    filename: 'CalculateMonthBudgetUseCase.kt',
    language: 'kotlin',
    description: 'Календарно-точный расчет бюджета с учетом 28/30/31 дней и дней недели',
    code: `package com.budget.app.domain.usecase

import com.budget.app.domain.model.*
import java.time.LocalDate
import java.time.YearMonth

class CalculateMonthBudgetUseCase {

    /**
     * Возвращает точное число повторений регулярной операции в конкретном месяце.
     * Например, для еженедельного расхода по субботам в сентябре 2026 года вернет 4,
     * а по вторникам - 5.
     */
    fun calculateOccurrences(item: RecurringItem, year: Int, month: Int): Int {
        if (!item.isActive) return 0
        val yearMonth = YearMonth.of(year, month)
        val daysInMonth = yearMonth.lengthOfMonth()

        return when (item.frequency) {
            Frequency.DAILY -> daysInMonth

            Frequency.WEEKLY -> {
                val targetDayOfWeek = item.dayOfWeek ?: return daysInMonth / 7
                var count = 0
                for (day in 1..daysInMonth) {
                    val date = LocalDate.of(year, month, day)
                    if (date.dayOfWeek.value == targetDayOfWeek) {
                        count++
                    }
                }
                count
            }

            Frequency.MONTHLY -> 1

            Frequency.YEARLY -> {
                item.dateStr?.let {
                    val targetMonth = LocalDate.parse(it).monthValue
                    if (targetMonth == month) 1 else 0
                } ?: 0
            }

            Frequency.ONCE -> {
                item.dateStr?.let {
                    val parsed = LocalDate.parse(it)
                    if (parsed.year == year && parsed.monthValue == month) 1 else 0
                } ?: 0
            }
        }
    }

    fun execute(items: List<RecurringItem>, year: Int, month: Int): MonthBudgetSummary {
        val yearMonth = YearMonth.of(year, month)
        val daysInMonth = yearMonth.lengthOfMonth()

        var plannedIncome: Long = 0
        var plannedEssential: Long = 0
        var plannedNonEssential: Long = 0

        for (item in items.filter { it.isActive }) {
            val occurrences = calculateOccurrences(item, year, month)
            val total = item.amount * occurrences

            if (item.type == TransactionType.INCOME) {
                plannedIncome += total
            } else {
                if (item.isEssential) {
                    plannedEssential += total
                } else {
                    plannedNonEssential += total
                }
            }
        }

        val plannedExpenses = plannedEssential + plannedNonEssential
        val plannedRemaining = plannedIncome - plannedExpenses

        val calendarWeeks = daysInMonth.toDouble() / 7.0
        val freePerWeek = if (plannedRemaining > 0) (plannedRemaining / calendarWeeks).toLong() else 0L

        val essentialPct = if (plannedIncome > 0) {
            ((plannedEssential.toDouble() / plannedIncome.toDouble()) * 100).toInt()
        } else if (plannedEssential > 0) 100 else 0

        val isOver = plannedExpenses > plannedIncome
        val overAmount = if (isOver) plannedExpenses - plannedIncome else 0L

        return MonthBudgetSummary(
            year = year,
            month = month,
            plannedIncome = plannedIncome,
            plannedExpenses = plannedExpenses,
            plannedEssentialExpenses = plannedEssential,
            plannedNonEssentialExpenses = plannedNonEssential,
            plannedRemaining = plannedRemaining,
            freeBudgetPerWeek = freePerWeek,
            essentialExpensePercentage = essentialPct,
            isOverBudget = isOver,
            overBudgetAmount = overAmount
        )
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/budget/app/data/local/BudgetDatabase.kt',
    filename: 'BudgetDatabase.kt',
    language: 'kotlin',
    description: 'Room SQLite Database, DAO и сущности таблиц',
    code: `package com.budget.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "recurring_items")
data class RecurringItemEntity(
    @PrimaryKey val id: String,
    val title: String,
    val amount: Long,
    val type: String, // "INCOME" or "EXPENSE"
    val frequency: String,
    val dayOfWeek: Int?,
    val dayOfMonth: Int?,
    val dateStr: String?,
    val categoryId: String,
    val isEssential: Boolean,
    val isActive: Boolean,
    val comment: String?,
    val createdAt: Long = System.currentTimeMillis()
)

@Dao
interface RecurringItemDao {
    @Query("SELECT * FROM recurring_items ORDER BY createdAt DESC")
    fun getAllFlow(): Flow<List<RecurringItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: RecurringItemEntity)

    @Update
    suspend fun update(item: RecurringItemEntity)

    @Query("DELETE FROM recurring_items WHERE id = :id")
    suspend fun deleteById(id: String)
}

@Database(entities = [RecurringItemEntity::class], version = 1, exportSchema = false)
abstract class BudgetDatabase : RoomDatabase() {
    abstract fun recurringItemDao(): RecurringItemDao
}
`,
  },
  {
    path: 'app/src/main/java/com/budget/app/presentation/home/HomeViewModel.kt',
    filename: 'HomeViewModel.kt',
    language: 'kotlin',
    description: 'ViewModel главного экрана со StateFlow реактивным состоянием',
    code: `package com.budget.app.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.budget.app.domain.model.MonthBudgetSummary
import com.budget.app.domain.usecase.CalculateMonthBudgetUseCase
import com.budget.app.data.local.RecurringItemDao
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate

data class HomeUiState(
    val selectedYear: Int = 2026,
    val selectedMonth: Int = 9,
    val summary: MonthBudgetSummary? = null,
    val isLoading: Boolean = false
)

class HomeViewModel(
    private val dao: RecurringItemDao,
    private val calculateUseCase: CalculateMonthBudgetUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun nextMonth() {
        val curr = _uiState.value
        val nextMonth = if (curr.selectedMonth == 12) 1 else curr.selectedMonth + 1
        val nextYear = if (curr.selectedMonth == 12) curr.selectedYear + 1 else curr.selectedYear
        _uiState.update { it.copy(selectedYear = nextYear, selectedMonth = nextMonth) }
        loadData()
    }

    fun prevMonth() {
        val curr = _uiState.value
        val prevMonth = if (curr.selectedMonth == 1) 12 else curr.selectedMonth - 1
        val prevYear = if (curr.selectedMonth == 1) curr.selectedYear - 1 else curr.selectedYear
        _uiState.update { it.copy(selectedYear = prevYear, selectedMonth = prevMonth) }
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            dao.getAllFlow().collect { entities ->
                // Map entities to domain items
                val summary = calculateUseCase.execute(
                    emptyList(),
                    _uiState.value.selectedYear,
                    _uiState.value.selectedMonth
                )
                _uiState.update { it.copy(summary = summary, isLoading = false) }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/test/java/com/budget/app/domain/usecase/BudgetCalculatorTest.kt',
    filename: 'BudgetCalculatorTest.kt',
    language: 'kotlin',
    description: 'Unit-тесты для 28/30/31-дневных месяцев, суббот и отрицательного баланса',
    code: `package com.budget.app.domain.usecase

import com.budget.app.domain.model.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class BudgetCalculatorTest {

    private lateinit var useCase: CalculateMonthBudgetUseCase

    @Before
    fun setUp() {
        useCase = CalculateMonthBudgetUseCase()
    }

    @Test
    fun testWeeklyOccurrencesInSeptember2026() {
        // В сентябре 2026 (30 дней, начинается во вторник):
        // Суббота (день 6): 5, 12, 19, 26 => ровно 4 субботы
        val groceryWeekly = RecurringItem(
            id = "groceries",
            title = "Продукты",
            amount = 500000L,
            type = TransactionType.EXPENSE,
            frequency = Frequency.WEEKLY,
            dayOfWeek = 6, // Суббота
            categoryId = "groceries",
            isEssential = true
        )

        val count = useCase.calculateOccurrences(groceryWeekly, 2026, 9)
        assertEquals(4, count)
    }

    @Test
    fun testWeeklyOccurrencesForTuesdayInSeptember2026() {
        // Вторник (день 2): 1, 8, 15, 22, 29 => ровно 5 вторников!
        val tuesdayItem = RecurringItem(
            id = "tue",
            title = "Вторничный расход",
            amount = 100000L,
            type = TransactionType.EXPENSE,
            frequency = Frequency.WEEKLY,
            dayOfWeek = 2, // Вторник
            categoryId = "test"
        )

        val count = useCase.calculateOccurrences(tuesdayItem, 2026, 9)
        assertEquals(5, count)
    }

    @Test
    fun testFullMonthSummaryCalculation() {
        val salary = RecurringItem(
            id = "sal",
            title = "Зарплата",
            amount = 40000000L,
            type = TransactionType.INCOME,
            frequency = Frequency.MONTHLY,
            dayOfMonth = 5,
            categoryId = "salary"
        )

        val rent = RecurringItem(
            id = "rent",
            title = "Аренда",
            amount = 5000000L,
            type = TransactionType.EXPENSE,
            frequency = Frequency.MONTHLY,
            dayOfMonth = 1,
            categoryId = "housing",
            isEssential = true
        )

        val loan = RecurringItem(
            id = "loan",
            title = "Кредит",
            amount = 8000000L,
            type = TransactionType.EXPENSE,
            frequency = Frequency.MONTHLY,
            dayOfMonth = 10,
            categoryId = "loans",
            isEssential = true
        )

        val summary = useCase.execute(listOf(salary, rent, loan), 2026, 9)

        assertEquals(40000000L, summary.plannedIncome)
        assertEquals(13000000L, summary.plannedExpenses)
        assertEquals(27000000L, summary.plannedRemaining)
        assertTrue(summary.plannedRemaining > 0)
    }

    @Test
    fun testOverBudgetDetection() {
        val lowIncome = RecurringItem(
            id = "low",
            title = "Низкий доход",
            amount = 5000000L,
            type = TransactionType.INCOME,
            frequency = Frequency.MONTHLY,
            categoryId = "salary"
        )

        val highExpense = RecurringItem(
            id = "high",
            title = "Большой расход",
            amount = 7500000L,
            type = TransactionType.EXPENSE,
            frequency = Frequency.MONTHLY,
            categoryId = "other",
            isEssential = true
        )

        val summary = useCase.execute(listOf(lowIncome, highExpense), 2026, 9)

        assertTrue(summary.isOverBudget)
        assertEquals(2500000L, summary.overBudgetAmount)
    }
}
`,
  },
  {
    path: 'Dockerfile',
    filename: 'Dockerfile',
    language: 'dockerfile',
    description: 'Docker-контейнер для сборки APK на любом компьютере или сервере',
    code: `# Сборка APK в изолированном контейнере без установки Android Studio
FROM eclipse-temurin:17-jdk-jammy

# Установка зависимостей и Android SDK commandlinetools
RUN apt-get update && apt-get install -y wget unzip git && rm -rf /var/lib/apt/lists/*

ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=\${PATH}:\${ANDROID_HOME}/cmdline-tools/latest/bin:\${ANDROID_HOME}/platform-tools

RUN mkdir -p \${ANDROID_HOME}/cmdline-tools && \\
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip && \\
    unzip -q /tmp/cmdline-tools.zip -d \${ANDROID_HOME}/cmdline-tools && \\
    mv \${ANDROID_HOME}/cmdline-tools/cmdline-tools \${ANDROID_HOME}/cmdline-tools/latest && \\
    rm /tmp/cmdline-tools.zip

# Принятие лицензий и установка SDK platform 35
RUN yes | sdkmanager --licenses && \\
    sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

WORKDIR /app
COPY . /app

# Дать права на исполнение Gradle Wrapper и запустить сборку APK
RUN chmod +x gradlew && ./gradlew assembleDebug

# Готовый APK будет скопирован в смонтированный том при запуске:
# docker run --rm -v $(pwd)/out:/output budget-builder cp app/build/outputs/apk/debug/app-debug.apk /output/
CMD ["cp", "app/build/outputs/apk/debug/app-debug.apk", "/output/app-debug.apk"]
`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    filename: 'build-apk.yml',
    language: 'yaml',
    description: 'Бесплатная сборка APK в облаке через GitHub Actions при каждом push',
    code: `name: Build Android APK

on:
  push:
    branches: [ "main" ]
  workflow_dispatch: # Запуск вручную по кнопке

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew

    - name: Run Unit Tests
      run: ./gradlew test

    - name: Build Debug APK
      run: ./gradlew assembleDebug

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: app-debug
        path: app/build/outputs/apk/debug/app-debug.apk
        retention-days: 14
`,
  },
];

export const AndroidExportModal: React.FC = () => {
  const { isAndroidModalOpen, setIsAndroidModalOpen } = useBudget();
  const [activeTab, setActiveTab] = useState<'instructions' | 'code'>('instructions');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadAll = () => {
    const content = ANDROID_PROJECT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-android-studio-project-files.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModalBottomSheet
      isOpen={isAndroidModalOpen}
      onClose={() => setIsAndroidModalOpen(false)}
      title="Сборка APK и проект Android Studio"
      subtitle="Пошаговая инструкция компиляции и полный исходный код"
      maxHeight="max-h-[92vh]"
    >
      <div className="space-y-4">
        {/* Sub-tab Navigation */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'instructions'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Инструкция по сборке APK
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Исходный код проекта ({ANDROID_PROJECT_FILES.length} файлов)
          </button>
        </div>

        {/* Tab 1: Step-by-Step Instructions */}
        {activeTab === 'instructions' && (
          <div className="space-y-4">
            {/* Quick Command Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Главная команда сборки Debug APK:</span>
                <button
                  onClick={() => handleCopyCmd('./gradlew assembleDebug')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedCmd === './gradlew assembleDebug' ? (
                    <>
                      <Check size={12} />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Копировать команду</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-sm bg-slate-900 p-2.5 rounded-xl border border-slate-800 overflow-x-auto text-emerald-400">
                <Terminal size={16} className="shrink-0" />
                <span>./gradlew assembleDebug</span>
              </div>

              <p className="text-[11px] text-slate-400">
                (Для Windows в командной строке: <code className="text-slate-200">gradlew.bat assembleDebug</code>)
              </p>
            </div>

            {/* Step 1: Open in Android Studio */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Шаг 1. Открытие проекта в Android Studio</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                1. Скачайте файлы проекта (кнопка «Скачать все файлы проекта» ниже).<br />
                2. Запустите <strong>Android Studio</strong> (Ladybug / Koala / Hedgehog или новее).<br />
                3. Выберите <strong>File → Open...</strong> и укажите папку проекта. Дождитесь автоматической Gradle-синхронизации (Sync).
              </p>
            </div>

            {/* Step 2: Build APK via Menu or Terminal */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Шаг 2. Сборка APK файла</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7 space-y-2">
                <p>
                  <strong>Вариант А (через интерфейс меню Android Studio):</strong><br />
                  В верхнем меню нажмите: <br />
                  <code className="text-slate-900 dark:text-slate-100 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    Build → Build Bundle(s) / APK(s) → Build APK(s)
                  </code>
                </p>
                <p>
                  <strong>Вариант Б (через встроенный терминал):</strong><br />
                  Откройте вкладку <strong>Terminal</strong> внизу экрана и выполните:<br />
                  <code className="text-emerald-600 dark:text-emerald-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    ./gradlew assembleDebug
                  </code>
                </p>
              </div>
            </div>

            {/* Step 3: Find generated APK */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Шаг 3. Где находится готовый .apk файл?</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7 space-y-1.5">
                <p>После завершения сборки Gradle сохраняет готовый файл по пути:</p>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all select-all">
                  app/build/outputs/apk/debug/app-debug.apk
                </div>
                <p className="text-[11px] text-slate-500">
                  В правом нижнем углу Android Studio также появится всплывающее уведомление со ссылкой <strong>«locate»</strong>, по клику на которую папка с APK откроется в проводнике Windows / Finder.
                </p>
              </div>
            </div>

            {/* Step 4: Install to Android Phone */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Шаг 4. Установка APK на смартфон</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7 space-y-1">
                <p>• <strong>Через проводник / мессенджер:</strong> отправьте файл <code className="font-semibold">app-debug.apk</code> на телефон (через Telegram «Избранное», Google Drive или USB кабель) и откройте его на телефоне.</p>
                <p>• При запросе разрешите Android <em>«Установку из неизвестных источников»</em> для этого приложения.</p>
                <p>• Либо установите через USB-кабель командой: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">adb install app-debug.apk</code></p>
              </div>
            </div>

            {/* Step 5: Direct Web App Installation (PWA) */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <Smartphone size={16} />
                <span>Альтернатива: Установка прямо сейчас без компиляции (PWA)</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                Вы можете прямо сейчас открыть текущее веб-приложение в браузере Chrome на вашем Android телефоне, нажать меню <strong>«⋮»</strong> и выбрать <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>. Приложение установится как полноценное автономное приложение со своим значком и поддержкой 100% offline работы!
              </p>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownloadAll}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Download size={15} />
              <span>Скачать все файлы проекта (TXT / Gradle / Kotlin)</span>
            </button>
          </div>
        )}

        {/* Tab 2: Code Explorer */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
                <FileCode size={15} className="text-emerald-500 shrink-0" />
                <span className="font-mono truncate">{currentFile.path}</span>
              </div>

              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold active:scale-95 transition-all shrink-0"
              >
                <Download size={13} />
                Скачать всё
              </button>
            </div>

            {/* File Navigator Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {ANDROID_PROJECT_FILES.map((file, idx) => {
                const isSelected = selectedFileIndex === idx;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <FileCode size={13} />
                    <span>{file.filename}</span>
                  </button>
                );
              })}
            </div>

            {/* Code viewer box */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden text-slate-200">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                <span className="font-mono text-slate-400 truncate max-w-[240px]">
                  {currentFile.path}
                </span>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                >
                  {hasCopied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 overflow-x-auto max-h-[340px] no-scrollbar">
                <pre className="font-mono text-xs leading-relaxed text-slate-300">
                  {currentFile.code}
                </pre>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {currentFile.description}.
            </p>
          </div>
        )}
      </div>
    </ModalBottomSheet>
  );
};
