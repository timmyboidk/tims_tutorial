/* ================================================================
 * Header — Top navigation bar with Google-style branding
 * Light theme · Google Material palette
 * ================================================================ */

interface HeaderProps {
    lessonTitle: string;
    onBackToRoadmap?: () => void;
}

export default function Header({ lessonTitle, onBackToRoadmap }: HeaderProps) {

    return (
        <header className="flex items-center justify-between px-8 h-16 bg-white border-b border-[#DADCE0] shrink-0 z-10 relative">
            {/* Branding */}
            <div className="flex items-center gap-4">
                {onBackToRoadmap && (
                    <button
                        onClick={onBackToRoadmap}
                        className="flex items-center justify-center text-[#5F6368] hover:text-[#202124] hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors text-sm font-medium mr-2"
                        title="返回路线图"
                    >
                        ← 返回路线图
                    </button>
                )}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <span className="text-lg font-semibold text-[#4285F4]">
                        CodeForge
                    </span>
                </div>
                <span className="text-[#DADCE0] mx-1">|</span>
                <span className="text-sm text-[#5F6368] font-medium">{lessonTitle}</span>
            </div>

        </header>
    );
}
