/* ============================================================
 * TypeScript interfaces for the CodeForge learning platform
 * ============================================================ */

/** Inline instructor comment displayed inside the editor */
export interface InstructorComment {
    /** 1-based line number where the comment appears */
    line: number;
    /** The comment text to display */
    text: string;
}

/** A single lesson in the curriculum */
export interface Lesson {
    id: string;
    /** Determines which renderer the left pane uses */
    type: 'frontend' | 'backend';
    title: string;
    /** Category label shown in the sidebar (module name) */
    category: string;
    /** Track identifier for grouping */
    track: string;
    /** Module number within the track */
    moduleNumber: number;
    /** Lesson number within the module */
    lessonNumber: number;
    /** Markdown-formatted instructions / objectives */
    instructions: string;
    /** The complete target code the user must type */
    targetCode: string;
    /** Code pre-filled in the editor when lesson starts */
    startingCode: string;
    /** Mermaid diagram markup (backend lessons) */
    diagramMarkup?: string;
    /** Language for Monaco syntax highlighting */
    language: string;
    /** Inline annotations from the instructor */
    comments: InstructorComment[];
}
