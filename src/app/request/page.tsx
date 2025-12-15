'use client';

import React from 'react';
import { Typography, Form, Input, Button, Card, message } from 'antd';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function UserRequestPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const createRequestMutation = api.quotation.createRequest.useMutation({
    onSuccess: () => {
      message.success('Quotation request submitted successfully!');
      form.resetFields();
      router.push('/my-quotations');
    },
    onError: (error) => {
      message.error(`Failed to submit: ${error.message}`);
    },
  });

  const onFinish = (values: { name: string; email: string; description: string }) => {
    createRequestMutation.mutate(values);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      <Title level={2}>Request a Quotation</Title>
      <Paragraph>Fill out the form below to get a price estimate for your project.</Paragraph>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          disabled={createRequestMutation.isPending}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="john@example.com" />
          </Form.Item>

          <Form.Item
            label="Project Description"
            name="description"
            rules={[{ required: true, message: 'Please describe your needs' }]}
          >
            <TextArea rows={4} placeholder="I need a website for my business..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={createRequestMutation.isPending}>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
