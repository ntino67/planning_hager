package handlers

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"planning_hager/models"
)

var jwtKey = []byte("HagerGroup!")

func (h *Handler) Login(c *gin.Context) {
	var loginInput struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginInput); err != nil {
		log.Printf("Invalid login input: %v", err)
		h.respondWithError(c, http.StatusBadRequest, "Invalid input")
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", loginInput.Username).First(&user).Error; err != nil {
		log.Printf("User not found: %s", loginInput.Username)
		h.respondWithError(c, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginInput.Password)); err != nil {
		log.Printf("Invalid password for user: %s", loginInput.Username)
		h.respondWithError(c, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &models.Claims{
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		h.respondWithError(c, http.StatusInternalServerError, "Could not generate token")
		return
	}

	log.Printf("Successful login for user: %s, role: %s", user.Username, user.Role)
	h.respondWithSuccess(c, http.StatusOK, gin.H{
		"token": tokenString,
		"role":  user.Role,
	})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		log.Printf("Received token: %s", tokenString) // Add this line

		if tokenString == "" {
			log.Println("No authorization header provided") // Add this line
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No authorization header provided"})
			c.Abort()
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		claims := &models.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtKey), nil
		})

		if err != nil {
			log.Printf("Error parsing token: %v", err) // Add this line
			if err == jwt.ErrSignatureInvalid {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token signature"})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			}
			c.Abort()
			return
		}

		if !token.Valid {
			log.Println("Invalid token") // Add this line
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		log.Printf("Token valid for user: %s, role: %s", claims.Username, claims.Role) // Add this line
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found"})
			c.Abort()
			return
		}
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func VerifyToken(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		log.Println("No username found in context") // Add this line
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No username found in context"})
		return
	}

	role, exists := c.Get("role")
	if !exists {
		log.Println("No role found in context") // Add this line
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No role found in context"})
		return
	}

	log.Printf("Token verified for user: %v, role: %v", username, role) // Add this line
	c.JSON(http.StatusOK, gin.H{
		"message":  "Token is valid",
		"username": username,
		"role":     role,
	})
}
