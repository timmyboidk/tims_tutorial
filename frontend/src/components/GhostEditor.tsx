import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { Lesson, InstructorComment } from '../types';

/* ================================================================
 * GhostEditor — The heuristic typing engine
 *
 * Renders `targetCode` as faded ghost text in Monaco. As the user
 * types matching characters, the text becomes fully opaque. Wrong
 * keystrokes are blocked and trigger an error flash animation.
 * ================================================================ */

interface GhostEditorProps {
    lesson: Lesson;
    onProgress: (confirmed: number, total: number) => void;
}

/** CSS class names injected into Monaco for decoration styling */
const GHOST_CLASS = 'ghost-text-decoration';
const CONFIRMED_CLASS = 'confirmed-text-decoration';
const COMMENT_CLASS = 'comment-decoration';
const ERROR_CLASS = 'error-line-decoration';

export default function GhostEditor({ lesson, onProgress }: GhostEditorProps) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const [errorLine, setErrorLine] = useState<number | null>(null);
    const [completed, setCompleted] = useState(false);

    const targetCode = lesson.targetCode;
    const targetLines = useMemo(() => targetCode.split('\n'), [targetCode]);
    const totalChars = targetCode.length;

    /** Reset state whenever the lesson changes */
    useEffect(() => {
        setConfirmedCount(0);
        setErrorLine(null);
        setCompleted(false);
        if (editorRef.current) {
            editorRef.current.setValue(targetCode);
            updateDecorations(0);
        }
    }, [lesson.id]);

    /** Report progress upstream */
    useEffect(() => {
        onProgress(confirmedCount, totalChars);
    }, [confirmedCount, totalChars, onProgress]);

    /** Convert a character offset into {lineNumber, column} in multi-line text */
    const offsetToPosition = useCallback(
        (offset: number) => {
            let remaining = offset;
            for (let i = 0; i < targetLines.length; i++) {
                const lineLen = targetLines[i].length + 1; // +1 for \n
                if (remaining < lineLen) {
                    return { lineNumber: i + 1, column: remaining + 1 };
                }
                remaining -= lineLen;
            }
            const lastLine = targetLines.length;
            return { lineNumber: lastLine, column: (targetLines[lastLine - 1]?.length ?? 0) + 1 };
        },
        [targetLines]
    );

    /** Build an inline decoration for an instructor comment */
    const buildCommentDecorations = useCallback(
        (monaco: any): any[] => {
            return lesson.comments.map((c: InstructorComment) => ({
                range: new monaco.Range(c.line, 1, c.line, 1),
                options: {
                    after: {
                        content: `  ${c.text}`,
                        inlineClassName: COMMENT_CLASS,
                    },
                },
            }));
        },
        [lesson.comments]
    );

    /** Apply decorations: ghost (untyped) + confirmed (typed) + comments */
    const updateDecorations = useCallback(
        (charIndex: number) => {
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            if (!editor || !monaco) return;

            const decorations: any[] = [];

            // Position separating confirmed vs ghost
            const splitPos = offsetToPosition(charIndex);

            if (charIndex > 0) {
                // Confirmed region: line 1, col 1 → splitPos
                decorations.push({
                    range: new monaco.Range(1, 1, splitPos.lineNumber, splitPos.column),
                    options: { inlineClassName: CONFIRMED_CLASS },
                });
            }

            if (charIndex < totalChars) {
                // Ghost region: splitPos → end of file
                const endLine = targetLines.length;
                const endCol = (targetLines[endLine - 1]?.length ?? 0) + 1;
                decorations.push({
                    range: new monaco.Range(
                        splitPos.lineNumber,
                        splitPos.column,
                        endLine,
                        endCol
                    ),
                    options: { inlineClassName: GHOST_CLASS },
                });
            }

            // Instructor comments
            decorations.push(...buildCommentDecorations(monaco));

            // Error flash
            if (errorLine !== null) {
                decorations.push({
                    range: new monaco.Range(errorLine, 1, errorLine, 1),
                    options: {
                        isWholeLine: true,
                        className: ERROR_CLASS,
                    },
                });
            }

            decorationsRef.current = editor.deltaDecorations(
                decorationsRef.current,
                decorations
            );
        },
        [offsetToPosition, buildCommentDecorations, totalChars, targetLines, errorLine]
    );

    /** Handle editor mount: configure settings and install key handler */
    const handleEditorDidMount: OnMount = useCallback(
        (editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            // Set initial content to the full target (displayed as ghost)
            editor.setValue(targetCode);

            // Move cursor to the beginning
            editor.setPosition({ lineNumber: 1, column: 1 });

            // Initial decorations
            updateDecorations(0);

            /* ── Key handler: intercept every keystroke ── */
            editor.onKeyDown((e: any) => {
                // Allow navigation keys
                const allowedKeys = new Set([
                    monaco.KeyCode.LeftArrow,
                    monaco.KeyCode.RightArrow,
                    monaco.KeyCode.UpArrow,
                    monaco.KeyCode.DownArrow,
                    monaco.KeyCode.Home,
                    monaco.KeyCode.End,
                    monaco.KeyCode.PageUp,
                    monaco.KeyCode.PageDown,
                    monaco.KeyCode.Escape,
                ]);

                // Allow ctrl/cmd combos (copy, etc.)
                if (e.ctrlKey || e.metaKey) return;

                if (allowedKeys.has(e.keyCode)) return;

                // Block ALL other edits — we handle typing ourselves
                e.preventDefault();
                e.stopPropagation();

                // If lesson is complete, do nothing
                if (confirmedCount >= totalChars) return;

                /** Determine the character the user intended to type */
                let typedChar: string | null = null;

                if (e.keyCode === monaco.KeyCode.Enter) {
                    typedChar = '\n';
                } else if (e.keyCode === monaco.KeyCode.Tab) {
                    // We treat Tab as the appropriate whitespace from targetCode
                    // Check if next chars in target are spaces (an indent)
                    const upcoming = targetCode.substring(confirmedCount);
                    const indentMatch = upcoming.match(/^( {2,4}|\t)/);
                    if (indentMatch) {
                        // Auto-advance through the indent whitespace
                        const indent = indentMatch[0];
                        const newCount = confirmedCount + indent.length;
                        setConfirmedCount(newCount);
                        setErrorLine(null);
                        if (newCount >= totalChars) setCompleted(true);
                        updateDecorations(newCount);
                        const newPos = offsetToPosition(newCount);
                        editor.setPosition(newPos);
                        editor.revealPositionInCenter(newPos);
                        return;
                    }
                    typedChar = '\t';
                } else if (e.browserEvent?.key?.length === 1) {
                    typedChar = e.browserEvent.key;
                }

                if (typedChar === null) return;

                const expectedChar = targetCode[confirmedCount];

                if (typedChar === expectedChar) {
                    // ✅ Correct character
                    const newCount = confirmedCount + 1;

                    // Auto-skip whitespace at the beginning of the next line
                    let autoCount = newCount;
                    if (typedChar === '\n') {
                        // Skip leading whitespace on the new line (auto-indent)
                        while (
                            autoCount < totalChars &&
                            (targetCode[autoCount] === ' ' || targetCode[autoCount] === '\t')
                        ) {
                            autoCount++;
                        }
                    }

                    setConfirmedCount(autoCount);
                    setErrorLine(null);
                    if (autoCount >= totalChars) setCompleted(true);

                    // Move cursor and update decorations
                    const newPos = offsetToPosition(autoCount);
                    editor.setPosition(newPos);
                    editor.revealPositionInCenter(newPos);
                    updateDecorations(autoCount);
                } else {
                    // ❌ Wrong character — flash error
                    const pos = offsetToPosition(confirmedCount);
                    setErrorLine(pos.lineNumber);
                    updateDecorations(confirmedCount);

                    // Clear the flash after 400ms
                    setTimeout(() => {
                        setErrorLine(null);
                        updateDecorations(confirmedCount);
                    }, 400);
                }
            });
        },
        [targetCode, totalChars, confirmedCount, offsetToPosition, updateDecorations]
    );

    /* Re-apply decorations when confirmedCount or errorLine changes */
    useEffect(() => {
        updateDecorations(confirmedCount);
    }, [confirmedCount, errorLine, updateDecorations]);

    return (
        <div className="h-full w-full relative">
            {/* Completion overlay */}
            {completed && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
                    <div className="text-center p-10 rounded-2xl bg-white border border-[#DADCE0] shadow-xl">
                        <h3 className="text-2xl font-bold text-[#34A853]">课程完成</h3>
                        <p className="mt-3 text-[#5F6368]">你已正确输入了全部代码。</p>
                    </div>
                </div>
            )}

            {/* Progress bar */}
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
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                    lineHeight: 22,
                    tabSize: 2,
                    // Disable built-in suggestions since we control input
                    quickSuggestions: false,
                    suggestOnTriggerCharacters: false,
                    acceptSuggestionOnEnter: 'off',
                    parameterHints: { enabled: false },
                    // Disable other auto-features that interfere
                    autoClosingBrackets: 'never',
                    autoClosingQuotes: 'never',
                    autoIndent: 'none',
                    formatOnType: false,
                    formatOnPaste: false,
                }}
            />
        </div>
    );
}
