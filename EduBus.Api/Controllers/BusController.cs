using EduBus.Api.Hubs;
using EduBus.Api.Models;
using EduBus.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace EduBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class BusController : ControllerBase
{
    private readonly ISafetyAlertService _safetyAlertService;
    private readonly IHubContext<EduBusHub> _hubContext;

    private static readonly List<Bus> FleetDb = new()
    {
        new Bus { Id = 5, BusNumber = "05 | 01 777 BAA", DriverName = "Anvar Qodirov", DriverPhone = "+998 90 900 11 22", RouteName = "Chilonzor -> Maktab №110", Capacity = 25, CurrentStudentCount = 4, Latitude = 41.2995, Longitude = 69.2401, SpeedKmH = 42.5, Status = BusStatus.OnRoute },
        new Bus { Id = 8, BusNumber = "08 | 01 555 XYZ", DriverName = "Rustam Alimov", DriverPhone = "+998 93 111 22 33", RouteName = "Yunusobod -> Maktab №110", Capacity = 30, CurrentStudentCount = 12, Latitude = 41.3111, Longitude = 69.2797, SpeedKmH = 58.0, Status = BusStatus.WarningSpeeding }
    };

    public BusController(ISafetyAlertService safetyAlertService, IHubContext<EduBusHub> hubContext)
    {
        _safetyAlertService = safetyAlertService;
        _hubContext = hubContext;
    }

    [HttpGet("fleet")]
    public IActionResult GetFleet()
    {
        return Ok(FleetDb);
    }

    [HttpPost("update-location")]
    public async Task<IActionResult> UpdateLocation([FromBody] LocationUpdateRequest request)
    {
        var bus = FleetDb.FirstOrDefault(b => b.Id == request.BusId);
        if (bus == null) return NotFound(new { Message = "Avtobus topilmadi" });

        bus.Latitude = request.Latitude;
        bus.Longitude = request.Longitude;
        bus.SpeedKmH = request.SpeedKmH;

        bool isSpeedNormal = _safetyAlertService.VerifySpeedLimit(bus, out string warning);
        if (!isSpeedNormal)
        {
            bus.Status = BusStatus.WarningSpeeding;
            await _hubContext.Clients.All.SendAsync("ReceiveSafetyWarning", bus.BusNumber, "SpeedLimitAlert", warning);
        }

        await _hubContext.Clients.All.SendAsync("ReceiveBusLocation", bus.Id, bus.Latitude, bus.Longitude, bus.SpeedKmH);

        return Ok(new { Success = true, Bus = bus, Warning = warning });
    }
}

public class LocationUpdateRequest
{
    public int BusId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double SpeedKmH { get; set; }
}
