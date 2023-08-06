import { useEffect, useCallback, useRef, useState } from "react";
import styled from "styled-components";

const Container = styled.div<{ $sizeL: number; $sizeR: number }>`
  position: relative;
  margin: 0 auto;

  p {
    position: absolute;
    padding: 0 10px;
    margin: 0;
    line-height: 48px;
    z-index: 2;

    &.left {
      font-size: ${(props) => props.$sizeL}rem;
      left: 0;
    }

    &.right {
      font-family: "Libre Baskerville", serif !important;
      font-size: ${(props) => props.$sizeR}rem;
      right: 0;
    }
  }
`;

const WhiteLine = styled.hr<{ $left: number; $right: number }>`
  width: calc(100% - ${(props) => props.$left + props.$right}px);
  transform: translateX(${(props) => props.$left}px);
`;

type Props = {
  left: { text: string; size?: number };
  right: { text: string; size?: number };
};

export default function LineDiv(props: Props) {
  const { left, right } = props;
  const leftRef = useRef<HTMLParagraphElement | null>(null);
  const rightRef = useRef<HTMLParagraphElement | null>(null);
  const [lineWidth, setLineWidth] = useState<{ left: number; right: number } | null>(null);

  const handleResize = useCallback(() => {
    if (leftRef.current && rightRef.current) {
      const left = leftRef.current.clientWidth;
      const right = rightRef.current.clientWidth;
      setLineWidth({ left, right });
    }
  }, []);

  useEffect(() => {
    handleResize();
  }, [handleResize, left, right]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <Container className="w-4/5 h-12 flex items-center" $sizeL={left.size || 2.125} $sizeR={right.size || 2.125}>
      <p className="left" ref={leftRef}>
        {left.text || "Left"}
      </p>
      <WhiteLine $left={lineWidth?.left || 100} $right={lineWidth?.right || 100} />
      <p className="right" ref={rightRef}>
        {right.text || "Right"}
      </p>
    </Container>
  );
}
