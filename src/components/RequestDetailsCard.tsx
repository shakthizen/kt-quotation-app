import React from "react";
import { Card, Descriptions } from "antd";

// Assuming getRequestById output type or a subset
// Since we don't have the exact type easily exported without TRPC context or manual definition,
// We can define the shape we expect. The router output is usually inferred.
// For now, let's define an interface that matches what we use.

interface RequestDetailsProps {
  request: {
    id: string;
    createdAt: Date | string;
    name: string;
    email: string;
    description: string;
  };
}

export const RequestDetailsCard: React.FC<RequestDetailsProps> = ({
  request,
}) => {
  return (
    <Card title="Request Details">
      <Descriptions column={2}>
        <Descriptions.Item label="Request ID">{request.id}</Descriptions.Item>
        <Descriptions.Item label="Date">
          {new Date(request.createdAt).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Name">{request.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{request.email}</Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {request.description}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
