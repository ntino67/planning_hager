import React, { useEffect, useState } from 'react';
import { Layout, Menu, message } from 'antd';
import axios from 'axios';
import EmployeeGrid from './components/EmployeeGrid.jsx';

const { Header, Content } = Layout;

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [ces, setCEs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [sectorsData, cesData, skillsData] = await Promise.all([
          axios.get('http://localhost:8080/sectors'),
          axios.get('http://localhost:8080/ces'),
          axios.get('http://localhost:8080/skills'),
        ]);

        console.log("Fetched sectors:", sectorsData.data);
        console.log("Fetched ces:", cesData.data);
        console.log("Fetched skills:", skillsData.data);

        setSectors(sectorsData.data);
        setCEs(cesData.data);
        setSkills(skillsData.data);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        message.error("Failed to fetch dropdown data");
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const { data: employeesData } = await axios.get('http://localhost:8080/employees_ce_sector');
        console.log("Fetched employees:", employeesData);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
        message.error("Failed to fetch employee data");
      }
    };

    fetchDropdownData();
    fetchEmployeeData();
    setLoading(false);
  }, []);

  return (
    <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">Home</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '50px' }}>
        {!loading && (
          <EmployeeGrid
            employees={employees}
            sectors={sectors}
            ces={ces}
            skills={skills}
            onAdd={() => { /* handle add */ }}
            onModify={() => { /* handle modify */ }}
            onDelete={() => { /* handle delete */ }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default App;
