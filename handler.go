package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// Fetch all sectors
func getSectors(c *gin.Context) {
	var sectors []Sector
	if err := db.Find(&sectors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sectors)
}

// Fetch all CEs
func getCEs(c *gin.Context) {
	var ces []CE
	if err := db.Find(&ces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ces)
}

// Fetch all skills
func getSkills(c *gin.Context) {
	var skills []Skill
	if err := db.Find(&skills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, skills)
}

// Fetch all employees with their CEs and sectors
func getEmployeesWithCESector(c *gin.Context) {
	var employees []Employee
	if err := db.Preload("CE").Preload("Sector").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var result []EmployeeWithCESector
	for _, emp := range employees {
		result = append(result, EmployeeWithCESector{
			EmployeeID:   emp.ID,
			EmployeeName: emp.Name,
			CEName:       emp.CE.Name,
			SectorName:   emp.Sector.Name,
		})
	}
	c.JSON(http.StatusOK, result)
}

// Add a new employee
func addEmployee(c *gin.Context) {
	var newEmployee NewEmployee
	if err := c.ShouldBindJSON(&newEmployee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	employee := Employee{
		Name:     newEmployee.Name,
		CEID:     newEmployee.CE,
		SectorID: newEmployee.Sector,
	}

	if err := db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Add skills if provided
	if len(newEmployee.Skills) > 0 {
		for _, skillID := range newEmployee.Skills {
			db.Create(&EmployeeSkill{EmployeeID: employee.ID, SkillID: skillID})
		}
	}

	c.JSON(http.StatusOK, employee)
}

// Modify an existing employee
func modifyEmployee(c *gin.Context) {
	var modifyEmployee ModifyEmployee
	if err := c.ShouldBindJSON(&modifyEmployee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var employee Employee
	if err := db.Where("id = ?", modifyEmployee.ID).First(&employee).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	employee.Name = modifyEmployee.Name
	employee.CEID = modifyEmployee.CE
	employee.SectorID = modifyEmployee.Sector

	if err := db.Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Update skills
	db.Where("employee_id = ?", employee.ID).Delete(&EmployeeSkill{})
	if len(modifyEmployee.Skills) > 0 {
		for _, skillID := range modifyEmployee.Skills {
			db.Create(&EmployeeSkill{EmployeeID: employee.ID, SkillID: skillID})
		}
	}

	c.JSON(http.StatusOK, employee)
}

// Delete an employee
func deleteEmployee(c *gin.Context) {
	var deleteEmployee DeleteEmployee
	if err := c.ShouldBindJSON(&deleteEmployee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Where("id = ?", deleteEmployee.ID).Delete(&Employee{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Employee deleted"})
}

// Fetch employee skills
func getEmployeeSkills(c *gin.Context) {
	employeeID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var employeeSkills []EmployeeSkill
	if err := db.Where("employee_id = ?", employeeID).Find(&employeeSkills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var skillIDs []int
	for _, es := range employeeSkills {
		skillIDs = append(skillIDs, es.SkillID)
	}

	c.JSON(http.StatusOK, skillIDs)
}
