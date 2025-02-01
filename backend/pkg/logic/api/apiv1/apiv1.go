package apiv1

// HealthCheck implements /api/v1/ping
func HealthCheck() (interface{}, error) {
	return "pong", nil
}
