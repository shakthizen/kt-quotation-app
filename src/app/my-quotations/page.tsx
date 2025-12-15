'use client';

import React from 'react';
import { Typography, Table, Tag, Card, Empty, Spin } from 'antd';
import { api } from '@/trpc/react';


const { Title } = Typography;



export default function UserQuotationsPage() {
  const { data: requests, isLoading } = api.quotation.getRequests.useQuery();
  // In a real app, we might need a separate query for full quotation details including items, 
  // but for simplicity we can fetch them on expand or if getRequests included them.
  // The current router 'getRequests' returns Request[].
  // To get items, we need to fetch quotation by requestId. 
  // We can create a sub-component for the expanded row to fetch details.

  const columns = [
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Pending' ? 'orange' : 'green';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  if (isLoading) {
      return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2}>My Quotations</Title>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        expandable={{
            expandedRowRender: (record) => <QuotationDetails requestId={record.id} status={record.status} />,
        }}
      />
    </div>
  );
}

const QuotationDetails = ({ requestId, status }: { requestId: string, status: string }) => {
    if (status !== 'Replied') {
        return <Empty description="No quotation received yet." />;
    }

    const { data: quotation, isLoading } = api.quotation.getQuotationByRequestId.useQuery({ requestId });

    if (isLoading) return <Spin />;
    if (!quotation) return <Empty description="Error: Quotation data not found." />;

    const itemColumns = [
      { title: 'Item', dataIndex: 'description', key: 'description' },
      { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
      { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (val: number) => `$${val.toFixed(2)}` },
      { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `$${val.toFixed(2)}` },
    ];

    return (
      <Card title="Quotation Details" bordered={false}>
        <div style={{ marginBottom: 16 }}>
             <strong>Admin Notes:</strong>
             <div dangerouslySetInnerHTML={{ __html: quotation.notes }} style={{ border: '1px solid #eee', padding: 8, marginTop: 4, borderRadius: 4, background: '#fafafa' }} />
        </div>
        
        <Table 
            columns={itemColumns} 
            dataSource={quotation.items} 
            rowKey="id" 
            pagination={false} 
            summary={(pageData) => {
                let total = 0;
                pageData.forEach(({ amount }) => { total += amount; });
                return (
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3} align="right"><strong>Total</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}><strong>${total.toFixed(2)}</strong></Table.Summary.Cell>
                    </Table.Summary.Row>
                );
            }}
        />
      </Card>
    );
};
