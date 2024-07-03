import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu, message, Select, Table, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../utils/Api.jsx';
import './Planning.css';

const { Option } = Select;

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const SHIFTS = ['M', 'S', 'N'];

const Planning = () => {
    const [planningData, setPlanningData] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchPlanningData();
        fetchSectors();
        fetchEmployees();
    }, [currentWeek]);

    const fetchPlanningData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/planning?week=${currentWeek}`);
            setPlanningData(response.data);
        } catch (error) {
            message.error('Failed to fetch planning data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await api.get('/sectors');
            setSectors(response.data);
        } catch (error) {
            message.error('Failed to fetch sectors');
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            message.error('Failed to fetch employees');
        }
    };

    const handleAddEmployee = async (day, shift, sectorId, employeeId) => {
        try {
            const response = await api.post('/add_planning', {
                date: getDateFromDayAndWeek(day, currentWeek),
                shift,
                sector_id: sectorId,
                employee_id: employeeId,
                status: 'Scheduled'
            });
            message.success('Employee added to planning');
            fetchPlanningData();
        } catch (error) {
            message.error('Failed to add employee to planning');
        }
    };

    const getDateFromDayAndWeek = (day, week) => {
        const year = new Date().getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
        const firstMondayOfYear = new Date(year, 0, 1 + daysToFirstMonday);
        const targetDate = new Date(firstMondayOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
        const dayIndex = DAYS.indexOf(day);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        return targetDate.toISOString().split('T')[0];
    };

    const isEmployeeCompetent = (employee, sector) => {
        const employeeSkills = new Set(employee.Skills.map(skill => skill.id));
        const requiredSkills = new Set(sector.RequiredSkills.map(skill => skill.id));
        return employeeSkills.size > 0 && requiredSkills.size > 0 &&
               [...employeeSkills].some(skillId => requiredSkills.has(skillId));
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
            width: 120,
            render: (ce) => ce ? ce.name : '-',
        },
        ...sectors.map(sector => ({
            title: sector.name,
            dataIndex: 'sectors',
            key: sector.id,
            render: (sectors, record) => {
                const sectorData = sectors.find(s => s.id === sector.id);
                const competentEmployees = employees.filter(emp =>
                    emp.SectorID === sector.id && isEmployeeCompetent(emp, sector)
                );

                const menu = (
                    <Menu>
                        {competentEmployees.map(emp => (
                            <Menu.Item key={emp.id} onClick={() => handleAddEmployee(record.day, record.shift, sector.id, emp.id)}>
                                {emp.name}
                            </Menu.Item>
                        ))}
                    </Menu>
                );

                if (sectorData && sectorData.employee) {
                    return (
                        <Tooltip title={`Status: ${sectorData.employee.status || 'N/A'}`}>
                            <span>{sectorData.employee.name}</span>
                        </Tooltip>
                    );
                } else {
                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button icon={<PlusOutlined />} size="small" />
                        </Dropdown>
                    );
                }
            },
        })),
    ];

    const data = DAYS.flatMap(day =>
        SHIFTS.map(shift => {
            const rowData = { day, shift, key: `${day}-${shift}`, sectors: [] };
            const dayShiftData = planningData.filter(entry =>
                entry.day === day && entry.shift === shift
            );

            if (dayShiftData.length > 0) {
                rowData.ce = dayShiftData[0].ce;
                rowData.sectors = sectors.map(sector => {
                    const sectorData = dayShiftData.find(entry => entry.sector.id === sector.id);
                    return sectorData ? {
                        id: sector.id,
                        employee: sectorData.employee,
                    } : { id: sector.id };
                });
            } else {
                rowData.sectors = sectors.map(sector => ({ id: sector.id }));
            }

            return rowData;
        })
    );

    return (
        <div className="planning-container">
            <h1>Planning</h1>
            <div className="planning-controls">
                <Select
                    value={currentWeek}
                    onChange={setCurrentWeek}
                    style={{ width: 200, marginRight: 16 }}
                >
                    {[...Array(52)].map((_, i) => (
                        <Option key={i + 1} value={i + 1}>Week {i + 1}</Option>
                    ))}
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
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default Planning;