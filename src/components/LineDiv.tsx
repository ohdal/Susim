import styled from "styled-components";

const Container = styled.div<{ $sizeL: number; $sizeR: number }>`
  position: relative;
  width: 600px;
  min-height: 48px;
  margin: 0 auto;

  p {
    position: absolute;
    background: #000000;
    padding: 0 10px;
    margin: 0;
    line-height: 48px;
    z-index: 2;

    &.left {
      font-size: ${(props) => props.$sizeL}px;
      left: 0;
    }
    
    &.right {
      font-size: ${(props) => props.$sizeR}px;
      right: 0;
    }
  }

  hr {
    width: 100%;
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
`;

type Props = {
  left: { text: string; size?: number };
  right: { text: string; size?: number };
};

export default function LineDiv(props: Props) {
  const { left, right } = props;

  return (
    <Container $sizeL={left.size || 28} $sizeR={right.size || 28}>
      <p className="left">{left.text || "Left"}</p>
      <hr />
      <p className="right">{right.text || "Right"}</p>
    </Container>
  );
}
