import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileNode {
    name: string;
    type: 'file' | 'directory';
    path: string;
    language?: string;
    content?: string;
    children?: FileNode[];
}

interface AppendixIDEProps {
    onBack: () => void;
}

const FileTreeItem: React.FC<{ node: FileNode; level: number; onSelect: (node: FileNode) => void; selectedPath: string }> = ({ node, level, onSelect, selectedPath }) => {
    const [expanded, setExpanded] = useState(false);

    const isSelected = selectedPath === node.path;
    const isDir = node.type === 'directory';

    const handleClick = () => {
        if (isDir) {
            setExpanded(!expanded);
        } else {
            onSelect(node);
        }
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className={`flex items-center py-1.5 px-2 cursor-pointer text-[13px] hover:bg-black/5 transition-colors ${isSelected ? 'bg-blue-100/60 text-blue-700 font-medium' : 'text-gray-700'}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                <span className={`mr-2 w-4 text-center ${isDir ? 'opacity-50' : 'opacity-80'}`}>
                    {isDir ? (expanded ? '▾' : '▸') : '📄'}
                </span>
                <span className="truncate">{node.name}</span>
            </div>
            {isDir && expanded && node.children && (
                <div>
                    {node.children.map((child, idx) => (
                        <FileTreeItem key={idx} node={child} level={level + 1} onSelect={onSelect} selectedPath={selectedPath} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function AppendixIDE({ onBack }: AppendixIDEProps) {
    const [tree, setTree] = useState<FileNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/codebase.json')
            .then(res => res.json())
            .then(data => {
                setTree(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load codebase.json', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col bg-white text-gray-900 overflow-hidden">
            {/* Header */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 text-sm px-3 py-1.5 rounded-md font-medium">
                        ← 返回路线图
                    </button>
                    <div className="font-semibold ml-4 text-gray-800 text-sm">项目全局代码库探索区 (Project Appendix)</div>
                </div>
                <div className="text-[11px] font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Read-Only Mode</div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-[#F8FAFC] border-r border-gray-200 flex flex-col h-full shrink-0">
                    <div className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 bg-[#F1F5F9]">
                        Explorer
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                        {loading ? (
                            <div className="text-center text-sm text-gray-500 mt-10">Loading tree...</div>
                        ) : (
                            tree.map((node, idx) => (
                                <FileTreeItem key={idx} node={node} level={0} onSelect={setSelectedFile} selectedPath={selectedFile?.path || ''} />
                            ))
                        )}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                    {selectedFile ? (
                        <div className="flex-1 flex flex-col h-full w-full">
                            <div className="h-10 bg-[#F8FAFC] flex items-center px-4 shrink-0 border-b border-gray-200">
                                <span className="text-sm font-mono text-gray-600 flex items-center gap-2">
                                    📄 {selectedFile.path}
                                </span>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <SyntaxHighlighter
                                    language={selectedFile.language || 'text'}
                                    style={vs}
                                    customStyle={{ margin: 0, padding: '1.5rem', fontSize: '16px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 'normal', lineHeight: '2.0', minHeight: '100%', backgroundColor: '#ffffff' }}
                                    showLineNumbers={true}
                                >
                                    {selectedFile.content || ''}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4 bg-[#F8FAFC]/50">
                            <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            <p className="text-lg font-medium text-gray-500">从左侧选择一个文件进行查看</p>
                            <p className="text-sm opacity-70">Select a file from the explorer to view its contents</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
