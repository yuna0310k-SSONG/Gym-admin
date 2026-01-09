import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e5e7eb] flex items-center px-4 sm:px-6 md:px-20 py-12 sm:py-16">
      <div className="max-w-xl w-full">
        {/* Meta */}
        <p className="text-xs tracking-[0.3em] text-[#6b7280] mb-6 sm:mb-8">
          HEALTH PLATFORM
        </p>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-[52px] leading-[1.5] sm:leading-[1.4] md:leading-[1.3] font-medium tracking-tight mb-10 sm:mb-12 md:mb-16">
          헬스장
          <br />
          <span className="text-[#d1d5db]">회원관리 시스템</span>
        </h1>

        {/* Divider */}
        <div className="mb-8 sm:mb-10 flex items-center gap-4">
          <div className="w-10 h-px bg-[#3f3f46]" />
          <span className="text-xs text-[#6b7280] tracking-widest">
            OVERVIEW
          </span>
        </div>

        {/* Description */}
        <p className="mb-12 sm:mb-16 text-sm sm:text-base text-[#9ca3af] leading-[1.8] sm:leading-[1.7] max-w-md">
          Member, Attendance, Payment, Trainer 관리 기능을
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          하나의 관리자 시스템에서 통합 운영합니다.
        </p>

        {/* Action */}
        <div>
          <Link
            href="/login"
            className="
              inline-flex items-center gap-2
              text-sm
              text-[#e5e7eb]
              border-b border-[#3f3f46]
              pb-1
              transition-all
              hover:text-white
              hover:border-white
            "
          >
            Login
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
