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
    cachedCode?: string;
    onCodeChange: (code: string) => void;
}

const COMMENT_CLASS = 'comment-decoration';

export default function GhostEditor({ lesson, cachedCode, onCodeChange }: GhostEditorProps) {
    const editorRef = useRef<any>(null);
    const backgroundEditorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const bgDecorationsRef = useRef<string[]>([]);
    const providerRef = useRef<any>(null);
    const saveTimeoutRef = useRef<any>(null);

    const targetCode = lesson.targetCode;
    const targetStrNoSpace = useMemo(() => targetCode.replace(/\s/g, ''), [targetCode]);
    const totalChars = targetStrNoSpace.length;

    const [localCode, setLocalCode] = useState<string>(cachedCode || lesson.startingCode || '');

    // Debounced API save
    const saveCodeToBackend = useCallback((code: string) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: lesson.id, code })
            }).catch(err => console.error('Failed to save code progress:', err));
        }, 1000);
    }, [lesson.id]);

    const handleModelChange = useCallback((currentVal: string) => {
        setLocalCode(currentVal);
        onCodeChange(currentVal);
        saveCodeToBackend(currentVal);

        const editor = editorRef.current;
        const bgEditor = backgroundEditorRef.current;
        const monaco = monacoRef.current;

        // Simplify Ghost logic: calculate a simple match offset just to fade out typed parts
        const userStr = currentVal.replace(/\s/g, '');
        let matchCount = 0;
        for (let i = 0; i < Math.min(userStr.length, totalChars); i++) {
            if (userStr[i] === targetStrNoSpace[i]) {
                matchCount++;
            } else {
                break;
            }
        }

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

                if (actualOffset > 0) {
                    newBgDecorations.push({
                        range: new monaco.Range(1, 1, endPos.lineNumber, endPos.column),
                        options: { inlineClassName: 'ghost-hidden' }
                    });
                }
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
    }, [targetCode, targetStrNoSpace, totalChars, lesson.comments, onCodeChange, saveCodeToBackend]);

    // Restore cached code on lesson change
    useEffect(() => {
        const initialCode = cachedCode !== undefined ? cachedCode : (lesson.startingCode || '');
        setLocalCode(initialCode);
        if (editorRef.current) {
            editorRef.current.setValue(initialCode);
            handleModelChange(initialCode);
        }
    }, [lesson.id, cachedCode, lesson.startingCode]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleEditorDidMount: OnMount = useCallback(
        (editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            const initialCode = cachedCode !== undefined ? cachedCode : (lesson.startingCode || '');
            editor.setValue(initialCode);
            handleModelChange(initialCode);

            // sync scrolling with background editor
            editor.onDidScrollChange((e: any) => {
                if (backgroundEditorRef.current) {
                    backgroundEditorRef.current.setScrollPosition({ scrollTop: e.scrollTop, scrollLeft: e.scrollLeft });
                }
            });

            // 💡 侦听用户输入的变化，存储代码
            editor.onDidChangeModelContent(() => {
                handleModelChange(editor.getValue());
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
        [cachedCode, lesson.startingCode, handleModelChange, targetCode]
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

            <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-[#E8EAED]" />

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
                        const initialCode = cachedCode !== undefined ? cachedCode : (lesson.startingCode || '');
                        // Call dummy change to trigger initial offset styling
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
