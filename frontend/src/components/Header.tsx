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
        <header className="flex items-center justify-between px-6 h-16 bg-[#282A35] shrink-0 z-10 relative">
            {/* Branding */}
            <div className="flex items-center gap-4">
                {onBackToRoadmap && (
                    <button
                        onClick={onBackToRoadmap}
                        className="flex items-center justify-center text-white hover:text-white hover:bg-[#04AA6D] px-4 py-2 rounded transition-colors text-sm font-semibold mr-2"
                        title="返回路线图"
                    >
                        ← HOME
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white tracking-widest">
                        CODE<span className="text-[#04AA6D]">FORGE</span>
                    </span>
                    <span className="text-gray-400 mx-2 font-light">|</span>
                    <span className="text-sm text-gray-300 font-medium tracking-wide">{lessonTitle}</span>
                </div>
            </div>

            {/* Mock Right Side Options */}
            <div className="hidden md:flex items-center gap-1">
                <button className="text-white hover:bg-black/30 px-3 py-2 rounded text-sm transition-colors">TUTORIALS</button>
                <button className="text-white hover:bg-black/30 px-3 py-2 rounded text-sm transition-colors">EXERCISES</button>
                <button className="text-white hover:bg-black/30 px-3 py-2 rounded text-sm transition-colors">CERTIFICATES</button>
                <div className="ml-4 flex items-center gap-2">
                    <button className="bg-[#04AA6D] hover:bg-[#059862] text-white px-5 py-2 rounded-full font-bold text-sm transition-colors">Pro</button>
                    <button className="bg-[#FFF4A3] hover:bg-[#EBE094] text-black px-5 py-2 rounded-full font-bold text-sm transition-colors">Log in</button>
                </div>
            </div>

        </header>
    );
}
