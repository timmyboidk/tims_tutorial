import { useState, useCallback, useEffect } from 'react';
import Split from 'react-split';
import Header from './components/Header';
import LessonSidebar from './components/LessonSidebar';
import InstructionPane from './components/InstructionPane';
import GhostEditor from './components/GhostEditor';
import LandingPage from './components/LandingPage';
import { lessons } from './data/lessons';
import type { LessonProgress } from './types';

/* ================================================================
 * App — Root component composing the split-pane layout:
 *   Sidebar | InstructionPane | GhostEditor
 * ================================================================ */

export default function App() {
    const [currentView, setCurrentView] = useState<'landing' | 'ide'>('landing');
    const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>(() => {
        const map: Record<string, LessonProgress> = {};
        for (const lesson of lessons) {
            map[lesson.id] = {
                lessonId: lesson.id,
                confirmedChars: 0,
                totalChars: lesson.targetCode.length,
                completed: false,
            };
        }
        return map;
    });

    const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
    const activeProgress = progressMap[activeLesson.id];

    // Load persisted progress on mount
    useEffect(() => {
        fetch('/api/progress')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.completedLessons) {
                    setProgressMap(prev => {
                        const newMap = { ...prev };
                        for (const lessonId of data.completedLessons) {
                            if (newMap[lessonId]) {
                                newMap[lessonId] = {
                                    ...newMap[lessonId],
                                    confirmedChars: newMap[lessonId].totalChars,
                                    completed: true
                                };
                            }
                        }
                        return newMap;
                    });
                }
            })
            .catch(err => console.error('Failed to fetch progress:', err));
    }, []);

    /** Update progress for the active lesson */
    const handleProgress = useCallback(
        (confirmed: number, total: number) => {
            setProgressMap((prev) => ({
                ...prev,
                [activeLesson.id]: {
                    lessonId: activeLesson.id,
                    confirmedChars: confirmed,
                    totalChars: total,
                    completed: confirmed >= total,
                },
            }));
        },
        [activeLesson.id]
    );

    return (
        <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
            {currentView === 'ide' ? (
                <>
                    {/* Top bar */}
                    <Header
                        lessonTitle={activeLesson.title}
                        confirmedChars={activeProgress?.confirmedChars ?? 0}
                        totalChars={activeProgress?.totalChars ?? 0}
                        onBackToRoadmap={() => setCurrentView('landing')}
                    />

                    {/* Main area: sidebar + split panes */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Lesson navigation sidebar */}
                        <LessonSidebar
                            lessons={lessons}
                            progressMap={progressMap}
                            activeLessonId={activeLessonId}
                            onSelectLesson={setActiveLessonId}
                            collapsed={sidebarCollapsed}
                            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
                        />

                        {/* Resizable split panes */}
                        <Split
                            className="flex flex-1"
                            sizes={[40, 60]}
                            minSize={300}
                            gutterSize={4}
                            gutterStyle={() => ({
                                backgroundColor: '#DADCE0',
                                cursor: 'col-resize',
                            })}
                        >
                            {/* Left pane: Instructions / Diagrams / Preview */}
                            <InstructionPane
                                lesson={activeLesson}
                                confirmedChars={activeProgress?.confirmedChars ?? 0}
                                totalChars={activeProgress?.totalChars ?? 0}
                            />

                            {/* Right pane: Ghost Text Editor */}
                            <div className="h-full">
                                <GhostEditor
                                    key={activeLesson.id}
                                    lesson={activeLesson}
                                    onProgress={handleProgress}
                                />
                            </div>
                        </Split>
                    </div>
                </>
            ) : (
                <LandingPage
                    onSelectLesson={(id) => {
                        setActiveLessonId(id);
                        setCurrentView('ide');
                    }}
                    progressMap={progressMap}
                />
            )}
        </div>
    );
}
