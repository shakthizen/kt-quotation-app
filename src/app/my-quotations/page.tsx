"use client";

import React, { useState } from "react";
import { Typography, Table, Button, Modal, Spin } from "antd";
import { api } from "@/trpc/react";
import { QuotationDetails } from "@/components/QuotationDetails";
import { StatusTag } from "@/components/StatusTag";

const { Title } = Typography;

export default function UserQuotationsPage() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: requests, isLoading } = api.quotation.getRequests.useQuery();

  const showModal = (id: string) => {
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
  };
  // In a real app, we might need a separate query for full quotation details including items,
  // but for simplicity we can fetch them on expand or if getRequests included them.
  // The current router 'getRequests' returns Request[].
  // To get items, we need to fetch quotation by requestId.
  // We can create a sub-component for the expanded row to fetch details.

  const columns = [
    {
      title: "Request Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) =>
        new Date(date).toLocaleDateString() +
        " " +
        new Date(date).toLocaleTimeString(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: { status: string; id: string }) =>
        record.status === "Replied" && (
          <Button size="small" onClick={() => showModal(record.id)}>
            View Quotation
          </Button>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <Title level={2}>My Quotations</Title>
      <Table columns={columns} dataSource={requests} rowKey="id" />
      <Modal
        title="Quotation Details"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
      >
        {selectedRequestId && (
          <QuotationDetails requestId={selectedRequestId} status="Replied" />
        )}
      </Modal>
    </div>
  );
}
