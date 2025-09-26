# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY RpsGame.Api/RpsGame.Api.csproj RpsGame.Api/
RUN dotnet restore RpsGame.Api/RpsGame.Api.csproj

COPY . .
RUN dotnet publish RpsGame.Api/RpsGame.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RpsGame.Api.dll"]
