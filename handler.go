package main

import (
	"github.com/gin-contrib/cors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}

	r.Use(cors.New(config))

	// Routes
	r.GET("/employees", getEmployees)
	r.POST("/add_employee", addEmployee)
	r.PUT("/update_employee/:id", updateEmployee)
	r.DELETE("/delete_employee/:id", deleteEmployee)
	r.GET("/skills", getSkills)
	r.POST("/add_skill", addSkill)
	r.PUT("/update_skill/:id", updateSkill)
	r.DELETE("/delete_skill/:id", deleteSkill)
	r.GET("/employee_skills/:id", getEmployeeSkills)
	r.GET("/sectors", getSectors)
	r.GET("/sectors/:id", getSectorByID)
	r.POST("/add_sector", addSector)
	r.PUT("/update_sector/:id", updateSector)
	r.DELETE("/delete_sector/:id", deleteSector)
	r.GET("/ces", getCEs)
	r.GET("/ces/:id", getCEByID)
	r.POST("/add_ce", addCE)
	r.PUT("/update_ce/:id", updateCE)
	r.DELETE("/delete_ce/:id", deleteCE)
	r.GET("/employees_ce_sector", getEmployeesWithCESector)

	return r
}

// Get all sectors
func getSectors(c *gin.Context) {
	var sectors []Sector
	if err := db.Find(&sectors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sectors)
}

func getSectorByID(c *gin.Context) {
	id := c.Param("id")
	var sector Sector

	if err := db.First(&sector, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sector not found"})
		return
	}

	c.JSON(http.StatusOK, sector)
}

// Add a new sector
func addSector(c *gin.Context) {
	var sector Sector
	if err := c.ShouldBindJSON(&sector); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&sector).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sector)
}

// Update a sector
func updateSector(c *gin.Context) {
	id := c.Param("id")
	var sector Sector
	if err := db.First(&sector, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sector not found"})
		return
	}
	if err := c.ShouldBindJSON(&sector); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Save(&sector).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sector)
}

// Delete a sector
func deleteSector(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&Sector{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sector deleted"})
}

// Get all skills
func getSkills(c *gin.Context) {
	var skills []Skill
	if err := db.Find(&skills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, skills)
}

// Add a new skill
func addSkill(c *gin.Context) {
	var skill Skill
	if err := c.ShouldBindJSON(&skill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&skill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, skill)
}

// Update a skill
func updateSkill(c *gin.Context) {
	id := c.Param("id")
	var skill Skill
	if err := db.Where("id = ?", id).First(&skill).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Skill not found"})
		return
	}
	if err := c.ShouldBindJSON(&skill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Save(&skill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, skill)
}

// Delete a skill
func deleteSkill(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&Skill{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Skill deleted"})
}

// Get all CEs
func getCEs(c *gin.Context) {
	var ces []CE
	if err := db.Find(&ces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ces)
}

func getCEByID(c *gin.Context) {
	id := c.Param("id")
	var ce CE

	if err := db.First(&ce, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "CE not found"})
		return
	}

	c.JSON(http.StatusOK, ce)
}

// Add a new CE
func addCE(c *gin.Context) {
	var ce CE
	if err := c.ShouldBindJSON(&ce); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&ce).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ce)
}

// Update a CE
func updateCE(c *gin.Context) {
	id := c.Param("id")
	var ce CE
	if err := db.First(&ce, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "CE not found"})
		return
	}
	if err := c.ShouldBindJSON(&ce); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Save(&ce).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ce)
}

// Delete a CE
func deleteCE(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&CE{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "CE deleted"})
}

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

	var skills []Skill
	for _, es := range employeeSkills {
		var skill Skill
		if err := db.First(&skill, es.SkillID).Error; err == nil {
			skills = append(skills, skill)
		}
	}

	c.JSON(http.StatusOK, skills)
}

// Get all employees
func getEmployees(c *gin.Context) {
	var employees []Employee
	if err := db.Preload("Skills").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, employees)
}

// Add a new employee
func addEmployee(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		CEID     int    `json:"ce_id"`
		SectorID int    `json:"sector_id"`
		Skills   []int  `json:"skills"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	employee := Employee{
		Name:     input.Name,
		CEID:     input.CEID,
		SectorID: input.SectorID,
	}

	if err := db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, skillID := range input.Skills {
		employeeSkill := EmployeeSkill{
			EmployeeID: employee.ID,
			SkillID:    skillID,
		}
		db.Create(&employeeSkill)
	}

	c.JSON(http.StatusOK, employee)
}

// Update an employee
func updateEmployee(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		CeID     int    `json:"ce_id"`
		SectorID int    `json:"sector_id"`
		Skills   []int  `json:"skills"`
	}

	id := c.Param("id")

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var employee Employee
	if err := db.First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	employee.Name = input.Name
	employee.CEID = input.CeID
	employee.SectorID = input.SectorID

	if err := db.Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Update skills
	db.Model(&employee).Association("Skills").Clear()
	var skills []Skill
	if len(input.Skills) > 0 {
		db.Where("id IN ?", input.Skills).Find(&skills)
	}
	db.Model(&employee).Association("Skills").Append(skills)

	c.JSON(http.StatusOK, employee)
}

// Delete an employee
func deleteEmployee(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&Employee{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Employee deleted"})
}
