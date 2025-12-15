"use client";

import React from "react";
import { Layout, Menu, Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeOutlined,
  FileTextOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine selected key based on pathname
  const getSelectedKey = () => {
    if (pathname === "/request") return "request";
    if (pathname === "/my-quotations") return "my-quotations";
    if (pathname?.startsWith("/admin")) return "admin";
    return "request";
  };

  const navItems = [
    {
      key: "request",
      icon: <HomeOutlined />,
      label: "Request Quotation",
      onClick: () => router.push("/request"),
    },
    {
      key: "my-quotations",
      icon: <FileTextOutlined />,
      label: "My Quotations",
      onClick: () => router.push("/my-quotations"),
    },
    {
      key: "admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/admin"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          padding: "0 20px",
        }}
      >
        <div style={{ marginRight: 20, fontWeight: "bold", fontSize: 18 }}>
          Quotation App
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={navItems}
          style={{ flex: 1, borderBottom: "none" }}
        />
      </Header>
      <Content style={{ padding: "24px 50px" }}>
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: 280,
            borderRadius: 8,
          }}
        >
          <React.Suspense
            fallback={
              <div style={{ textAlign: "center", padding: 50 }}>
                <Spin size="large" />
              </div>
            }
          >
            {children}
          </React.Suspense>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Quotation App ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
