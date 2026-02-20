import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { lessons } from '../data/lessons';

interface LandingPageProps {
    onSelectLesson: (id: string) => void;
}

export default function LandingPage({ onSelectLesson }: LandingPageProps) {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderMermaid = async () => {
            if (mermaidRef.current) {
                try {
                    const id = `landing-mermaid-${Date.now()}`;
                    const { svg } = await mermaid.render(
                        id,
                        `graph TD
    Client["📱 Frontend (React / Next.js)"]
    API["⚡ Spring Boot REST API"]
    Redis[("🚀 Redis (Cache & Session)")]
    Kafka{"📨 Kafka (Event Bus) DLQ"}
    DB[("🗄️ MySQL (Persistent Storage)")]
    
    Client -- "1. Login / Fetch Feed" --> API
    Client -- "2. Like Video" --> API
    API -- "3. Read/Write Cache" --> Redis
    API -- "4. Publish Like Event" --> Kafka
    Kafka -- "5. Consume & Aggregate" --> DB
    
    style Client fill:#E8F0FE,stroke:#4285F4,stroke-width:2px,color:#202124
    style API fill:#E6F4EA,stroke:#34A853,stroke-width:2px,color:#202124
    style Redis fill:#FCE8E6,stroke:#EA4335,stroke-width:2px,color:#202124
    style Kafka fill:#FEF7E0,stroke:#FBBC05,stroke-width:2px,color:#202124
    style DB fill:#E8F0FE,stroke:#4285F4,stroke-width:2px,color:#202124`
                    );
                    mermaidRef.current.innerHTML = svg;
                } catch (e) {
                    console.error('Mermaid render failed', e);
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = '<div class="text-red-500">Failed to load architecture diagram.</div>';
                    }
                }
            }
        };

        renderMermaid();
    }, []);

    // Group lessons by module (or just category)
    const categories = Array.from(new Set(lessons.map((l) => l.category)));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 overflow-y-auto w-full h-full">
            <div className="max-w-6xl w-full">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">短视频 SaaS 看板项目实战全栈架构</h1>
                <p className="text-center text-gray-600 mb-10 text-lg">从零开始构建一个支撑高并发的高可用体系</p>

                {/* Architecture Diagram */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12 flex justify-center">
                    <div ref={mermaidRef} className="text-center w-full max-w-3xl" />
                </div>

                {/* Roadmap Grid */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 实战闯关地图 (Roadmap)</h2>
                <div className="space-y-8 pb-12">
                    {categories.map((category) => {
                        const catLessons = lessons.filter((l) => l.category === category);
                        return (
                            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {catLessons.map((lesson) => {
                                        return (
                                            <div
                                                key={lesson.id}
                                                onClick={() => onSelectLesson(lesson.id)}
                                                className="group relative p-4 rounded-lg border border-gray-200 hover:border-[#4285F4] hover:shadow-md cursor-pointer transition-all bg-white flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${lesson.type === 'frontend' ? 'bg-[#E8F0FE] text-[#1967D2]' : 'bg-[#E6F4EA] text-[#137333]'}`}>
                                                            {lesson.type === 'frontend' ? '前端' : '后端'}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-800 group-hover:text-[#4285F4] transition-colors line-clamp-2">
                                                        {lesson.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
