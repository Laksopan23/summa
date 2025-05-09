import React, { useState, useEffect } from "react";
import {
  HomeOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  AppstoreAddOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  StockOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Button } from "antd";
import { FloatButton } from "antd";
import { useNavigate } from "react-router-dom";
//import imageSrc from "./logo.png";

const { Header, Content, Footer, Sider } = Layout;
const loggedInUserType = localStorage.getItem("usertype");

const adminUserItems = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "categories",
    icon: <HomeOutlined />,
    label: "Category",
  },
  {
    key: "shorts",
    icon: <HomeOutlined />,
    label: "Shorts",
  },
  {
    key: "timer",
    icon: <HomeOutlined />,
    label: "Timer",
  },
  {
    key: "addpro",
    icon: <HomeOutlined />,
    label: "Add Products",
  },
  {
    key: "addLay",
    icon: <HomeOutlined />,
    label: "Home Layouts",
  },
];

const sellerItems = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: "TIME TRACKER",
  },
  
];

const headerIteam = [
  { key: "1", text: "profile", icon: <UserSwitchOutlined /> },
  { key: "2", text: "Login", icon: <LogoutOutlined /> },
];

const App = ({ children, userType }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleHeaderClick = (key) => {
    if (key === "1") {
      navigate("/seller");
    } else if (key === "2") {
      localStorage.setItem("authToken", null);
      localStorage.setItem("loggedInUserType", null);
      navigate("/login");
    }
  };

  const [isBackTopVisible, setIsBackTopVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      setIsBackTopVisible(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMenuClick = (item) => {
    if (item.key === "dashboard") {
      navigate("/user");
    }
    
    
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        onCollapse={(value) => setCollapsed(value)}
        width={200}
        style={{
          backgroundColor: "white",
          overflow: "hidden",
          position: "fixed",
          height: "100vh",
          left: 0,
        }}
      >

        <Menu
          theme="light"
          mode="inline"
          items={loggedInUserType === "admin" ? adminUserItems : sellerItems}
          onClick={handleMenuClick}
          style={{ backgroundColor: "white",marginTop:"100px" }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: collapsed ? 80 : 200,
            width: `calc(100% - ${collapsed ? 80 : 200}px)`,
            height: "64px",
            backgroundColor: "rgb(224, 245, 249)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {headerIteam.map((item) => (
              <Button
                key={item.key}
                type="text"
                icon={item.icon}
                style={{ color: "Black", fontSize: "20px" }}
                onClick={() => handleHeaderClick(item.key)}
              >
                {item.text}
              </Button>
            ))}
          </div>
        </Header>

        <Content style={{ marginTop: 64, padding: 24 }}>
          <div
            style={{
              padding: 0,
              minHeight: 360,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: borderRadiusLG,
            }}
          >
            {isBackTopVisible && (
              <FloatButton.Group shape="circle" style={{ right: 24 }}>
                <FloatButton.BackTop visibilityHeight={0} />
              </FloatButton.Group>
            )}
            {children}
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}></Footer>
      </Layout>
    </Layout>
  );
};

export default App;
