interface CardProps {
  title: string;
  value: string;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="card">
      <small>{title}</small>
      <b>{value}</b>
    </div>
  );
}
