import type { Lesson, LessonProgress } from '../types';

/* ================================================================
 * LessonSidebar — Light theme with Google Material palette
 * Clean spacing, no emoji, proper margins
 * ================================================================ */

interface LessonSidebarProps {
    lessons: Lesson[];
    progressMap: Record<string, LessonProgress>;
    activeLessonId: string;
    onSelectLesson: (id: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

/** Group lessons by their category */
function groupByCategory(lessons: Lesson[]): Record<string, Lesson[]> {
    const groups: Record<string, Lesson[]> = {};
    for (const lesson of lessons) {
        if (!groups[lesson.category]) groups[lesson.category] = [];
        groups[lesson.category].push(lesson);
    }
    return groups;
}

export default function LessonSidebar({
    lessons,
    progressMap,
    activeLessonId,
    onSelectLesson,
    collapsed,
    onToggleCollapse,
}: LessonSidebarProps) {
    const groups = groupByCategory(lessons);

    if (collapsed) {
        return (
            <div className="flex flex-col items-center py-5 w-14 bg-[#F8F9FA] border-r border-[#DADCE0]">
                <button
                    onClick={onToggleCollapse}
                    className="p-2 rounded-lg hover:bg-[#E8EAED] text-[#5F6368] transition-colors"
                    aria-label="展开侧边栏"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
                <div className="mt-6 flex flex-col gap-2">
                    {lessons.map((lesson) => {
                        const prog = progressMap[lesson.id];
                        const pct = prog ? Math.round((prog.confirmedChars / prog.totalChars) * 100) : 0;
                        const isActive = lesson.id === activeLessonId;
                        return (
                            <button
                                key={lesson.id}
                                onClick={() => onSelectLesson(lesson.id)}
                                className={`relative w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isActive
                                    ? 'bg-[#E8F0FE] text-[#4285F4]'
                                    : 'text-[#80868B] hover:bg-[#E8EAED] hover:text-[#5F6368]'
                                    }`}
                                title={lesson.title}
                            >
                                {pct === 100 ? '✓' : `${pct}`}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-72 bg-[#F8F9FA] border-r border-[#DADCE0] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[#DADCE0]">
                <h3 className="text-sm font-semibold text-[#202124] tracking-wide">课程目录</h3>
                <button
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded-lg hover:bg-[#E8EAED] text-[#80868B] hover:text-[#5F6368] transition-colors"
                    aria-label="折叠侧边栏"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Lesson list */}
            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                {Object.entries(groups).map(([category, categoryLessons]) => (
                    <div key={category}>
                        <h4 className="px-2 mb-3 text-xs font-semibold text-[#80868B] uppercase tracking-wider">
                            {category}
                        </h4>
                        <ul className="space-y-1">
                            {categoryLessons.map((lesson) => {
                                const prog = progressMap[lesson.id];
                                const pct = prog
                                    ? Math.round((prog.confirmedChars / prog.totalChars) * 100)
                                    : 0;
                                const isActive = lesson.id === activeLessonId;
                                const isComplete = pct === 100;

                                return (
                                    <li key={lesson.id}>
                                        <button
                                            onClick={() => onSelectLesson(lesson.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                                                ? 'bg-[#E8F0FE] text-[#4285F4]'
                                                : 'text-[#5F6368] hover:bg-[#E8EAED] hover:text-[#202124]'
                                                }`}
                                        >
                                            {/* Progress ring */}
                                            <div className="relative shrink-0 w-8 h-8">
                                                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                                                    <circle
                                                        cx="16" cy="16" r="12"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        className="text-[#E8EAED]"
                                                    />
                                                    <circle
                                                        cx="16" cy="16" r="12"
                                                        fill="none"
                                                        strokeWidth="2.5"
                                                        strokeDasharray={`${pct * 0.754} 100`}
                                                        strokeLinecap="round"
                                                        className={isComplete ? 'text-[#34A853]' : 'text-[#4285F4]'}
                                                    />
                                                </svg>
                                                {isComplete && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-[#34A853] text-xs">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{lesson.title}</p>
                                                <p className={`text-xs transition-colors ${isActive ? 'text-[#4285F4]/60' : 'text-[#BDC1C6]'}`}>
                                                    {isComplete ? '已完成' : `${pct}% 已完成`}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    );
}
