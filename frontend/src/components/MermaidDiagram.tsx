import { useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';

/* ================================================================
 * MermaidDiagram — Renders Mermaid.js diagrams and highlights
 * completed architecture nodes based on user progress.
 * ================================================================ */

interface MermaidDiagramProps {
    /** Raw Mermaid markup string */
    markup: string;
    /** How many logical steps the user has finished (0-based) */
    completedSteps: number;
}

/** Initialize mermaid with dark theme once */
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#334155',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#64748b',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
    },
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
    },
});

/** Node IDs in the order they appear in the architecture diagram */
const NODE_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const HIGHLIGHT_FILL = '#059669';    // emerald-600
const HIGHLIGHT_STROKE = '#34d399';  // emerald-400
const HIGHLIGHT_TEXT = '#ffffff';

export default function MermaidDiagram({ markup, completedSteps }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    /** Inject highlight styles for completed nodes into the markup */
    const getHighlightedMarkup = useCallback(() => {
        let result = markup;

        // Remove all existing style lines so we can rewrite them
        result = result.replace(/\n\s*style\s+\w+\s+fill:.*$/gm, '');

        // Add style directives for each node
        const styleLines = NODE_IDS.map((id, index) => {
            if (index < completedSteps) {
                return `    style ${id} fill:${HIGHLIGHT_FILL},stroke:${HIGHLIGHT_STROKE},color:${HIGHLIGHT_TEXT}`;
            }
            return `    style ${id} fill:#334155,stroke:#64748b,color:#e2e8f0`;
        });

        return result + '\n' + styleLines.join('\n');
    }, [markup, completedSteps]);

    useEffect(() => {
        const render = async () => {
            if (!containerRef.current) return;

            try {
                const id = `mermaid-${Date.now()}`;
                const highlighted = getHighlightedMarkup();
                const { svg } = await mermaid.render(id, highlighted);
                containerRef.current.innerHTML = svg;

                // Make the SVG responsive
                const svgEl = containerRef.current.querySelector('svg');
                if (svgEl) {
                    svgEl.style.maxWidth = '100%';
                    svgEl.style.height = 'auto';
                }
            } catch (err) {
                console.warn('Mermaid render error:', err);
                if (containerRef.current) {
                    containerRef.current.innerHTML =
                        '<p class="text-slate-500 text-sm">Diagram rendering...</p>';
                }
            }
        };

        render();
    }, [getHighlightedMarkup]);

    return (
        <div
            ref={containerRef}
            className="w-full p-4 flex justify-center items-center bg-slate-900/50 rounded-xl border border-slate-700/50"
        />
    );
}
