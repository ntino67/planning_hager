import React, {useEffect, useState} from 'react';
import {Layout, Menu, message} from 'antd';
import axios from 'axios';
import EmployeeGrid from './components/EmployeeGrid';
import './App.css';

const {Header, Content, Footer} = Layout;

function App() {
    const [employees, setEmployees] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [ces, setCEs] = useState([]);
    const [skills, setSkills] = useState([]);

    useEffect(() => {
        fetchEmployeeData();
        fetchDropdownData();
    }, []);

    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/employees_ce_sector');
            setEmployees(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const sectorResponse = await axios.get('http://localhost:8080/sectors');
            const ceResponse = await axios.get('http://localhost:8080/ces');
            const skillsResponse = await axios.get('http://localhost:8080/skills');
            setSectors(sectorResponse.data.sort((a, b) => a.id - b.id));
            setCEs(ceResponse.data.sort((a, b) => a.id - b.id));
            setSkills(skillsResponse.data);
        } catch (error) {
            console.error('Failed to fetch dropdown data', error);
        }
    };

    const handleAddEmployee = async (employee) => {
        try {
            const response = await axios.post('http://localhost:8080/add_employee', employee);
            if (response.status === 200) {
                message.success('Employee added successfully');
                fetchEmployeeData();
            }
        } catch (error) {
            console.error('Failed to add employee:', error);
            message.error('Failed to add employee');
        }
    };

    const handleModifyEmployee = async (employee) => {
        try {
            const response = await axios.post('http://localhost:8080/modify_employee', employee);
            if (response.status === 200) {
                message.success('Employee modified successfully');
                fetchEmployeeData();
            }
        } catch (error) {
            console.error('Failed to modify employee:', error);
            message.error('Failed to modify employee');
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            const response = await axios.post('http://localhost:8080/delete_employee', {id: employeeId});
            if (response.status === 200) {
                message.success('Employee deleted successfully');
                fetchEmployeeData();
            }
        } catch (error) {
            console.error('Failed to delete employee:', error);
            message.error('Failed to delete employee');
        }
    };

    const menuItems = [
        {label: 'Home', key: '1'},
        {label: 'Planning', key: '2'},
    ];

    return (
        <Layout className="layout">
            <Header>
                <div className="logo"/>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={menuItems}/>
            </Header>
            <Content style={{padding: '0 50px'}}>
                <div className="site-layout-content" style={{margin: '16px 0'}}>
                    <h1>Employee Grid</h1>
                    <EmployeeGrid
                        employees={employees}
                        sectors={sectors}
                        ces={ces}
                        skills={skills}
                        onAdd={handleAddEmployee}
                        onModify={handleModifyEmployee}
                        onDelete={handleDeleteEmployee}
                    />
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Company Planning ©2023</Footer>
        </Layout>
    );
}

export default App;
