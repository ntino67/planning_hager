import React, {useEffect, useState} from 'react';
import {Button, Dropdown, Menu, message, Modal, Select, Table, Tooltip} from 'antd';
import {EditOutlined, PlusOutlined} from '@ant-design/icons';
import api from '../utils/Api.jsx';
import {generateShiftSchedule} from '../utils/shift.jsx';
import './Planning.css';

const {Option} = Select;

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const SHIFTS = ['M', 'S', 'N'];
const STATUS_COLORS = {
    'Day shift': '#91cf50',
    'Absent (Unplanned)': '#cc00ff',
    'Absent (Planned)': '#00afee',
    'Training': '#fdbf00',
};
const STATUS_OPTIONS = [
    'Scheduled',
    'Day shift',
    'Absent (Unplanned)',
    'Absent (Planned)',
    'Training',
];

const Planning = () => {
    const [planningData, setPlanningData] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [sectorRequiredSkills, setSectorRequiredSkills] = useState({});
    const [ces, setCEs] = useState([]);
    const [shiftType, setShiftType] = useState('4x8 L');


    useEffect(() => {
        fetchPlanningData();
        fetchSectors();
        fetchEmployees();
        fetchSectorRequiredSkills()
        fetchCEs();
    }, [currentWeek]);

    const fetchPlanningData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/planning?week=${currentWeek}`);
            console.log('Fetched planning data:', response.data);
            setPlanningData(response.data);
        } catch (error) {
            console.error('Failed to fetch planning data:', error);
            message.error('Failed to fetch planning data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await api.get('/sectors');
            console.log('Fetched sectors:', response.data);
            setSectors(response.data);
        } catch (error) {
            console.error('Failed to fetch sectors:', error);
            message.error('Failed to fetch sectors');
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            console.log('Fetched employees:', response.data);
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            message.error('Failed to fetch employees');
        }
    };

    const fetchSectorRequiredSkills = async () => {
        try {
            const response = await api.get('/sector_required_skills');
            console.log('Fetched sector required skills:', response.data);
            const skillsBySector = response.data.reduce((acc, item) => {
                if (!acc[item.sector_id]) {
                    acc[item.sector_id] = [];
                }
                acc[item.sector_id].push(item.skill_id);
                return acc;
            }, {});
            setSectorRequiredSkills(skillsBySector);
        } catch (error) {
            console.error('Failed to fetch sector required skills:', error);
            message.error('Failed to fetch sector required skills');
        }
    };

    const fetchCEs = async () => {
        try {
            const response = await api.get('/ces');
            setCEs(response.data);
        } catch (error) {
            console.error('Failed to fetch CEs:', error);
            message.error('Failed to fetch CEs');
        }
    };

    const handleAddEmployee = async (day, shift, sectorId, employeeId) => {
        try {
            const date = getDateFromDayAndWeek(day, currentWeek);
            const payload = {
                date,
                week: currentWeek,
                shift,
                sector_id: parseInt(sectorId, 10),
                employee_id: parseInt(employeeId, 10),
                status: 'Scheduled'
            };

            const response = await api.post('/add_planning', payload);
            console.log('Employee added successfully:', response.data);
            message.success('Employee added to planning');
            fetchPlanningData(); // Refresh the planning data
        } catch (error) {
            console.error('Failed to add employee:', error.response?.data || error.message);
            message.error('Failed to add employee to planning');
        }
    };

    const handleAddCE = async (day, shift, ceId) => {
        try {
            const schedule = generateShiftSchedule(ceId, currentWeek, shiftType);

            for (const [scheduleDay, scheduleShift] of Object.entries(schedule)) {
                const date = getDateFromDayAndWeek(scheduleDay, currentWeek);
                const payload = {
                    date,
                    week: currentWeek,
                    shift: scheduleShift,
                    ce_id: parseInt(ceId, 10),
                    status: 'Scheduled'
                };

                await api.post('/add_ce_planning', payload);
            }

            message.success('CE and team added to planning');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to add CE and team:', error.response?.data || error.message);
            message.error('Failed to add CE and team to planning');
        }
    };

    const handleCEStatusChange = async (planningId, newStatus) => {
        try {
            await api.put(`/update_ce_planning/${planningId}`, {status: newStatus});
            message.success('CE status updated successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to update CE status:', error);
            message.error('Failed to update CE status');
        }
    };

    const showDeleteConfirmCE = (planningId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this CE planning entry?',
            content: 'This will also remove all associated employee entries.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDeleteCEPlanning(planningId);
            },
        });
    };

    const handleDeleteCEPlanning = async (planningId) => {
        try {
            await api.delete(`/delete_ce_planning/${planningId}`);
            message.success('CE planning entry deleted successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to delete CE planning entry:', error);
            message.error('Failed to delete CE planning entry');
        }
    };

    const handleStatusChange = async (planningId, newStatus) => {
        try {
            await api.put(`/update_planning/${planningId}`, {status: newStatus});
            message.success('Status updated successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to update status:', error);
            message.error('Failed to update status');
        }
    };

    const handleDeletePlanning = async (planningId) => {
        try {
            await api.delete(`/delete_planning/${planningId}`);
            message.success('Planning entry deleted successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to delete planning entry:', error);
            message.error('Failed to delete planning entry');
        }
    };

    const showDeleteConfirm = (planningId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this planning entry?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDeletePlanning(planningId);
            },
        });
    };

    const getDateFromDayAndWeek = (day, week) => {
        const year = new Date().getFullYear();
        const firstDayOfYear = new Date(year, 0, 0);
        const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
        const firstMondayOfYear = new Date(year, 0, 1 + daysToFirstMonday);
        const targetDate = new Date(firstMondayOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
        const dayIndex = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].indexOf(day);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        return targetDate.toISOString().split('T')[0];
    };

    const isEmployeeCompetent = (employee, sectorId) => {
        // console.log('Checking competency for employee:', employee, 'in sector:', sectorId);

        if (!employee || !sectorId) {
            console.log('Employee or sectorId is undefined');
            return false;
        }

        const employeeSkills = new Set(employee.Skills?.map(skill => skill.id) || []);
        const requiredSkills = new Set(sectorRequiredSkills[sectorId] || []);

        // console.log('Employee skills:', employeeSkills);
        // console.log('Required skills:', requiredSkills);

        const isCompetent = employeeSkills.size > 0 && requiredSkills.size > 0 &&
            [...employeeSkills].some(skillId => requiredSkills.has(skillId));

        // console.log('Is employee competent:', isCompetent);
        return isCompetent;
    };

    const handleShiftTypeChange = async (value) => {
        setShiftType(value);
        try {
            await api.post('/update_planning_shift_type', {week: currentWeek, shiftType: value});
            message.success('Shift type updated successfully');
            fetchPlanningData(); // Refresh the planning data
        } catch (error) {
            console.error('Failed to update shift type:', error);
            message.error('Failed to update shift type');
        }
    };

    const columns = [
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
            width: 60,
        },
        {
            title: 'Shift',
            dataIndex: 'shift',
            key: 'shift',
            width: 60,
        },
        {
            title: 'CE',
            dataIndex: 'ce',
            key: 'ce',
            render: (ce, record) => {
                if (ce) {
                    const menu = (
                        <Menu>
                            {STATUS_OPTIONS.map(status => (
                                <Menu.Item
                                    key={status}
                                    onClick={() => handleCEStatusChange(record.planningId, status)}
                                >
                                    {status}
                                </Menu.Item>
                            ))}
                            <Menu.Divider/>
                            <Menu.Item
                                key="delete"
                                onClick={() => showDeleteConfirmCE(record.planningId)}
                                danger
                            >
                                Delete
                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Tooltip title={`Status: ${ce.status || 'Not set'}`}>
                    <span style={{
                        cursor: 'pointer',
                        backgroundColor: STATUS_COLORS[ce.status] || 'transparent',
                        padding: '2px 4px',
                        borderRadius: '4px'
                    }}>
                        {ce.name} <EditOutlined style={{marginLeft: 8}}/>
                    </span>
                            </Tooltip>
                        </Dropdown>
                    );
                } else {
                    const menu = (
                        <Menu>
                            {ces.map(ce => (
                                <Menu.Item key={ce.id} onClick={() => handleAddCE(record.day, record.shift, ce.id)}>
                                    {ce.name}
                                </Menu.Item>
                            ))}
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button icon={<PlusOutlined/>} size="small"/>
                        </Dropdown>
                    );
                }
            },
        },
        ...sectors.map(sector => ({
            title: sector.name,
            dataIndex: 'sectors',
            key: sector.id,
            render: (sectors, record) => {
                const sectorData = sectors.find(s => s.id === sector.id);
                const competentEmployees = employees.filter(emp =>
                    isEmployeeCompetent(emp, sector.id)
                );

                if (sectorData && sectorData.employee) {
                    const backgroundColor = STATUS_COLORS[sectorData.status] || 'transparent';
                    const menu = (
                        <Menu>
                            {STATUS_OPTIONS.map(status => (
                                <Menu.Item
                                    key={status}
                                    onClick={() => handleStatusChange(sectorData.planningId, status)}
                                >
                                    {status}
                                </Menu.Item>
                            ))}
                            <Menu.Divider/>
                            <Menu.Item
                                key="delete"
                                onClick={() => showDeleteConfirm(sectorData.planningId)}
                                danger
                            >
                                Delete
                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Tooltip title={`Status: ${sectorData.status}`}>
            <span style={{
                cursor: 'pointer',
                backgroundColor: STATUS_COLORS[sectorData.status] || 'transparent',
                padding: '2px 4px',
                borderRadius: '4px'
            }}>
              {sectorData.employee.name} <EditOutlined style={{marginLeft: 8}}/>
            </span>
                            </Tooltip>
                        </Dropdown>
                    );
                } else {
                    const menu = (
                        <Menu>
                            {competentEmployees.map(emp => (
                                <Menu.Item key={emp.ID}
                                           onClick={() => handleAddEmployee(record.day, record.shift, sector.id, emp.ID)}>
                                    {emp.Name}
                                </Menu.Item>
                            ))}
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button icon={<PlusOutlined/>} size="small"/>
                        </Dropdown>
                    );
                }
            },
        })),
    ];

    const data = DAYS.flatMap(day =>
        SHIFTS.map(shift => {
            const rowData = {day, shift, key: `${day}-${shift}`, sectors: []};
            const dayShiftData = planningData.filter(entry =>
                entry.day === day && entry.shift === shift
            );

            if (dayShiftData.length > 0) {
                const ceEntry = dayShiftData.find(entry => entry.ce);
                if (ceEntry) {
                    rowData.ce = {
                        ...ceEntry.ce,
                        status: ceEntry.status // Add this line
                    };
                    rowData.planningId = ceEntry.id;
                }
                rowData.sectors = sectors.map(sector => {
                    const sectorData = dayShiftData.find(entry => entry.sector && entry.sector.id === sector.id);
                    return sectorData ? {
                        id: sector.id,
                        employee: sectorData.employee,
                        status: sectorData.status,
                        planningId: sectorData.id,
                    } : {id: sector.id};
                });
            } else {
                rowData.sectors = sectors.map(sector => ({id: sector.id}));
            }

            return rowData;
        })
    );

    return (
        <div className="planning-container">
            <div className="planning-controls">
                <Select
                    value={currentWeek}
                    onChange={setCurrentWeek}
                    style={{width: 120}}
                >
                    {[...Array(52)].map((_, i) => (
                        <Option key={i + 1} value={i + 1}>Week {i + 1}</Option>
                    ))}
                </Select>
                <Select
                    value={shiftType}
                    onChange={handleShiftTypeChange}
                    style={{width: 120, marginLeft: 16}}
                >
                    <Option value="4x8 L">4x8 Long</Option>
                    <Option value="4x8 N">4x8 Normal</Option>
                    <Option value="4x8 C">4x8 Short</Option>
                </Select>
                <Button onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}>
                    Previous Week
                </Button>
                <Button onClick={() => setCurrentWeek(prev => Math.min(52, prev + 1))}>
                    Next Week
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={false}
                scroll={{x: 'max-content'}}
            />
        </div>
    );
};

export default Planning;