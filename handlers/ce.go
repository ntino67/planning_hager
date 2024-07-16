package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"planning_hager/models"
)

func (h *Handler) GetCEs(c *gin.Context) {
	var ces []models.CE
	if err := h.DB.Preload("Employees").Find(&ces).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch CEs")
		return
	}
	h.respondWithSuccess(c, http.StatusOK, ces)
}

func (h *Handler) AddCE(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	ce := models.CE{Name: input.Name}

	if err := h.DB.Create(&ce).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to create CE")
		return
	}

	h.respondWithSuccess(c, http.StatusCreated, ce)
}

func (h *Handler) UpdateCE(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		h.respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	var ce models.CE
	if err := h.DB.First(&ce, id).Error; err != nil {
		h.respondWithError(c, http.StatusNotFound, "CE not found")
		return
	}

	ce.Name = input.Name

	if err := h.DB.Save(&ce).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to update CE")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, ce)
}

func (h *Handler) DeleteCE(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.CE{}, id).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to delete CE")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, gin.H{"message": "CE deleted successfully"})
}

func (h *Handler) GetCEByID(c *gin.Context) {
	ceID := c.Param("id")

	var ce models.CE
	if err := h.DB.First(&ce, ceID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			h.respondWithError(c, http.StatusNotFound, "CE not found")
		} else {
			h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch CE")
		}
		return
	}

	h.respondWithSuccess(c, http.StatusOK, ce)
}
