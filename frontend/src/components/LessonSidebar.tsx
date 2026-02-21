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
        return (
            <div className="flex flex-col items-center py-5 w-14 bg-[#F2F2F2] border-r border-[#E5E5E5] shrink-0">
                <button
                    onClick={onToggleCollapse}
                    className="p-2 rounded hover:bg-[#D9D9D9] text-[#282A35] transition-colors"
                    aria-label="展开侧边栏"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
                <div className="mt-6 flex flex-col gap-2 w-full px-2">
                    {lessons.map((lesson, idx) => {
                        const isActive = lesson.id === activeLessonId;
                        return (
                            <button
                                key={lesson.id}
                                onClick={() => onSelectLesson(lesson.id)}
                                className={`w-full py-2 flex items-center justify-center text-xs font-bold transition-all ${isActive
                                    ? 'bg-[#04AA6D] text-white'
                                    : 'text-[#282A35] hover:bg-[#D9D9D9]'
                                    }`}
                                title={lesson.title}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-64 bg-[#F2F2F2] shrink-0 border-r border-[#E5E5E5] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#E5E5E5]">
                <h3 className="text-[15px] font-bold text-[#282A35]">Tutorial Menu</h3>
                <button
                    onClick={onToggleCollapse}
                    className="p-1 rounded hover:bg-[#D9D9D9] text-[#282A35] transition-colors"
                    aria-label="折叠侧边栏"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Lesson list */}
            <nav className="flex-1 overflow-y-auto w-full custom-scrollbar">
                {Object.entries(groups).map(([category, categoryLessons]) => (
                    <div key={category} className="mb-2">
                        <h4 className="px-4 pt-5 pb-2 text-[13px] font-bold text-[#282A35] uppercase tracking-wider bg-[#E5E5E5]/50">
                            {category}
                        </h4>
                        <ul className="flex flex-col">
                            {categoryLessons.map((lesson) => {
                                const isActive = lesson.id === activeLessonId;
                                return (
                                    <li key={lesson.id} className="w-full">
                                        <button
                                            onClick={() => onSelectLesson(lesson.id)}
                                            className={`w-full text-left px-4 py-2.5 text-[15px] transition-colors font-sans ${isActive
                                                ? 'bg-[#04AA6D] text-white hover:bg-[#059862]'
                                                : 'text-[#282A35] hover:bg-[#D9D9D9]'
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
