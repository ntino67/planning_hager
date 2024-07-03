import React, {useEffect, useState} from 'react';
import api from "../utils/Api.jsx";
import {Button, Dropdown, Menu, message, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import './Planning.css';
import AddCEModal from './AddCEModal';
import AddEmployeeModal from './AddEmployeeModal';
import EditCEModal from './EditCEModal';
import UpdatePlanningModal from './UpdatePlanningModal';

const PlanningTab = () => {
    const [planning, setPlanning] = useState([]);
    const [ces, setCEs] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedCE, setSelectedCE] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [isAddCEModalVisible, setAddCEModalVisible] = useState(false);
    const [isAddEmployeeModalVisible, setAddEmployeeModalVisible] = useState(false);
    const [isEditCEModalVisible, setEditCEModalVisible] = useState(false);
    const [isUpdatePlanningModalVisible, setUpdatePlanningModalVisible] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [selectedPlanningEntry, setSelectedPlanningEntry] = useState(null);

    useEffect(() => {
        fetchPlanning();
        fetchCEs();
        fetchSectors();
        fetchEmployees();
    }, [currentWeek]);

    const fetchPlanning = async () => {
        try {
            const response = await api.get(`http://localhost:8080/planning?week=${currentWeek}`);
            if (response.data.message) {
                setPlanning([]);
            } else {
                setPlanning(response.data);
            }
        } catch (error) {
            message.error('Failed to fetch planning');
            console.error('Failed to fetch planning:', error);
        }
    };

    const fetchCEs = async () => {
        try {
            const response = await api.get('http://localhost:8080/ces');
            setCEs(response.data);
        } catch (error) {
            console.error('Failed to fetch CEs:', error);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await api.get('http://localhost:8080/sectors');
            setSectors(response.data);
        } catch (error) {
            console.error('Failed to fetch sectors:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('http://localhost:8080/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    const handleCEAssign = async (ce, shift, day) => {
        try {
            await api.post('http://localhost:8080/assign_ce', {ce_id: ce.id, week: currentWeek, shift, day});
            message.success('CE assigned successfully');
            fetchPlanning();
        } catch (error) {
            message.error('Failed to assign CE');
            console.error('Failed to assign CE:', error);
        }
    };

    const renderCEDropdown = (shift, day) => (
        <Menu onClick={({key}) => handleCEAssign(ces.find(ce => ce.id === parseInt(key)), shift, day)}>
            {ces.map(ce => (
                <Menu.Item key={ce.id}>{ce.name}</Menu.Item>
            ))}
        </Menu>
    );

    const handleMenuClick = (item, type) => {
        if (type === 'ce') {
            setSelectedCE(item);
            setEditCEModalVisible(true);
        } else if (type === 'sector') {
            setSelectedSector(item);
            setAddEmployeeModalVisible(true);
        }
    };

    const renderEmployeeDropdown = (employee) => (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item key="add" icon={<PlusOutlined/>} onClick={() => setAddEmployeeModalVisible(true)}>
                        Add
                    </Menu.Item>
                    <Menu.Item key="edit" icon={<EditOutlined/>} onClick={() => {
                        setSelectedPlanningEntry(employee);
                        setUpdatePlanningModalVisible(true);
                    }}>
                        Edit
                    </Menu.Item>
                    <Menu.Item key="delete" icon={<DeleteOutlined/>} onClick={() => handleDelete(employee.id)}>
                        Delete
                    </Menu.Item>
                </Menu>
            }
        >
            <span>{employee.name}</span>
        </Dropdown>
    );

    const handleDelete = async (id) => {
        try {
            await api.delete(`http://localhost:8080/delete_planning/${id}`);
            message.success('Deleted successfully');
            fetchPlanning();
        } catch (error) {
            message.error('Failed to delete');
            console.error('Failed to delete:', error);
        }
    };

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    const columns = [
        ...days.map(day => ({
            title: day,
            children: [
                {
                    title: 'CE',
                    dataIndex: `ce_${day}`,
                    key: `ce_${day}`,
                    render: (text, record) => (
                        <Dropdown overlay={renderCEDropdown(record.shift, day)}>
                            <Button>{text || <PlusOutlined/>}</Button>
                        </Dropdown>
                    ),
                },
                ...sectors.map(sector => ({
                    title: sector.name,
                    dataIndex: `${sector.name}_${day}`,
                    key: `${sector.id}_${day}`,
                    render: (text, record) => (
                        text ? renderEmployeeDropdown(record) : <Button icon={<PlusOutlined/>}
                                                                        onClick={() => handleAddEmployee(record.shift, day, sector.id)}/>
                    ),
                })),
            ],
        })),
    ];

    return (
        <div className="planning-tab">
            <Table
                dataSource={planning}
                columns={columns}
                pagination={false}
                scroll={{x: 'max-content'}}
            />
            <Button onClick={() => setCurrentWeek(currentWeek > 1 ? currentWeek - 1 : 1)}>Previous Week</Button>
            <Button onClick={() => setCurrentWeek(currentWeek < 52 ? currentWeek + 1 : 52)}>Next Week</Button>
            <AddCEModal
                visible={isAddCEModalVisible}
                onClose={() => setAddCEModalVisible(false)}
                fetchCEs={fetchCEs}
            />
            <AddEmployeeModal
                visible={isAddEmployeeModalVisible}
                onClose={() => setAddEmployeeModalVisible(false)}
                fetchEmployees={fetchEmployees}
            />
            <EditCEModal
                visible={isEditCEModalVisible}
                onClose={() => setEditCEModalVisible(false)}
                ce={selectedCE}
                fetchCEs={fetchCEs}
            />
            <UpdatePlanningModal
                visible={isUpdatePlanningModalVisible}
                onClose={() => setUpdatePlanningModalVisible(false)}
                planningEntry={selectedPlanningEntry}
                fetchPlanning={fetchPlanning}
            />
        </div>
    );
};

export default PlanningTab;
