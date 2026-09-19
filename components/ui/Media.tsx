import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  aspect?: string; // e.g. "4/5"
  flush?: boolean;
  position?: string; // object-position
  quality?: number;
};

/** An image in a media-cover frame: rounded, clipped, art-directed by aspect and focal point. */
export default function Media({ src, alt, className = "", sizes = "(min-width: 1024px) 50vw, 100vw", priority, aspect = "4/3", flush, position = "50% 50%", quality = 82 }: Props) {
  return (
    <div className={`media-cover ${flush ? "flush" : ""} ${className}`} style={{ aspectRatio: aspect }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={quality} style={{ objectPosition: position }} />
    </div>
  );
}
