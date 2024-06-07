import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Home from './components/Home';
import Planning from './components/Planning';
import './App.css';
import 'antd/es/style/reset.css';
import 'antd/es/style/index.js';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1"><a href="/">Home</a></Menu.Item>
            <Menu.Item key="2"><a href="/planning">Planning</a></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/planning" element={<Planning />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Hager ©2024</Footer>
      </Layout>
    </Router>
  );
}

export default App;
