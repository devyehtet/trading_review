interface TitleProps {
  title: string;
  sub: string;
}

export default function Title({ title, sub }: TitleProps) {
  return (
    <div className="title">
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
  );
}
