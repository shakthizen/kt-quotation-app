'use client';

import React from 'react';
import { Typography, Table, Tag, Button, Space, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import type { RouterOutputs } from '@/trpc/react';

const { Title } = Typography;

type RequestItem = RouterOutputs['quotation']['getRequests'][number];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: requests, isLoading } = api.quotation.getRequests.useQuery();

  const columns = [
    {
      title: 'Received',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString(),
      sorter: (a: RequestItem, b: RequestItem) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Pending' ? 'orange' : 'green';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Replied', value: 'Replied' },
      ],
      onFilter: (value: boolean | React.Key, record: RequestItem) => record.status === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: RequestItem) => (
        <Space size="middle">
          {record.status === 'Pending' ? (
             <Button type="primary" onClick={() => router.push(`/admin/quote/${record.id}`)}>
               Reply
             </Button>
          ) : (
             <Button onClick={() => router.push(`/admin/quote/${record.id}`)}>
               View/Edit
             </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2}>Admin Dashboard</Title>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
      />
    </div>
  );
}
