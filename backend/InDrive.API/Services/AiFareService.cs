using System.Text.Json;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class AiFareService : IAiFareService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AiFareService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<AiFareSuggestion> GetFareSuggestionAsync(double distanceKm)
    {
        try
        {
            var aiServiceUrl = _configuration["AiServiceUrl"] ?? "http://ai-service:5000";
            var response = await _httpClient.PostAsJsonAsync(
                $"{aiServiceUrl}/api/fare/predict",
                new { distance_km = distanceKm }
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Failed to get fare suggestion from AI service");
            }

            var result = await response.Content.ReadFromJsonAsync<AiFareSuggestion>();
            return result ?? throw new Exception("Invalid response from AI service");
        }
        catch (Exception ex)
        {
            // Fallback to simple calculation if AI service is unavailable
            var baseFare = 2.5m;
            var perKmRate = 1.5m;
            var estimatedFare = baseFare + (decimal)distanceKm * perKmRate;

            return new AiFareSuggestion
            {
                MinFare = estimatedFare * 0.8m,
                MaxFare = estimatedFare * 1.2m,
                AverageFare = estimatedFare,
                Message = $"Using fallback calculation (AI service unavailable: {ex.Message})"
            };
        }
    }
}

