package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"planning_hager/handlers"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Set up CORS
	r.Use(CORSMiddleware())

	// Initialize handlers
	h := handlers.NewHandler(db)

	// Public Routes
	r.POST("/login", h.Login)

	// Protected routes
	protected := r.Group("/")
	protected.Use(handlers.AuthMiddleware())
	{
		protected.GET("/verify-token", handlers.VerifyToken)
		protected.GET("/planning", h.GetPlannings)
		protected.GET("/employees", h.GetEmployees)
		protected.GET("/sectors", h.GetSectors)
		protected.GET("/ces", h.GetCEs)
		protected.GET("/skills", h.GetSkills)
		protected.GET("/employee_skills/:id", h.GetEmployeeSkills)
		protected.GET("/sector_required_skills", h.GetSectorRequiredSkills)

		// Admin only routes
		admin := protected.Group("/")
		admin.Use(handlers.AdminMiddleware())
		{
			admin.POST("/add_employee", h.AddEmployee)
			admin.PUT("/update_employee/:id", h.UpdateEmployee)
			admin.DELETE("/delete_employee/:id", h.DeleteEmployee)
			admin.POST("/add_skill", h.AddSkill)
			admin.PUT("/update_skill/:id", h.UpdateSkill)
			admin.DELETE("/delete_skill/:id", h.DeleteSkill)
			admin.POST("/add_sector", h.AddSector)
			admin.PUT("/update_sector/:id", h.UpdateSector)
			admin.DELETE("/delete_sector/:id", h.DeleteSector)
			admin.POST("/add_ce", h.AddCE)
			admin.PUT("/update_ce/:id", h.UpdateCE)
			admin.DELETE("/delete_ce/:id", h.DeleteCE)
			admin.POST("/add_planning", h.AddPlanning)
			admin.PUT("/update_planning/:id", h.UpdatePlanning)
			admin.DELETE("/delete_planning/:id", h.DeletePlanning)
			admin.POST("/add_ce_planning", h.AddCEPlanning)
			admin.PUT("/update_ce_planning/:id", h.UpdateCEPlanning)
			admin.DELETE("/delete_ce_planning/:id", h.DeleteCEPlanning)
			admin.POST("/update_planning_shift_type", h.UpdatePlanningShiftType)
			admin.POST("/populate_yearly_planning", h.PopulateYearlyPlanning)
			admin.POST("/bulk_update_planning", h.BulkUpdatePlanning)
			admin.GET("/reservists", h.GetReservists)
			admin.POST("/add_reservist", h.AddReservist)
			admin.PUT("/update_reservist/:id", h.UpdateReservist)
			admin.DELETE("/delete_reservist/:id", h.DeleteReservist)
		}
	}

	return r
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
