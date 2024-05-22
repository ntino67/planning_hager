import React, {useEffect, useState} from 'react';
import {Layout, Menu, message} from 'antd';
import axios from 'axios';
import EmployeeGrid from './components/EmployeeGrid';
import {EmployeeModal, ModifyEmployeeModal} from './components/EmployeeModal';

const {Header, Content, Footer} = Layout;

function App() {
    const [employees, setEmployees] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [ces, setCEs] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
    const [newEmployee, setNewEmployee] = useState({name: '', sector: '', ce: ''});
    const [modifyEmployee, setModifyEmployee] = useState({id: '', name: '', sector: '', ce: ''});

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
            setSectors(sectorResponse.data.sort((a, b) => a.id - b.id));
            setCEs(ceResponse.data.sort((a, b) => a.id - b.id));
        } catch (error) {
            console.error('Failed to fetch dropdown data', error);
        }
    };

    const handleAdd = (sector, ce) => {
        setNewEmployee({name: '', sector, ce});
        setIsModalVisible(true);
    };

    const handleModify = (employee) => {
        setModifyEmployee({
            id: employee.employee_id,
            name: employee.employee_name,
            sector: employee.sector_name,
            ce: employee.ce_name,
        });
        setIsModifyModalVisible(true);
    };

    const handleDelete = async (name, sector, ce) => {
        try {
            const response = await axios.post('http://localhost:8080/delete_employee', {name, sector, ce});
            if (response.status === 200) {
                message.success('Employee deleted successfully');
                fetchEmployeeData();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to delete employee');
        }
    };

    const handleOk = async () => {
        try {
            const response = await axios.post('http://localhost:8080/add_employee', newEmployee);
            if (response.status === 200) {
                message.success('Employee added successfully');
                fetchEmployeeData();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to add employee');
        }
        setIsModalVisible(false);
    };

    const handleModifyOk = async (updatedEmployee) => {
        try {
            const response = await axios.post('http://localhost:8080/modify_employee', updatedEmployee);
            if (response.status === 200) {
                message.success('Employee modified successfully');
                fetchEmployeeData();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to modify employee');
        }
        setIsModifyModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsModifyModalVisible(false);
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
                        onAdd={handleAdd}
                        onModify={handleModify}
                        onDelete={handleDelete}
                        employees={employees}
                        sectors={sectors}
                        ces={ces}
                    />
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Company Planning ©2023</Footer>
            <EmployeeModal
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                employee={newEmployee}
                onChange={setNewEmployee}
                sectors={sectors}
                ces={ces}
            />
            <ModifyEmployeeModal
                open={isModifyModalVisible}
                onOk={handleModifyOk}
                onCancel={handleCancel}
                employee={modifyEmployee}
                onChange={setModifyEmployee}
                sectors={sectors}
                ces={ces}
            />
        </Layout>
    );
}

export default App;
