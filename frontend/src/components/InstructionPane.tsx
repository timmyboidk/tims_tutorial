import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';
import LivePreview from './LivePreview';
import type { Lesson } from '../types';

/* ================================================================
 * InstructionPane — Light theme with Google Material palette
 * Better margins/padding, clean typography
 * ================================================================ */

interface InstructionPaneProps {
    lesson: Lesson;
    confirmedChars: number;
    totalChars: number;
}

export default function InstructionPane({
    lesson,
    confirmedChars,
    totalChars,
}: InstructionPaneProps) {
    const progress = totalChars > 0 ? confirmedChars / totalChars : 0;

    const completedSteps = useMemo(() => {
        if (!lesson.diagramMarkup) return 0;
        return Math.min(7, Math.floor(progress * 8));
    }, [progress, lesson.diagramMarkup]);

    const confirmedCode = useMemo(() => {
        return lesson.targetCode.substring(0, confirmedChars);
    }, [lesson.targetCode, confirmedChars]);

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="shrink-0 px-8 py-5 border-b border-[#DADCE0]">
                <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full ${lesson.type === 'frontend'
                        ? 'bg-[#E8F0FE] text-[#4285F4]'
                        : 'bg-[#E6F4EA] text-[#34A853]'
                        }`}>
                        {lesson.type === 'frontend' ? '前端' : '后端'}
                    </span>
                    <h2 className="text-lg font-semibold text-[#202124]">{lesson.title}</h2>
                </div>
                {/* Progress indicator */}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-[#E8EAED] overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#4285F4] transition-all duration-300"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-[#80868B] font-mono tabular-nums">
                        {Math.round(progress * 100)}%
                    </span>
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
                {/* Markdown instructions */}
                <div className="px-8 py-6 prose-light max-w-none
          [&_h1]:text-xl [&_h1]:border-b [&_h1]:border-[#DADCE0] [&_h1]:pb-4 [&_h1]:mb-5
          [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-sm [&_h3]:mt-5 [&_h3]:mb-2
          [&_p]:text-sm [&_p]:mb-4 [&_p]:leading-7
          [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:space-y-2
          [&_li]:text-sm [&_li]:leading-7
          [&_strong]:font-semibold">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lesson.instructions}
                    </ReactMarkdown>
                </div>

                {/* Backend: Mermaid diagram */}
                {lesson.type === 'backend' && lesson.diagramMarkup && (
                    <div className="px-8 pb-8">
                        <h3 className="text-xs font-semibold text-[#80868B] uppercase tracking-wider mb-4">
                            架构流程
                        </h3>
                        <MermaidDiagram
                            markup={lesson.diagramMarkup}
                            completedSteps={completedSteps}
                        />
                    </div>
                )}

                {/* Frontend: Live preview */}
                {lesson.type === 'frontend' && (
                    <div className="px-8 pb-8" style={{ height: '400px' }}>
                        <h3 className="text-xs font-semibold text-[#80868B] uppercase tracking-wider mb-4">
                            实时预览
                        </h3>
                        <LivePreview code={confirmedCode} language={lesson.language} />
                    </div>
                )}
            </div>
        </div>
    );
}
