package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"planning_hager/models"
)

func (h *Handler) GetSectorRequiredSkills(c *gin.Context) {
	var sectorRequiredSkills []models.SectorRequiredSkill

	if err := h.DB.Table("sector_required_skills").Find(&sectorRequiredSkills).Error; err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Failed to fetch sector required skills")
		return
	}

	h.respondWithSuccess(c, http.StatusOK, sectorRequiredSkills)
}
