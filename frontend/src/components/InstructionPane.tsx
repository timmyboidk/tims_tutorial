import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
        <div className="flex flex-col py-0 md:py-6 px-0 md:px-4 min-h-full">
            <div className="max-w-5xl w-full mx-auto bg-white min-h-full md:min-h-0 md:h-auto shadow-sm md:shadow-lg md:shadow-gray-200/50 md:rounded-2xl border-x md:border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="shrink-0 px-10 py-6 border-b border-[#DADCE0] bg-gray-50/50">
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
                    <div className="px-10 py-8 prose max-w-none
          [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:border-b [&_h1]:border-gray-200 [&_h1]:pb-4 [&_h1]:mb-6 [&_h1]:text-gray-900
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-gray-800
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-gray-800
          [&_p]:text-base [&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-gray-700
          [&_ul]:mb-6 [&_ul]:pl-6 [&_ul]:space-y-3 [&_ul]:list-disc
          [&_li]:text-base [&_li]:leading-relaxed [&_li]:text-gray-700 [&_li]:marker:text-blue-500
          [&_strong]:font-semibold [&_strong]:text-gray-900
          [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:bg-blue-50/60 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-[#1967d2]
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-10 [&_img]:border [&_img]:border-gray-100 [&_img]:w-full [&_img]:object-cover
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-3 [&_blockquote]:px-4 [&_blockquote]:my-6 [&_blockquote]:rounded-r-lg">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="my-8 rounded-xl overflow-hidden border border-gray-200/80 shadow-sm bg-[#f8f9fa]">
                                            <SyntaxHighlighter
                                                {...props}
                                                children={String(children).replace(/\n$/, '')}
                                                style={vs}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6', backgroundColor: '#f8f9fa' }}
                                            />
                                        </div>
                                    ) : (
                                        <code {...props} className={className}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
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
