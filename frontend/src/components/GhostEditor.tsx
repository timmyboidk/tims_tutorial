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
    const backgroundEditorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const bgDecorationsRef = useRef<string[]>([]);
    const providerRef = useRef<any>(null);

    const [confirmedCount, setConfirmedCount] = useState(0);
    const [completed, setCompleted] = useState(false);
    const hasSavedRef = useRef<boolean>(false);

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
            if (!hasSavedRef.current) {
                hasSavedRef.current = true;
                fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId: lesson.id, completed: true })
                }).catch(err => console.error('Failed to save progress:', err));
            }
        } else {
            setCompleted(false);
        }

        const editor = editorRef.current;
        const bgEditor = backgroundEditorRef.current;
        const monaco = monacoRef.current;

        // 💡 动态切分 targetCode 找到实际 offset，给 bgEditor 加装透明度（使得已经打出来的代码的重影消失）
        if (bgEditor && monaco) {
            let actualOffset = 0;
            let nonSpaceFound = 0;
            for (let i = 0; i < targetCode.length; i++) {
                if (nonSpaceFound >= matchCount) {
                    actualOffset = i;
                    break;
                }
                if (!/\s/.test(targetCode[i])) {
                    nonSpaceFound++;
                }
                if (i === targetCode.length - 1 && nonSpaceFound === matchCount) {
                    actualOffset = targetCode.length;
                }
            }

            const model = bgEditor.getModel();
            if (model) {
                const endPos = model.getPositionAt(actualOffset);
                const fullEndPos = model.getPositionAt(targetCode.length);
                const newBgDecorations = [];

                // 前半部分：已经被正确敲击的代码，完全透明隐身
                if (actualOffset > 0) {
                    newBgDecorations.push({
                        range: new monaco.Range(1, 1, endPos.lineNumber, endPos.column),
                        options: { inlineClassName: 'ghost-hidden' }
                    });
                }

                // 后半部分：属于“未来”的重影代码，淡出显示
                if (actualOffset < targetCode.length) {
                    newBgDecorations.push({
                        range: new monaco.Range(endPos.lineNumber, endPos.column, fullEndPos.lineNumber, fullEndPos.column),
                        options: { inlineClassName: 'ghost-visible' }
                    });
                }

                bgDecorationsRef.current = bgEditor.deltaDecorations(bgDecorationsRef.current, newBgDecorations);
            }
        }

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
    }, [targetStrNoSpace, totalChars, targetCode, lesson.comments]);

    useEffect(() => {
        setConfirmedCount(0);
        setCompleted(false);
        hasSavedRef.current = false;
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

            // sync scrolling with background editor
            editor.onDidScrollChange((e: any) => {
                if (backgroundEditorRef.current) {
                    backgroundEditorRef.current.setScrollPosition({ scrollTop: e.scrollTop, scrollLeft: e.scrollLeft });
                }
            });

            // 💡 侦听用户输入的变化，自动打分评估
            editor.onDidChangeModelContent(() => {
                evaluateProgress(editor.getValue());
            });

            if (providerRef.current) {
                providerRef.current.dispose();
            }

            // 💡 把剩余的 Target Code 注册成类似 Copilot 的灰色幻影提示 (Ghost Text)
            // 作为 Inline 补充，这样按 Tab 依然能够自动补全
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
            <style>{`
                .ghost-visible {
                    color: #9ca3af !important;
                    opacity: 0.6 !important;
                }
                .ghost-hidden {
                    opacity: 0 !important;
                }
                .monaco-bg-transparent .monaco-editor,
                .monaco-bg-transparent .monaco-editor-background,
                .monaco-bg-transparent .margin {
                    background-color: transparent !important;
                }
            `}</style>

            {completed && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
                    <div className="text-center p-10 rounded-2xl bg-white border border-[#DADCE0] shadow-xl">
                        <h3 className="text-2xl font-bold text-[#34A853]">课程完成</h3>
                        <p className="mt-3 text-[#5F6368]">你已成功拼写出了所有核心业务逻辑代码！</p>
                    </div>
                </div>
            )}

            <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-[#E8EAED]">
                <div
                    className="h-full bg-[#4285F4] transition-all duration-200"
                    style={{ width: `${totalChars > 0 ? (confirmedCount / totalChars) * 100 : 0}%` }}
                />
            </div>

            {/* Background Editor: 显示目标代码淡淡的重影 */}
            <div className="absolute inset-0 z-0">
                <Editor
                    height="100%"
                    language={lesson.language === 'typescript' ? 'typescript' : 'java'}
                    theme="light"
                    value={targetCode}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        lineNumbers: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        readOnly: true,
                        domReadOnly: true,
                        wordWrap: 'on',
                        automaticLayout: true,
                        renderLineHighlight: 'none',
                        selectionHighlight: false,
                        matchBrackets: 'never',
                        occurrencesHighlight: 'off',
                        padding: { top: 16, bottom: 16 },
                        lineHeight: 22,
                        tabSize: 2,
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
                    }}
                    onMount={(editor) => {
                        backgroundEditorRef.current = editor;
                        // Initial evaluation to hide the already-typed starting code
                        evaluateProgress(startingCode);
                    }}
                />
            </div>

            {/* Foreground Editor: 用户实际输入的地方，背景透明！ */}
            <div className="absolute inset-0 z-10 opacity-100">
                <Editor
                    height="100%"
                    className="monaco-bg-transparent"
                    language={lesson.language === 'typescript' ? 'typescript' : 'java'}
                    beforeMount={(monaco) => {
                        monaco.editor.defineTheme('transparentTheme', {
                            base: 'vs',
                            inherit: true,
                            rules: [],
                            colors: {
                                'editor.background': '#ffffff00',
                                'editorGutter.background': '#ffffff00',
                                'editorLineNumber.foreground': '#00000000',
                                'editorLineNumber.activeForeground': '#00000000',
                            }
                        });
                    }}
                    theme="transparentTheme"
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

                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'smart',
                        parameterHints: { enabled: true },
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoIndent: 'full',
                        formatOnType: true,
                        formatOnPaste: true,

                        inlineSuggest: { enabled: true },
                    }}
                />
            </div>
        </div>
    );
}
