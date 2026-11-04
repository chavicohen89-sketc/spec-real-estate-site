type ContainerProps = {
  children: React.ReactNode;
  /** narrow: רוחב צר לטקסט רץ */
  size?: "default" | "narrow";
  className?: string;
};

const sizes = {
  default: "max-w-6xl",
  narrow: "max-w-2xl",
};

export function Container({
  children,
  size = "default",
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-5 md:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}
