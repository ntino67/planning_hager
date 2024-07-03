package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"planning_hager/models"
)

func (h *Handler) GetSkills(c *gin.Context) {
	var skills []models.Skill
	if err := h.DB.Find(&skills).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch skills")
		return
	}
	h.respondWithSuccess(c, http.StatusOK, skills)
}

func (h *Handler) AddSkill(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	skill := models.Skill{Name: input.Name}

	if err := h.DB.Create(&skill).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create skill")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, skill)
}

func (h *Handler) UpdateSkill(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var skill models.Skill
	if err := h.DB.First(&skill, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "Skill not found")
		return
	}

	skill.Name = input.Name

	if err := h.DB.Save(&skill).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update skill")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, skill)
}

func (h *Handler) DeleteSkill(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.Skill{}, id).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete skill")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "Skill deleted successfully"})
}
