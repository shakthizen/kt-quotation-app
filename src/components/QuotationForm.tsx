import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Typography,
  Divider,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export type QuotationItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type QuotationFormValues = {
  items: QuotationItem[];
  notes?: string;
};

interface QuotationFormProps {
  initialValues?: QuotationFormValues;
  onFinish: (values: QuotationFormValues) => void;
  isLoading?: boolean;
  isUpdateMode?: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialValues,
  onFinish,
  isLoading,
  isUpdateMode,
}) => {
  const [form] = Form.useForm();
  const router = useRouter();

  // Watch items to calculate totals
  const items = Form.useWatch("items", form) as QuotationItem[] | undefined;

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      // Default initial value if none provided (e.g. fresh create)
      // Though parent usually handles this logic, redundant check helps.
      form.setFieldsValue({
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
      });
    }
  }, [initialValues, form]);

  const calculateTotal = (currentItems: QuotationItem[] | undefined) => {
    if (!currentItems) return 0;
    return currentItems.reduce((acc, item) => {
      const q = item?.quantity ?? 0;
      const p = item?.unitPrice ?? 0;
      return acc + q * p;
    }, 0);
  };

  const totalAmount = calculateTotal(items);

  return (
    <Card title="Reply / Quotation Editor">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isLoading}
        initialValues={{ items: [{ description: "", quantity: 1, unitPrice: 0 }] }}
      >
        <Typography.Text strong>Items</Typography.Text>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "description"]}
                    rules={[{ required: true, message: "Missing description" }]}
                    style={{ flex: 3, marginBottom: 0 }}
                  >
                    <Input placeholder="Item Description" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "Missing qty" }]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <InputNumber
                      placeholder="Qty"
                      min={1}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "unitPrice"]}
                    rules={[{ required: true, message: "Missing price" }]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <InputNumber
                      placeholder="Price"
                      min={0}
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                  <div
                    style={{
                      flex: 1,
                      lineHeight: "32px",
                      textAlign: "right",
                    }}
                  >
                    {(() => {
                      const item = items?.[name];
                      const amt =
                        (item?.quantity ?? 0) * (item?.unitPrice ?? 0);
                      return `$${amt.toFixed(2)}`;
                    })()}
                  </div>
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{ lineHeight: "32px", color: "red" }}
                  />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div style={{ textAlign: "right", marginBottom: 24 }}>
          <Title level={4}>Total: ${totalAmount.toFixed(2)}</Title>
        </div>

        <Divider />

        <Form.Item label="Additional Notes / Terms" name="notes">
          <ReactQuill theme="snow" />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Button
              size="large"
              onClick={() => router.push("/admin")}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              style={{ flex: 1 }}
            >
              {isUpdateMode ? "Update Quotation" : "Send Quotation"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};
