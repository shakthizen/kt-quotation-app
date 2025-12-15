"use client";

import React, { use } from "react";
import { Button, Space, Spin, App } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { RequestDetailsCard } from "@/components/RequestDetailsCard";
import {
  QuotationForm,
  type QuotationFormValues,
} from "@/components/QuotationForm";

export default function AdminQuotationEditorPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { message } = App.useApp();
  const { requestId } = use(params);
  const router = useRouter();

  const { data: request, isLoading: isLoadingRequest } =
    api.quotation.getRequestById.useQuery({ id: requestId });
  const { data: existingQuotation, isLoading: isLoadingQuotation } =
    api.quotation.getQuotationByRequestId.useQuery({ requestId });

  const createQuotationMutation = api.quotation.createQuotation.useMutation({
    onSuccess: () => {
      message.success("Quotation saved successfully");
      router.push("/admin");
    },
    onError: (err) => {
      message.error(`Failed to save: ${err.message}`);
    },
  });

  if (isLoadingRequest || isLoadingQuotation) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!request) {
    return <div>Request not found</div>;
  }

  const onFinish = (values: QuotationFormValues) => {
    createQuotationMutation.mutate({
      requestId: request.id,
      notes: values.notes ?? "",
      items: values.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  };

  const initialValues: QuotationFormValues | undefined = existingQuotation
    ? {
        items: existingQuotation.items ?? [
          { description: "", quantity: 1, unitPrice: 0 },
        ],
        notes: existingQuotation.notes,
      }
    : undefined;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>
      <Button
        icon={<LeftOutlined />}
        onClick={() => router.push("/admin")}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <RequestDetailsCard request={request} />

        <QuotationForm
          initialValues={initialValues}
          onFinish={onFinish}
          isLoading={createQuotationMutation.isPending}
          isUpdateMode={!!existingQuotation}
        />
      </Space>
    </div>
  );
}

