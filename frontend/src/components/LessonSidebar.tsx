import type { Lesson } from '../types';

/* ================================================================
 * LessonSidebar — Light theme with Google Material palette
 * Clean spacing, no emoji, proper margins
 * ================================================================ */

interface LessonSidebarProps {
    lessons: Lesson[];
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
    activeLessonId,
    onSelectLesson,
    collapsed,
    onToggleCollapse,
}: LessonSidebarProps) {
    const groups = groupByCategory(lessons);

    if (collapsed) {
        <div className="flex flex-col items-center py-5 w-16 bg-[#F8F9FA] border-r border-[#DADCE0] shrink-0">
            <button
                onClick={onToggleCollapse}
                className="p-2 rounded-full hover:bg-black/5 text-[#5F6368] transition-colors"
                aria-label="展开侧边栏"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            </button>
            <div className="mt-8 flex flex-col gap-3 w-full px-2 items-center">
                {lessons.map((lesson, idx) => {
                    const isActive = lesson.id === activeLessonId;
                    return (
                        <button
                            key={lesson.id}
                            onClick={() => onSelectLesson(lesson.id)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all rounded-full ${isActive
                                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                                : 'text-[#5F6368] hover:bg-black/5'
                                }`}
                            title={lesson.title}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    }

    return (
        <div className="flex flex-col w-72 bg-[#F8F9FA] shrink-0 border-r border-[#DADCE0] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#DADCE0]">
                <h3 className="text-[15px] font-medium text-[#202124]">课程章节</h3>
                <button
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded-full hover:bg-black/5 text-[#5F6368] transition-colors"
                    aria-label="折叠侧边栏"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Lesson list */}
            <nav className="flex-1 overflow-y-auto w-full custom-scrollbar py-2">
                {Object.entries(groups).map(([category, categoryLessons]) => (
                    <div key={category} className="mb-4">
                        <h4 className="px-6 pt-4 pb-2 text-xs font-semibold text-[#5F6368] uppercase tracking-wider">
                            {category}
                        </h4>
                        <ul className="flex flex-col px-3 space-y-0.5">
                            {categoryLessons.map((lesson) => {
                                const isActive = lesson.id === activeLessonId;
                                return (
                                    <li key={lesson.id} className="w-full">
                                        <button
                                            onClick={() => onSelectLesson(lesson.id)}
                                            className={`w-full text-left px-4 py-2.5 text-[14px] leading-tight transition-colors rounded-r-full font-medium ${isActive
                                                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                                                : 'text-[#3C4043] hover:bg-black/5'
                                                }`}
                                        >
                                            {lesson.title}
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
