namespace EduBus.Api.Models;

public class Bus
{
    public int Id { get; set; }
    public string BusNumber { get; set; } = string.Empty; // e.g. "01 | 777 ABC"
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string RouteName { get; set; } = string.Empty;
    public int Capacity { get; set; } = 25;
    public int CurrentStudentCount { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double SpeedKmH { get; set; }
    public double MaxSpeedLimit { get; set; } = 50.0; // School bus safety limit
    public BusStatus Status { get; set; } = BusStatus.Idle;
}

public enum BusStatus
{
    Idle,
    OnRoute,
    ArrivedSchool,
    WarningSpeeding,
    WarningUncheckedStudents
}
