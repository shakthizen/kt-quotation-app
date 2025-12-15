import React from "react";
import { Tag } from "antd";

interface StatusTagProps {
  status: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const color = status === "Pending" ? "orange" : "green";
  return <Tag color={color}>{status.toUpperCase()}</Tag>;
};
