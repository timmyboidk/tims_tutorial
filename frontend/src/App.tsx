import { useState, useCallback, useEffect } from 'react';
import Split from 'react-split';
import Header from './components/Header';
import LessonSidebar from './components/LessonSidebar';
import InstructionPane from './components/InstructionPane';
import GhostEditor from './components/GhostEditor';
import LandingPage from './components/LandingPage';
import { lessons } from './data/lessons';

/* ================================================================
 * App — Root component composing the split-pane layout:
 *   Sidebar | InstructionPane | GhostEditor
 * ================================================================ */

export default function App() {
    const [currentView, setCurrentView] = useState<'landing' | 'ide'>('landing');
    const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // codeCache: maps lessonId -> cached code string
    const [codeCache, setCodeCache] = useState<Record<string, string>>({});

    const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

    // Load persisted progress on mount
    useEffect(() => {
        fetch('/api/progress')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.records) {
                    const newCache: Record<string, string> = {};
                    data.records.forEach((r: { lessonId: string, code: string }) => {
                        newCache[r.lessonId] = r.code;
                    });
                    setCodeCache(newCache);
                }
            })
            .catch(err => console.error('Failed to fetch progress cache:', err));
    }, []);

    /** Update cached code for the active lesson */
    const handleCodeChange = useCallback(
        (code: string) => {
            setCodeCache((prev) => ({
                ...prev,
                [activeLesson.id]: code,
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
                        onBackToRoadmap={() => setCurrentView('landing')}
                    />

                    {/* Main area: sidebar + split panes */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Lesson navigation sidebar */}
                        <LessonSidebar
                            lessons={lessons}
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
                            />

                            {/* Right pane: Ghost Text Editor */}
                            <div className="h-full">
                                <GhostEditor
                                    key={activeLesson.id}
                                    lesson={activeLesson}
                                    cachedCode={codeCache[activeLesson.id]}
                                    onCodeChange={handleCodeChange}
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
                />
            )}
        </div>
    );
}
