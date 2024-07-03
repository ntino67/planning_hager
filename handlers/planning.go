// planning.go

package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"planning_hager/models"
)

func (h *Handler) GetPlannings(c *gin.Context) {
	weekStr := c.Query("week")
	week, err := strconv.Atoi(weekStr)
	if err != nil {
		log.Printf("Invalid week parameter: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "Invalid week parameter")
		return
	}

	var plannings []models.Planning
	if err := h.DB.Preload("Employee").Preload("Sector").
		Where("week = ?", week).
		Find(&plannings).Error; err != nil {
		log.Printf("Error fetching planning data: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch planning data")
		return
	}

	response := formatPlanningResponse(plannings)
	h.respondWithSuccess(c, http.StatusOK, response)
}

func (h *Handler) AddPlanning(c *gin.Context) {
	var input struct {
		Date       string `json:"date" binding:"required"`
		Shift      string `json:"shift" binding:"required"`
		SectorID   uint   `json:"sector_id" binding:"required"`
		EmployeeID uint   `json:"employee_id" binding:"required"`
		Status     string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error binding JSON: %v", err)
		log.Printf("Received input: %+v", input)
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		log.Printf("Error parsing date: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "Invalid date format")
		return
	}

	_, week := date.ISOWeek()

	planning := models.Planning{
		Date:       date,
		Week:       week,
		Shift:      input.Shift,
		SectorID:   input.SectorID,
		EmployeeID: input.EmployeeID,
		Status:     input.Status,
	}

	if err := h.DB.Create(&planning).Error; err != nil {
		log.Printf("Error creating planning entry: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create planning entry")
		return
	}

	// Preload the related data
	if err := h.DB.Preload("Sector").Preload("Employee").First(&planning, planning.ID).Error; err != nil {
		log.Printf("Error preloading related data: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Failed to load related data")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, planning)
}

func (h *Handler) UpdatePlanning(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Date       string `json:"date"`
		Shift      string `json:"shift"`
		SectorID   uint   `json:"sector_id"`
		EmployeeID uint   `json:"employee_id"`
		Status     string `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error binding JSON: %v", err)
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var planning models.Planning
	if err := h.DB.First(&planning, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			h.respondWithError(c, http.StatusNotFound, "Planning entry not found")
		} else {
			log.Printf("Error fetching planning entry: %v", err)
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch planning entry")
		}
		return
	}

	if input.Date != "" {
		date, err := time.Parse("2006-01-02", input.Date)
		if err != nil {
			log.Printf("Error parsing date: %v", err)
			h.respondWithError(c, http.StatusBadRequest, "Invalid date format")
			return
		}
		planning.Date = date
	}

	if input.Shift != "" {
		planning.Shift = input.Shift
	}

	if input.SectorID != 0 {
		planning.SectorID = input.SectorID
	}

	if input.EmployeeID != 0 {
		planning.EmployeeID = input.EmployeeID
	}

	if input.Status != "" {
		planning.Status = input.Status
	}

	if err := h.DB.Save(&planning).Error; err != nil {
		log.Printf("Error updating planning entry: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, planning)
}

func (h *Handler) DeletePlanning(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.Planning{}, id).Error; err != nil {
		log.Printf("Error deleting planning entry: %v", err)
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Planning entry deleted successfully"})
}

func getWeekStartDate(year, week int) time.Time {
	// Jan 1st of the given year
	t := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)

	// Roll forward to Monday
	for t.Weekday() != time.Monday {
		t = t.AddDate(0, 0, 1)
	}

	// Add weeks
	t = t.AddDate(0, 0, (week-1)*7)

	return t
}

func formatPlanningResponse(plannings []models.Planning) []gin.H {
	response := make([]gin.H, 0)
	for _, p := range plannings {
		entry := gin.H{
			"id":     p.ID,
			"date":   p.Date,
			"shift":  p.Shift,
			"day":    p.Date.Format("Mon")[0:2],
			"sector": p.Sector,
			"employee": gin.H{
				"id":     p.Employee.ID,
				"name":   p.Employee.Name,
				"status": p.Status,
			},
		}
		response = append(response, entry)
	}
	return response
}
