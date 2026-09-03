namespace EduBus.Api.Models;

public class AttendanceLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int BusId { get; set; }
    public string BusNumber { get; set; } = string.Empty;
    public DateTime TapTime { get; set; } = DateTime.UtcNow;
    public EventType EventType { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public bool TelegramAlertSent { get; set; } = true;
}

public enum EventType
{
    BoardingBus,   // Avtobusga chiqdi (Check-In)
    LeavingBus     // Avtobusdan tushdi (Check-Out)
}
