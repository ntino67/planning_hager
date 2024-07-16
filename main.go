package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"log"
	"os"

	"planning_hager/config"
	"planning_hager/routes"
)

var db *gorm.DB

// Add this function to your main.go file
func getCurrentDirectory() string {
	dir, err := os.Getwd()
	if err != nil {
		log.Printf("Error getting current directory: %v", err)
		return "unknown"
	}
	return dir
}

func main() {
	// At the beginning of your main() function
	if err := godotenv.Load(); err != nil {
		log.Printf("Error loading .env file: %v", err)
		log.Println("Current working directory:", getCurrentDirectory())
		log.Println("Falling back to environment variables")
	}

	// Azure SQL Database connection details
	server := os.Getenv("DB_SERVER")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	database := os.Getenv("DB_NAME")

	// Build connection string
	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;port=%s;database=%s;",
		server, user, password, port, database)

	// Create connection pool
	var err error
	db, err = gorm.Open(sqlserver.Open(connString), &gorm.Config{})
	if err != nil {
		log.Fatal("Error creating connection pool: ", err.Error())
	}

	// Run database migrations
	config.MigrateDB(db)

	// Initialize router
	r := routes.SetupRouter(db)

	// Start server
	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "8080"
	}
	log.Printf("Server starting on port %s", serverPort)
	if err := r.Run(":" + serverPort); err != nil {
		log.Fatal("Error starting server: ", err.Error())
	}
}
