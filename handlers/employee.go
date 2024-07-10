package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
	"planning_hager/models"
	"time"
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
		CEID     *uint  `json:"ce_id"`
		SectorID *uint  `json:"sector_id"`
		SkillIDs []uint `json:"skills"`
		Swap     bool   `json:"swap"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	tx := h.DB.Begin()

	var employee models.Employee
	if err := tx.Preload("Skills").First(&employee, id).Error; err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusNotFound, "Employee not found")
		return
	}

	// Check if there's already an employee in the new position
	var existingEmployee models.Employee
	if input.CEID != nil && input.SectorID != nil {
		if err := tx.Where("ce_id = ? AND sector_id = ? AND id != ?", *input.CEID, *input.SectorID, id).First(&existingEmployee).Error; err == nil {
			if !input.Swap {
				tx.Rollback()
				h.respondWithSuccess(c, http.StatusOK, gin.H{
					"message":          "Employee exists in target position",
					"existingEmployee": existingEmployee,
					"requiresSwap":     true,
				})
				return
			}
			// Swap logic
			tempCEID := existingEmployee.CEID
			tempSectorID := existingEmployee.SectorID

			// Update existing employee
			existingEmployee.CEID = employee.CEID
			existingEmployee.SectorID = employee.SectorID
			if err := tx.Save(&existingEmployee).Error; err != nil {
				tx.Rollback()
				h.respondWithError(c, http.StatusInternalServerError, "Failed to update existing employee")
				return
			}

			// Update planning for existing employee
			if err := updateEmployeePlanning(tx, existingEmployee.ID, existingEmployee.CEID, existingEmployee.SectorID); err != nil {
				tx.Rollback()
				h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning for existing employee")
				return
			}

			// Update the employee being edited
			employee.CEID = tempCEID
			employee.SectorID = tempSectorID
		}
	}

	// Update the employee
	if input.Name != "" {
		employee.Name = input.Name
	}
	if input.CEID != nil {
		employee.CEID = *input.CEID
	}
	if input.SectorID != nil {
		employee.SectorID = *input.SectorID
	}

	if err := tx.Save(&employee).Error; err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update employee")
		return
	}

	// Update skills
	if len(input.SkillIDs) > 0 {
		// Clear existing skills
		if err := tx.Model(&employee).Association("Skills").Clear(); err != nil {
			tx.Rollback()
			h.respondWithError(c, http.StatusInternalServerError, "Failed to clear employee skills")
			return
		}

		// Fetch the skills
		var skills []models.Skill
		if err := tx.Where("id IN ?", input.SkillIDs).Find(&skills).Error; err != nil {
			tx.Rollback()
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch skills")
			return
		}

		// Append new skills
		if err := tx.Model(&employee).Association("Skills").Append(skills); err != nil {
			tx.Rollback()
			h.respondWithError(c, http.StatusInternalServerError, "Failed to update employee skills")
			return
		}
	}

	// Update planning for the employee being edited
	if err := updateEmployeePlanning(tx, employee.ID, employee.CEID, employee.SectorID); err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning")
		return
	}

	if err := tx.Commit().Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	// Fetch the updated employee with associated data
	if err := h.DB.Preload("Skills").Preload("CE").Preload("Sector").First(&employee, id).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch updated employee data")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, employee)
}

func updateEmployeePlanning(tx *gorm.DB, employeeID, newCEID, newSectorID uint) error {
	log.Printf("Starting updateEmployeePlanning: employeeID=%d, newCEID=%d, newSectorID=%d", employeeID, newCEID, newSectorID)

	currentTime := time.Now()
	log.Printf("Current time for planning update: %v", currentTime)

	// Fetch the CE's schedule
	var cePlannings []models.Planning
	if err := tx.Where("ce_id = ? AND date >= ? AND employee_id IS NULL", newCEID, currentTime).
		Order("date ASC").Find(&cePlannings).Error; err != nil {
		log.Printf("Error fetching CE plannings: %v", err)
		return err
	}

	// Update employee plannings
	for _, cePlanning := range cePlannings {
		result := tx.Model(&models.Planning{}).
			Where("employee_id = ? AND date = ?", employeeID, cePlanning.Date).
			Updates(map[string]interface{}{
				"sector_id": newSectorID,
				"shift":     cePlanning.Shift,
				"ce_id":     newCEID,
			})

		log.Printf("SQL Query: %s", result.Statement.SQL.String())
		log.Printf("Query Parameters: %+v", result.Statement.Vars)

		if result.Error != nil {
			log.Printf("Error updating employee planning: %v", result.Error)
			return result.Error
		}

		log.Printf("Updated planning entry for date %v: Affected rows: %d", cePlanning.Date, result.RowsAffected)
	}

	// Sample the updated records
	var updatedPlannings []models.Planning
	if err := tx.Where("employee_id = ? AND date >= ? AND ce_id = ? AND sector_id = ?",
		employeeID, currentTime, newCEID, newSectorID).
		Limit(5).Find(&updatedPlannings).Error; err != nil {
		log.Printf("Error sampling updated plannings: %v", err)
	} else {
		log.Printf("Sample of updated plannings:")
		for _, p := range updatedPlannings {
			log.Printf("  ID: %d, EmployeeID: %v, CEID: %v, SectorID: %v, Date: %v, Shift: %s, Status: %s",
				p.ID,
				getValue(p.EmployeeID),
				getValue(p.CEID),
				getValue(p.SectorID),
				p.Date, p.Shift, p.Status)
		}
	}

	return nil
}

// Helper function to safely get the value of a pointer or return nil
func getValue(ptr interface{}) interface{} {
	if ptr == nil {
		return nil
	}
	switch v := ptr.(type) {
	case *uint:
		if v != nil {
			return *v
		}
	case *int:
		if v != nil {
			return *v
		}
	case *string:
		if v != nil {
			return *v
		}
	}
	return nil
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
