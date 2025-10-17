FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY InDrive.API/InDrive.API.csproj InDrive.API/
RUN dotnet restore InDrive.API/InDrive.API.csproj

# Copy everything else and build
COPY InDrive.API/. InDrive.API/
WORKDIR /src/InDrive.API
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "InDrive.API.dll"]

