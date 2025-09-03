import React from "react";
import "./OverviewCard.css";

function OverviewCard({ title, value, description, icon, color }) {
  return (
    <div className={`overview-card overview-card-${color}`}>
      <div className="card-icon">
        <span className="icon-emoji">{icon}</span>
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="card-value">{value}</div>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
}

export default OverviewCard;
