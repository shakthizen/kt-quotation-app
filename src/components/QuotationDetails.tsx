import React from "react";
import { Empty, Spin, Table } from "antd";
import { api } from "@/trpc/react";

interface QuotationDetailsProps {
  requestId: string;
  status: string;
}

export const QuotationDetails = ({
  requestId,
  status,
}: QuotationDetailsProps) => {
  if (status !== "Replied") {
    return <Empty description="No quotation received yet." />;
  }

  const { data: quotation, isLoading } =
    api.quotation.getQuotationByRequestId.useQuery({ requestId });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin />
      </div>
    );
  }

  if (!quotation)
    return <Empty description="Error: Quotation data not found." />;

  const itemColumns = [
    { title: "Item", dataIndex: "description", key: "description" },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `$${val.toFixed(2)}`,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <strong>Admin Notes:</strong>
        <div
          dangerouslySetInnerHTML={{ __html: quotation.notes }}
          style={{
            border: "1px solid #eee",
            padding: 8,
            marginTop: 4,
            borderRadius: 4,
            background: "#fafafa",
          }}
        />
      </div>

      <Table
        columns={itemColumns}
        dataSource={quotation.items}
        rowKey="id"
        pagination={false}
        summary={(pageData) => {
          let total = 0;
          pageData.forEach(({ amount }) => {
            total += amount;
          });
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3} align="right">
                <strong>Total</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong>${total.toFixed(2)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </>
  );
};
