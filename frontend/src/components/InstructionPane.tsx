import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';
import type { Lesson } from '../types';

/* ================================================================
 * InstructionPane — Light theme with Google Material palette
 * Better margins/padding, clean typography
 * ================================================================ */

interface InstructionPaneProps {
    lesson: Lesson;
}

export default function InstructionPane({
    lesson,
}: InstructionPaneProps) {

    // Removed dynamic progress, diagram stays static
    const completedSteps = 7;

    // Pass target code to live preview instead of partially confirmed code
    const confirmedCode = lesson.targetCode;

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

            </div>
        </div>
    );
}
