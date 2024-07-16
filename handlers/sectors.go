package handlers

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"planning_hager/models"
)

func (h *Handler) GetSectors(c *gin.Context) {
	var sectors []models.Sector
	if err := h.DB.Preload("RequiredSkills").Find(&sectors).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch sectors")
		return
	}
	h.respondWithSuccess(c, http.StatusOK, sectors)
}

func (h *Handler) AddSector(c *gin.Context) {
	var input struct {
		Name           string `json:"name" binding:"required"`
		RequiredSkills []uint `json:"required_skills"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	sector := models.Sector{Name: input.Name}

	if err := h.DB.Create(&sector).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create sector")
		return
	}

	if len(input.RequiredSkills) > 0 {
		var skills []models.Skill
		if err := h.DB.Where("id IN ?", input.RequiredSkills).Find(&skills).Error; err != nil {
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch skills")
			return
		}
		if err := h.DB.Model(&sector).Association("RequiredSkills").Append(skills); err != nil {
			h.respondWithError(c, http.StatusInternalServerError, "Failed to associate skills")
			return
		}
	}

	h.respondWithSuccess(c, http.StatusCreated, sector)
}

// handlers/sector.go

func (h *Handler) UpdateSector(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name           string `json:"name"`
		RequiredSkills []uint `json:"required_skills"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var sector models.Sector
	if err := h.DB.First(&sector, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Sector not found")
		return
	}

	sector.Name = input.Name

	if err := h.DB.Save(&sector).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update sector")
		return
	}

	// Update required skills
	if err := h.DB.Model(&sector).Association("RequiredSkills").Clear(); err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to clear existing skills")
		return
	}

	if len(input.RequiredSkills) > 0 {
		var skills []models.Skill
		if err := h.DB.Where("id IN ?", input.RequiredSkills).Find(&skills).Error; err != nil {
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch skills")
			return
		}
		if err := h.DB.Model(&sector).Association("RequiredSkills").Append(skills); err != nil {
			h.respondWithError(c, http.StatusInternalServerError, "Failed to associate skills")
			return
		}
	}

	h.respondWithSuccess(c, http.StatusOK, sector)
}

func (h *Handler) DeleteSector(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.Sector{}, id).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete sector")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Sector deleted successfully"})
}

func (h *Handler) GetSectorByID(c *gin.Context) {
	sectorID := c.Param("id")

	var sector models.Sector
	if err := h.DB.First(&sector, sectorID).Error; err != nil {
		if errors.Is(gorm.ErrRecordNotFound, err) {
			h.respondWithError(c, http.StatusNotFound, "Sector not found")
		} else {
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch sector")
		}
		return
	}

	h.respondWithSuccess(c, http.StatusOK, sector)
}
