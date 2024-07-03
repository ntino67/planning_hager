package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"planning_hager/models"
)

func (h *Handler) GetPlannings(c *gin.Context) {
	weekStr := c.Query("week")
	week, err := strconv.Atoi(weekStr)
	if err != nil {
		h.respondWithError(c, http.StatusBadRequest, "Invalid week parameter")
		return
	}

	year := time.Now().Year()
	startDate := getWeekStartDate(year, week)
	endDate := startDate.AddDate(0, 0, 7)

	var plannings []models.Planning
	if err := h.DB.Preload("CE").Preload("Sector").Preload("Employee").
		Where("date >= ? AND date < ?", startDate, endDate).
		Find(&plannings).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch planning data")
		return
	}

	response := formatPlanningResponse(plannings)
	h.respondWithSuccess(c, http.StatusOK, response)
}

func (h *Handler) AddPlanning(c *gin.Context) {
	var input models.Planning
	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Create(&input).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, input)
}

func (h *Handler) UpdatePlanning(c *gin.Context) {
	id := c.Param("id")
	var input models.Planning
	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var planning models.Planning
	if err := h.DB.First(&planning, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Planning entry not found")
		return
	}

	if err := h.DB.Model(&planning).Updates(input).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, planning)
}

func (h *Handler) DeletePlanning(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.Planning{}, id).Error; err != nil {
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
			"ce":     p.CE,
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
