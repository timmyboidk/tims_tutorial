import { useState } from 'react';
import Header from './components/Header';
import LessonSidebar from './components/LessonSidebar';
import InstructionPane from './components/InstructionPane';
import LandingPage from './components/LandingPage';
import { lessons } from './data/lessons';/* ================================================================
 * App — Root component composing the split-pane layout:
 *   Sidebar | InstructionPane | GhostEditor
 * ================================================================ */

export default function App() {
    const [currentView, setCurrentView] = useState<'landing' | 'ide'>('landing');
    const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

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
                            onToggleCollapse={() => setSidebarCollapsed((c: boolean) => !c)}
                        />

                        {/* Central pane: Instructions / Content */}
                        <div className="flex-1 overflow-hidden">
                            <InstructionPane
                                lesson={activeLesson}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <LandingPage
                    onSelectLesson={(id: string) => {
                        setActiveLessonId(id);
                        setCurrentView('ide');
                    }}
                />
            )}
        </div>
    );
}
