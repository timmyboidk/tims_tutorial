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
    const completedSteps = 7;

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-4xl w-full mx-auto bg-white min-h-full shadow-sm">
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
                <div className="flex-1 pb-16">
                    {/* Markdown instructions */}
                    <div className="px-10 py-8 prose-light max-w-none
          [&_h1]:text-xl [&_h1]:border-b [&_h1]:border-[#DADCE0] [&_h1]:pb-4 [&_h1]:mb-5
          [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-sm [&_h3]:mt-5 [&_h3]:mb-2
          [&_p]:text-base [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-gray-700
          [&_ul]:mb-6 [&_ul]:pl-6 [&_ul]:space-y-3
          [&_li]:text-base [&_li]:leading-relaxed [&_li]:text-gray-700
          [&_strong]:font-semibold [&_strong]:text-gray-900
          [&_code]:text-sm [&_code]:font-mono [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[#E91E63]
          [&_pre]:bg-[#1E293B] [&_pre]:text-gray-100 [&_pre]:p-6 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-8 [&_pre]:shadow-md
          [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 [&_pre_code]:text-sm
          [&_img]:rounded-xl [&_img]:shadow-lg [&_img]:my-8 [&_img]:border [&_img]:border-gray-100
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#4285F4] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:rounded-r-lg">
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
        </div>
    );
}
