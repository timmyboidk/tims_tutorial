import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { Lesson, InstructorComment } from '../types';

/* ================================================================
 * GhostEditor — Rebuilt as intelligent Copilot IDE
 *
 * Uses native Monaco "quickSuggestions" for standard word autocomplete,
 * and custom "InlineCompletionsProvider" to render the target code
 * as ghost text (press Tab to accept). No longer blocks typing!
 * ================================================================ */

interface GhostEditorProps {
    lesson: Lesson;
    onProgress: (confirmed: number, total: number) => void;
}

const COMMENT_CLASS = 'comment-decoration';

export default function GhostEditor({ lesson, onProgress }: GhostEditorProps) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const providerRef = useRef<any>(null);

    const [confirmedCount, setConfirmedCount] = useState(0);
    const [completed, setCompleted] = useState(false);

    const targetCode = lesson.targetCode;
    const targetStrNoSpace = useMemo(() => targetCode.replace(/\s/g, ''), [targetCode]);
    const totalChars = targetStrNoSpace.length;

    const startingCode = lesson.startingCode || '';

    const evaluateProgress = useCallback((currentVal: string) => {
        const userStr = currentVal.replace(/\s/g, '');
        let matchCount = 0;

        // 分别计算去除了空格的字符串，看有多少前缀是匹配的
        for (let i = 0; i < Math.min(userStr.length, totalChars); i++) {
            if (userStr[i] === targetStrNoSpace[i]) {
                matchCount++;
            } else {
                break;
            }
        }

        setConfirmedCount(matchCount);
        if (matchCount >= totalChars && totalChars > 0) {
            setCompleted(true);
        } else {
            setCompleted(false);
        }

        const editor = editorRef.current;
        const monaco = monacoRef.current;
        if (editor && monaco) {
            const lines = currentVal.split('\n');
            const currentLineCount = lines.length;
            const newDecorations = lesson.comments
                .filter((c: InstructorComment) => c.line <= currentLineCount)
                .map((c: InstructorComment) => ({
                    range: new monaco.Range(c.line, 1, c.line, 1),
                    options: {
                        after: {
                            content: `  ${c.text}`,
                            inlineClassName: COMMENT_CLASS,
                        }
                    }
                }));
            decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
        }
    }, [targetStrNoSpace, totalChars, lesson.comments]);

    useEffect(() => {
        setConfirmedCount(0);
        setCompleted(false);
        if (editorRef.current) {
            editorRef.current.setValue(startingCode);
            evaluateProgress(startingCode);
        }
    }, [lesson.id, startingCode, evaluateProgress]);

    useEffect(() => {
        onProgress(confirmedCount, totalChars);
    }, [confirmedCount, totalChars, onProgress]);

    const handleEditorDidMount: OnMount = useCallback(
        (editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            editor.setValue(startingCode);
            evaluateProgress(startingCode);

            // 💡 侦听用户输入的变化，自动打分评估
            editor.onDidChangeModelContent(() => {
                evaluateProgress(editor.getValue());
            });

            if (providerRef.current) {
                providerRef.current.dispose();
            }

            // 💡 把剩余的 Target Code 注册成类似 Copilot 的灰色幻影提示 (Ghost Text)
            providerRef.current = monaco.languages.registerInlineCompletionsProvider(
                ['typescript', 'javascript', 'java', 'json', 'yaml', 'dockerfile'],
                {
                    provideInlineCompletions: function (model: any, position: any) {
                        const userLines = model.getValue().split('\n');
                        const targetLines = targetCode.split('\n');

                        const userLine = userLines[position.lineNumber - 1] || '';
                        const targetLine = targetLines[position.lineNumber - 1];

                        if (!targetLine) return { items: [] };

                        // 💡 如果用户现在的行完全匹配我们的期待值，甚至没敲完，那么我们幻影出下半段！
                        if (targetLine.startsWith(userLine) && userLine.trim() !== '') {
                            const completion = targetLine.substring(userLine.length);
                            if (completion.length > 0) {
                                return {
                                    items: [{
                                        insertText: completion,
                                        range: new monaco.Range(
                                            position.lineNumber,
                                            position.column,
                                            position.lineNumber,
                                            position.column
                                        )
                                    }]
                                };
                            }
                        }

                        // 💡 宽容一点，允许用户带空白尾缀也能继续联想出目标代码
                        const trimmedUser = userLine.trimEnd();
                        if (targetLine.startsWith(trimmedUser) && trimmedUser.length > 0) {
                            const remainingInLine = targetLine.substring(trimmedUser.length);
                            if (remainingInLine.length > 0) {
                                return {
                                    items: [{
                                        insertText: remainingInLine,
                                        range: new monaco.Range(
                                            position.lineNumber,
                                            position.column - (userLine.length - trimmedUser.length),
                                            position.lineNumber,
                                            position.column
                                        )
                                    }]
                                };
                            }
                        }

                        return { items: [] };
                    },
                    freeInlineCompletions: function () { }
                }
            );
        },
        [startingCode, targetCode, evaluateProgress]
    );

    // Unmount 清理器
    useEffect(() => {
        return () => {
            if (providerRef.current) {
                providerRef.current.dispose();
            }
        };
    }, []);

    return (
        <div className="h-full w-full relative">
            {completed && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
                    <div className="text-center p-10 rounded-2xl bg-white border border-[#DADCE0] shadow-xl">
                        <h3 className="text-2xl font-bold text-[#34A853]">课程完成</h3>
                        <p className="mt-3 text-[#5F6368]">你已成功拼写出了所有核心业务逻辑代码！</p>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 right-0 z-10 h-1 bg-[#E8EAED]">
                <div
                    className="h-full bg-[#4285F4] transition-all duration-200"
                    style={{ width: `${totalChars > 0 ? (confirmedCount / totalChars) * 100 : 0}%` }}
                />
            </div>

            <Editor
                height="100%"
                language={lesson.language === 'typescript' ? 'typescript' : 'java'}
                theme="light"
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontLigatures: true,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    renderLineHighlight: 'line',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                    lineHeight: 22,
                    tabSize: 2,

                    // 💡 Unlock powerful native code autocompletion! (系统原生关键词提示)
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'smart',
                    parameterHints: { enabled: true },
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoIndent: 'full',
                    formatOnType: true,
                    formatOnPaste: true,

                    // 💡 Enable our Copilot ghost text plugin (按 TAB 直接填充)
                    inlineSuggest: { enabled: true },
                }}
            />
        </div>
    );
}
