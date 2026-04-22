const StatusBadge = ({ ratio }) => {
  let text = "Optimal";
  let color = "text-green-500";

  if (ratio < 0.75) {
    text = "Critical";
    color = "text-red-500";
  } else if (ratio < 0.88) {
    text = "Warning";
    color = "text-yellow-500";
  }

  return <span className={color}>{text}</span>;
};

export default StatusBadge;