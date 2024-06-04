import React, { useState, useEffect } from 'react';
import { Table, Button, Dropdown, Menu, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';
import ModifyEmployeeModal from './ModifyEmployeeModal';

const EmployeeGrid = ({ employees, sectors, ces, skills, onAdd, onModify, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
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
    }
  };

  const handleModifyClick = async (employee) => {
    try {
      const response = await axios.get(`http://localhost:8080/employee_skills/${employee.employee_id}`);
      const skills = response.data || []; // Assuming the response contains an array of skills
      console.log('Fetched skills:', skills);
      setModifyEmployee({
        id: employee.employee_id,
        name: employee.employee_name,
        sector: employee.sector_name,
        ce: employee.ce_name,
        skills: skills
      });
      setIsModifyModalVisible(true);
    } catch (error) {
      console.error('Error fetching employee skills:', error);
      message.error('Failed to fetch employee skills.');
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
        const employeeList = employees.filter(
          (emp) => emp.ce_name === ce.name && emp.sector_name === sector.name
        );
        rowData[sector.name] = (
          <div>
            {employeeList.map((employee, index) => (
              <Dropdown
                key={`${employee.employee_id}-${index}`}
                overlay={
                  <Menu onClick={(e) => handleMenuClick(e, employee)}>
                    <Menu.Item key="edit">Edit</Menu.Item>
                    <Menu.Item key="delete">Delete</Menu.Item>
                  </Menu>
                }
              >
                <div className="employee-cell">
                  <span className="employee-name">{employee.employee_name}</span>
                </div>
              </Dropdown>
            ))}
            {employeeList.length === 0 && (
              <Button
                type="default"
                className="custom-add-button"
                onClick={() => handleAddClick(ce.name, sector.name)}
              >
                <PlusOutlined />
              </Button>
            )}
          </div>
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
        open={isModalVisible}
        onOk={(employee) => {
          onAdd(employee);
          setIsModalVisible(false);
        }}
        onCancel={() => setIsModalVisible(false)}
        employee={newEmployee}
        onChange={setNewEmployee}
        sectors={sectors}
        ces={ces}
        skills={skills}
      />
      <ModifyEmployeeModal
        open={isModifyModalVisible}
        onOk={(employee) => {
          onModify(employee);
          setIsModifyModalVisible(false);
        }}
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
