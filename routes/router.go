package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"planning_hager/handlers"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

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
		protected.GET("/test-auth", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "You are authenticated!"})
		})
		protected.GET("/planning", h.GetPlannings)
		protected.GET("/employees", h.GetEmployees)
		protected.GET("/sectors", h.GetSectors)
		protected.GET("/ces", h.GetCEs)
		protected.GET("/skills", h.GetSkills)
		protected.GET("/employee_skills/:id", h.GetEmployeeSkills)

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
