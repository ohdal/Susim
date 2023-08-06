import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Container = styled.div<{ $sizeL: number; $sizeR: number }>`
  position: relative;
  width: 800px;
  min-height: 48px;
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
  position: absolute;
  top: 50%;
  left: ${(props) => props.$left}px;
  transform: translateY(-50%);
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

  useEffect(() => {
    if (leftRef.current && rightRef.current) {
      const left = leftRef.current.clientWidth;
      const right = rightRef.current.clientWidth;
      setLineWidth({ left, right });
    }
  }, [left, right]);

  return (
    <Container $sizeL={left.size || 2.125} $sizeR={right.size || 2.125}>
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
