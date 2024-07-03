// src/App.jsx
import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {Layout, Menu} from 'antd';
import EmployeeGrid from './components/EmployeeGrid';
import Planning from './components/Planning';
import Login from './components/Login';
import api from './utils/Api.jsx';
import './App.css';

const {Header, Content, Footer} = Layout;

function App() {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        if (token) {
            api.get('/verify-token')
                .then((response) => {
                    console.log('Token verification response:', response.data);
                    setUserRole(response.data.role);
                })
                .catch((error) => {
                    console.error('Token verification error:', error.response ? error.response.data : error.message);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    setUserRole(null);
                });
        } else {
            setUserRole(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUserRole(null);
    };

    return (
        <Router>
            <Layout className="layout">
                <Header>
                    <div className="logo"/>
                    {userRole && (
                        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                            {userRole === 'admin' &&
                                <Menu.Item key="1"><a href="/employee-grid">Employee Grid</a></Menu.Item>}
                            <Menu.Item key="2"><a href="/planning">Planning</a></Menu.Item>
                            <Menu.Item key="3" onClick={handleLogout}>Logout</Menu.Item>
                        </Menu>
                    )}
                </Header>
                <Content style={{padding: '0 50px'}}>
                    <div className="site-layout-content">
                        <Routes>
                            <Route path="/login" element={<Login setUserRole={setUserRole}/>}/>
                            <Route
                                path="/employee-grid"
                                element={userRole === 'admin' ? <EmployeeGrid/> : <Navigate to="/login"/>}
                            />
                            <Route
                                path="/planning"
                                element={userRole ? <Planning/> : <Navigate to="/login"/>}
                            />
                            <Route path="/" element={<Navigate
                                to={userRole ? (userRole === 'admin' ? '/employee-grid' : '/planning') : '/login'}/>}/>
                        </Routes>
                    </div>
                </Content>
                <Footer style={{textAlign: 'center'}}>Hager ©2024</Footer>
            </Layout>
        </Router>
    );
}

export default App;