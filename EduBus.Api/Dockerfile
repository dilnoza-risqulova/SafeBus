# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY EduBus.Api.csproj ./
RUN dotnet restore

# Copy all source files and publish
COPY . ./
RUN dotnet publish EduBus.Api.csproj -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "EduBus.Api.dll"]
