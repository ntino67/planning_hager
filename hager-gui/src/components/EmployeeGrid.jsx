import React, { useState } from 'react';
import { Table, Button, Dropdown, Menu, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';
import ModifyEmployeeModal from './ModifyEmployeeModal';
import './EmployeeGrid.css';

const EmployeeGrid = ({ employees, sectors, ces, skills, onAdd, onModify, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', sector: '', ce: '', skills: [] });
  const [modifyEmployee, setModifyEmployee] = useState({ id: '', name: '', sector: '', ce: '', skills: [] });

  const handleAddClick = (ce, sector) => {
    setNewEmployee({ name: '', sector, ce, skills: [] });
    setIsModalVisible(true);
  };

  const handleMenuClick = (e, employee) => {
    if (e.key === 'edit') {
      handleModifyClick(employee);
    } else if (e.key === 'delete') {
      handleDeleteClick(employee);
    } else if (e.key === 'add') {
      handleAddClick(employee.ce_name, employee.sector_name);
    }
  };

  const handleModifyClick = async (employee) => {
    try {
      const { data: employeeSkills } = await axios.get(`http://localhost:8080/employee_skills/${employee.employee_id}`);
      setModifyEmployee({
        id: employee.employee_id,
        name: employee.employee_name,
        sector: employee.sector_name,
        ce: employee.ce_name,
        skills: employeeSkills.map(skill => skill.id),
      });
      setIsModifyModalVisible(true);
    } catch (error) {
      console.error('Error fetching employee skills:', error);
    }
  };

  const handleDeleteClick = (employee) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this employee?',
      onOk: () => onDelete(employee.employee_id),
    });
  };

  const generateTableData = () => {
    return ces.map((ce) => {
      const rowData = { ce_name: ce.name };
      sectors.forEach((sector) => {
        const employee = employees.find(
          (emp) => emp.ce_name === ce.name && emp.sector_name === sector.name
        );
        rowData[sector.name] = employee ? (
          <Dropdown
            overlay={
              <Menu onClick={(e) => handleMenuClick(e, employee)}>
                <Menu.Item key="add">Add</Menu.Item>
                <Menu.Item key="edit">Edit</Menu.Item>
                <Menu.Item key="delete">Delete</Menu.Item>
              </Menu>
            }
          >
            <div className="employee-cell">
              <span className="employee-name">{employee.employee_name}</span>
            </div>
          </Dropdown>
        ) : (
          <Button
            type="default"
            className="custom-add-button"
            onClick={() => handleAddClick(ce.name, sector.name)}
          >
            <PlusOutlined />
          </Button>
        );
      });
      return rowData;
    });
  };

  const columns = [
    {
      title: 'CE',
      dataIndex: 'ce_name',
      key: 'ce_name',
      render: (text) => (
        <div className="employee-cell">
          <span className="employee-name">{text}</span>
        </div>
      ),
    },
    ...sectors.map((sector) => ({
      title: sector.name,
      dataIndex: sector.name,
      key: sector.id,
      render: (text, record) => <div>{record[sector.name]}</div>,
    })),
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={generateTableData()}
        pagination={false}
        rowKey="ce_name"
      />
      <EmployeeModal
        visible={isModalVisible}
        onOk={() => onAdd(newEmployee)}
        onCancel={() => setIsModalVisible(false)}
        employee={newEmployee}
        onChange={setNewEmployee}
        sectors={sectors}
        ces={ces}
        skills={skills}
      />
      <ModifyEmployeeModal
        visible={isModifyModalVisible}
        onOk={() => onModify(modifyEmployee)}
        onCancel={() => setIsModifyModalVisible(false)}
        employee={modifyEmployee}
        onChange={setModifyEmployee}
        sectors={sectors}
        ces={ces}
        skills={skills}
      />
    </div>
  );
};

export default EmployeeGrid;
