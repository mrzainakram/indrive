using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IAiFareService
{
    Task<AiFareSuggestion> GetFareSuggestionAsync(double distanceKm);
}

