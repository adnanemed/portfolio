/**
 * Theme-aware StackLab logo.
 * Light theme: COLORED svg (/logo-stacklab.svg).
 * Dark theme: BLACK & WHITE mark (/logo-stacklab-bw.png).
 * Both are mounted and toggled purely via [data-theme] CSS in
 * globals.css (.stacklab-logo); the hidden one is display:none
 * (out of the accessibility tree) and carries aria-hidden.
 */
type Props = {
  /** Rendered height in px (~28-32 in nav). Logos are square. */
  height?: number;
  className?: string;
};

export default function StackLabLogo({ height = 30, className = "" }: Props) {
  const imgStyle = { height, width: height };
  return (
    <span
      className={`stacklab-logo ${className}`}
      role="img"
      aria-label="StackLab"
      style={{ height }}
    >
      <span className="logo-light" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-stacklab.svg" alt="" style={imgStyle} draggable={false} />
      </span>
      <span className="logo-dark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-stacklab-bw.png"
          alt=""
          style={imgStyle}
          draggable={false}
        />
      </span>
    </span>
  );
}
