/* ================================================================
 * Header — Top navigation bar with Google-style branding
 * Light theme · Google Material palette
 * ================================================================ */

interface HeaderProps {
    lessonTitle: string;
    confirmedChars: number;
    totalChars: number;
}

export default function Header({ lessonTitle, confirmedChars, totalChars }: HeaderProps) {
    const pct = totalChars > 0 ? Math.round((confirmedChars / totalChars) * 100) : 0;

    return (
        <header className="flex items-center justify-between px-8 h-16 bg-white border-b border-[#DADCE0] shrink-0">
            {/* Branding */}
            <div className="flex items-center gap-4">
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

            {/* Stats */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#80868B]">字符:</span>
                    <span className="font-mono text-[#202124] tabular-nums">
                        {confirmedChars} <span className="text-[#BDC1C6]">/ {totalChars}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#80868B]">进度:</span>
                    <span className={`font-mono font-semibold tabular-nums ${pct === 100 ? 'text-[#34A853]' : 'text-[#4285F4]'
                        }`}>
                        {pct}%
                    </span>
                </div>
                <div className="w-28 h-2 rounded-full bg-[#E8EAED] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[#4285F4] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </header>
    );
}
