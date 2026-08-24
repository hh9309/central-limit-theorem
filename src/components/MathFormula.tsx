import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  tex: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  tex,
  block = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(tex, containerRef.current, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        containerRef.current.innerText = tex;
      }
    }
  }, [tex, block]);

  if (block) {
    return <div ref={containerRef} className={`my-2 text-center overflow-x-auto ${className}`} />;
  }

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-center align-baseline px-0.5 font-normal ${className}`}
    />
  );
};

