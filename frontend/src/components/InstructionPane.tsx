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
                <div className="shrink-0 px-8 py-8 md:py-10 bg-white">
                    <h1 className="text-[36px] leading-[1.2] font-medium text-[#202124] font-sans pb-4">
                        {lesson.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <button className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-5 py-2 rounded-md text-[14px] font-medium transition-colors cursor-pointer shadow-sm">
                            ❮ Previous
                        </button>
                        <button className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-5 py-2 rounded-md text-[14px] font-medium transition-colors cursor-pointer shadow-sm">
                            Next ❯
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 pb-16">
                    {/* Markdown instructions */}
                    <div className="px-8 prose max-w-none
          [&_h2]:text-[28px] [&_h2]:font-medium [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[#202124] [&_h2]:border-b [&_h2]:border-[#DADCE0] [&_h2]:pb-2
          [&_h3]:text-[22px] [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[#202124]
          [&_p]:text-[16px] [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-[#3C4043] [&_p]:font-sans
          [&_ul]:mb-6 [&_ul]:pl-10 [&_ul]:space-y-1 [&_ul]:list-disc
          [&_li]:text-[16px] [&_li]:leading-relaxed [&_li]:text-[#3C4043] [&_li]:font-sans
          [&_strong]:font-semibold [&_strong]:text-[#202124]
          [&_:not(pre)>code]:text-[14px] [&_:not(pre)>code]:text-[#D93025] [&_:not(pre)>code]:bg-[#F1F3F4] [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:font-bold
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_img]:shadow-sm [&_img]:my-8 [&_img]:w-full [&_img]:max-w-3xl [&_img]:object-cover [&_img]:rounded-xl [&_img]:border [&_img]:border-[#DADCE0]
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#1A73E8] [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:text-[#3C4043] [&_blockquote]:bg-[#F8F9FA] [&_blockquote]:my-6 [&_blockquote]:rounded-r-lg">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="my-6 rounded-xl overflow-hidden border border-[#DADCE0] shadow-sm bg-[#F8F9FA]">
                                            <div className="bg-[#F1F3F4] px-4 py-2 border-b border-[#DADCE0] flex items-center">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-[#EA4335]"></div>
                                                    <div className="w-3 h-3 rounded-full bg-[#FBBC04]"></div>
                                                    <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
                                                </div>
                                                <span className="ml-4 text-[12px] font-mono text-[#5F6368] uppercase tracking-wider">{match[1]}</span>
                                            </div>
                                            <div className="p-4 overflow-x-auto">
                                                <SyntaxHighlighter
                                                    {...props}
                                                    children={String(children).replace(/\n$/, '')}
                                                    style={vs}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: 0, fontSize: '18px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 'normal', lineHeight: '1.6', backgroundColor: 'transparent' }}
                                                />
                                            </div>
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

                    {/* Explanatory Illustration Feature */}
                    {lesson.illustrationUrl && (
                        <div className="px-8 pb-10">
                            <hr className="border-[#DADCE0] my-6" />
                            <h2 className="text-[28px] font-medium text-[#202124] mb-4 font-sans">
                                Architecture Illustration
                            </h2>
                            <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#DADCE0] shadow-sm">
                                <img src={lesson.illustrationUrl} alt="课程说明性插图" className="w-full object-cover rounded-lg" />
                            </div>
                        </div>
                    )}

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
