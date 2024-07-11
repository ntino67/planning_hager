package handlers

import (
	"gorm.io/gorm"
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

	var plannings []models.Planning
	if err := h.DB.Preload("Employee").Preload("Sector").Preload("CE").Preload("Substitute").
		Where("week = ?", week).
		Find(&plannings).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch planning data")
		return
	}

	response := make([]gin.H, len(plannings))
	for i, p := range plannings {
		entry := gin.H{
			"id":     p.ID,
			"date":   p.Date,
			"week":   p.Week,
			"day":    p.Weekday,
			"shift":  p.Shift,
			"status": p.Status,
		}

		if p.Sector != nil {
			entry["sector"] = p.Sector
		}

		if p.Employee != nil {
			entry["employee"] = gin.H{
				"id":   p.Employee.ID,
				"name": p.Employee.Name,
			}
		}

		if p.CE != nil {
			entry["ce"] = gin.H{
				"id":   p.CE.ID,
				"name": p.CE.Name,
			}
		}

		if p.Substitute != nil {
			entry["substitute"] = gin.H{
				"id":   p.Substitute.ID,
				"name": p.Substitute.Name,
			}
		}

		response[i] = entry
	}

	h.respondWithSuccess(c, http.StatusOK, response)
}

func (h *Handler) AddPlanning(c *gin.Context) {
	var input struct {
		Date       string `json:"date" binding:"required"`
		Week       int    `json:"week" binding:"required"`
		Shift      string `json:"shift" binding:"required"`
		SectorID   uint   `json:"sector_id" binding:"required"`
		EmployeeID uint   `json:"employee_id" binding:"required"`
		Status     string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		h.respondWithError(c, http.StatusBadRequest, "Invalid date format")
		return
	}

	planning := models.Planning{
		Date:       date,
		Week:       input.Week,
		Year:       date.Year(),
		Shift:      input.Shift,
		SectorID:   &input.SectorID,
		EmployeeID: &input.EmployeeID,
		Status:     input.Status,
	}

	if err := h.DB.Create(&planning).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create planning entry")
		return
	}

	if err := h.DB.Preload("Sector").Preload("Employee").First(&planning, planning.ID).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch created planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, planning)
}

func (h *Handler) UpdatePlanning(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status       string `json:"status" binding:"required"`
		SubstituteID *uint  `json:"SubstituteID"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var planning models.Planning
	if err := h.DB.First(&planning, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Planning entry not found")
		return
	}

	planning.Status = input.Status
	planning.SubstituteID = input.SubstituteID

	if err := h.DB.Save(&planning).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, planning)
}

func (h *Handler) DeletePlanning(c *gin.Context) {
	id := c.Param("id")

	var planning models.Planning
	if err := h.DB.First(&planning, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Planning entry not found")
		return
	}

	if err := h.DB.Delete(&planning).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Planning entry deleted successfully"})
}

func (h *Handler) AddCEPlanning(c *gin.Context) {
	var input struct {
		Date  string `json:"date" binding:"required"`
		Week  int    `json:"week" binding:"required"`
		Shift string `json:"shift" binding:"required"`
		CEID  uint   `json:"ce_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		h.respondWithError(c, http.StatusBadRequest, "Invalid date format")
		return
	}

	planning := models.Planning{
		Date:  date,
		Week:  input.Week,
		Year:  date.Year(),
		Shift: input.Shift,
		CEID:  &input.CEID,
	}

	if err := h.DB.Create(&planning).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create CE planning entry")
		return
	}

	if err := h.DB.Preload("CE").First(&planning, planning.ID).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch created CE planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, planning)
}

func generateCESchedule(ceID uint, week int) map[int][]string {
	schedule := make(map[int][]string)
	ceIndex := int(ceID-1) % 4
	weekInCycle := (week - 1) % 4

	patterns := [][]string{
		{"", "M", "M", "M", "M", "M", ""}, // Week 1
		{"S", "S", "S", "S", "", "", "N"}, // Week 2
		{"N", "N", "", "", "S", "", ""},   // Week 3
		{"M", "", "N", "N", "N", "", ""},  // Week 4
	}

	currentPattern := patterns[(ceIndex+weekInCycle)%4]

	for day := 0; day < 7; day++ {
		if currentPattern[day] != "" {
			schedule[day] = append(schedule[day], currentPattern[day])
		}
	}

	return schedule
}

func (h *Handler) UpdateCEPlanning(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var planning models.Planning
	if err := h.DB.First(&planning, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "CE planning entry not found")
		return
	}

	planning.Status = input.Status

	if err := h.DB.Save(&planning).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update CE planning entry")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, planning)
}

func (h *Handler) DeleteCEPlanning(c *gin.Context) {
	id := c.Param("id")

	tx := h.DB.Begin()

	var cePlanning models.Planning
	if err := tx.First(&cePlanning, id).Error; err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusNotFound, "CE planning entry not found")
		return
	}

	// Delete CE planning entry
	if err := tx.Delete(&cePlanning).Error; err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete CE planning entry")
		return
	}

	// Delete associated employee planning entries
	if err := tx.Where("date = ? AND shift = ? AND week = ?", cePlanning.Date, cePlanning.Shift, cePlanning.Week).Delete(&models.Planning{}).Error; err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete associated employee planning entries")
		return
	}

	if err := tx.Commit().Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "CE planning entry and associated employee entries deleted successfully"})
}

func (h *Handler) UpdateCEStatus(c *gin.Context) {
	var input struct {
		PlanningID uint   `json:"planning_id" binding:"required"`
		Status     string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	if !isValidStatus(input.Status) {
		h.respondWithError(c, http.StatusBadRequest, "Invalid status")
		return
	}

	var planning models.Planning
	if err := h.DB.First(&planning, input.PlanningID).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Planning entry not found")
		return
	}

	planning.Status = input.Status

	if err := h.DB.Save(&planning).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update status")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, planning)
}

func (h *Handler) UpdatePlanningShiftType(c *gin.Context) {
	var input struct {
		Week      int    `json:"week" binding:"required"`
		ShiftType string `json:"shiftType" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Start a transaction
	tx := h.DB.Begin()

	// Get the start date of the week
	year := time.Now().Year()
	startDate := getWeekStartDate(year, input.Week)

	// Define shifts to remove for each type
	shiftsToRemove := map[string][]struct {
		DayOffset int
		Shift     string
	}{
		"4x8 N": {{6, "N"}},           // Sunday night
		"4x8 C": {{6, "N"}, {5, "M"}}, // Sunday night and Saturday morning
	}

	// Remove shifts based on shift type
	if shifts, ok := shiftsToRemove[input.ShiftType]; ok {
		for _, s := range shifts {
			shiftDate := startDate.AddDate(0, 0, s.DayOffset)
			if err := tx.Where("date = ? AND shift = ? AND week = ?", shiftDate, s.Shift, input.Week).Delete(&models.Planning{}).Error; err != nil {
				tx.Rollback()
				h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning")
				return
			}
		}
	}

	// If switching to 4x8 L, we need to add back the removed shifts
	if input.ShiftType == "4x8 L" {
		// Get all CEs with their employees
		var ces []models.CE
		if err := tx.Preload("Employees").Find(&ces).Error; err != nil {
			tx.Rollback()
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch CEs and employees")
			return
		}

		// Add back Sunday night shift
		if err := addShiftWithTeam(tx, startDate.AddDate(0, 0, 6), input.Week, "N", ces); err != nil {
			tx.Rollback()
			h.respondWithError(c, http.StatusInternalServerError, "Failed to add Sunday night shift")
			return
		}

		// Add back Saturday morning shift
		if err := addShiftWithTeam(tx, startDate.AddDate(0, 0, 5), input.Week, "M", ces); err != nil {
			tx.Rollback()
			h.respondWithError(c, http.StatusInternalServerError, "Failed to add Saturday morning shift")
			return
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to commit changes")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Planning updated successfully"})
}

func addShiftWithTeam(tx *gorm.DB, date time.Time, week int, shift string, ces []models.CE) error {
	for _, ce := range ces {
		// Add CE to planning
		cePlanning := models.Planning{
			Date:   date,
			Week:   week,
			Year:   date.Year(),
			Shift:  shift,
			CEID:   &ce.ID,
			Status: "Scheduled",
		}
		if err := tx.Create(&cePlanning).Error; err != nil {
			return err
		}

		// Add employees to planning
		for _, emp := range ce.Employees {
			empPlanning := models.Planning{
				Date:       date,
				Week:       week,
				Year:       date.Year(),
				Shift:      shift,
				CEID:       &ce.ID,
				EmployeeID: &emp.ID,
				SectorID:   &emp.SectorID,
				Status:     "Scheduled",
			}
			if err := tx.Create(&empPlanning).Error; err != nil {
				return err
			}
		}
	}
	return nil
}

func getWeekStartDate(year, week int) time.Time {
	// Jan 1 of the year
	t := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)

	// Roll forward to Monday
	if wd := t.Weekday(); wd == time.Sunday {
		t = t.AddDate(0, 0, 1)
	} else if wd != time.Monday {
		t = t.AddDate(0, 0, int(time.Monday-wd))
	}

	// Add weeks
	t = t.AddDate(0, 0, (week-1)*7)

	return t
}

func (h *Handler) PopulateYearlyPlanning(c *gin.Context) {
	var input struct {
		Year int `json:"year" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Start a transaction
	tx := h.DB.Begin()

	// Fetch all CEs
	var ces []models.CE
	if err := tx.Find(&ces).Error; err != nil {
		tx.Rollback()
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch CEs")
		return
	}

	// Calculate the first Monday of the year
	firstDay := time.Date(input.Year, 1, 1, 0, 0, 0, 0, time.UTC)
	for firstDay.Weekday() != time.Monday {
		firstDay = firstDay.AddDate(0, 0, 1)
	}

	// Generate planning for 52 weeks
	for week := 1; week <= 52; week++ {
		weekStart := firstDay.AddDate(0, 0, (week-1)*7)

		for _, ce := range ces {
			schedule := generateCESchedule(ce.ID, week)

			// Fetch employees under this CE
			var employees []models.Employee
			if err := tx.Where("ce_id = ?", ce.ID).Find(&employees).Error; err != nil {
				tx.Rollback()
				h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch employees")
				return
			}

			for day, shifts := range schedule {
				currentDate := weekStart.AddDate(0, 0, day)
				for _, shift := range shifts {
					// Add CE planning
					cePlanning := models.Planning{
						Date:   currentDate,
						Week:   week,
						Year:   input.Year,
						Shift:  shift,
						CEID:   &ce.ID,
						Status: "Scheduled",
					}

					if err := tx.Create(&cePlanning).Error; err != nil {
						tx.Rollback()
						h.respondWithError(c, http.StatusInternalServerError, "Failed to create CE planning entry")
						return
					}

					// Add employee planning
					for _, emp := range employees {
						empPlanning := models.Planning{
							Date:       currentDate,
							Week:       week,
							Year:       input.Year,
							Shift:      shift,
							EmployeeID: &emp.ID,
							SectorID:   &emp.SectorID,
							Status:     "Scheduled",
						}

						if err := tx.Create(&empPlanning).Error; err != nil {
							tx.Rollback()
							h.respondWithError(c, http.StatusInternalServerError, "Failed to create employee planning entry")
							return
						}
					}
				}
			}
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, gin.H{"message": "Yearly planning populated successfully"})
}

func isValidStatus(status string) bool {
	for _, s := range ValidCEStatuses {
		if s == status {
			return true
		}
	}
	return false
}

func (h *Handler) BulkUpdatePlanning(c *gin.Context) {
	var input struct {
		EmployeeID uint      `json:"employee_id" binding:"required"`
		CEID       uint      `json:"ce_id" binding:"required"`
		SectorID   uint      `json:"sector_id" binding:"required"`
		StartDate  time.Time `json:"start_date" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Model(&models.Planning{}).
		Where("employee_id = ? AND date >= ?", input.EmployeeID, input.StartDate).
		Updates(map[string]interface{}{
			"ce_id":     input.CEID,
			"sector_id": input.SectorID,
		}).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update planning entries")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Planning entries updated successfully"})
}

const (
	StatusScheduled = "Scheduled"
	StatusAbsentP   = "Absent (Planned)"
	StatusAbsentU   = "Absent (Unplanned)"
	StatusTraining  = "Training"
	StatusDay       = "Day Shift"
)

var ValidCEStatuses = []string{
	StatusScheduled,
	StatusAbsentP,
	StatusAbsentU,
	StatusTraining,
	StatusDay,
}
