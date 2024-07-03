import React, {useState} from 'react';
import {Button, Form, Input, message} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import api from '../utils/Api.jsx';

const Login = ({setUserRole}) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/login', values);
            const {token, role} = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            setUserRole(role);
            console.log('Login successful. Token:', token, 'Role:', role);
            navigate(role === 'admin' ? '/employee-grid' : '/planning');
        } catch (error) {
            console.error('Login failed:', error);
            message.error('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{maxWidth: 300, margin: '100px auto'}}>
            <h1 style={{textAlign: 'center', marginBottom: 24}}>Login</h1>
            <Form
                name="normal_login"
                initialValues={{remember: true}}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[{required: true, message: 'Please input your Username!'}]}
                >
                    <Input prefix={<UserOutlined/>} placeholder="Username"/>
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{required: true, message: 'Please input your Password!'}]}
                >
                    <Input
                        prefix={<LockOutlined/>}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{width: '100%'}} loading={loading}>
                        Log in
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;