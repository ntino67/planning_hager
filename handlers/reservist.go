package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"planning_hager/models"
)

func (h *Handler) GetReservists(c *gin.Context) {
	var reservists []models.Reservist
	if err := h.DB.Preload("Skills").Find(&reservists).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch reservists")
		return
	}
	h.respondWithSuccess(c, http.StatusOK, reservists)
}

func (h *Handler) AddReservist(c *gin.Context) {
	var input struct {
		Name   string `json:"name" binding:"required"`
		Skills []uint `json:"skills" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Log the received data
	fmt.Printf("Received reservist data: %+v\n", input)

	reservist := models.Reservist{Name: input.Name}

	if err := h.DB.Create(&reservist).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create reservist")
		return
	}

	var skills []models.Skill
	if err := h.DB.Where("id IN ?", input.Skills).Find(&skills).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch skills")
		return
	}

	if err := h.DB.Model(&reservist).Association("Skills").Append(skills); err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to associate skills")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, reservist)
}

func (h *Handler) UpdateReservist(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name     string `json:"name"`
		SkillIDs []uint `json:"skills"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var reservist models.Reservist
	if err := h.DB.Preload("Skills").First(&reservist, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Reservist not found")
		return
	}

	reservist.Name = input.Name

	if err := h.DB.Model(&reservist).Association("Skills").Clear(); err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to clear existing skills")
		return
	}

	var skills []models.Skill
	if err := h.DB.Where("id IN ?", input.SkillIDs).Find(&skills).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch skills")
		return
	}

	if err := h.DB.Model(&reservist).Association("Skills").Append(skills); err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to associate skills")
		return
	}

	if err := h.DB.Save(&reservist).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update reservist")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, reservist)
}

func (h *Handler) DeleteReservist(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.Reservist{}, id).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete reservist")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Reservist deleted successfully"})
}
