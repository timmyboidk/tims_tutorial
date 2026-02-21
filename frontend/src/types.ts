/* ============================================================
 * TypeScript interfaces for the CodeForge learning platform
 * ============================================================ */

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
    /** Mermaid diagram markup (backend lessons) */
    diagramMarkup?: string;
    /** Illustration image for the lesson */
    illustrationUrl?: string;
    targetCode?: string;
    startingCode?: string;
    language?: string;
    comments?: any[];
}
