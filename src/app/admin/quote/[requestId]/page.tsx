'use client';

import React, { useEffect, use } from 'react';
import { Typography, Form, Input, InputNumber, Button, Card, Descriptions, Divider, message, Space, Spin } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/trpc/react';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;

type QuotationItem = {
    description: string;
    quantity: number;
    unitPrice: number;
};

type QuotationFormValues = {
    items: QuotationItem[];
    notes?: string;
};

export default function AdminQuotationEditorPage({ params }: { params: Promise<{ requestId: string }> }) {
  // Unwrap params using React.use() or await if async component. 
  // Since this is a client component, we use React.use() to unwrap the promise 
  // OR just await it if we make the component async (but client async components are experimental/limited).
  // Actually, in Next 15, params is a Promise. We should unwrap it.
  const { requestId } = use(params);
  
  const router = useRouter();
  const [form] = Form.useForm();
  
  // Watch items to calculate totals
  const items = Form.useWatch('items', form) as QuotationItem[] | undefined;

  const { data: request, isLoading: isLoadingRequest } = api.quotation.getRequestById.useQuery({ id: requestId });
  const { data: existingQuotation, isLoading: isLoadingQuotation } = api.quotation.getQuotationByRequestId.useQuery({ requestId });
  
  const createQuotationMutation = api.quotation.createQuotation.useMutation({
      onSuccess: () => {
          message.success('Quotation saved successfully');
          router.push('/admin');
      },
      onError: (err) => {
          message.error(`Failed to save: ${err.message}`);
      }
  });

  useEffect(() => {
    if (existingQuotation) {
      form.setFieldsValue({
        items: existingQuotation.items,
        notes: existingQuotation.notes,
      });
    } else {
        form.setFieldsValue({
            items: [{ description: '', quantity: 1, unitPrice: 0 }]
        });
    }
  }, [existingQuotation, form]);

  if (isLoadingRequest || isLoadingQuotation) {
       return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (!request) {
    return <div>Request not found</div>;
  }

  const calculateTotal = (currentItems: QuotationItem[] | undefined) => {
    if (!currentItems) return 0;
    return currentItems.reduce((acc, item) => {
      const q = item?.quantity ?? 0;
      const p = item?.unitPrice ?? 0;
      return acc + (q * p);
    }, 0);
  };

  const totalAmount = calculateTotal(items);

  const onFinish = (values: QuotationFormValues) => {
    createQuotationMutation.mutate({
        requestId: request.id,
        notes: values.notes ?? '',
        items: values.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        }))
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 0' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Request Details">
          <Descriptions column={2}>
            <Descriptions.Item label="Request ID">{request.id}</Descriptions.Item>
            <Descriptions.Item label="Date">{new Date(request.createdAt).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Name">{request.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{request.email}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>{request.description}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Reply / Quotation Editor">
          <Form form={form} layout="vertical" onFinish={onFinish} disabled={createQuotationMutation.isPending}>
             <Typography.Text strong>Items</Typography.Text>
             <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Missing description' }]}
                        style={{ flex: 3, marginBottom: 0 }}
                      >
                        <Input placeholder="Item Description" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Missing qty' }]}
                         style={{ flex: 1, marginBottom: 0 }}
                      >
                        <InputNumber placeholder="Qty" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'unitPrice']}
                        rules={[{ required: true, message: 'Missing price' }]}
                         style={{ flex: 1, marginBottom: 0 }}
                      >
                        <InputNumber 
                            placeholder="Price" 
                            min={0} 
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                      <div style={{ flex: 1, lineHeight: '32px', textAlign: 'right' }}>
                         {(() => {
                            const item = items?.[name];
                            const amt = (item?.quantity ?? 0) * (item?.unitPrice ?? 0);
                            return `$${amt.toFixed(2)}`;
                         })()}
                      </div>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ lineHeight: '32px', color: 'red' }} />
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Item
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <Title level={4}>Total: ${totalAmount.toFixed(2)}</Title>
            </div>

            <Divider />

            <Form.Item label="Additional Notes / Terms" name="notes">
               <ReactQuill theme="snow" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={createQuotationMutation.isPending}>
                {existingQuotation ? 'Update Quotation' : 'Send Quotation'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
