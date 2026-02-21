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
                    <h1 className="text-[38px] leading-[1.2] font-normal text-[#282A35] font-sans pb-4">
                        {lesson.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <button className="bg-[#04AA6D] hover:bg-[#059862] text-white px-5 py-2 rounded text-[15px] font-sans transition-colors cursor-pointer">
                            ❮ Previous
                        </button>
                        <button className="bg-[#04AA6D] hover:bg-[#059862] text-white px-5 py-2 rounded text-[15px] font-sans transition-colors cursor-pointer">
                            Next ❯
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 pb-16">
                    {/* Markdown instructions */}
                    <div className="px-8 prose max-w-none
          [&_h2]:text-[32px] [&_h2]:font-normal [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[#282A35] [&_h2]:border-b [&_h2]:border-[#E5E5E5] [&_h2]:pb-2
          [&_h3]:text-[24px] [&_h3]:font-normal [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[#282A35]
          [&_p]:text-[15px] [&_p]:mb-4 [&_p]:leading-normal [&_p]:text-[#282A35] [&_p]:font-sans
          [&_ul]:mb-6 [&_ul]:pl-10 [&_ul]:space-y-1 [&_ul]:list-disc
          [&_li]:text-[15px] [&_li]:leading-normal [&_li]:text-[#282A35] [&_li]:font-sans
          [&_strong]:font-bold [&_strong]:text-[#282A35]
          [&_:not(pre)>code]:text-[15px] [&_:not(pre)>code]:text-[#E01E5A] [&_:not(pre)>code]:bg-[#f1f1f1] [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-sm
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_img]:shadow-md [&_img]:my-8 [&_img]:w-full [&_img]:max-w-3xl [&_img]:object-cover
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#04AA6D] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:text-[#282A35] [&_blockquote]:bg-[#E7E9EB] [&_blockquote]:my-5">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="my-6 bg-[#E7E9EB] rounded px-4 py-4 md:px-5 md:py-5 font-sans">
                                            <h3 className="text-lg font-normal text-[#282A35] mt-0 mb-3">Example</h3>
                                            <div className="bg-white p-4 border-l-4 border-[#04AA6D] overflow-x-auto">
                                                <SyntaxHighlighter
                                                    {...props}
                                                    children={String(children).replace(/\n$/, '')}
                                                    style={vs}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: 0, fontSize: '15px', fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: 'transparent' }}
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
                            <hr className="border-[#E5E5E5] my-6" />
                            <h2 className="text-[32px] font-normal text-[#282A35] mb-4 font-sans">
                                Architecture Illustration
                            </h2>
                            <div className="bg-[#E7E9EB] p-4 rounded">
                                <img src={lesson.illustrationUrl} alt="课程说明性插图" className="w-full object-cover bg-white p-2" />
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
