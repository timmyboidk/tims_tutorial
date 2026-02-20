import { useMemo } from 'react';

/* ================================================================
 * LivePreview — Sandboxed iframe that renders the user's confirmed
 * code as a live React application with Tailwind CDN styling.
 * ================================================================ */

interface LivePreviewProps {
    /** The user's confirmed (correctly typed) code so far */
    code: string;
    /** Programming language of the lesson */
    language: string;
}

export default function LivePreview({ code, language }: LivePreviewProps) {
    /** Build a self-contained HTML document for the iframe */
    const srcdoc = useMemo(() => {
        if (!code.trim()) {
            return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #0f172a;
                color: #64748b;
                font-family: 'Inter', sans-serif;
              }
            </style>
          </head>
          <body>
            <p>Start typing to see the live preview...</p>
          </body>
        </html>
      `;
        }

        // For TypeScript/JSX, we wrap it as a React component in an HTML page
        if (language === 'typescript' || language === 'javascript') {
            return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <script src="https://cdn.tailwindcss.com"><\/script>
            <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
            <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #0f172a;
                font-family: 'Inter', sans-serif;
              }
              #preview-root {
                padding: 2rem;
              }
            </style>
            <script>
              tailwind.config = {
                darkMode: 'class',
              };
            <\/script>
          </head>
          <body class="dark">
            <div id="preview-root"></div>
            <script type="text/babel" data-type="module">
              const { useState, useEffect, useRef, useCallback, useMemo } = React;

              // User's code inlined
              ${code.replace(/export default /g, 'const __UserComponent__ = ').replace(/import .*?;/g, '// import removed for preview')}

              // If we found a component, render it
              try {
                if (typeof __UserComponent__ === 'function') {
                  ReactDOM.createRoot(document.getElementById('preview-root'))
                    .render(React.createElement(__UserComponent__));
                }
              } catch (e) {
                document.getElementById('preview-root').innerHTML =
                  '<p style="color:#f87171">Preview error: ' + e.message + '</p>';
              }
            <\/script>
          </body>
        </html>
      `;
        }

        // For non-JSX languages (Java, etc.), show the code in a styled block
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 1.5rem;
              background: #0f172a;
              color: #e2e8f0;
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              line-height: 1.6;
            }
            pre { white-space: pre-wrap; word-break: break-all; }
          </style>
        </head>
        <body>
          <pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `;
    }, [code, language]);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2 font-mono">preview</span>
            </div>
            <iframe
                srcDoc={srcdoc}
                title="Live Preview"
                sandbox="allow-scripts"
                className="w-full border-0"
                style={{ height: 'calc(100% - 36px)' }}
            />
        </div>
    );
}
