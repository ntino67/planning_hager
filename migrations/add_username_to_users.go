package migrations

import (
	"gorm.io/gorm"
	"planning_hager/models"
)

func AddUsernameToUsers(db *gorm.DB) error {
	return db.AutoMigrate(&models.User{})
}
