package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"planning_hager/models"
)

func (h *Handler) GetEmployees(c *gin.Context) {
	var employees []models.Employee
	if err := h.DB.Preload("Skills").Preload("CE").Preload("Sector").Find(&employees).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch employees")
		return
	}

	response := make([]gin.H, len(employees))
	for i, emp := range employees {
		skills := make([]gin.H, len(emp.Skills))
		for j, skill := range emp.Skills {
			skills[j] = gin.H{"id": skill.ID, "name": skill.Name}
		}

		response[i] = gin.H{
			"ID":       emp.ID,
			"Name":     emp.Name,
			"CEID":     emp.CEID,
			"CE":       gin.H{"id": emp.CE.ID, "name": emp.CE.Name},
			"SectorID": emp.SectorID,
			"Sector":   gin.H{"id": emp.Sector.ID, "name": emp.Sector.Name},
			"Skills":   skills,
		}
	}

	h.respondWithSuccess(c, http.StatusOK, response)
}

func (h *Handler) AddEmployee(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		CEID     uint   `json:"ce_id" binding:"required"`
		SectorID uint   `json:"sector_id" binding:"required"`
		SkillIDs []uint `json:"skills" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	employee := models.Employee{
		Name:     input.Name,
		CEID:     input.CEID,
		SectorID: input.SectorID,
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&employee).Error; err != nil {
			return err
		}

		var skills []models.Skill
		if err := tx.Where("id IN ?", input.SkillIDs).Find(&skills).Error; err != nil {
			return err
		}

		if err := tx.Model(&employee).Association("Skills").Append(skills); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create employee")
		return
	}

	// Fetch the employee with associated skills
	h.DB.Preload("Skills").First(&employee, employee.ID)

	h.respondWithSuccess(c, http.StatusCreated, employee)
}

func (h *Handler) UpdateEmployee(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name     string `json:"name"`
		CEID     uint   `json:"ce_id"`
		SectorID uint   `json:"sector_id"`
		SkillIDs []uint `json:"skills"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var employee models.Employee
	if err := h.DB.First(&employee, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Employee not found")
		return
	}

	employee.Name = input.Name
	employee.CEID = input.CEID
	employee.SectorID = input.SectorID

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&employee).Error; err != nil {
			return err
		}

		// Update skills
		if err := tx.Model(&employee).Association("Skills").Clear(); err != nil {
			return err
		}

		var skills []models.Skill
		if err := tx.Where("id IN ?", input.SkillIDs).Find(&skills).Error; err != nil {
			return err
		}

		if err := tx.Model(&employee).Association("Skills").Append(skills); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update employee")
		return
	}

	// Fetch the updated employee with associated data
	h.DB.Preload("Skills").Preload("CE").Preload("Sector").First(&employee, employee.ID)

	h.respondWithSuccess(c, http.StatusOK, employee)
}

func (h *Handler) DeleteEmployee(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Employee{}, id).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete employee")
		return
	}
	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Employee deleted successfully"})
}

func (h *Handler) GetEmployeeSkills(c *gin.Context) {
	id := c.Param("id")
	var employee models.Employee
	if err := h.DB.Preload("Skills").First(&employee, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Employee not found")
		return
	}
	h.respondWithSuccess(c, http.StatusOK, employee.Skills)
}
