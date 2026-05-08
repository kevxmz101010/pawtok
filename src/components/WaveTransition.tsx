export default function WaveTransition() {
  return (
    <div className="relative z-10 -mt-1 h-28 sm:h-36 md:h-44 overflow-hidden bg-white" aria-hidden="true">
      <svg
        className="absolute bottom-0 left-0 h-full w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#0b8cff"
          d="M0,128L80,138.7C160,149,320,171,480,154.7C640,139,800,85,960,80C1120,75,1280,117,1360,138.7L1440,160L1440,320L0,320Z"
        />
      </svg>
    </div>
  );
}
