import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { splashColors } from '../theme';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { language } = useApp();
  const [progress, setProgress] = useState(0);
  const colors = splashColors;

  const isRTL = language === 'ar';
  const fontFamily = useMemo(
    () =>
      isRTL
        ? '"Tajawal", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
        : '"Inter", "Tajawal", sans-serif',
    [isRTL]
  );

  useEffect(() => {
    const durationMs = 3200;
    const start = performance.now();
    let raf = 0;

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const e = easeInOut(t);
      const v = Math.round(e * 100);
      setProgress(v);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        fontFamily,
        color: colors.text,
        background: colors.background,
      }}
    >
      <div
        className="pointer-events-none fixed"
        style={{
          inset: -40,
          background: colors.overlay,
        }}
      />

      <div className="h-full flex items-center justify-center p-7 text-center">
        <div className="w-[92vw] max-w-[980px] flex flex-col items-center gap-2.5">
          <div className="relative grid place-items-center mb-6 h-[560px] w-[560px]">
            <div
              className="absolute -inset-[34px] blur-[10px]"
              style={{
                background: colors.logoGlow,
              }}
            />
            <img
              src="public/images/Image.png"
              alt="الشعار"
              className="relative z-10 h-full w-full object-contain"
              style={{ filter: colors.logoShadow }}
            />
          </div>

         

       

          <div
            className="relative mt-7 w-[82vw] max-w-[740px]"
            style={{ direction: 'ltr' }}
          >
            <div
              className="absolute top-[-24px] text-[14px]"
              style={{
                left: `${progress}%`,
                transform: 'translateX(-50%)',
                color: colors.progressText,
                textShadow: colors.progressShadow,
                userSelect: 'none',
              }}
            >
              {progress}%
            </div>

            <div
              className="relative overflow-hidden rounded-full"
              style={{
                height: 14,
                background: colors.barGradient,
                border: `2px solid ${colors.barBorder}`,
                boxShadow: colors.barShadow,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: 9999,
                  background: colors.fillGradient,
                  boxShadow: colors.fillShadow,
                }}
              />
              <div
                className="absolute top-[-18px] h-[44px] w-[44px] rounded-full"
                style={{
                  left: `${progress}%`,
                  transform: 'translateX(-50%)',
                  background: colors.shine,
                  opacity: 0.85,
                  pointerEvents: 'none',
                  mixBlendMode: 'screen',
                }}
              />
              <div
                className="absolute top-1/2 h-[10px] w-[10px] rounded-full"
                style={{
                  left: `${progress}%`,
                  transform: 'translate(-50%,-50%)',
                  background: colors.dot,
                  boxShadow: colors.dotShadow,
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div
              className="mt-4 flex flex-col items-center gap-2.5"
              style={{ fontFamily: '"Inter","Tajawal",sans-serif', direction: 'ltr' }}
            >
              <div
                className="whitespace-nowrap"
                style={{ color: colors.statusPrimary, fontSize: 'clamp(13px, 1.35vw, 16px)' }}
              >
              </div>
              <div
                className="whitespace-nowrap"
                style={{ color: colors.statusSecondary, fontSize: 'clamp(13px, 1.35vw, 16px)' }}
              >
                Loading the Enterprise Perception definition …   <span className="opacity-80">|</span> جاري تحميل تعريف الإدراك المؤسسي  ...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
