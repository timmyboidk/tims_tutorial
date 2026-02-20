import { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { Lesson, InstructorComment } from '../types';

/* ================================================================
 * Standard Code Editor
 *
 * Full featured editor without ghost typing evaluation restrictions.
 * ================================================================ */

interface GhostEditorProps {
    lesson: Lesson;
    cachedCode?: string;
    onCodeChange: (code: string) => void;
}

const COMMENT_CLASS = 'comment-decoration';

export default function GhostEditor({ lesson, cachedCode, onCodeChange }: GhostEditorProps) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const saveTimeoutRef = useRef<any>(null);

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
        const monaco = monacoRef.current;

        if (editor && monaco && lesson.comments) {
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
    }, [lesson.comments, onCodeChange, saveCodeToBackend]);

    // Restore cached code on lesson change
    useEffect(() => {
        const initialCode = cachedCode !== undefined ? cachedCode : (lesson.startingCode || '');
        setLocalCode(initialCode);
        if (editorRef.current) {
            editorRef.current.setValue(initialCode);
            handleModelChange(initialCode);
        }
    }, [lesson.id, cachedCode, lesson.startingCode, handleModelChange]);

    const handleEditorDidMount: OnMount = useCallback(
        (editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            const initialCode = cachedCode !== undefined ? cachedCode : (lesson.startingCode || '');
            editor.setValue(initialCode);
            handleModelChange(initialCode);

            // Listen to user input changes
            editor.onDidChangeModelContent(() => {
                handleModelChange(editor.getValue());
            });
        },
        [cachedCode, lesson.startingCode, handleModelChange]
    );

    // Unmount cleanup - no longer needed for providerRef
    useEffect(() => {
        return () => {
            // No specific cleanup needed for this simplified editor
        };
    }, []);

    return (
        <div className="h-full w-full relative">
            <style>{`
                .comment-decoration {
                    color: #34A853 !important;
                    font-style: italic;
                    opacity: 0.8;
                }
            `}</style>
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
                    minimap: { enabled: true }, // Enable minimap for standard editor
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
    );
}
